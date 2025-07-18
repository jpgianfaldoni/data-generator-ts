"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTableName = buildTableName;
exports.generateOutputFilename = generateOutputFilename;
exports.escapeSqlString = escapeSqlString;
exports.isValidYamlFile = isValidYamlFile;
const path_1 = require("path");
/**
 * Build a fully qualified table name with optional catalog and schema
 * Equivalent to the Go BuildTableName function
 */
function buildTableName(catalog, schema, tableName) {
    if (!tableName) {
        throw new Error('Table name is required');
    }
    const parts = [];
    if (catalog && catalog.trim() !== '') {
        parts.push(catalog.trim());
    }
    if (schema && schema.trim() !== '') {
        parts.push(schema.trim());
    }
    parts.push(tableName.trim());
    return parts.join('.');
}
/**
 * Generate output filename based on input file and suffix
 * Equivalent to the Go generateOutputFilename function
 */
function generateOutputFilename(inputFile, suffix) {
    // Get just the filename without the path
    const filename = (0, path_1.basename)(inputFile);
    // Get the file extension
    const ext = (0, path_1.extname)(filename);
    // Remove extension and add suffix + .sql
    const baseName = (0, path_1.basename)(filename, ext);
    const sqlFilename = baseName + suffix + '.sql';
    // Return the full path in the output directory
    return (0, path_1.join)('output', sqlFilename);
}
/**
 * Escape single quotes in SQL strings by doubling them
 */
function escapeSqlString(text) {
    return text.replace(/'/g, "''");
}
/**
 * Validate file extension is YAML
 */
function isValidYamlFile(filename) {
    const ext = (0, path_1.extname)(filename).toLowerCase();
    return ext === '.yaml' || ext === '.yml';
}
//# sourceMappingURL=helpers.js.map