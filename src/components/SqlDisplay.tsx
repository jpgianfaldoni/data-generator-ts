import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';

interface SqlDisplayProps {
  createSql: string;
  insertSql: string;
}

interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  columns?: string[];
  row_count?: number;
  shape?: string;
}

const SqlDisplay: React.FC<SqlDisplayProps> = ({ createSql, insertSql }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'insert'>('create');
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runQuery = async (sql: string) => {
    setIsRunning(true);
    setQueryResults(null);
    
    try {
      // Call the Python Flask API
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      });

      const result: QueryResult = await response.json();
      setQueryResults(result);
      
      if (result.success) {
        toast.success(`Query executed successfully! ${result.shape || `${result.row_count} rows returned`}`);
      } else {
        toast.error(`Query failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error running query:', error);
      toast.error('Failed to execute query. Check console for details.');
      setQueryResults({
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} SQL copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy to clipboard');
    }
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
              <span className="feature-icon">⚡</span>
              <span>Run queries on Databricks warehouse</span>
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
                  onClick={() => runQuery(createSql)}
                  disabled={isRunning}
                  className="btn btn-sm btn-primary"
                  title="Run query on Databricks warehouse"
                >
                  {isRunning ? '⏳ Running...' : '⚡ Run Query'}
                </button>
              </div>
            </div>
            <Editor
              height="300px"
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
                  onClick={() => runQuery(insertSql)}
                  disabled={isRunning}
                  className="btn btn-sm btn-primary"
                  title="Run query on Databricks warehouse"
                >
                  {isRunning ? '⏳ Running...' : '⚡ Run Query'}
                </button>
              </div>
            </div>
            <Editor
              height="300px"
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

      {/* Query Results Section */}
      {queryResults && (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          margin: '1rem 0' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>Query Results</h3>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: queryResults.success ? 'rgba(72, 187, 120, 0.2)' : 'rgba(245, 101, 101, 0.2)',
              color: queryResults.success ? '#68d391' : '#fc8181',
              border: `1px solid ${queryResults.success ? 'rgba(72, 187, 120, 0.3)' : 'rgba(245, 101, 101, 0.3)'}`
            }}>
              {queryResults.success ? '✅ Success' : '❌ Error'}
            </span>
          </div>
          
          {queryResults.success && queryResults.data ? (
            <div>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontSize: '0.9rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                {queryResults.shape || `${queryResults.row_count} rows × ${queryResults.columns?.length || 0} columns`}
              </p>
              <div style={{ 
                maxHeight: '300px', 
                overflow: 'auto', 
                margin: '1rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  background: 'rgba(255, 255, 255, 0.05)'
                }}>
                  <thead>
                    <tr>
                      {queryResults.columns?.map((column, index) => (
                        <th key={index} style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '0.85rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          fontWeight: 600,
                          position: 'sticky',
                          top: 0
                        }}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResults.data.slice(0, 50).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {queryResults.columns?.map((column, colIndex) => (
                          <td key={colIndex} style={{
                            padding: '0.75rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '0.85rem',
                            maxWidth: '200px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {String(row[column] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {queryResults.data.length > 50 && (
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.8rem',
                    padding: '0.75rem',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.02)'
                  }}>
                    Showing first 50 rows of {queryResults.data.length} total rows
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              padding: '1.5rem',
              color: '#fc8181',
              background: 'rgba(245, 101, 101, 0.1)',
              border: '1px solid rgba(245, 101, 101, 0.2)',
              borderRadius: '8px',
              margin: '1rem 1.5rem'
            }}>
              <p>{queryResults.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SqlDisplay; 