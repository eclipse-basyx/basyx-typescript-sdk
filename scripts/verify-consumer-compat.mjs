import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const exportRoot = packageJson.exports?.['.'];
if (!exportRoot) {
    throw new Error('Missing exports["."] in package.json');
}

const importPath = exportRoot.import;
const requirePath = exportRoot.require;
const typesPath = exportRoot.types;

for (const [label, relPath] of [
    ['import', importPath],
    ['require', requirePath],
    ['types', typesPath],
]) {
    if (!relPath || typeof relPath !== 'string') {
        throw new Error(`Missing ${label} export target`);
    }

    const absolutePath = path.resolve(repoRoot, relPath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Missing expected ${label} artifact: ${relPath}`);
    }
}

const requireEntryPath = path.resolve(repoRoot, requirePath);
const importEntryPath = path.resolve(repoRoot, importPath);
const requireFromRepo = createRequire(import.meta.url);

const cjsExports = requireFromRepo(requireEntryPath);
const esmExports = await import(pathToFileURL(importEntryPath).href);

const requiredSymbols = ['Configuration', 'AasService', 'SubmodelService', 'AasRepositoryClient'];
for (const symbol of requiredSymbols) {
    if (!(symbol in cjsExports)) {
        throw new Error(`CJS export is missing symbol: ${symbol}`);
    }
    if (!(symbol in esmExports)) {
        throw new Error(`ESM export is missing symbol: ${symbol}`);
    }
}

console.log('Consumer compatibility checks passed.');
