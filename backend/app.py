import os
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from databricks import sql
from databricks.sdk import WorkspaceClient
from databricks.sdk.core import Config

# Assert required environment variable
assert os.getenv('DATABRICKS_WAREHOUSE_ID'), "DATABRICKS_WAREHOUSE_ID must be set in app.yaml."

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)

def sqlQuery(query: str) -> pd.DataFrame:
    """Execute a SQL query and return the result as a pandas DataFrame."""
    cfg = Config()  # Pull environment variables for auth
    with sql.connect(
        server_hostname=cfg.host,
        http_path=f"/sql/1.0/warehouses/{os.getenv('DATABRICKS_WAREHOUSE_ID')}",
        credentials_provider=lambda: cfg.authenticate
    ) as connection:
        with connection.cursor() as cursor:
            cursor.execute(query)
            return cursor.fetchall_arrow().to_pandas()

@app.route('/api/execute-sql', methods=['POST'])
def execute_sql():
    """Execute SQL query endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'error': 'Query is required in request body'
            }), 400
        
        query = data['query']
        
        if not query or not isinstance(query, str):
            return jsonify({
                'success': False,
                'error': 'Query must be a non-empty string'
            }), 400
        
        # Execute the query using the user's pattern
        try:
            result_df = sqlQuery(query)
            
            # Convert DataFrame to JSON-serializable format
            result_data = {
                'success': True,
                'data': result_df.to_dict('records'),  # Convert to list of dictionaries
                'columns': list(result_df.columns),
                'row_count': len(result_df),
                'shape': f"{result_df.shape[0]} rows × {result_df.shape[1]} columns"
            }
            
            print(f"Query executed successfully:")
            print(f"Data shape: {result_df.shape}")
            print(f"Data columns: {result_df.columns.tolist()}")
            
            return jsonify(result_data)
            
        except Exception as e:
            error_msg = f"An error occurred in querying data: {str(e)}"
            print(error_msg)
            
            return jsonify({
                'success': False,
                'error': error_msg,
                'data': [],
                'columns': [],
                'row_count': 0
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Server error: {str(e)}"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'warehouse_id': os.getenv('DATABRICKS_WAREHOUSE_ID'),
        'timestamp': pd.Timestamp.now().isoformat()
    })

@app.route('/api/test-query', methods=['GET'])
def test_query():
    """Test endpoint with a sample query"""
    try:
        # Test with a simple query
        test_sql = "SELECT 1 as test_column, 'Hello Databricks' as message"
        result_df = sqlQuery(test_sql)
        
        return jsonify({
            'success': True,
            'message': 'Test query executed successfully',
            'data': result_df.to_dict('records'),
            'columns': list(result_df.columns),
            'shape': f"{result_df.shape[0]} rows × {result_df.shape[1]} columns"
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Test query failed: {str(e)}"
        }), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve React frontend - catch all route for SPA"""
    try:
        if path and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')
    except:
        # Fallback if static files not found
        return jsonify({
            'message': 'Data Generator API is running',
            'frontend': 'React app not built yet - run npm run build in frontend/',
            'api_health': '/health',
            'test_query': '/api/test-query'
        })

# Optional: For development only
if __name__ == '__main__':
    print("⚠️  Running in development mode - use Gunicorn for production")
    print("🚀 Starting Databricks SQL Query API...")
    print(f"Warehouse ID: {os.getenv('DATABRICKS_WAREHOUSE_ID')}")
    print(f"Host: {os.getenv('DATABRICKS_HOST', 'Not set')}")
    
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 8000)),
        debug=True
    )
