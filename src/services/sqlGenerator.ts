import { faker } from '@faker-js/faker';
import moment from 'moment';
import * as fs from 'fs-extra';
import { TableSchema, Column, SqlGenerationResult } from '../types/schema';
import { buildTableName, generateOutputFilename, escapeSqlString } from '../utils/helpers';

/**
 * SQL Generator Service - Converts YAML table schemas to Databricks SQL
 * This is the TypeScript equivalent of the Go sqlgen package
 */
export class SqlGeneratorService {
  
  /**
   * Generate CREATE TABLE SQL statement
   * Equivalent to the Go GenerateCreateTableSQL method
   */
  public generateCreateTableSQL(tableSchema: TableSchema): string {
    const tableName = buildTableName(
      tableSchema.catalog,
      tableSchema.schema,
      tableSchema.table_name
    );

    let sql = `CREATE TABLE ${tableName} (\n`;

    // Track primary key columns
    const primaryKeyColumns: string[] = [];

    // Add each column
    tableSchema.columns.forEach((col, index) => {
      sql += '  ';
      sql += col.name;
      sql += ' ';
      sql += col.type;

      // Add NULL/NOT NULL constraint
      if (!col.nullable || col.primary_key) {
        sql += ' NOT NULL';
      }

      // Add comment if provided
      if (col.comment) {
        // Escape single quotes in comments by doubling them
        const escapedComment = escapeSqlString(col.comment);
        sql += ` COMMENT '${escapedComment}'`;
      }

      // Track primary key columns
      if (col.primary_key) {
        primaryKeyColumns.push(col.name);
      }

      // Add comma if not the last column or if we have primary keys to add
      if (index < tableSchema.columns.length - 1 || primaryKeyColumns.length > 0) {
        sql += ',';
      }

      sql += '\n';
    });

    // Add PRIMARY KEY constraint if we have primary key columns
    if (primaryKeyColumns.length > 0) {
      sql += `  PRIMARY KEY (${primaryKeyColumns.join(', ')})\n`;
    }

    sql += ');';

    return sql;
  }

