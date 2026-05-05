import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';

const REPORT_FORMATS = new Set(['console', 'json', 'junit', 'markdown']);
const DEFAULT_REPORTS = ['console', 'json'];
const ENGINE_MODE_ENV = 'BASYX_TEST_ENGINE_MODE';

const COMPONENT_CATALOG = {
    'aas-repository': {
        displayName: 'AAS Repository',
        endpointEnvVar: 'BASYX_AAS_REPOSITORY_URL',
        openapiService: 'aasRepository',
        testFile: 'src/integration-tests/aasRepo.integration.test.ts',
    },
    'submodel-repository': {
        displayName: 'Submodel Repository',
        endpointEnvVar: 'BASYX_SUBMODEL_REPOSITORY_URL',
        openapiService: 'submodelRepository',
        testFile: 'src/integration-tests/submodelRepo.integration.test.ts',
    },
    'concept-description-repository': {
        displayName: 'Concept Description Repository',
        endpointEnvVar: 'BASYX_CONCEPT_DESCRIPTION_REPOSITORY_URL',
        openapiService: 'conceptDescriptionRepository',
        testFile: 'src/integration-tests/conceptDescriptionRepo.integration.test.ts',
    },
    'aas-registry': {
        displayName: 'AAS Registry',
        endpointEnvVar: 'BASYX_AAS_REGISTRY_URL',
        openapiService: 'aasRegistry',
        testFile: 'src/integration-tests/aasRegistry.integration.test.ts',
    },
    'submodel-registry': {
        displayName: 'Submodel Registry',
        endpointEnvVar: 'BASYX_SUBMODEL_REGISTRY_URL',
        openapiService: 'submodelRegistry',
        testFile: 'src/integration-tests/submodelRegistry.integration.test.ts',
    },
    'aas-discovery': {
        displayName: 'AAS Discovery',
        endpointEnvVar: 'BASYX_AAS_DISCOVERY_URL',
        openapiService: 'aasDiscovery',
        testFile: 'src/integration-tests/aasDiscovery.integration.test.ts',
    },
    'aasx-file-server': {
        displayName: 'AASX File Server',
        endpointEnvVar: 'BASYX_AASX_FILE_SERVER_URL',
        openapiService: 'aasxFileServer',
        testFile: 'src/integration-tests/aasxFile.integration.test.ts',
    },
};

