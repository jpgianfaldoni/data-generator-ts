import { faker } from '@faker-js/faker';
import moment from 'moment';
import type { TableSchema, Column, SqlGenerationResult } from '../types/schema';

/**
 * Browser-compatible SQL Generator Service
 * Reuses the core logic from backend but without Node.js dependencies
 */
export class SqlGeneratorService {
  
  /**
   * Generate CREATE TABLE SQL statement
   * Copied from backend logic
   */
  public generateCreateTableSQL(tableSchema: TableSchema): string {
    const tableName = this.buildTableName(
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
        const escapedComment = this.escapeSqlString(col.comment);
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
   * Copied from backend logic
   */
  public generateInsertSQL(tableSchema: TableSchema): string {
    if (tableSchema.rows <= 0) {
      return '';
    }

    const tableName = this.buildTableName(
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
   * Generate both CREATE and INSERT SQL (browser-compatible version)
   */
  public generateSqlFiles(tableSchema: TableSchema, filename: string = 'table'): SqlGenerationResult {
    const createSql = this.generateCreateTableSQL(tableSchema);
    const createOutputFile = `${filename}_create.sql`;

    let insertSql: string | undefined;
    let insertOutputFile: string | undefined;

    if (tableSchema.rows > 0) {
      insertSql = this.generateInsertSQL(tableSchema);
      insertOutputFile = `${filename}_insert.sql`;
    }

    return {
      createSql,
      insertSql,
      createOutputFile,
      insertOutputFile
    };
  }

  /**
   * Build a fully qualified table name
   * Copied from backend helpers
   */
  private buildTableName(catalog?: string, schema?: string, tableName?: string): string {
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
   * Generate primary key value (incremental)
   * Copied from backend logic
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
   * Copied from backend logic with the updated switch statement
   */
  private generateRandomValue(column: Column): string {
    // Handle nullable columns (10% chance for NULL)
    if (column.nullable && !column.primary_key && Math.random() < 0.1) {
      return 'NULL';
    }

    const dataType = column.type.toUpperCase();

    switch (dataType) {
      case 'BIGINT':
        return faker.number.bigInt({ min: 1n, max: 9223372036854775807n }).toString();
      
      case 'INT':
        return faker.number.int({ min: 1, max: 2147483647 }).toString();
      
      case 'SMALLINT':
        return faker.number.int({ min: 1, max: 32767 }).toString();
      
      case 'TINYINT':
        return faker.number.int({ min: 1, max: 127 }).toString();
      
      case 'DECIMAL':
        // Extract precision and scale from DECIMAL(precision, scale)
        const decimalMatch = dataType.match(/DECIMAL\((\d+),\s*(\d+)\)/);
        if (decimalMatch) {
          const precision = parseInt(decimalMatch[1]!);
          const scale = parseInt(decimalMatch[2]!);
          const value = faker.number.float({ 
            min: 0, 
            max: Math.pow(10, precision - scale) - 1,
            fractionDigits: scale
          });
          return value.toFixed(scale);
        }
        return faker.number.float({ min: 0, max: 999999.99, fractionDigits: 2 }).toString();
      
      case 'DOUBLE':
      case 'FLOAT':
        return faker.number.float({ min: 0, max: 999999.999999, fractionDigits: 6 }).toString();
      
      case 'STRING':
        const text = faker.lorem.words(faker.number.int({ min: 1, max: 5 }));
        return `'${this.escapeSqlString(text)}'`;
      
      case 'VARCHAR':
        // Extract length from VARCHAR(n)
        const varcharMatch = dataType.match(/VARCHAR\((\d+)\)/);
        const maxLength = varcharMatch ? parseInt(varcharMatch[1]!) : 50;
        const varcharText = faker.lorem.words(faker.number.int({ min: 1, max: 3 }));
        const truncatedText = varcharText.substring(0, Math.min(varcharText.length, maxLength));
        return `'${this.escapeSqlString(truncatedText)}'`;
      
      case 'BOOLEAN':
        return faker.datatype.boolean().toString().toUpperCase();
      
      case 'DATE':
        const date = faker.date.between({ 
          from: '2020-01-01', 
          to: '2024-12-31' 
        });
        return `'${moment(date).format('YYYY-MM-DD')}'`;
      
      case 'TIMESTAMP':
        const timestamp = faker.date.between({ 
          from: '2020-01-01', 
          to: '2024-12-31' 
        });
        return `'${moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}'`;
      
      default:
        // Default fallback
        return `'${this.escapeSqlString(faker.lorem.word())}'`;
    }
  }

  /**
   * Escape single quotes in SQL strings
   * Copied from backend helpers
   */
  private escapeSqlString(text: string): string {
    return text.replace(/'/g, "''");
  }
} 