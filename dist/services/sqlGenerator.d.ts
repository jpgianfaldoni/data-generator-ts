import { TableSchema, SqlGenerationResult } from '../types/schema';
/**
 * SQL Generator Service - Converts YAML table schemas to Databricks SQL
 * This is the TypeScript equivalent of the Go sqlgen package
 */
export declare class SqlGeneratorService {
    /**
     * Generate CREATE TABLE SQL statement
     * Equivalent to the Go GenerateCreateTableSQL method
     */
    generateCreateTableSQL(tableSchema: TableSchema): string;
    /**
     * Generate INSERT SQL statements with random data
     * Equivalent to the Go GenerateInsertSQL method
     */
    generateInsertSQL(tableSchema: TableSchema): string;
    /**
     * Generate primary key value (incremental)
     */
    private generatePrimaryKeyValue;
    /**
     * Generate random value based on column type and constraints
     * Equivalent to the Go generateRandomValue function
     */
    private generateRandomValue;
    /**
     * Generate both CREATE and INSERT SQL files
     * Equivalent to the main workflow in the Go main.go
     */
    generateSqlFiles(tableSchema: TableSchema, inputFilename: string): Promise<SqlGenerationResult>;
}
//# sourceMappingURL=sqlGenerator.d.ts.map