import { useState } from 'react';
import Editor from '@monaco-editor/react';

interface SqlDisplayProps {
  createSql: string;
  insertSql: string;
}

const SqlDisplay: React.FC<SqlDisplayProps> = ({ createSql, insertSql }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'insert'>('create');

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`${type} SQL copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadSql = (sql: string, filename: string) => {
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!createSql && !insertSql) {
    return (
      <div className="sql-display-empty">
        <div className="empty-state">
          <h2>🎯 Generated SQL will appear here</h2>
          <p>Edit your YAML schema and click "Create SQL" to generate statements</p>
          <div className="empty-features">
            <div className="feature">
              <span className="feature-icon">📋</span>
              <span>CREATE TABLE statements</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>INSERT statements with sample data</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💾</span>
              <span>Auto-download SQL files</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sql-display">
      <div className="sql-tabs">
        <button 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          📋 CREATE TABLE
        </button>
        {insertSql && (
          <button 
            className={`tab ${activeTab === 'insert' ? 'active' : ''}`}
            onClick={() => setActiveTab('insert')}
          >
            📊 INSERT DATA
          </button>
        )}
      </div>

      <div className="sql-content">
        {activeTab === 'create' && createSql && (
          <div className="sql-section">
            <div className="sql-header">
              <h3>CREATE TABLE Statement</h3>
              <div className="sql-actions">
                <button 
                  onClick={() => copyToClipboard(createSql, 'CREATE')}
                  className="btn btn-sm"
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
                <button 
                  onClick={() => downloadSql(createSql, 'create_table.sql')}
                  className="btn btn-sm"
                  title="Download SQL file"
                >
                  💾 Download
                </button>
              </div>
            </div>
            <Editor
              height="400px"
              language="sql"
              theme="vs-dark"
              value={createSql}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                wordWrap: 'on',
              }}
            />
          </div>
        )}

        {activeTab === 'insert' && insertSql && (
          <div className="sql-section">
            <div className="sql-header">
              <h3>INSERT Statements</h3>
              <div className="sql-actions">
                <button 
                  onClick={() => copyToClipboard(insertSql, 'INSERT')}
                  className="btn btn-sm"
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
                <button 
                  onClick={() => downloadSql(insertSql, 'insert_data.sql')}
                  className="btn btn-sm"
                  title="Download SQL file"
                >
                  💾 Download
                </button>
              </div>
            </div>
            <Editor
              height="400px"
              language="sql"
              theme="vs-dark"
              value={insertSql}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                wordWrap: 'on',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SqlDisplay; 