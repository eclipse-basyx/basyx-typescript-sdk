import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const REQUIRED_STATUSES = new Set([200, 201, 204, 400, 404]);
const NON_BLOCKING_STATUSES = new Set([409]);
const WAIVER_TAGS = new Set(['known-backend-bug', 'known-specification-bug', 'known-behavior-mismatch']);
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

const SERVICE_CONFIG = {
    aasDiscovery: {
        openapiFile: 'openapi/aasdiscovery.yaml',
        clientFile: 'src/clients/AasDiscoveryClient.ts',
        integrationTestFile: 'src/integration-tests/aasDiscovery.integration.test.ts',
    },
    aasRegistry: {
        openapiFile: 'openapi/aasregistry.yaml',
        clientFile: 'src/clients/AasRegistryClient.ts',
        integrationTestFile: 'src/integration-tests/aasRegistry.integration.test.ts',
    },
    submodelRegistry: {
        openapiFile: 'openapi/smregistry.yaml',
        clientFile: 'src/clients/SubmodelRegistryClient.ts',
        integrationTestFile: 'src/integration-tests/submodelRegistry.integration.test.ts',
    },
    conceptDescriptionRepository: {
        openapiFile: 'openapi/cdrepository.yaml',
        clientFile: 'src/clients/ConceptDescriptionRepositoryClient.ts',
        integrationTestFile: 'src/integration-tests/conceptDescriptionRepo.integration.test.ts',
    },
};

function parseArgs(argv) {
    const serviceFlagIndex = argv.indexOf('--service');
    if (serviceFlagIndex === -1 || serviceFlagIndex === argv.length - 1) {
        return { services: Object.keys(SERVICE_CONFIG) };
    }

    const serviceName = argv[serviceFlagIndex + 1];
    if (!(serviceName in SERVICE_CONFIG)) {
        throw new Error(`Unsupported service "${serviceName}". Supported: ${Object.keys(SERVICE_CONFIG).join(', ')}`);
    }

    return { services: [serviceName] };
}

function lcFirst(value) {
    return value.charAt(0).toLowerCase() + value.slice(1);
}

function operationIdToMethodName(operationId) {
    const normalized = operationId.replace(/[^A-Za-z0-9]+(.)?/g, (_, nextChar) =>
        nextChar ? nextChar.toUpperCase() : ''
    );
    return lcFirst(normalized);
}

function parseOpenApiOperations(openapiSource) {
    const doc = YAML.parse(openapiSource);
    const operations = [];

    for (const [routePath, pathDef] of Object.entries(doc.paths ?? {})) {
        if (!pathDef || typeof pathDef !== 'object') {
            continue;
        }

        for (const method of HTTP_METHODS) {
            const operation = pathDef[method];
            if (!operation || typeof operation !== 'object' || !operation.operationId) {
                continue;
            }

            const responseKeys = Object.keys(operation.responses ?? {});
            const numericStatuses = responseKeys
                .map((status) => Number.parseInt(status, 10))
                .filter((status) => Number.isInteger(status));

            const requiredStatuses = numericStatuses.filter((status) => REQUIRED_STATUSES.has(status));
            const nonBlockingStatuses = numericStatuses.filter((status) => NON_BLOCKING_STATUSES.has(status));

            operations.push({
                operationId: operation.operationId,
                method,
                routePath,
                deprecated: Boolean(operation.deprecated),
                requiredStatuses,
                nonBlockingStatuses,
            });
        }
    }

    return operations;
}

function parseClientMethods(clientSource) {
    const methods = new Set();
    for (const match of clientSource.matchAll(/async\s+([A-Za-z0-9_]+)\s*\(/g)) {
        methods.add(match[1]);
    }
    return methods;
}

function findMatchingBrace(source, openBraceIndex) {
    let depth = 0;
    for (let index = openBraceIndex; index < source.length; index += 1) {
        const char = source[index];
        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                return index;
            }
        }
    }

    return -1;
}

function parseStatusTags(suffix) {
    const tags = [...suffix.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1].trim().toLowerCase());
    const waiverTag = tags.find((tag) => WAIVER_TAGS.has(tag));

    return {
        nonBlocking: tags.includes('non-blocking'),
        waiverTag,
    };
}

