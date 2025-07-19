# Data Generator - Full Stack Application

A TypeScript-based Data Generator for Databricks that reads YAML table schemas and generates SQL CREATE TABLE and INSERT statements with random test data.

## 🏗️ Project Structure

This project is organized into separate frontend and backend components:

```
data-generator-ts/
├── backend/                   # TypeScript/Node.js backend
│   ├── src/                  # Backend source code
│   ├── examples/             # YAML schema examples
│   ├── output/               # Generated SQL files
│   ├── package.json          # Backend dependencies
│   └── README.md             # Backend documentation
├── frontend/                  # Frontend application (TBD)
│   └── README.md             # Frontend documentation
├── .gitignore                # Git ignore patterns
└── README.md                 # This file
```

## 🚀 Quick Start

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Build the project
npm run build

# Generate SQL from example
npm start examples/example_table.yaml
```

### Frontend Setup

The frontend is planned for future development. See `frontend/README.md` for details.

## 🔧 Backend Features

✅ **CLI Interface**: Command-line tool for SQL generation  
✅ **YAML Schema Input**: Define table structures in YAML  
✅ **Smart Data Generation**: Realistic random data based on column types  
✅ **Databricks Compatible**: Supports Databricks SQL syntax  
✅ **TypeScript**: Full type safety and modern development experience  

## 🎨 Frontend Features

✅ **Schema Builder**: Visual YAML editor with Monaco Editor  
✅ **Live Preview**: Real-time SQL generation and preview  
✅ **File Management**: Edit, save, and download YAML/SQL files  
✅ **Export Options**: Download generated SQL files automatically  
✅ **Responsive Design**: Modern glassmorphism UI that works on all devices  

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev examples/example_table.yaml  # Watch mode
npm run lint                              # Code linting
npm test                                  # Run tests
```

### Frontend Development

```bash
cd frontend
npm install                      # Install dependencies
npm run dev                      # Start development server
npm run build                    # Build for production
```

## 📚 Documentation

- **Backend**: See `backend/README.md` for detailed backend documentation
- **Frontend**: See `frontend/README.md` for frontend plans and setup

## 🤝 Contributing

1. Choose your area: `backend/` for API/CLI work, `frontend/` for UI work
2. Make your changes in the appropriate directory
3. Follow the existing code style and conventions
4. Test your changes thoroughly

## 📄 License

MIT License - feel free to use this project for any purpose.

---

**Current Status**: Backend is fully functional. Frontend development is planned for the future. 