function printUsage() {
    console.log(
        `Usage:\n  node scripts/test-engine.mjs --component <id> --url <http(s)://host:port> [options] [-- <vitest args>]\n\nOptions:\n  --component <id>               Component ID to test\n  --url <base-url>               Base URL for the selected component\n  --report <formats>             Report output(s): console,json,junit,markdown\n                                 Repeatable or comma-separated\n  --report-dir <dir>             Output directory (default: coverage/test-engine)\n  --strict-known-issues          Treat known waived OpenAPI issues as failures\n  --list-components              Print available component IDs and exit\n  --help                         Show this help\n\nExamples:\n  node scripts/test-engine.mjs --component submodel-repository --url http://localhost:8082\n  node scripts/test-engine.mjs --component aas-repository --url http://localhost:8081 --report console,json,markdown\n  node scripts/test-engine.mjs --component aas-discovery --url http://localhost:8086 --strict-known-issues -- --testNamePattern "lookup"`
    );
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function readRequiredValue(argv, index, flagName) {
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${flagName}.`);
    }

    return value;
}

function parseReports(reportValues) {
    if (reportValues.length === 0) {
        return [...DEFAULT_REPORTS];
    }

    const selected = new Set();
    for (const rawValue of reportValues) {
        for (const entry of rawValue.split(',')) {
            const format = entry.trim();
            if (!format) {
                continue;
            }
            if (!REPORT_FORMATS.has(format)) {
                throw new Error(`Unsupported report format "${format}". Supported: ${[...REPORT_FORMATS].join(', ')}`);
            }
            selected.add(format);
        }
    }

    if (selected.size === 0) {
        return [...DEFAULT_REPORTS];
    }

    return [...selected];
}

function parseArgs(argv) {
    const reportValues = [];
    const parsed = {
        component: undefined,
        url: undefined,
        reportDir: 'coverage/test-engine',
        strictKnownIssues: false,
        listComponents: false,
        help: false,
        vitestArgs: [],
    };

    let index = 0;
    while (index < argv.length) {
        const arg = argv[index];

        if (arg === '--') {
            if (
                index === 0 &&
                parsed.component === undefined &&
                parsed.url === undefined &&
                reportValues.length === 0 &&
                parsed.reportDir === 'coverage/test-engine' &&
                parsed.strictKnownIssues === false
            ) {
                index += 1;
                continue;
            }

            parsed.vitestArgs = argv.slice(index + 1);
            break;
        }

        if (arg === '--help' || arg === '-h') {
            parsed.help = true;
            index += 1;
            continue;
        }

        if (arg === '--list-components') {
            parsed.listComponents = true;
            index += 1;
            continue;
        }

        if (arg === '--strict-known-issues') {
            parsed.strictKnownIssues = true;
            index += 1;
            continue;
        }

        if (arg === '--component') {
            parsed.component = readRequiredValue(argv, index, '--component');
            index += 2;
            continue;
        }

        if (arg.startsWith('--component=')) {
            parsed.component = arg.slice('--component='.length);
            index += 1;
            continue;
        }

        if (arg === '--url') {
            parsed.url = readRequiredValue(argv, index, '--url');
            index += 2;
            continue;
        }

        if (arg.startsWith('--url=')) {
            parsed.url = arg.slice('--url='.length);
            index += 1;
            continue;
        }

        if (arg === '--report') {
            reportValues.push(readRequiredValue(argv, index, '--report'));
            index += 2;
            continue;
        }

        if (arg.startsWith('--report=')) {
            reportValues.push(arg.slice('--report='.length));
            index += 1;
            continue;
        }

        if (arg === '--report-dir') {
            parsed.reportDir = readRequiredValue(argv, index, '--report-dir');
            index += 2;
            continue;
        }

        if (arg.startsWith('--report-dir=')) {
            parsed.reportDir = arg.slice('--report-dir='.length);
            index += 1;
            continue;
        }

        throw new Error(`Unknown argument: ${arg}`);
    }

    parsed.reports = parseReports(reportValues);
    return parsed;
}

function normalizeBaseUrl(urlValue) {
    const parsed = new URL(urlValue);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Only http and https URLs are supported.');
    }

    return urlValue.replace(/\/+$/, '');
}

function ensureDirectory(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function toTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

function runCommand(command, args, options = {}) {
    const result = spawnSync(command, args, {
        encoding: 'utf8',
        stdio: 'pipe',
        ...options,
    });

    return {
        status: result.status ?? 1,
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        error: result.error,
    };
}

function readJson(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
}

function escapeXml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

function normalizeFailureMessage(message) {
    if (!message) {
        return '';
    }

    return String(message).trim();
}

function sanitizeFailureMessages(messages) {
    if (!Array.isArray(messages)) {
        return [];
    }

    return messages.map((message) => normalizeFailureMessage(message)).filter(Boolean);
}

function compactFailureReason(message) {
    const normalized = normalizeFailureMessage(message);
    if (!normalized) {
        return '';
    }

    const firstLine = normalized
        .split('\n')
        .map((line) => line.trim())
        .find(Boolean);

    return firstLine || normalized;
}

function formatFailureDetailLine(message) {
    return normalizeFailureMessage(message).replace(/\s+/g, ' ').trim();
}

function parseVitestResults(vitestReport) {
    const passedChecks = [];
    const failedChecks = [];
    const skippedChecks = [];

    for (const suite of vitestReport.testResults ?? []) {
        let suiteHasFailedAssertion = false;

        for (const assertion of suite.assertionResults ?? []) {
            const failureMessages = sanitizeFailureMessages(assertion.failureMessages);
            const check = {
                checkType: 'integration-test',
                suite: suite.name,
                name: assertion.fullName || assertion.title,
                durationMs: assertion.duration,
                reason: failureMessages[0] || '',
                failureMessages,
                status: assertion.status,
            };

            if (assertion.status === 'passed') {
                passedChecks.push(check);
                continue;
            }

            if (assertion.status === 'failed') {
                suiteHasFailedAssertion = true;
                failedChecks.push(check);
                continue;
            }

            skippedChecks.push(check);
        }

        if (suite.status === 'failed' && !suiteHasFailedAssertion) {
            const suiteMessage = normalizeFailureMessage(suite.message);
            failedChecks.push({
                checkType: 'integration-suite',
                suite: suite.name,
                name: `Suite failure: ${suite.name}`,
                durationMs: 0,
                reason: suiteMessage || 'Suite failed before assertions (setup hook or runtime error).',
                failureMessages: suiteMessage ? [suiteMessage] : [],
                status: 'failed',
            });
        }
    }

    return {
        summary: {
            success: Boolean(vitestReport.success),
            totalSuites: vitestReport.numTotalTestSuites ?? 0,
            passedSuites: vitestReport.numPassedTestSuites ?? 0,
            failedSuites: vitestReport.numFailedTestSuites ?? 0,
            totalTests: vitestReport.numTotalTests ?? 0,
            passedTests: vitestReport.numPassedTests ?? 0,
            failedTests: vitestReport.numFailedTests ?? 0,
            skippedTests: vitestReport.numPendingTests ?? 0,
            todoTests: vitestReport.numTodoTests ?? 0,
        },
        passedChecks,
        failedChecks,
        skippedChecks,
    };
}

function parseOpenApiResults(openApiReport, strictKnownIssues) {
    const criticalChecks = (openApiReport.criticalFindings ?? []).map((finding) => ({
        checkType: 'openapi-coverage-critical',
        name: finding,
        reason: finding,
        status: 'failed',
    }));

    const warningChecks = (openApiReport.warnings ?? []).map((warning) => ({
        checkType: 'openapi-coverage-warning',
        name: warning,
        reason: warning,
        status: 'warning',
    }));

    const knownIssueChecks = [];
    for (const row of openApiReport.matrix ?? []) {
        if (!Array.isArray(row.waivedRequiredStatuses) || row.waivedRequiredStatuses.length === 0) {
            continue;
        }

        knownIssueChecks.push({
            checkType: 'known-issue-waived',
            operationId: row.operationId,
            name: `${row.operationId} waived required statuses`,
            reason: `Waived required statuses: ${row.waivedRequiredStatuses.join(', ')}`,
            statuses: row.waivedRequiredStatuses,
            tests: row.skippedTests ?? [],
            status: strictKnownIssues ? 'failed' : 'known',
        });
    }

    const failedChecks = [...criticalChecks];
    if (strictKnownIssues) {
        failedChecks.push(...knownIssueChecks);
    }

    return {
        summary: {
            operationCount: openApiReport.operationCount ?? 0,
            criticalFindings: criticalChecks.length,
            warnings: warningChecks.length,
            knownIssueWaivers: knownIssueChecks.length,
        },
        failedChecks,
        warnings: warningChecks,
        knownIssues: knownIssueChecks,
    };
}

function buildReport({ component, baseUrl, strictKnownIssues, vitestRun, vitestResult, openApiRun, openApiResult }) {
    const vitestParsed = parseVitestResults(vitestResult);
    const openApiParsed = parseOpenApiResults(openApiResult, strictKnownIssues);

    const allFailedChecks = [...vitestParsed.failedChecks, ...openApiParsed.failedChecks];

    return {
        generatedAt: new Date().toISOString(),
        component: {
            id: component.id,
            displayName: component.displayName,
            endpoint: baseUrl,
            endpointEnvVar: component.endpointEnvVar,
            testFile: component.testFile,
            openapiService: component.openapiService,
        },
        strictKnownIssues,
        commands: {
            vitest: {
                exitCode: vitestRun.status,
                stdout: vitestRun.stdout,
                stderr: vitestRun.stderr,
            },
            openapiCoverage: {
                exitCode: openApiRun.status,
                stdout: openApiRun.stdout,
                stderr: openApiRun.stderr,
            },
        },
        summary: {
            passedChecks: vitestParsed.passedChecks.length,
            failedChecks: allFailedChecks.length,
            skippedChecks: vitestParsed.skippedChecks.length,
            warnings: openApiParsed.warnings.length,
            knownIssues: openApiParsed.knownIssues.length,
            success: allFailedChecks.length === 0,
        },
        vitest: {
            ...vitestParsed.summary,
            passedChecks: vitestParsed.passedChecks,
            failedChecks: vitestParsed.failedChecks,
            skippedChecks: vitestParsed.skippedChecks,
        },
        openapiCoverage: {
            ...openApiParsed.summary,
            failedChecks: openApiParsed.failedChecks,
            warnings: openApiParsed.warnings,
            knownIssues: openApiParsed.knownIssues,
        },
        failedChecks: allFailedChecks,
    };
}

function writeJsonReport(report, outputPath) {
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function writeMarkdownReport(report, outputPath) {
    const lines = [];
    lines.push('# BaSyx Integration Test Engine Report');
    lines.push('');
    lines.push(`- Generated at: ${report.generatedAt}`);
    lines.push(`- Component: ${report.component.displayName} (${report.component.id})`);
    lines.push(`- Endpoint: ${report.component.endpoint}`);
    lines.push(`- Strict known issues: ${report.strictKnownIssues}`);
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`- Success: ${report.summary.success}`);
    lines.push(`- Passed checks: ${report.summary.passedChecks}`);
    lines.push(`- Failed checks: ${report.summary.failedChecks}`);
    lines.push(`- Skipped checks: ${report.summary.skippedChecks}`);
    lines.push(`- Warnings: ${report.summary.warnings}`);
    lines.push(`- Known issues: ${report.summary.knownIssues}`);
    lines.push('');

    lines.push('## Failed Checks');
    lines.push('');
    if (report.failedChecks.length === 0) {
        lines.push('- None');
    } else {
        for (const failure of report.failedChecks) {
            lines.push(`- [${failure.checkType}] ${failure.name}`);
            if (failure.suite) {
                lines.push(`  - suite: ${failure.suite}`);
            }

            const primaryReason = failure.reason || failure.failureMessages?.[0] || 'No failure reason provided';
            lines.push(`  - reason: ${primaryReason}`);

            if (Array.isArray(failure.failureMessages) && failure.failureMessages.length > 1) {
                for (const extraMessage of failure.failureMessages.slice(1, 5)) {
                    lines.push(`  - detail: ${formatFailureDetailLine(extraMessage)}`);
                }
            }
        }
    }
    lines.push('');

    lines.push('## OpenAPI Coverage Warnings');
    lines.push('');
    if ((report.openapiCoverage.warnings ?? []).length === 0) {
        lines.push('- None');
    } else {
        for (const warning of report.openapiCoverage.warnings) {
            lines.push(`- ${warning.reason}`);
        }
    }
    lines.push('');

    lines.push('## Known Issues');
    lines.push('');
    if ((report.openapiCoverage.knownIssues ?? []).length === 0) {
        lines.push('- None');
    } else {
        for (const issue of report.openapiCoverage.knownIssues) {
            lines.push(`- ${issue.operationId}: ${issue.reason}`);
        }
    }
    lines.push('');

    fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
}

function writeJunitReport(report, outputPath) {
    const tests = [];

    for (const check of report.vitest.passedChecks ?? []) {
        tests.push({
            suiteName: 'integration-tests',
            name: check.name,
            status: 'passed',
            durationMs: check.durationMs ?? 0,
            message: '',
        });
    }

    for (const check of report.vitest.failedChecks ?? []) {
        tests.push({
            suiteName: 'integration-tests',
            name: check.name,
            status: 'failed',
            durationMs: check.durationMs ?? 0,
            message: compactFailureReason(check.reason || check.failureMessages?.[0] || 'No failure message'),
        });
    }

    for (const check of report.openapiCoverage.failedChecks ?? []) {
        tests.push({
            suiteName: 'openapi-coverage',
            name: check.name,
            status: 'failed',
            durationMs: 0,
            message: check.reason || 'OpenAPI coverage check failed',
        });
    }

    const total = tests.length;
    const failures = tests.filter((test) => test.status === 'failed').length;

    const testCaseXml = tests
        .map((test) => {
            const failureXml =
                test.status === 'failed'
                    ? `\n      <failure message="${escapeXml(test.message)}">${escapeXml(test.message)}</failure>`
                    : '';

            return `    <testcase classname="${escapeXml(test.suiteName)}" name="${escapeXml(test.name)}" time="${(
                (test.durationMs ?? 0) / 1000
            ).toFixed(6)}">${failureXml}\n    </testcase>`;
        })
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites name="basyx-test-engine" tests="${total}" failures="${failures}">\n  <testsuite name="${escapeXml(
        report.component.id
    )}" tests="${total}" failures="${failures}" skipped="0" errors="0">\n${testCaseXml}\n  </testsuite>\n</testsuites>\n`;

    fs.writeFileSync(outputPath, xml, 'utf8');
}

