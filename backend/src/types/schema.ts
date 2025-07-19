/**
 * Column represents a single column in the table
 * Equivalent to the Go Column struct
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
 * Equivalent to the Go TableSchema struct
 */
export interface TableSchema {
  table_name: string;
  catalog?: string;
  schema?: string;
  columns: Column[];
  rows: number; // Number of rows to generate for INSERT
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

/**
 * SQL Generation result
 */
export interface SqlGenerationResult {
  createSql: string;
  insertSql?: string;
  createOutputFile: string;
  insertOutputFile?: string;
} 