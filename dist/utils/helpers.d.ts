/**
 * Build a fully qualified table name with optional catalog and schema
 * Equivalent to the Go BuildTableName function
 */
export declare function buildTableName(catalog?: string, schema?: string, tableName?: string): string;
/**
 * Generate output filename based on input file and suffix
 * Equivalent to the Go generateOutputFilename function
 */
export declare function generateOutputFilename(inputFile: string, suffix: string): string;
/**
 * Escape single quotes in SQL strings by doubling them
 */
export declare function escapeSqlString(text: string): string;
/**
 * Validate file extension is YAML
 */
export declare function isValidYamlFile(filename: string): boolean;
//# sourceMappingURL=helpers.d.ts.map