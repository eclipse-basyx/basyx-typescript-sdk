import fs from 'node:fs';
import path from 'node:path';

type ClientMethodData = {
    methodNames: string[];
    delegationMap: Map<string, string>;
};

function parseClientMethodData(clientSource: string): ClientMethodData {
    const methodRegex = /async\s+([A-Za-z0-9_]+)\s*\(/g;
    const delegatorRegex =
        /async\s+([A-Za-z0-9_]+)\s*\(\s*options\s*:\s*\{[\s\S]*?\}\s*\)\s*:\s*Promise<[\s\S]*?>\s*\{\s*return\s+this\.([A-Za-z0-9_]+)\(options\);\s*\}/g;
    const methodNames = new Set<string>();
    const delegationMap = new Map<string, string>();

    let match: RegExpExecArray | null;
    while ((match = methodRegex.exec(clientSource)) !== null) {
        methodNames.add(match[1]);
    }

    while ((match = delegatorRegex.exec(clientSource)) !== null) {
        delegationMap.set(match[1], match[2]);
    }

    return {
        methodNames: [...methodNames],
        delegationMap,
    };
}

describe('Client Integration Coverage Guard', () => {
    test('all client methods are covered in component integration tests', () => {
        const workspaceRoot = process.cwd();
        const clientsDir = path.join(workspaceRoot, 'src', 'clients');
        const integrationDir = path.join(workspaceRoot, 'src', 'integration-tests');

        const clientFiles = fs
            .readdirSync(clientsDir)
            .filter((fileName) => fileName.endsWith('Client.ts'))
            .map((fileName) => path.join(clientsDir, fileName));

        const integrationFiles = fs
            .readdirSync(integrationDir)
            .filter(
                (fileName) =>
                    fileName.endsWith('.integration.test.ts') && fileName !== 'clientMethodCoverage.integration.test.ts'
            )
            .map((fileName) => path.join(integrationDir, fileName));

        const integrationText = integrationFiles.map((filePath) => fs.readFileSync(filePath, 'utf8')).join('\n');

        const missingMethods: string[] = [];

        for (const clientFile of clientFiles) {
            const clientSource = fs.readFileSync(clientFile, 'utf8');
            const { methodNames, delegationMap } = parseClientMethodData(clientSource);

            for (const methodName of methodNames) {
                const delegatedAliases = [...delegationMap.entries()]
                    .filter(([, targetMethod]) => targetMethod === methodName)
                    .map(([aliasMethod]) => aliasMethod);

                const isCoveredDirectly = integrationText.includes(methodName);
                const isCoveredViaAlias = delegatedAliases.some((aliasMethod) => integrationText.includes(aliasMethod));

                if (!isCoveredDirectly && !isCoveredViaAlias) {
                    const clientBaseName = path.basename(clientFile);
                    missingMethods.push(`${clientBaseName}:${methodName}`);
                }
            }
        }

        expect(missingMethods).toEqual([]);
    });
});
