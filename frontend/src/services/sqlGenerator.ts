import type { TableSchema, TableColumn, SqlGenerationResult } from '../types/schema';
import { faker } from '@faker-js/faker';

export class SqlGeneratorService {
  generateSqlFiles(tableSchema: TableSchema, outputFileName: string): SqlGenerationResult {
    const createSql = this.generateCreateStatement(tableSchema);
    const insertSql = tableSchema.rows > 0 ? this.generateInsertStatements(tableSchema) : undefined;
    
    return {
      createSql,
      insertSql,
      createOutputFile: `${outputFileName}_create.sql`,
      insertOutputFile: insertSql ? `${outputFileName}_insert.sql` : undefined
    };
  }

  private generateCreateStatement(tableSchema: TableSchema): string {
    const { table_name, catalog, schema, columns } = tableSchema;
    
    // Build table name with catalog and schema
    let fullTableName = table_name;
    if (catalog && schema) {
      fullTableName = `${catalog}.${schema}.${table_name}`;
    } else if (schema) {
      fullTableName = `${schema}.${table_name}`;
    }

    // Generate column definitions
    const columnDefs = columns.map(col => {
      let def = `  ${col.name} ${col.type}`;
      
      if (!col.nullable) {
        def += ' NOT NULL';
      }
      
      if (col.comment) {
        def += ` COMMENT '${col.comment}'`;
      }
      
      return def;
    }).join(',\n');

    // Generate primary key constraint if any
    const primaryKeyColumns = columns.filter(col => col.primary_key).map(col => col.name);
    let primaryKeyConstraint = '';
    if (primaryKeyColumns.length > 0) {
      primaryKeyConstraint = `,\n  PRIMARY KEY (${primaryKeyColumns.join(', ')})`;
    }

    return `CREATE TABLE ${fullTableName} (\n${columnDefs}${primaryKeyConstraint}\n);`;
  }

  private generateInsertStatements(tableSchema: TableSchema): string {
    const { table_name, catalog, schema, columns, rows } = tableSchema;
    
    // Build table name with catalog and schema
    let fullTableName = table_name;
    if (catalog && schema) {
      fullTableName = `${catalog}.${schema}.${table_name}`;
    } else if (schema) {
      fullTableName = `${schema}.${table_name}`;
    }

    const columnNames = columns.map(col => col.name).join(', ');
    const insertStatements: string[] = [];

    for (let i = 0; i < rows; i++) {
      const values = columns.map(col => this.generateFakeValue(col, i)).join(', ');
      insertStatements.push(`INSERT INTO ${fullTableName} (${columnNames}) VALUES (${values});`);
    }

    return insertStatements.join('\n');
  }

  private generateFakeValue(column: TableColumn, rowIndex: number): string {
    const { type, nullable, primary_key, name } = column;
    
    // Handle nullable columns (20% chance of NULL)
    if (nullable && !primary_key && Math.random() < 0.2) {
      return 'NULL';
    }

    // Handle primary key auto-increment
    if (primary_key && (type.includes('INT') || type.includes('BIGINT'))) {
      return (rowIndex + 1).toString();
    }

    // Generate values based on type
    const upperType = type.toUpperCase();
    const lowerName = name.toLowerCase();

    // String/Text types
    if (upperType.includes('STRING') || upperType.includes('VARCHAR') || upperType.includes('TEXT')) {
      return `'${this.generateStringValue(lowerName)}'`;
    }

    // Numeric types
    if (upperType.includes('BIGINT')) {
      return faker.number.bigInt({ min: 1000000000n, max: 9999999999n }).toString();
    }
    if (upperType.includes('INT')) {
      return faker.number.int({ min: 1, max: 100000 }).toString();
    }
    if (upperType.includes('SMALLINT')) {
      return faker.number.int({ min: 1, max: 32767 }).toString();
    }
    if (upperType.includes('TINYINT')) {
      return faker.number.int({ min: 1, max: 255 }).toString();
    }
    if (upperType.includes('DECIMAL') || upperType.includes('NUMERIC')) {
      return faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }).toString();
    }
    if (upperType.includes('DOUBLE') || upperType.includes('FLOAT')) {
      return faker.number.float({ min: 0, max: 10000, fractionDigits: 3 }).toString();
    }

    // Boolean type
    if (upperType.includes('BOOLEAN') || upperType.includes('BOOL')) {
      return faker.datatype.boolean().toString().toUpperCase();
    }

    // Date/Time types
    if (upperType.includes('DATE')) {
      return `'${faker.date.past({ years: 5 }).toISOString().split('T')[0]}'`;
    }
    if (upperType.includes('TIMESTAMP') || upperType.includes('DATETIME')) {
      return `'${faker.date.past({ years: 2 }).toISOString().replace('T', ' ').split('.')[0]}'`;
    }

    // Default fallback
    return `'${faker.lorem.word()}'`;
  }

  private generateStringValue(columnName: string): string {
    // Generate contextual fake data based on column name
    if (columnName.includes('email')) {
      return faker.internet.email();
    }
    if (columnName.includes('phone')) {
      return faker.phone.number();
    }
    if (columnName.includes('name') && !columnName.includes('username')) {
      if (columnName.includes('first')) return faker.person.firstName();
      if (columnName.includes('last')) return faker.person.lastName();
      return faker.person.fullName();
    }
    if (columnName.includes('username') || columnName.includes('user_name')) {
      return faker.internet.userName();
    }
    if (columnName.includes('address')) {
      return faker.location.streetAddress();
    }
    if (columnName.includes('city')) {
      return faker.location.city();
    }
    if (columnName.includes('state')) {
      return faker.location.state();
    }
    if (columnName.includes('country')) {
      return faker.location.country();
    }
    if (columnName.includes('company')) {
      return faker.company.name();
    }
    if (columnName.includes('title') || columnName.includes('job')) {
      return faker.person.jobTitle();
    }
    if (columnName.includes('description')) {
      return faker.lorem.sentence();
    }
    if (columnName.includes('url') || columnName.includes('website')) {
      return faker.internet.url();
    }
    if (columnName.includes('color')) {
      return faker.color.human();
    }

    // Default random text
    return faker.lorem.words({ min: 1, max: 3 });
  }
} 