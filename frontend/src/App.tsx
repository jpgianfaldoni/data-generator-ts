import { useState, useEffect } from 'react'
import './App.css'

interface ApiResponse {
  message: string
}



interface SQLQueryResponse {
  success: boolean
  message: string
  error?: string
}

interface GenerateFromYAMLResponse {
  success: boolean
  create_sql?: string
  insert_sql?: string
  error?: string
}

function App() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  
  // SQL Query states
  const [sqlQuery, setSqlQuery] = useState('')
  const [sqlLoading, setSqlLoading] = useState(false)
  const [sqlResponse, setSqlResponse] = useState<SQLQueryResponse | null>(null)
  
  // YAML to SQL states
  const [yamlContent, setYamlContent] = useState(`table_name: customers
catalog: my_catalog
schema: sales
rows: 5
columns:
  - name: id
    type: BIGINT
    nullable: false
    primary_key: true
  - name: email
    type: STRING
    nullable: false
    comment: "Customer email address"
  - name: first_name
    type: STRING
    nullable: false
  - name: last_name
    type: STRING
    nullable: false
  - name: company
    type: STRING
    nullable: true
  - name: created_at
    type: TIMESTAMP
    nullable: false`)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [generatedSQL, setGeneratedSQL] = useState<GenerateFromYAMLResponse | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [insertLoading, setInsertLoading] = useState(false)
  const [createResponse, setCreateResponse] = useState<SQLQueryResponse | null>(null)
  const [insertResponse, setInsertResponse] = useState<SQLQueryResponse | null>(null)

  useEffect(() => {
    // Fetch hello message
    fetch('/api/hello')
      .then(response => response.json())
      .then(helloData => {
        setApiData(helloData)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error:', error)
        setLoading(false)
      })
  }, [])

  const executeSqlQuery = async () => {
    if (!sqlQuery.trim()) {
      setSqlResponse({
        success: false,
        message: 'Query execution failed',
        error: 'Please enter a SQL query'
      })
      return
    }

    setSqlLoading(true)
    setSqlResponse(null)

    try {
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlQuery }),
      })

      const result: SQLQueryResponse = await response.json()
      setSqlResponse(result)
    } catch (error) {
      setSqlResponse({
        success: false,
        message: 'Query execution failed',
        error: `Network error: ${error}`
      })
    } finally {
      setSqlLoading(false)
    }
  }

  const generateFromYAML = async () => {
    if (!yamlContent.trim()) {
      setGeneratedSQL({
        success: false,
        error: 'Please enter YAML content'
      })
      return
    }

    setGenerateLoading(true)
    setGeneratedSQL(null)

    try {
      const response = await fetch('/api/generate-from-yaml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ yaml_content: yamlContent }),
      })

      const result: GenerateFromYAMLResponse = await response.json()
      setGeneratedSQL(result)
    } catch (error) {
      setGeneratedSQL({
        success: false,
        error: `Network error: ${error}`
      })
    } finally {
      setGenerateLoading(false)
    }
  }

  const executeCreateSQL = async () => {
    if (!generatedSQL?.create_sql) {
      setCreateResponse({
        success: false,
        message: 'Execution failed',
        error: 'No CREATE SQL to execute'
      })
      return
    }

    setCreateLoading(true)
    setCreateResponse(null)

    try {
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: generatedSQL.create_sql }),
      })

      const result: SQLQueryResponse = await response.json()
      setCreateResponse(result)
    } catch (error) {
      setCreateResponse({
        success: false,
        message: 'CREATE execution failed',
        error: `Network error: ${error}`
      })
    } finally {
      setCreateLoading(false)
    }
  }

  const executeInsertSQL = async () => {
    if (!generatedSQL?.insert_sql) {
      setInsertResponse({
        success: false,
        message: 'Execution failed',
        error: 'No INSERT SQL to execute'
      })
      return
    }

    setInsertLoading(true)
    setInsertResponse(null)

    try {
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: generatedSQL.insert_sql }),
      })

      const result: SQLQueryResponse = await response.json()
      setInsertResponse(result)
    } catch (error) {
      setInsertResponse({
        success: false,
        message: 'INSERT execution failed',
        error: `Network error: ${error}`
      })
    } finally {
      setInsertLoading(false)
    }
  }



  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Node.js + FastAPI Hello World</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="content">
            {apiData ? (
              <div className="api-info">
                <p className="message">{apiData.message}</p>
              </div>
            ) : (
              <p>Failed to connect to API</p>
            )}

            {/* YAML to SQL Generator */}
            <div className="yaml-interface">
              <h2>📝 YAML Schema to SQL Generator</h2>
              <div className="yaml-form">
                <textarea
                  value={yamlContent}
                  onChange={(e) => setYamlContent(e.target.value)}
                  placeholder="Enter your YAML schema definition here..."
                  className="yaml-textarea"
                  rows={20}
                  disabled={generateLoading}
                />
                <button
                  onClick={generateFromYAML}
                  disabled={generateLoading || !yamlContent.trim()}
                  className="generate-btn"
                >
                  {generateLoading ? 'Generating...' : 'Generate SQL'}
                </button>
              </div>

              {/* Generated SQL Display */}
              {generatedSQL && (
                <div className={`generation-response ${generatedSQL.success ? 'success' : 'error'}`}>
                  {generatedSQL.success ? (
                    <div className="generated-sql">
                      <h3>✅ SQL Generated Successfully</h3>
                      
                      {/* CREATE TABLE SQL */}
                      <div className="sql-section">
                        <div className="sql-header">
                          <h4>CREATE TABLE SQL:</h4>
                          <button
                            onClick={executeCreateSQL}
                            disabled={createLoading}
                            className="execute-btn create-btn"
                          >
                            {createLoading ? 'Running...' : 'Run CREATE'}
                          </button>
                        </div>
                        <pre className="sql-code">{generatedSQL.create_sql}</pre>
                        
                        {/* CREATE Response */}
                        {createResponse && (
                          <div className={`sql-result ${createResponse.success ? 'success' : 'error'}`}>
                            <strong>{createResponse.success ? '✅ Success' : '❌ Error'}:</strong> {createResponse.message}
                            {createResponse.error && (
                              <div className="error-details">
                                <pre>{createResponse.error}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* INSERT SQL */}
                      <div className="sql-section">
                        <div className="sql-header">
                          <h4>INSERT SQL:</h4>
                          <button
                            onClick={executeInsertSQL}
                            disabled={insertLoading}
                            className="execute-btn insert-btn"
                          >
                            {insertLoading ? 'Running...' : 'Run INSERT'}
                          </button>
                        </div>
                        <pre className="sql-code">{generatedSQL.insert_sql}</pre>
                        
                        {/* INSERT Response */}
                        {insertResponse && (
                          <div className={`sql-result ${insertResponse.success ? 'success' : 'error'}`}>
                            <strong>{insertResponse.success ? '✅ Success' : '❌ Error'}:</strong> {insertResponse.message}
                            {insertResponse.error && (
                              <div className="error-details">
                                <pre>{insertResponse.error}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="generation-error">
                      <h3>❌ Generation Failed</h3>
                      <p><strong>Error:</strong> {generatedSQL.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SQL Query Interface */}
            <div className="sql-interface">
              <h2>🔧 SQL Query Executor</h2>
              <div className="sql-form">
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter your SQL query here (CREATE TABLE, INSERT, etc.)..."
                  className="sql-textarea"
                  rows={6}
                  disabled={sqlLoading}
                />
                <button
                  onClick={executeSqlQuery}
                  disabled={sqlLoading || !sqlQuery.trim()}
                  className="sql-execute-btn"
                >
                  {sqlLoading ? 'Executing...' : 'Execute Query'}
                </button>
              </div>

              {/* SQL Response Display */}
              {sqlResponse && (
                <div className={`sql-response ${sqlResponse.success ? 'success' : 'error'}`}>
                  <h3>{sqlResponse.success ? '✅ Success' : '❌ Error'}</h3>
                  <p><strong>Message:</strong> {sqlResponse.message}</p>
                  {sqlResponse.error && (
                    <div className="error-details">
                      <strong>Error Details:</strong>
                      <pre>{sqlResponse.error}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  )
}

export default App 