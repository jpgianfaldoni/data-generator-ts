#!/usr/bin/env node
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
const commander_1 = require("commander");
const fs = __importStar(require("fs-extra"));
const YAML = __importStar(require("yaml"));
const chalk_1 = __importDefault(require("chalk"));
const sqlGenerator_1 = require("./services/sqlGenerator");
const helpers_1 = require("./utils/helpers");
const outputDir = 'output';
const program = new commander_1.Command();
/**
 * Main CLI function - equivalent to main() in Go
 */
async function main() {
    program
        .name('data-generator-ts')
        .description('TypeScript Data Generator for Databricks - Generate SQL CREATE and INSERT statements from YAML schemas')
        .version('1.0.0')
        .argument('<yaml_file>', 'YAML file containing table schema')
        .option('-v, --verbose', 'verbose output')
        .action(async (yamlFile, options) => {
        try {
            await processYamlFile(yamlFile, options.verbose || false);
        }
        catch (error) {
            console.error(chalk_1.default.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
            process.exit(1);
        }
    });
    // Add help examples
    program.addHelpText('after', `
Examples:
  $ data-generator-ts examples/example_table.yaml
  $ data-generator-ts config/products_table.yml
  $ data-generator-ts users.yaml --verbose

The YAML file should include a 'rows' field to specify how many INSERT rows to generate.
Generated SQL files will be saved to the 'output/' directory.
`);
    await program.parseAsync();
}
/**
 * Process a YAML file and generate SQL
 * Equivalent to the main logic in Go main()
 */
async function processYamlFile(filename, verbose) {
    if (verbose) {
        console.log(chalk_1.default.blue(`🔍 Processing YAML file: ${filename}`));
    }
    // Ensure output directory exists
    try {
        await fs.ensureDir(outputDir);
        if (verbose) {
            console.log(chalk_1.default.green(`✅ Output directory '${outputDir}' ready`));
        }
    }
    catch (error) {
        throw new Error(`Error creating output directory: ${error instanceof Error ? error.message : String(error)}`);
    }
    // Check file extension
    if (!(0, helpers_1.isValidYamlFile)(filename)) {
        const ext = filename.split('.').pop();
        throw new Error(`Unsupported file format: .${ext}. Please provide a .yaml or .yml file`);
    }
    // Check if file exists
    if (!(await fs.pathExists(filename))) {
        throw new Error(`File not found: ${filename}`);
    }
    // Read the YAML file
    let yamlData;
    try {
        yamlData = await fs.readFile(filename, 'utf8');
        if (verbose) {
            console.log(chalk_1.default.green(`✅ YAML file read successfully`));
        }
    }
    catch (error) {
        throw new Error(`Error reading YAML file: ${error instanceof Error ? error.message : String(error)}`);
    }
    // Parse YAML data into TableSchema
    let tableSchema;
    try {
        tableSchema = YAML.parse(yamlData);
        // Validate required fields
        if (!tableSchema.table_name) {
            throw new Error('Missing required field: table_name');
        }
        if (!tableSchema.columns || !Array.isArray(tableSchema.columns) || tableSchema.columns.length === 0) {
            throw new Error('Missing or empty required field: columns');
        }
        if (typeof tableSchema.rows !== 'number') {
            tableSchema.rows = 0; // Default to 0 if not specified
        }
        if (verbose) {
            console.log(chalk_1.default.green(`✅ YAML parsed successfully`));
            console.log(chalk_1.default.cyan(`   Table: ${tableSchema.table_name}`));
            console.log(chalk_1.default.cyan(`   Columns: ${tableSchema.columns.length}`));
            console.log(chalk_1.default.cyan(`   Rows to generate: ${tableSchema.rows}`));
        }
    }
    catch (error) {
        throw new Error(`Error parsing YAML: ${error instanceof Error ? error.message : String(error)}`);
    }
    // Generate SQL files
    const sqlGenerator = new sqlGenerator_1.SqlGeneratorService();
    try {
        const result = await sqlGenerator.generateSqlFiles(tableSchema, filename);
        // Display results
        console.log(chalk_1.default.bold(`\n🚀 Generated SQL for table: ${tableSchema.table_name}`));
        console.log(chalk_1.default.gray('='.repeat(50)));
        console.log(chalk_1.default.bold('\n1. CREATE TABLE SQL:'));
        console.log(chalk_1.default.green(`   ✅ CREATE TABLE SQL saved to: ${result.createOutputFile}`));
        if (tableSchema.rows > 0 && result.insertSql && result.insertOutputFile) {
            console.log(chalk_1.default.bold(`\n2. INSERT SQL (${tableSchema.rows} rows):`));
            console.log(chalk_1.default.gray('-'.repeat(24)));
            console.log(chalk_1.default.green(`   ✅ INSERT SQL saved to: ${result.insertOutputFile}`));
        }
        else {
            console.log(chalk_1.default.bold('\n2. INSERT SQL:'));
            console.log(chalk_1.default.gray('-'.repeat(13)));
            console.log(chalk_1.default.yellow("   ⚠️  No INSERT SQL generated (add 'rows: N' field to YAML to generate INSERT statements)"));
        }
        if (verbose) {
            console.log(chalk_1.default.blue('\n📊 Generation Summary:'));
            console.log(chalk_1.default.cyan(`   • CREATE SQL length: ${result.createSql.length} characters`));
            if (result.insertSql) {
                console.log(chalk_1.default.cyan(`   • INSERT SQL length: ${result.insertSql.length} characters`));
            }
        }
        console.log(chalk_1.default.green('\n✨ SQL generation completed successfully!'));
    }
    catch (error) {
        throw new Error(`Error generating SQL: ${error instanceof Error ? error.message : String(error)}`);
    }
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk_1.default.red('Unhandled Rejection at:'), promise, chalk_1.default.red('reason:'), reason);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error(chalk_1.default.red('Uncaught Exception:'), error);
    process.exit(1);
});
// Run the CLI
if (require.main === module) {
    main().catch((error) => {
        console.error(chalk_1.default.red(`Fatal error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map