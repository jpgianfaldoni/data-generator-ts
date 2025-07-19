import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface SqlDisplayProps {
  createSql: string;
  insertSql: string;
}

const SqlDisplay: React.FC<SqlDisplayProps> = ({ createSql, insertSql }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'insert'>('create');

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} SQL copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon">📝</div>
      <h3>No SQL Generated Yet</h3>
      <p>Edit your YAML schema in the left panel and click "Create SQL" to generate SQL statements.</p>
    </div>
  );

  const renderSqlContent = (sql: string, type: string) => {
    if (!sql) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <h3>No {type} SQL</h3>
          <p>{type === 'INSERT' ? 'Set rows > 0 in your YAML to generate INSERT statements.' : 'Generate SQL first.'}</p>
        </div>
      );
    }

    return (
      <div className="sql-content">
        <button
          className="copy-button"
          onClick={() => copyToClipboard(sql, type)}
        >
          📋 Copy
        </button>
        <pre className="sql-code">{sql}</pre>
      </div>
    );
  };

  if (!createSql && !insertSql) {
    return (
      <div className="sql-display">
        <div className="section-header">
          <h2>🗄️ Generated SQL</h2>
        </div>
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div className="sql-display">
      <div className="section-header">
        <h2>🗄️ Generated SQL</h2>
      </div>
      
      <div className="sql-tabs">
        <button
          className={`sql-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          📋 CREATE
        </button>
        <button
          className={`sql-tab ${activeTab === 'insert' ? 'active' : ''}`}
          onClick={() => setActiveTab('insert')}
        >
          ⚡ INSERT
        </button>
      </div>

      {activeTab === 'create' && renderSqlContent(createSql, 'CREATE')}
      {activeTab === 'insert' && renderSqlContent(insertSql, 'INSERT')}
    </div>
  );
};

export default SqlDisplay; 