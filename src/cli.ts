#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as YAML from 'yaml';
import chalk from 'chalk';
import { TableSchema } from './types/schema';
import { SqlGeneratorService } from './services/sqlGenerator';
import { isValidYamlFile } from './utils/helpers';

const outputDir = 'output';
const program = new Command();

/**
 * Main CLI function - equivalent to main() in Go
 */
async function main(): Promise<void> {
  program
    .name('data-generator-ts')
    .description('TypeScript Data Generator for Databricks - Generate SQL CREATE and INSERT statements from YAML schemas')
    .version('1.0.0')
    .argument('<yaml_file>', 'YAML file containing table schema')
    .option('-v, --verbose', 'verbose output')
    .action(async (yamlFile: string, options: { verbose?: boolean }) => {
      try {
        await processYamlFile(yamlFile, options.verbose || false);
      } catch (error) {
        console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
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
async function processYamlFile(filename: string, verbose: boolean): Promise<void> {
  if (verbose) {
    console.log(chalk.blue(`🔍 Processing YAML file: ${filename}`));
  }

  // Ensure output directory exists
  try {
    await fs.ensureDir(outputDir);
    if (verbose) {
      console.log(chalk.green(`✅ Output directory '${outputDir}' ready`));
    }
  } catch (error) {
    throw new Error(`Error creating output directory: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Check file extension
  if (!isValidYamlFile(filename)) {
    const ext = filename.split('.').pop();
    throw new Error(`Unsupported file format: .${ext}. Please provide a .yaml or .yml file`);
  }

  // Check if file exists
  if (!(await fs.pathExists(filename))) {
    throw new Error(`File not found: ${filename}`);
  }

  // Read the YAML file
  let yamlData: string;
  try {
    yamlData = await fs.readFile(filename, 'utf8');
    if (verbose) {
      console.log(chalk.green(`✅ YAML file read successfully`));
    }
  } catch (error) {
    throw new Error(`Error reading YAML file: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Parse YAML data into TableSchema
  let tableSchema: TableSchema;
  try {
    tableSchema = YAML.parse(yamlData) as TableSchema;
    
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
      console.log(chalk.green(`✅ YAML parsed successfully`));
      console.log(chalk.cyan(`   Table: ${tableSchema.table_name}`));
      console.log(chalk.cyan(`   Columns: ${tableSchema.columns.length}`));
      console.log(chalk.cyan(`   Rows to generate: ${tableSchema.rows}`));
    }
  } catch (error) {
    throw new Error(`Error parsing YAML: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Generate SQL files
  const sqlGenerator = new SqlGeneratorService();
  try {
    const result = await sqlGenerator.generateSqlFiles(tableSchema, filename);

    // Display results
    console.log(chalk.bold(`\n🚀 Generated SQL for table: ${tableSchema.table_name}`));
    console.log(chalk.gray('='.repeat(50)));

    console.log(chalk.bold('\n1. CREATE TABLE SQL:'));
    console.log(chalk.green(`   ✅ CREATE TABLE SQL saved to: ${result.createOutputFile}`));

    if (tableSchema.rows > 0 && result.insertSql && result.insertOutputFile) {
      console.log(chalk.bold(`\n2. INSERT SQL (${tableSchema.rows} rows):`));
      console.log(chalk.gray('-'.repeat(24)));
      console.log(chalk.green(`   ✅ INSERT SQL saved to: ${result.insertOutputFile}`));
    } else {
      console.log(chalk.bold('\n2. INSERT SQL:'));
      console.log(chalk.gray('-'.repeat(13)));
      console.log(chalk.yellow("   ⚠️  No INSERT SQL generated (add 'rows: N' field to YAML to generate INSERT statements)"));
    }

    if (verbose) {
      console.log(chalk.blue('\n📊 Generation Summary:'));
      console.log(chalk.cyan(`   • CREATE SQL length: ${result.createSql.length} characters`));
      if (result.insertSql) {
        console.log(chalk.cyan(`   • INSERT SQL length: ${result.insertSql.length} characters`));
      }
    }

    console.log(chalk.green('\n✨ SQL generation completed successfully!'));

  } catch (error) {
    throw new Error(`Error generating SQL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red(`Fatal error: ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  });
} 