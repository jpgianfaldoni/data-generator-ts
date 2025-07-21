import { useState } from 'react'
import './App.css'





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
        <div className="content">

            {/* Three Column Layout: YAML | CREATE | INSERT */}
            <div className="three-column-container">
              
              {/* YAML Schema Editor */}
              <div className="yaml-section">
                <div className="yaml-header">
                  <h3>YAML Schema</h3>
                </div>
                <div className="yaml-content-area">
                  <textarea
                    value={yamlContent}
                    onChange={(e) => setYamlContent(e.target.value)}
                    placeholder="Enter your YAML schema definition here..."
                    className="yaml-textarea"
                    rows={20}
                    disabled={generateLoading}
                  />
                </div>

                {/* Generation Error Display */}
                {generatedSQL && !generatedSQL.success && (
                  <div className="generation-error">
                    <h4>Generation Failed</h4>
                    <p><strong>Error:</strong> {generatedSQL.error}</p>
                  </div>
                )}

                <button
                  onClick={generateFromYAML}
                  disabled={generateLoading || !yamlContent.trim()}
                  className="generate-btn"
                >
                  {generateLoading ? 'Generating...' : 'Generate SQL'}
                </button>
              </div>

              {/* CREATE TABLE SQL Section */}
              <div className="sql-section">
                <div className="sql-header">
                  <h3>CREATE TABLE SQL</h3>
                </div>
                
                <div className="sql-content-area">
                  <pre className="sql-code">
                    {generatedSQL?.create_sql || '-- CREATE TABLE SQL will appear here after generating from YAML schema'}
                  </pre>
                </div>
                
                {/* CREATE Response */}
                {createResponse && (
                  <div className={`sql-result ${createResponse.success ? 'success' : 'error'}`}>
                    <strong>{createResponse.success ? 'Success' : 'Error'}:</strong> {createResponse.message}
                    {createResponse.error && (
                      <div className="error-details">
                        <pre>{createResponse.error}</pre>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={executeCreateSQL}
                  disabled={createLoading || !generatedSQL?.create_sql}
                  className="execute-btn create-btn"
                >
                  {createLoading ? 'Running...' : 'Run CREATE'}
                </button>
              </div>

              {/* INSERT SQL Section */}
              <div className="sql-section">
                <div className="sql-header">
                  <h3>INSERT SQL</h3>
                </div>
                
                <div className="sql-content-area">
                  <pre className="sql-code insert-sql">
                    {generatedSQL?.insert_sql || '-- INSERT SQL with sample data will appear here after generating from YAML schema'}
                  </pre>
                </div>
                
                {/* INSERT Response */}
                {insertResponse && (
                  <div className={`sql-result ${insertResponse.success ? 'success' : 'error'}`}>
                    <strong>{insertResponse.success ? 'Success' : 'Error'}:</strong> {insertResponse.message}
                    {insertResponse.error && (
                      <div className="error-details">
                        <pre>{insertResponse.error}</pre>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={executeInsertSQL}
                  disabled={insertLoading || !generatedSQL?.insert_sql}
                  className="execute-btn insert-btn"
                >
                  {insertLoading ? 'Running...' : 'Run INSERT'}
                </button>
              </div>

            </div>
          </div>
      </header>
    </div>
  )
}

export default App 