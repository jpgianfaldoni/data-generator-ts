import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import * as YAML from 'yaml';
import type { TableSchema } from './types/schema';
import { SqlGeneratorService } from './services/sqlGenerator';
import YamlEditor from './components/YamlEditor';
import SqlDisplay from './components/SqlDisplay';
import './App.css';

const defaultYaml = `table_name: "users"
catalog: "main"
schema: "gold"
rows: 5
columns:
  - name: "id"
    type: "BIGINT"
    nullable: false
    primary_key: true
    comment: "User ID"
  - name: "username"
    type: "VARCHAR(50)"
    nullable: false
    comment: "Username"
  - name: "email"
    type: "VARCHAR(100)"
    nullable: false
    comment: "Email address"
  - name: "age"
    type: "INT"
    nullable: true
    comment: "User age"
  - name: "is_active"
    type: "BOOLEAN"
    nullable: false
    comment: "Is user active"
  - name: "created_at"
    type: "TIMESTAMP"
    nullable: false
    comment: "Creation timestamp"`;

function App() {
  const [yamlContent, setYamlContent] = useState<string>(defaultYaml);
  const [createSql, setCreateSql] = useState<string>('');
  const [insertSql, setInsertSql] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const sqlGenerator = new SqlGeneratorService();

  const handleGenerateSQL = () => {
    setIsGenerating(true);
    
    try {
      // Parse YAML
      const tableSchema = YAML.parse(yamlContent) as TableSchema;
      
      // Validate required fields
      if (!tableSchema.table_name) {
        throw new Error('Missing required field: table_name');
      }
      if (!tableSchema.columns || !Array.isArray(tableSchema.columns) || tableSchema.columns.length === 0) {
        throw new Error('Missing or empty required field: columns');
      }
      if (typeof tableSchema.rows !== 'number') {
        tableSchema.rows = 0;
      }

      // Generate SQL
      const result = sqlGenerator.generateSqlFiles(tableSchema, tableSchema.table_name);
      
      setCreateSql(result.createSql);
      setInsertSql(result.insertSql || '');

      // Save files (simulate saving)
      const createBlob = new Blob([result.createSql], { type: 'text/sql' });
      const createUrl = URL.createObjectURL(createBlob);
      const createLink = document.createElement('a');
      createLink.href = createUrl;
      createLink.download = result.createOutputFile;
      createLink.click();
      URL.revokeObjectURL(createUrl);

      if (result.insertSql && result.insertOutputFile) {
        const insertBlob = new Blob([result.insertSql], { type: 'text/sql' });
        const insertUrl = URL.createObjectURL(insertBlob);
        const insertLink = document.createElement('a');
        insertLink.href = insertUrl;
        insertLink.download = result.insertOutputFile;
        insertLink.click();
        URL.revokeObjectURL(insertUrl);
      }

      toast.success('SQL generated and files downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating SQL:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadExample = () => {
    setYamlContent(defaultYaml);
    setCreateSql('');
    setInsertSql('');
    toast.success('Example loaded!');
  };

  return (
    <div className="app">
      <Toaster position="top-right" />
      
      <header className="app-header">
        <h1>🚀 Data Generator - Frontend</h1>
        <p>Edit YAML schema and generate SQL CREATE and INSERT statements</p>
      </header>

      <main className="app-main">
        <div className="editor-section">
          <div className="section-header">
            <h2>📝 YAML Schema Editor</h2>
            <div className="section-actions">
              <button 
                onClick={handleLoadExample}
                className="btn btn-secondary"
              >
                Load Example
              </button>
              <button 
                onClick={handleGenerateSQL}
                disabled={isGenerating}
                className="btn btn-primary"
              >
                {isGenerating ? '⏳ Generating...' : '✨ Create SQL'}
              </button>
            </div>
          </div>
          <YamlEditor 
            value={yamlContent}
            onChange={setYamlContent}
          />
        </div>

        <div className="results-section">
          <SqlDisplay 
            createSql={createSql}
            insertSql={insertSql}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with ❤️ using React + TypeScript + Vite</p>
      </footer>
    </div>
  );
}

export default App;
