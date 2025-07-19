# Data Generator - Backend

A TypeScript/Node.js backend implementation of the Data Generator for Databricks that reads YAML table schemas and generates SQL CREATE TABLE and INSERT statements with random test data.

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
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Build the project
npm run build
```

## 🛠️ Usage

### Basic Usage

```bash
# Generate SQL from YAML schema
npm start examples/example_table.yaml

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
backend/
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

## 🔧 Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start <file>` - Run the CLI with a YAML file
- `npm run dev <file>` - Run with auto-recompilation
- `npm test` - Run tests (when implemented)
- `npm run lint` - Run ESLint
- `npm run clean` - Remove compiled files

## 🧪 Key TypeScript Features

1. **Type Safety**: All data structures are typed for compile-time safety
2. **Modern Async/Await**: Uses promises throughout for better error handling
3. **Modular Architecture**: Clean separation of concerns with services and utilities
4. **Error Handling**: Comprehensive error catching and user-friendly messages
5. **CLI Framework**: Uses Commander.js for robust command-line interface

## 📄 License

MIT License - feel free to use this project for any purpose. 