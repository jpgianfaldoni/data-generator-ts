"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlGeneratorService = void 0;
const faker_1 = require("@faker-js/faker");
const moment_1 = __importDefault(require("moment"));
const fs = __importStar(require("fs-extra"));
const helpers_1 = require("../utils/helpers");
/**
 * SQL Generator Service - Converts YAML table schemas to Databricks SQL
 * This is the TypeScript equivalent of the Go sqlgen package
 */
class SqlGeneratorService {
    /**
     * Generate CREATE TABLE SQL statement
     * Equivalent to the Go GenerateCreateTableSQL method
     */
    generateCreateTableSQL(tableSchema) {
        const tableName = (0, helpers_1.buildTableName)(tableSchema.catalog, tableSchema.schema, tableSchema.table_name);
        let sql = `CREATE TABLE ${tableName} (\n`;
        // Track primary key columns
        const primaryKeyColumns = [];
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
                const escapedComment = (0, helpers_1.escapeSqlString)(col.comment);
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
    generateInsertSQL(tableSchema) {
        if (tableSchema.rows <= 0) {
            return '';
        }
        const tableName = (0, helpers_1.buildTableName)(tableSchema.catalog, tableSchema.schema, tableSchema.table_name);
        const columnNames = tableSchema.columns.map(col => col.name);
        let sql = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES\n`;
        // Initialize primary key counters
        const primaryKeyCounters = {};
        tableSchema.columns.forEach(col => {
            if (col.primary_key) {
                primaryKeyCounters[col.name] = 1; // Start from 1 for primary keys
            }
        });
        const rows = [];
        for (let i = 0; i < tableSchema.rows; i++) {
            const values = tableSchema.columns.map(col => {
                if (col.primary_key) {
                    // Generate incremental value for primary key
                    const value = this.generatePrimaryKeyValue(col.type, primaryKeyCounters[col.name]);
                    primaryKeyCounters[col.name]++;
                    return value;
                }
                else {
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
    generatePrimaryKeyValue(dataType, counter) {
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
    generateRandomValue(column) {
        // Handle nullable columns (10% chance for NULL)
        if (column.nullable && !column.primary_key && Math.random() < 0.1) {
            return 'NULL';
        }
        const dataType = column.type.toUpperCase();
        // Handle numeric types
        if (dataType === 'BIGINT') {
            return faker_1.faker.number.bigInt({ min: 1n, max: 9223372036854775807n }).toString();
        }
        if (dataType === 'INT') {
            return faker_1.faker.number.int({ min: 1, max: 2147483647 }).toString();
        }
        if (dataType === 'SMALLINT') {
            return faker_1.faker.number.int({ min: 1, max: 32767 }).toString();
        }
        if (dataType === 'TINYINT') {
            return faker_1.faker.number.int({ min: 1, max: 127 }).toString();
        }
        // Handle decimal types
        if (dataType.startsWith('DECIMAL')) {
            // Extract precision and scale from DECIMAL(precision, scale)
            const match = dataType.match(/DECIMAL\((\d+),\s*(\d+)\)/);
            if (match) {
                const precision = parseInt(match[1]);
                const scale = parseInt(match[2]);
                const value = faker_1.faker.number.float({
                    min: 0,
                    max: Math.pow(10, precision - scale) - 1,
                    fractionDigits: scale
                });
                return value.toFixed(scale);
            }
            return faker_1.faker.number.float({ min: 0, max: 999999.99, fractionDigits: 2 }).toString();
        }
        if (dataType === 'DOUBLE' || dataType === 'FLOAT') {
            return faker_1.faker.number.float({ min: 0, max: 999999.999999, fractionDigits: 6 }).toString();
        }
        // Handle string types
        if (dataType === 'STRING') {
            const text = faker_1.faker.lorem.words(faker_1.faker.number.int({ min: 1, max: 5 }));
            return `'${(0, helpers_1.escapeSqlString)(text)}'`;
        }
        if (dataType.startsWith('VARCHAR')) {
            // Extract length from VARCHAR(n)
            const match = dataType.match(/VARCHAR\((\d+)\)/);
            const maxLength = match ? parseInt(match[1]) : 50;
            const text = faker_1.faker.lorem.words(faker_1.faker.number.int({ min: 1, max: 3 }));
            const truncatedText = text.substring(0, Math.min(text.length, maxLength));
            return `'${(0, helpers_1.escapeSqlString)(truncatedText)}'`;
        }
        // Handle boolean
        if (dataType === 'BOOLEAN') {
            return faker_1.faker.datatype.boolean().toString().toUpperCase();
        }
        // Handle date/time types
        if (dataType === 'DATE') {
            const date = faker_1.faker.date.between({
                from: '2020-01-01',
                to: '2024-12-31'
            });
            return `'${(0, moment_1.default)(date).format('YYYY-MM-DD')}'`;
        }
        if (dataType === 'TIMESTAMP') {
            const timestamp = faker_1.faker.date.between({
                from: '2020-01-01',
                to: '2024-12-31'
            });
            return `'${(0, moment_1.default)(timestamp).format('YYYY-MM-DD HH:mm:ss')}'`;
        }
        // Default fallback
        return `'${(0, helpers_1.escapeSqlString)(faker_1.faker.lorem.word())}'`;
    }
    /**
     * Generate both CREATE and INSERT SQL files
     * Equivalent to the main workflow in the Go main.go
     */
    async generateSqlFiles(tableSchema, inputFilename) {
        // Ensure output directory exists
        const outputDir = 'output';
        await fs.ensureDir(outputDir);
        // Generate CREATE TABLE SQL
        const createSql = this.generateCreateTableSQL(tableSchema);
        const createOutputFile = (0, helpers_1.generateOutputFilename)(inputFilename, '_create');
        // Write CREATE SQL file
        await fs.writeFile(createOutputFile, createSql, 'utf8');
        let insertSql;
        let insertOutputFile;
        // Generate INSERT SQL if rows > 0
        if (tableSchema.rows > 0) {
            insertSql = this.generateInsertSQL(tableSchema);
            insertOutputFile = (0, helpers_1.generateOutputFilename)(inputFilename, '_insert');
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
exports.SqlGeneratorService = SqlGeneratorService;
//# sourceMappingURL=sqlGenerator.js.map