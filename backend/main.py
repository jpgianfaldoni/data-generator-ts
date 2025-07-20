import os
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from databricks import sql
from databricks.sdk.core import Config

# --- Pydantic Models ---
class SQLQueryRequest(BaseModel):
    query: str

class SQLQueryResponse(BaseModel):
    success: bool
    message: str
    error: str = None

# --- Environment Check ---
assert os.getenv('DATABRICKS_WAREHOUSE_ID'), "DATABRICKS_WAREHOUSE_ID must be set in app.yaml."

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Simple FastAPI + React App")

# --- SQL Query Function ---
def sqlQuery(query: str) -> bool:
    """Execute a SQL DDL/DML query (CREATE TABLE, INSERT) and return success status."""
    try:
        cfg = Config()  # Pull environment variables for auth
        with sql.connect(
            server_hostname=cfg.host,
            http_path=f"/sql/1.0/warehouses/{os.getenv('DATABRICKS_WAREHOUSE_ID')}",
            credentials_provider=lambda: cfg.authenticate
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute(query)
                # No need to fetch for DDL/DML operations
                return True
    except Exception as e:
        logger.error(f"SQL query failed: {str(e)}")
        raise e

# --- API Routes ---
@app.get("/api/hello")
async def hello():
    logger.info("Accessed /api/hello")
    return {"message": "Hello from FastAPI!"}

@app.get("/api/health")
async def health_check():
    logger.info("Health check at /api/health")
    return {"status": "healthy"}



@app.post("/api/execute-sql")
async def execute_sql(request: SQLQueryRequest) -> SQLQueryResponse:
    """Execute SQL DDL/DML query (CREATE TABLE, INSERT) endpoint"""
    logger.info("SQL query execution requested")
    
    try:
        # Validate query
        if not request.query or not isinstance(request.query, str):
            raise HTTPException(
                status_code=400,
                detail="Query must be a non-empty string"
            )
        
        query = request.query.strip()
        if not query:
            raise HTTPException(
                status_code=400,
                detail="Query cannot be empty"
            )
        
        # Log query type for monitoring
        query_upper = query.upper().strip()
        if query_upper.startswith('CREATE'):
            operation_type = "CREATE TABLE"
        elif query_upper.startswith('INSERT'):
            operation_type = "INSERT"
        else:
            operation_type = "DDL/DML"
        
        logger.info(f"Executing {operation_type} query: {query[:100]}...")
        
        # Execute the query
        sqlQuery(query)
        
        logger.info(f"{operation_type} query executed successfully")
        return SQLQueryResponse(
            success=True,
            message=f"{operation_type} operation completed successfully"
        )
        
    except HTTPException:
        # Re-raise HTTPExceptions as-is
        raise
    except Exception as e:
        error_msg = f"SQL query execution failed: {str(e)}"
        logger.error(error_msg)
        
        return SQLQueryResponse(
            success=False,
            message="Query execution failed",
            error=error_msg
        )

# --- Static Files Setup ---
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
os.makedirs(static_dir, exist_ok=True)

app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

# --- Catch-all for React Routes ---
@app.get("/{full_path:path}")
async def serve_react(full_path: str):
    index_html = os.path.join(static_dir, "index.html")
    if os.path.exists(index_html):
        logger.info(f"Serving React frontend for path: /{full_path}")
        return FileResponse(index_html)
    logger.error("Frontend not built. index.html missing.")
    raise HTTPException(
        status_code=404,
        detail="Frontend not built. Please run 'npm run build' first."
    )