function parseIntegrationMetadata(testSource) {
    const metadata = [];
    const testBlockRegex =
        /\/\*\*([\s\S]*?)\*\/\s*(?:test|it)(\.skip)?\(\s*(['"`])(.+?)\3\s*,\s*async\s*\(\)\s*=>\s*\{/g;

    let match;
    while ((match = testBlockRegex.exec(testSource)) !== null) {
        const jsdoc = match[1];
        const skipped = match[2] === '.skip';
        const testName = match[4];
        const openBraceIndex = testBlockRegex.lastIndex - 1;
        const closeBraceIndex = findMatchingBrace(testSource, openBraceIndex);
        if (closeBraceIndex === -1) {
            continue;
        }

        const body = testSource.slice(openBraceIndex + 1, closeBraceIndex);
        const operationMatch = jsdoc.match(/@operation\s+([A-Za-z0-9_-]+)/);
        if (!operationMatch) {
            continue;
        }

        const operationId = operationMatch[1];
        const statuses = [];
        for (const statusMatch of jsdoc.matchAll(/@status\s+(\d{3})([^\n]*)/g)) {
            const status = Number.parseInt(statusMatch[1], 10);
            const suffix = statusMatch[2] ?? '';
            const tags = parseStatusTags(suffix);
            statuses.push({
                status,
                nonBlocking: tags.nonBlocking,
                waiverTag: tags.waiverTag,
            });
        }

        const assertions = new Map();
        for (const { status } of statuses) {
            const hasStatusCodeAssert = new RegExp(`statusCode\\)\\.toBe\\(${status}\\)`).test(body);
            const hasMessageCodeAssert = new RegExp(
                `messages\\?\\.\\[0\\]\\?\\.code\\)\\.toBe\\((['"])${status}\\1\\)`
            ).test(body);
            assertions.set(status, hasStatusCodeAssert || hasMessageCodeAssert);
        }

        metadata.push({
            operationId,
            testName,
            skipped,
            statuses,
            assertions,
        });
    }

    return metadata;
}

function buildCoverageReport(operations, clientMethods, testMetadata) {
    const operationCoverage = new Map();

    for (const entry of testMetadata) {
        if (!operationCoverage.has(entry.operationId)) {
            operationCoverage.set(entry.operationId, {
                annotatedStatuses: new Set(),
                assertedStatuses: new Set(),
                waivedStatuses: new Set(),
                waivedStatusReasons: new Map(),
                tests: [],
                skippedTests: [],
                missingAssertions: [],
            });
        }

        const coverage = operationCoverage.get(entry.operationId);
        if (entry.skipped) {
            coverage.skippedTests.push(entry.testName);
        } else {
            coverage.tests.push(entry.testName);
        }

        for (const { status, waiverTag } of entry.statuses) {
            coverage.annotatedStatuses.add(status);

            if (entry.skipped && waiverTag) {
                coverage.waivedStatuses.add(status);
                if (!coverage.waivedStatusReasons.has(status)) {
                    coverage.waivedStatusReasons.set(status, new Set());
                }
                coverage.waivedStatusReasons.get(status).add(waiverTag);
                continue;
            }

            if (entry.skipped) {
                continue;
            }

            if (entry.assertions.get(status)) {
                coverage.assertedStatuses.add(status);
            } else {
                coverage.missingAssertions.push({ status, testName: entry.testName });
            }
        }
    }

    const matrix = [];
    const criticalFindings = [];
    const warnings = [];

    for (const operation of operations) {
        const expectedMethodName = operationIdToMethodName(operation.operationId);
        const implemented = clientMethods.has(expectedMethodName);
        const coverage = operationCoverage.get(operation.operationId);
        const assertedStatuses = coverage?.assertedStatuses ?? new Set();
        const waivedStatuses = coverage?.waivedStatuses ?? new Set();
        const waivedStatusReasons = coverage?.waivedStatusReasons ?? new Map();

        const missingRequiredStatuses = operation.requiredStatuses.filter(
            (status) => !assertedStatuses.has(status) && !waivedStatuses.has(status)
        );
        const waivedRequiredStatuses = operation.requiredStatuses.filter(
            (status) => !assertedStatuses.has(status) && waivedStatuses.has(status)
        );
        const missingNonBlockingStatuses = operation.nonBlockingStatuses.filter(
            (status) => !assertedStatuses.has(status)
        );

        if (!implemented) {
            criticalFindings.push(
                `Missing client method for ${operation.operationId} (expected ${expectedMethodName})`
            );
        }

        if (missingRequiredStatuses.length > 0) {
            criticalFindings.push(
                `${operation.operationId} missing required status coverage: ${missingRequiredStatuses.join(', ')}`
            );
        }

        if (waivedRequiredStatuses.length > 0) {
            const waivedWithReason = waivedRequiredStatuses.map((status) => {
                const reasons = [...(waivedStatusReasons.get(status) ?? [])].sort();
                return reasons.length > 0 ? `${status} [${reasons.join(', ')}]` : `${status}`;
            });
            warnings.push(`${operation.operationId} has waived required statuses: ${waivedWithReason.join(', ')}`);
        }

        if (coverage?.missingAssertions?.length) {
            for (const missing of coverage.missingAssertions) {
                if (REQUIRED_STATUSES.has(missing.status)) {
                    criticalFindings.push(
                        `${operation.operationId} status ${missing.status} is annotated but not asserted in test "${missing.testName}"`
                    );
                } else if (NON_BLOCKING_STATUSES.has(missing.status)) {
                    warnings.push(
                        `${operation.operationId} status ${missing.status} is annotated but not asserted in test "${missing.testName}"`
                    );
                }
            }
        }

        if (missingNonBlockingStatuses.length > 0) {
            warnings.push(
                `${operation.operationId} missing non-blocking status coverage: ${missingNonBlockingStatuses.join(', ')}`
            );
        }

        matrix.push({
            operationId: operation.operationId,
            method: operation.method.toUpperCase(),
            routePath: operation.routePath,
            deprecated: operation.deprecated,
            implemented,
            requiredStatuses: operation.requiredStatuses,
            nonBlockingStatuses: operation.nonBlockingStatuses,
            assertedStatuses: [...assertedStatuses].sort((a, b) => a - b),
            tests: coverage?.tests ?? [],
            skippedTests: coverage?.skippedTests ?? [],
            waivedRequiredStatuses,
            missingRequiredStatuses,
            missingNonBlockingStatuses,
        });
    }

    return {
        generatedAt: new Date().toISOString(),
        operationCount: operations.length,
        matrix,
        criticalFindings,
        warnings,
    };
}

function writeReportFile(serviceName, report) {
    const reportDir = path.join(process.cwd(), 'coverage', 'openapi-coverage');
    fs.mkdirSync(reportDir, { recursive: true });
    const reportFile = path.join(reportDir, `${serviceName}.json`);
    fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    return path.relative(process.cwd(), reportFile);
}

function printSummary(serviceName, report) {
    console.log(`\nService: ${serviceName}`);
    console.log(`Operations: ${report.operationCount}`);

    for (const row of report.matrix) {
        const statusSymbol = row.missingRequiredStatuses.length === 0 && row.implemented ? 'PASS' : 'FAIL';
        const deprecatedTag = row.deprecated ? ' [deprecated]' : '';
        console.log(
            `${statusSymbol} ${row.operationId}${deprecatedTag} | ${row.method} ${row.routePath} | asserted: [${row.assertedStatuses.join(', ')}]`
        );
    }

    if (report.criticalFindings.length > 0) {
        console.log('\nCritical findings:');
        for (const finding of report.criticalFindings) {
            console.log(`- ${finding}`);
        }
    }

    if (report.warnings.length > 0) {
        console.log('\nWarnings:');
        for (const warning of report.warnings) {
            console.log(`- ${warning}`);
        }
    }
}

function loadFile(filePath) {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
}

function runForService(serviceName) {
    const config = SERVICE_CONFIG[serviceName];
    const openApiSource = loadFile(config.openapiFile);
    const clientSource = loadFile(config.clientFile);
    const testSource = loadFile(config.integrationTestFile);

    const operations = parseOpenApiOperations(openApiSource);
    const clientMethods = parseClientMethods(clientSource);
    const testMetadata = parseIntegrationMetadata(testSource);

    const report = buildCoverageReport(operations, clientMethods, testMetadata);
    const reportPath = writeReportFile(serviceName, report);

    printSummary(serviceName, report);
    console.log(`Coverage report written to ${reportPath}`);

    return report;
}

function main() {
    const { services } = parseArgs(process.argv.slice(2));
    let hasCriticalFindings = false;

    for (const serviceName of services) {
        const report = runForService(serviceName);
        if (report.criticalFindings.length > 0) {
            hasCriticalFindings = true;
        }
    }

    if (hasCriticalFindings) {
        process.exitCode = 1;
        return;
    }

    process.exitCode = 0;
}

main();
