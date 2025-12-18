export function process(sourceText) {
    return {
        code: `module.exports = ${JSON.stringify(sourceText)};`,
    };
}