  /**
   * Generate INSERT SQL statements with random data
   * Equivalent to the Go GenerateInsertSQL method
   */
  public generateInsertSQL(tableSchema: TableSchema): string {
    if (tableSchema.rows <= 0) {
      return '';
    }

    const tableName = buildTableName(
      tableSchema.catalog,
      tableSchema.schema,
      tableSchema.table_name
    );

    const columnNames = tableSchema.columns.map(col => col.name);
    let sql = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES\n`;

    // Initialize primary key counters
    const primaryKeyCounters: { [key: string]: number } = {};
    tableSchema.columns.forEach(col => {
      if (col.primary_key) {
        primaryKeyCounters[col.name] = 1; // Start from 1 for primary keys
      }
    });

    const rows: string[] = [];

    for (let i = 0; i < tableSchema.rows; i++) {
      const values = tableSchema.columns.map(col => {
        if (col.primary_key) {
          // Generate incremental value for primary key
          const value = this.generatePrimaryKeyValue(col.type, primaryKeyCounters[col.name]!);
          primaryKeyCounters[col.name]++;
          return value;
        } else {
          // Generate random value for non-primary key columns
          return this.generateRandomValue(col);
        }
      });
      rows.push(`(${values.join(', ')})`);
    }

    sql += rows.join(',\n');
    sql += ';';

    return sql;
  }

  /**
   * Generate primary key value (incremental)
   */
  private generatePrimaryKeyValue(dataType: string, counter: number): string {
    const type = dataType.toUpperCase();
    
    if (['BIGINT', 'INT', 'SMALLINT', 'TINYINT'].includes(type)) {
      return counter.toString();
    }
    
    if (type === 'STRING' || type.startsWith('VARCHAR')) {
      return `'pk_${counter}'`;
    }
    
    // Default to integer
    return counter.toString();
  }

  /**
   * Generate random value based on column type and constraints
   * Equivalent to the Go generateRandomValue function
   */
  private generateRandomValue(column: Column): string {
    // Handle nullable columns (10% chance for NULL)
    if (column.nullable && !column.primary_key && Math.random() < 0.1) {
      return 'NULL';
    }

    const dataType = column.type.toUpperCase();

    // Handle numeric types
    if (dataType === 'BIGINT') {
      return faker.number.bigInt({ min: 1n, max: 9223372036854775807n }).toString();
    }
    
    if (dataType === 'INT') {
      return faker.number.int({ min: 1, max: 2147483647 }).toString();
    }
    
    if (dataType === 'SMALLINT') {
      return faker.number.int({ min: 1, max: 32767 }).toString();
    }
    
    if (dataType === 'TINYINT') {
      return faker.number.int({ min: 1, max: 127 }).toString();
    }

    // Handle decimal types
    if (dataType.startsWith('DECIMAL')) {
      // Extract precision and scale from DECIMAL(precision, scale)
      const match = dataType.match(/DECIMAL\((\d+),\s*(\d+)\)/);
      if (match) {
        const precision = parseInt(match[1]!);
        const scale = parseInt(match[2]!);
        const value = faker.number.float({ 
          min: 0, 
          max: Math.pow(10, precision - scale) - 1,
          fractionDigits: scale
        });
        return value.toFixed(scale);
      }
      return faker.number.float({ min: 0, max: 999999.99, fractionDigits: 2 }).toString();
    }

    if (dataType === 'DOUBLE' || dataType === 'FLOAT') {
      return faker.number.float({ min: 0, max: 999999.999999, fractionDigits: 6 }).toString();
    }

    // Handle string types
    if (dataType === 'STRING') {
      const text = faker.lorem.words(faker.number.int({ min: 1, max: 5 }));
      return `'${escapeSqlString(text)}'`;
    }

    if (dataType.startsWith('VARCHAR')) {
      // Extract length from VARCHAR(n)
      const match = dataType.match(/VARCHAR\((\d+)\)/);
      const maxLength = match ? parseInt(match[1]!) : 50;
      const text = faker.lorem.words(faker.number.int({ min: 1, max: 3 }));
      const truncatedText = text.substring(0, Math.min(text.length, maxLength));
      return `'${escapeSqlString(truncatedText)}'`;
    }

    // Handle boolean
    if (dataType === 'BOOLEAN') {
      return faker.datatype.boolean().toString().toUpperCase();
    }

    // Handle date/time types
    if (dataType === 'DATE') {
      const date = faker.date.between({ 
        from: '2020-01-01', 
        to: '2024-12-31' 
      });
      return `'${moment(date).format('YYYY-MM-DD')}'`;
    }

    if (dataType === 'TIMESTAMP') {
      const timestamp = faker.date.between({ 
        from: '2020-01-01', 
        to: '2024-12-31' 
      });
      return `'${moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}'`;
    }

    // Default fallback
    return `'${escapeSqlString(faker.lorem.word())}'`;
  }

  /**
   * Generate both CREATE and INSERT SQL files
   * Equivalent to the main workflow in the Go main.go
   */
  public async generateSqlFiles(
    tableSchema: TableSchema, 
    inputFilename: string
  ): Promise<SqlGenerationResult> {
    // Ensure output directory exists
    const outputDir = 'output';
    await fs.ensureDir(outputDir);

    // Generate CREATE TABLE SQL
    const createSql = this.generateCreateTableSQL(tableSchema);
    const createOutputFile = generateOutputFilename(inputFilename, '_create');

    // Write CREATE SQL file
    await fs.writeFile(createOutputFile, createSql, 'utf8');

    let insertSql: string | undefined;
    let insertOutputFile: string | undefined;

    // Generate INSERT SQL if rows > 0
    if (tableSchema.rows > 0) {
      insertSql = this.generateInsertSQL(tableSchema);
      insertOutputFile = generateOutputFilename(inputFilename, '_insert');
      await fs.writeFile(insertOutputFile, insertSql, 'utf8');
    }

    return {
      createSql,
      insertSql,
      createOutputFile,
      insertOutputFile
    };
  }
} 