function printConsoleSummary(report, artifactPaths) {
    console.log('');
    console.log(`Component: ${report.component.displayName} (${report.component.id})`);
    console.log(`Endpoint: ${report.component.endpoint}`);
    console.log(`Success: ${report.summary.success}`);
    console.log(`Passed checks: ${report.summary.passedChecks}`);
    console.log(`Failed checks: ${report.summary.failedChecks}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Known issues: ${report.summary.knownIssues}`);

    if (report.failedChecks.length > 0) {
        console.log('');
        console.log('Failed checks:');
        for (const failure of report.failedChecks) {
            console.log(`- [${failure.checkType}] ${failure.name}`);
            const primaryReason = failure.reason || failure.failureMessages?.[0] || 'No failure reason provided';
            console.log(`  reason: ${primaryReason}`);

            if (Array.isArray(failure.failureMessages) && failure.failureMessages.length > 1) {
                for (const extraMessage of failure.failureMessages.slice(1, 3)) {
                    console.log(`  detail: ${formatFailureDetailLine(extraMessage)}`);
                }
            }
        }
    }

    if (artifactPaths.length > 0) {
        console.log('');
        console.log('Artifacts:');
        for (const artifact of artifactPaths) {
            console.log(`- ${artifact}`);
        }
    }
}

