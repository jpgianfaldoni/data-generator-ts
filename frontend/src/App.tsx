import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Scatter } from 'react-chartjs-2'
import './App.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ApiResponse {
  message: string
}

interface DataPoint {
  x: number
  y: number
}

interface ChartData {
  data: DataPoint[]
  title: string
  x_title: string
  y_title: string
}

interface SQLQueryResponse {
  success: boolean
  message: string
  error?: string
}

function App() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // SQL Query states
  const [sqlQuery, setSqlQuery] = useState('')
  const [sqlLoading, setSqlLoading] = useState(false)
  const [sqlResponse, setSqlResponse] = useState<SQLQueryResponse | null>(null)

  useEffect(() => {
    // Fetch both hello message and chart data
    Promise.all([
      fetch('/api/hello').then(response => response.json()),
      fetch('/api/data').then(response => response.json())
    ])
      .then(([helloData, dataResponse]) => {
        setApiData(helloData)
        setChartData(dataResponse)
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: chartData?.title || 'Hello world!',
        font: {
          size: 20
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: chartData?.x_title || 'Apps'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: chartData?.y_title || 'Fun with data'
        }
      }
    }
  }

  const scatterData = {
    datasets: [
      {
        data: chartData?.data || [],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 4,
      },
    ],
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
            
            {chartData && (
              <div className="chart-container">
                <Scatter data={scatterData} options={chartOptions} />
              </div>
            )}

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