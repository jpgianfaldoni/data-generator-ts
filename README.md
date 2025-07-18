# Data Generator - TypeScript Edition

A TypeScript/Node.js implementation of the Data Generator for Databricks that reads YAML table schemas and generates SQL CREATE TABLE and INSERT statements with random test data.

## 🚀 Features

✅ **Always generates both CREATE TABLE and INSERT SQL**  
✅ **Smart random data generation** based on column types  
✅ **Respects nullable constraints** (10% chance for NULL values)  
✅ **Supports Databricks catalog.schema.table format**  
✅ **Primary key auto-increment support**  
✅ **TypeScript type safety**  
✅ **Colored CLI output**  
✅ **Verbose mode for debugging**  

## 📦 Installation

```bash
# Clone or copy the ts_version folder
cd ts_version

# Install dependencies
npm install

# Build the project
npm run build

# Optional: Install globally
npm link
```

## 🛠️ Usage

### Basic Usage

```bash
# Generate SQL from YAML schema
npm start examples/example_table.yaml

# Or if installed globally
data-generator-ts examples/example_table.yaml

# With verbose output
npm start examples/example_table.yaml -- --verbose
```

### Development Mode

```bash
# Run with automatic recompilation
npm run dev examples/example_table.yaml
```

## 📁 Project Structure

```
ts_version/
├── src/
│   ├── types/
│   │   └── schema.ts          # TypeScript interfaces
│   ├── services/
│   │   └── sqlGenerator.ts    # SQL generation logic
│   ├── utils/
│   │   └── helpers.ts         # Utility functions
│   └── cli.ts                 # Main CLI interface
├── examples/
│   ├── example_table.yaml     # Basic table example
│   └── products_table.yaml    # Products table example
├── output/                    # Generated SQL files (created automatically)
│   ├── *_create.sql          # CREATE TABLE statements
│   └── *_insert.sql          # INSERT statements with random data
├── dist/                      # Compiled JavaScript (after build)
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## 📝 YAML Input Format

```yaml
table_name: "your_table_name"
catalog: "main"          # Optional
schema: "gold"           # Optional  
rows: 5                  # Number of INSERT rows to generate
columns:
  - name: "column_name"
    type: "DATA_TYPE"
    nullable: true/false
    comment: "optional comment"
    primary_key: true/false    # Optional, for auto-increment
```

## 🗃️ Supported Databricks Data Types

- `BIGINT`, `INT`, `SMALLINT`, `TINYINT`
- `STRING`, `VARCHAR(n)`
- `BOOLEAN`
- `TIMESTAMP`, `DATE`
- `DECIMAL(precision, scale)`
- `DOUBLE`, `FLOAT`

## 📊 Example Output

Running the tool generates two SQL files in the `output/` directory:
- `<filename>_create.sql` - CREATE TABLE statement
- `<filename>_insert.sql` - INSERT statements with random data

Both files use the same fully-qualified table name format and are ready to execute in Databricks.

## 🔧 Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start <file>` - Run the CLI with a YAML file
- `npm run dev <file>` - Run with auto-recompilation
- `npm test` - Run tests (when implemented)
- `npm run lint` - Run ESLint
- `npm run clean` - Remove compiled files

## 🚦 Example Run

```bash
$ npm start examples/example_table.yaml

🚀 Generated SQL for table: users
==================================================

1. CREATE TABLE SQL:
   ✅ CREATE TABLE SQL saved to: output/example_table_create.sql

2. INSERT SQL (5000 rows):
------------------------
   ✅ INSERT SQL saved to: output/example_table_insert.sql

✨ SQL generation completed successfully!
```

## 🔍 Verbose Mode

```bash
$ npm start examples/example_table.yaml -- --verbose

🔍 Processing YAML file: examples/example_table.yaml
✅ Output directory 'output' ready
✅ YAML file read successfully
✅ YAML parsed successfully
   Table: users
   Columns: 6
   Rows to generate: 5000

🚀 Generated SQL for table: users
==================================================

1. CREATE TABLE SQL:
   ✅ CREATE TABLE SQL saved to: output/example_table_create.sql

2. INSERT SQL (5000 rows):
------------------------
   ✅ INSERT SQL saved to: output/example_table_insert.sql

📊 Generation Summary:
   • CREATE SQL length: 387 characters
   • INSERT SQL length: 892456 characters

✨ SQL generation completed successfully!
```

## 🧪 Key TypeScript Features

1. **Type Safety**: All data structures are typed for compile-time safety
2. **Modern Async/Await**: Uses promises throughout for better error handling
3. **Modular Architecture**: Clean separation of concerns with services and utilities
4. **Error Handling**: Comprehensive error catching and user-friendly messages
5. **CLI Framework**: Uses Commander.js for robust command-line interface

## 🆚 Differences from Go Version

| Feature | Go Version | TypeScript Version |
|---------|------------|-------------------|
| Language | Go 1.21+ | TypeScript/Node.js 18+ |
| Dependencies | gofakeit, yaml.v3 | @faker-js/faker, yaml, chalk |
| Build | `go build` | `npm run build` |
| Run | `./data-generator` | `npm start` or `node dist/cli.js` |
| Error Handling | Go errors | Promises with try/catch |
| CLI Colors | None | Chalk for colored output |

## 🤝 Contributing

1. Make changes to the `src/` directory
2. Run `npm run build` to compile
3. Test with `npm start examples/example_table.yaml`
4. Run `npm run lint` to check code style

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🔗 Related

- Original Go version: `../` (parent directory)
- Databricks SQL Reference: [docs.databricks.com](https://docs.databricks.com/sql/language-manual/) 