function listComponents() {
    console.log('Available components:');
    for (const [id, config] of Object.entries(COMPONENT_CATALOG)) {
        console.log(`- ${id}: ${config.displayName}`);
    }
}

function main() {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
        printUsage();
        process.exitCode = 0;
        return;
    }

    if (args.listComponents) {
        listComponents();
        process.exitCode = 0;
        return;
    }

    assert(args.component, 'Missing required argument: --component');
    assert(args.url, 'Missing required argument: --url');

    const componentConfig = COMPONENT_CATALOG[args.component];
    assert(
        componentConfig,
        `Unsupported component "${args.component}". Use --list-components to inspect valid options.`
    );

    const baseUrl = normalizeBaseUrl(args.url);
    const reportDir = path.resolve(process.cwd(), args.reportDir);
    ensureDirectory(reportDir);

    const timestamp = toTimestamp();
    const reportPrefix = `${args.component}-${timestamp}`;
    const vitestReportPath = path.join(reportDir, `${reportPrefix}.vitest.raw.json`);

    const env = {
        ...process.env,
        [ENGINE_MODE_ENV]: 'true',
        BASYX_SKIP_DOCKER_SETUP: 'true',
        [componentConfig.endpointEnvVar]: baseUrl,
    };

    const vitestRun = runCommand(
        'pnpm',
        [
            'exec',
            'vitest',
            'run',
            '--project',
            'integration-tests',
            componentConfig.testFile,
            '--reporter',
            'json',
            '--outputFile',
            vitestReportPath,
            ...args.vitestArgs,
        ],
        { env }
    );

    if (vitestRun.error) {
        throw new Error(`Failed to execute Vitest: ${vitestRun.error.message}`);
    }

    assert(fs.existsSync(vitestReportPath), `Vitest report was not created at ${vitestReportPath}`);
    const vitestResult = readJson(vitestReportPath);

    const openApiRun = runCommand(
        process.execPath,
        ['scripts/validate-openapi-coverage.mjs', '--service', componentConfig.openapiService],
        { env }
    );

    if (openApiRun.error) {
        throw new Error(`Failed to execute OpenAPI coverage validation: ${openApiRun.error.message}`);
    }

    const openApiReportPath = path.join(
        process.cwd(),
        'coverage',
        'openapi-coverage',
        `${componentConfig.openapiService}.json`
    );
    assert(fs.existsSync(openApiReportPath), `OpenAPI coverage report was not created at ${openApiReportPath}`);
    const openApiResult = readJson(openApiReportPath);

    const report = buildReport({
        component: {
            id: args.component,
            ...componentConfig,
        },
        baseUrl,
        strictKnownIssues: args.strictKnownIssues,
        vitestRun,
        vitestResult,
        openApiRun,
        openApiResult,
    });

    const artifactPaths = [];
    if (args.reports.includes('json')) {
        const outputPath = path.join(reportDir, `${reportPrefix}.report.json`);
        writeJsonReport(report, outputPath);
        artifactPaths.push(path.relative(process.cwd(), outputPath));
    }

    if (args.reports.includes('markdown')) {
        const outputPath = path.join(reportDir, `${reportPrefix}.report.md`);
        writeMarkdownReport(report, outputPath);
        artifactPaths.push(path.relative(process.cwd(), outputPath));
    }

    if (args.reports.includes('junit')) {
        const outputPath = path.join(reportDir, `${reportPrefix}.report.junit.xml`);
        writeJunitReport(report, outputPath);
        artifactPaths.push(path.relative(process.cwd(), outputPath));
    }

    if (args.reports.includes('console')) {
        printConsoleSummary(report, artifactPaths);
    }

    process.exitCode = report.summary.success ? 0 : 1;
}

try {
    main();
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Test engine failed: ${message}`);
    process.exitCode = 1;
}
