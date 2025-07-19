export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  comment?: string;
  primary_key?: boolean;
}

export interface TableSchema {
  table_name: string;
  catalog?: string;
  schema?: string;
  rows: number;
  columns: TableColumn[];
}

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