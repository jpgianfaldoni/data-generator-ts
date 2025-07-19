/**
 * Column represents a single column in the table
 * (Copied from backend types for browser compatibility)
 */
export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  comment?: string;
  primary_key?: boolean;
}

/**
 * TableSchema represents the overall table definition
 * (Copied from backend types for browser compatibility)
 */
export interface TableSchema {
  table_name: string;
  catalog?: string;
  schema?: string;
  columns: Column[];
  rows: number; // Number of rows to generate for INSERT
}

/**
 * SQL Generation result
 * (Copied from backend types for browser compatibility)
 */
export interface SqlGenerationResult {
  createSql: string;
  insertSql?: string;
  createOutputFile: string;
  insertOutputFile?: string;
}

/**
 * Supported Databricks data types
 */
export type DatabricksDataType = 
  | 'BIGINT' 
  | 'INT' 
  | 'SMALLINT' 
  | 'TINYINT'
  | 'STRING' 
  | 'VARCHAR'
  | 'BOOLEAN'
  | 'TIMESTAMP' 
  | 'DATE'
  | 'DECIMAL'
  | 'DOUBLE' 
  | 'FLOAT'; 