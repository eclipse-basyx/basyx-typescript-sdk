import fs from 'node:fs';
import path from 'node:path';

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
            const methodMatches = [...clientSource.matchAll(/async\s+([A-Za-z0-9_]+)\s*\(/g)];
            const methodNames = [...new Set(methodMatches.map((match) => match[1]))];

            for (const methodName of methodNames) {
                if (!integrationText.includes(methodName)) {
                    const clientBaseName = path.basename(clientFile);
                    missingMethods.push(`${clientBaseName}:${methodName}`);
                }
            }
        }

        expect(missingMethods).toEqual([]);
    });
});
