# Data Generator - Frontend

A modern React TypeScript frontend for the Data Generator that allows users to edit YAML table schemas and generate SQL CREATE and INSERT statements.

## ✨ Features

- 🎨 **Modern UI**: Beautiful glassmorphism design with gradient backgrounds
- 📝 **YAML Editor**: Monaco Editor with syntax highlighting and validation  
- 🔍 **Live SQL Preview**: Real-time SQL generation with tabbed display
- 💾 **File Downloads**: Automatic download of generated SQL files
- 📋 **Copy to Clipboard**: One-click copying of SQL statements
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices
- 🚀 **Fast**: Built with Vite for lightning-fast development and builds

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **Editor**: Monaco Editor (VS Code's editor)
- **YAML Parser**: js-yaml
- **Notifications**: React Hot Toast
- **Styling**: CSS with custom glassmorphism design
- **Icons**: Emoji for a fun, accessible interface

## 📦 Installation & Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Usage

1. **Edit YAML Schema**: Use the Monaco editor to create or modify table schemas
2. **Load Example**: Click "Load Example" to see a sample schema
3. **Generate SQL**: Click "✨ Create SQL" to generate CREATE and INSERT statements
4. **View Results**: Toggle between CREATE and INSERT tabs to see generated SQL
5. **Download Files**: SQL files are automatically downloaded when generated
6. **Copy SQL**: Use the copy buttons to copy SQL to clipboard

## 📝 YAML Schema Format

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

## 🗃️ Supported Data Types

- **Numeric**: `BIGINT`, `INT`, `SMALLINT`, `TINYINT`, `DECIMAL`, `DOUBLE`, `FLOAT`
- **Text**: `STRING`, `VARCHAR(n)`
- **Boolean**: `BOOLEAN`  
- **Date/Time**: `DATE`, `TIMESTAMP`

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── YamlEditor.tsx     # Monaco YAML editor component
│   │   └── SqlDisplay.tsx     # SQL preview and display component
│   ├── services/
│   │   └── sqlGenerator.ts    # Frontend SQL generation logic
│   ├── types/
│   │   └── schema.ts          # TypeScript interfaces
│   ├── App.tsx                # Main application component
│   ├── App.css                # Modern glassmorphism styles
│   └── main.tsx               # React entry point
├── public/                    # Static assets
├── dist/                      # Production build output
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

## 🎯 Key Components

### YamlEditor
- Monaco Editor with YAML syntax highlighting
- Dark theme with proper indentation
- Real-time validation and error reporting

### SqlDisplay  
- Tabbed interface for CREATE and INSERT SQL
- Copy to clipboard functionality
- Download SQL files
- Empty state with feature descriptions

### SqlGeneratorService
- Frontend SQL generation (placeholder data)
- Matches backend logic for consistency
- Handles all supported Databricks data types

## 🎨 Design Features

- **Glassmorphism**: Modern glass-like UI with backdrop blur
- **Gradient Backgrounds**: Purple-blue gradient theme
- **Responsive Layout**: CSS Grid with mobile-first design
- **Smooth Animations**: Hover effects and transitions
- **Accessibility**: High contrast, proper focus states
- **Professional Typography**: System font stack for readability

## 🔧 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production  
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

## 🚦 Getting Started

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5173`

3. Try the example by clicking "Load Example"

4. Modify the YAML schema in the left editor

5. Click "✨ Create SQL" to generate statements

6. View the results in the right panel

## 🔗 Backend Integration

This frontend works independently but is designed to complement the backend located in `../backend/`. The SQL generation logic matches the backend for consistency.

## 🤝 Contributing

1. Follow the existing code style and component patterns
2. Use TypeScript for all new code
3. Test on multiple screen sizes
4. Ensure accessibility standards
5. Update this README for any new features

## 📄 License

MIT License - feel free to use this project for any purpose.

---

**Status**: ✅ Complete and functional frontend application
