import { basename, extname, join } from 'path';

/**
 * Build a fully qualified table name with optional catalog and schema
 * Equivalent to the Go BuildTableName function
 */
export function buildTableName(catalog?: string, schema?: string, tableName?: string): string {
  if (!tableName) {
    throw new Error('Table name is required');
  }

  const parts: string[] = [];
  
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
export function generateOutputFilename(inputFile: string, suffix: string): string {
  // Get just the filename without the path
  const filename = basename(inputFile);
  
  // Get the file extension
  const ext = extname(filename);
  
  // Remove extension and add suffix + .sql
  const baseName = basename(filename, ext);
  const sqlFilename = baseName + suffix + '.sql';
  
  // Return the full path in the output directory
  return join('output', sqlFilename);
}

/**
 * Escape single quotes in SQL strings by doubling them
 */
export function escapeSqlString(text: string): string {
  return text.replace(/'/g, "''");
}

/**
 * Validate file extension is YAML
 */
export function isValidYamlFile(filename: string): boolean {
  const ext = extname(filename).toLowerCase();
  return ext === '.yaml' || ext === '.yml';
} 