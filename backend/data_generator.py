from typing import Dict, List, Tuple
import random
from datetime import datetime, timedelta
from faker import Faker
import sys
import os
import multiprocessing as mp
from functools import partial
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlgen import TableSchema, build_table_name

# Initialize Faker instance
fake = Faker()

def generate_row_chunk(args: Tuple[int, int, List, Dict[str, int]]) -> List[Tuple[int, List[str]]]:
    """Generate a chunk of rows for multiprocessing - must be top-level function for pickling"""
    start_row, end_row, columns, pk_start_values = args
    
    # Initialize a new Faker instance for this process
    process_fake = Faker()
    process_fake.seed_instance(start_row + random.randint(0, 1000))  # Unique seed per chunk
    
    chunk_results = []
    
    for row_index in range(start_row, end_row):
        row_values = []
        
        # Generate value for each column
        for col in columns:
            if col.primary_key:
                # Calculate primary key value based on row index and starting value
                pk_value = pk_start_values[col.name] + row_index
                value = generate_primary_key_value(col.type, pk_value)
            else:
                # Generate random value for non-primary key columns
                value = generate_random_value_mp(process_fake, col.name, col.type, col.nullable)
            row_values.append(value)
        
        chunk_results.append((row_index, row_values))
    
    return chunk_results

def generate_random_value_mp(faker_instance: Faker, column_name: str, column_type: str, nullable: bool) -> str:
    """Multiprocessing-safe version of generate_random_value"""
    # Sometimes generate NULL for nullable columns (10% chance)
    if nullable and random.random() < 0.1:
        return "NULL"
    
    # Handle different data types with realistic data
    if "BIGINT" in column_type:
        return str(faker_instance.random_int(min=-9223372036854775808, max=9223372036854775807))
    
    elif "INT" in column_type:
        return str(faker_instance.random_int(min=-2147483648, max=2147483647))
    
    elif "SMALLINT" in column_type:
        return str(faker_instance.random_int(min=0, max=32767))
    
    elif "TINYINT" in column_type:
        return str(faker_instance.random_int(min=0, max=255))
    
    elif "STRING" in column_type or "VARCHAR" in column_type:
        # Generate contextual fake data based on column name
        return f"'{generate_contextual_value_mp(faker_instance, column_name)}'"
    
    elif "BOOLEAN" in column_type:
        return str(faker_instance.boolean()).lower()
    
    elif "TIMESTAMP" in column_type:
        # Generate random timestamp within the last 2 years
        end_date = datetime.now()
        start_date = end_date - timedelta(days=730)  # 2 years ago
        random_time = faker_instance.date_time_between(start_date=start_date, end_date=end_date)
        return f"'{random_time.strftime('%Y-%m-%d %H:%M:%S')}'"
    
    elif "DATE" in column_type:
        # Generate random date within the last 2 years
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=730)  # 2 years ago
        random_date = faker_instance.date_between(start_date=start_date, end_date=end_date)
        return f"'{random_date.strftime('%Y-%m-%d')}'"
    
    elif "DECIMAL" in column_type:
        # Generate realistic decimal values (e.g., for prices, percentages)
        return f"{faker_instance.pyfloat(min_value=0.01, max_value=9999.99, right_digits=2)}"
    
    elif "DOUBLE" in column_type or "FLOAT" in column_type:
        return f"{faker_instance.pyfloat(min_value=0.0001, max_value=99999.9999, right_digits=4)}"
    
    else:
        # Default to realistic string data for unknown types
        return f"'{faker_instance.word()}'"

def generate_contextual_value_mp(faker_instance: Faker, column_name: str) -> str:
    """Multiprocessing-safe version of generate_contextual_value"""
    lower_name = column_name.lower()
    
    # Generate contextual data based on common column name patterns
    if "email" in lower_name:
        return faker_instance.email()
    elif "phone" in lower_name:
        return faker_instance.phone_number()
    elif "address" in lower_name:
        return faker_instance.address().replace('\n', ', ')
    elif "city" in lower_name:
        return faker_instance.city()
    elif "state" in lower_name:
        return faker_instance.state()
    elif "country" in lower_name:
        return faker_instance.country()
    elif "zip" in lower_name or "postal" in lower_name:
        return faker_instance.zipcode()
    elif "first" in lower_name and "name" in lower_name:
        return faker_instance.first_name()
    elif "last" in lower_name and "name" in lower_name:
        return faker_instance.last_name()
    elif "name" in lower_name or "username" in lower_name:
        return faker_instance.user_name()
    elif "company" in lower_name:
        return faker_instance.company()
    elif "job" in lower_name or "title" in lower_name:
        return faker_instance.job()
    elif "description" in lower_name:
        return faker_instance.sentence(nb_words=random.randint(5, 15))
    elif "url" in lower_name or "website" in lower_name:
        return faker_instance.url()
    elif "uuid" in lower_name or "guid" in lower_name:
        return str(faker_instance.uuid4())
    elif "price" in lower_name or "cost" in lower_name:
        return f"{faker_instance.pyfloat(min_value=1.00, max_value=999.99, right_digits=2)}"
    elif "product" in lower_name:
        products = ["Laptop", "Smartphone", "Headphones", "Tablet", "Monitor", "Keyboard", "Mouse", "Speaker", "Camera", "Watch"]
        return faker_instance.random_element(products)
    elif "category" in lower_name:
        categories = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Automotive", "Health", "Beauty", "Food", "Toys"]
        return faker_instance.random_element(categories)
    elif "color" in lower_name:
        return faker_instance.color_name()
    elif "status" in lower_name:
        statuses = ["active", "inactive", "pending", "completed", "cancelled"]
        return faker_instance.random_element(statuses)
    else:
        # Fallback to varied realistic data
        options = [
            faker_instance.first_name(),
            faker_instance.last_name(),
            faker_instance.company(),
            faker_instance.job(),
            faker_instance.city(),
            faker_instance.word(),
            faker_instance.sentence(nb_words=random.randint(3, 8)),
        ]
        return faker_instance.random_element(options)


def generate_insert_sql(schema: TableSchema) -> str:
    """Generates Databricks SQL INSERT statements with random data (limited to 5 rows for display)"""
    if schema.rows <= 0:
        return ""
    
    # Limit display to maximum 5 rows to prevent performance issues
    display_rows = min(schema.rows, 5)
    
    # Build the table name with optional catalog and schema
    table_name = build_table_name(schema.catalog, schema.schema, schema.table_name)
    
    # Build column names for INSERT statement
    column_names = [col.name for col in schema.columns]
    
    # Start INSERT statement
    sql_parts = [f"INSERT INTO {table_name} ("]
    
    # Add column names with proper formatting
    for i, col_name in enumerate(column_names):
        indent = "    "
        col_line = f"{indent}{col_name}"
        if i < len(column_names) - 1:
            col_line += ","
        sql_parts.append(col_line)
    
    sql_parts.append(")")
    sql_parts.append("VALUES")
    
    # Initialize primary key counters
    primary_key_counters: Dict[str, int] = {}
    for col in schema.columns:
        if col.primary_key:
            primary_key_counters[col.name] = 1  # Start from 1 for primary keys
    
    # Generate random data for each row (limited to display_rows)
    for row_index in range(display_rows):
        row_values = []
        
        # Generate value for each column
        for col in schema.columns:
            if col.primary_key:
                # Generate incremental value for primary key
                value = generate_primary_key_value(col.type, primary_key_counters[col.name])
                primary_key_counters[col.name] += 1
            else:
                # Generate random value for non-primary key columns
                value = generate_random_value(col.name, col.type, col.nullable)
            row_values.append(value)
        
        # Format row values with proper indentation
        row_sql = f"    ({', '.join(row_values)})"
        
        # Add comma if not last row
        if row_index < display_rows - 1:
            row_sql += ","
        
        sql_parts.append(row_sql)
    
    # Add comment if we're showing fewer rows than requested
    if schema.rows > 5:
        sql_parts.append(f"-- Showing first 5 rows (total: {schema.rows} rows)")
    
    sql_parts.append(";")
    return "\n".join(sql_parts)


def generate_full_insert_sql(schema: TableSchema) -> str:
    """Generates complete INSERT SQL with all rows for execution using multiprocessing for large datasets"""
    if schema.rows <= 0:
        return ""
    
    # Build the table name with optional catalog and schema
    table_name = build_table_name(schema.catalog, schema.schema, schema.table_name)
    
    # Build column names for INSERT statement
    column_names = [col.name for col in schema.columns]
    
    # Start INSERT statement
    sql_parts = [f"INSERT INTO {table_name} ("]
    
    # Add column names with proper formatting
    for i, col_name in enumerate(column_names):
        indent = "    "
        col_line = f"{indent}{col_name}"
        if i < len(column_names) - 1:
            col_line += ","
        sql_parts.append(col_line)
    
    sql_parts.append(")")
    sql_parts.append("VALUES")
    
    # Initialize primary key starting values
    primary_key_starts: Dict[str, int] = {}
    for col in schema.columns:
        if col.primary_key:
            primary_key_starts[col.name] = 1  # Start from 1 for primary keys
    
    # Use multiprocessing for large datasets (≥1000 rows), sequential for small ones
    # Multiprocessing provides significant performance benefits for CPU-intensive fake data generation
    MULTIPROCESSING_THRESHOLD = 1000
    
    if schema.rows >= MULTIPROCESSING_THRESHOLD:
        # Use multiprocessing for large datasets - bypasses GIL for better CPU utilization
        row_results = _generate_rows_multiprocessing(schema.rows, schema.columns, primary_key_starts)
    else:
        # Use sequential processing for small datasets to avoid multiprocessing overhead
        row_results = _generate_rows_sequential(schema.rows, schema.columns, primary_key_starts)
    
    # Sort results by row index to maintain proper order
    row_results.sort(key=lambda x: x[0])
    
    # Format row results into SQL
    for i, (row_index, row_values) in enumerate(row_results):
        # Format row values with proper indentation
        row_sql = f"    ({', '.join(row_values)})"
        
        # Add comma if not last row
        if i < len(row_results) - 1:
            row_sql += ","
        
        sql_parts.append(row_sql)
    
    sql_parts.append(";")
    return "\n".join(sql_parts)

def _generate_rows_multiprocessing(total_rows: int, columns: List, primary_key_starts: Dict[str, int]) -> List[Tuple[int, List[str]]]:
    """Generate rows using multiprocessing for better CPU utilization"""
    try:
        # Determine optimal chunk size and number of processes
        cpu_count = mp.cpu_count()
        chunk_size = max(1000, total_rows // (cpu_count * 2))  # At least 1000 rows per chunk
        
        # Create chunks for multiprocessing
        chunks = []
        for start_row in range(0, total_rows, chunk_size):
            end_row = min(start_row + chunk_size, total_rows)
            chunks.append((start_row, end_row, columns, primary_key_starts))
        
        # Process chunks in parallel
        row_results = []
        with mp.Pool(processes=cpu_count) as pool:
            chunk_results = pool.map(generate_row_chunk, chunks)
            
            # Flatten the results
            for chunk_result in chunk_results:
                row_results.extend(chunk_result)
        
        return row_results
    
    except Exception as e:
        # Fallback to sequential processing if multiprocessing fails
        print(f"Warning: Multiprocessing failed ({e}), falling back to sequential processing")
        return _generate_rows_sequential(total_rows, columns, primary_key_starts)

def _generate_rows_sequential(total_rows: int, columns: List, primary_key_starts: Dict[str, int]) -> List[Tuple[int, List[str]]]:
    """Generate rows sequentially for small datasets"""
    # Initialize primary key counters
    primary_key_counters: Dict[str, int] = primary_key_starts.copy()
    
    row_results = []
    for row_index in range(total_rows):
        row_values = []
        
        # Generate value for each column
        for col in columns:
            if col.primary_key:
                # Generate incremental value for primary key
                value = generate_primary_key_value(col.type, primary_key_counters[col.name])
                primary_key_counters[col.name] += 1
            else:
                # Generate random value for non-primary key columns
                value = generate_random_value(col.name, col.type, col.nullable)
            row_values.append(value)
        
        row_results.append((row_index, row_values))
    
    return row_results


def generate_primary_key_value(column_type: str, counter: int) -> str:
    """Creates incremental values for primary key columns"""
    if "STRING" in column_type or "VARCHAR" in column_type:
        # For string primary keys, create a pattern like "ID_001", "ID_002", etc.
        return f"'ID_{counter:03d}'"
    else:
        # For all integer types (BIGINT, INT, SMALLINT, TINYINT) and others, use incremental numbers
        return str(counter)


def generate_random_value(column_name: str, column_type: str, nullable: bool) -> str:
    """Creates random data based on column type using faker"""
    # Sometimes generate NULL for nullable columns (10% chance)
    if nullable and random.random() < 0.1:
        return "NULL"
    
    # Handle different data types with realistic data
    if "BIGINT" in column_type:
        return str(fake.random_int(min=-9223372036854775808, max=9223372036854775807))
    
    elif "INT" in column_type:
        return str(fake.random_int(min=-2147483648, max=2147483647))
    
    elif "SMALLINT" in column_type:
        return str(fake.random_int(min=0, max=32767))
    
    elif "TINYINT" in column_type:
        return str(fake.random_int(min=0, max=255))
    
    elif "STRING" in column_type or "VARCHAR" in column_type:
        # Generate contextual fake data based on column name
        return f"'{generate_contextual_value(column_name)}'"
    
    elif "BOOLEAN" in column_type:
        return str(fake.boolean()).lower()
    
    elif "TIMESTAMP" in column_type:
        # Generate random timestamp within the last 2 years
        end_date = datetime.now()
        start_date = end_date - timedelta(days=730)  # 2 years ago
        random_time = fake.date_time_between(start_date=start_date, end_date=end_date)
        return f"'{random_time.strftime('%Y-%m-%d %H:%M:%S')}'"
    
    elif "DATE" in column_type:
        # Generate random date within the last 2 years
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=730)  # 2 years ago
        random_date = fake.date_between(start_date=start_date, end_date=end_date)
        return f"'{random_date.strftime('%Y-%m-%d')}'"
    
    elif "DECIMAL" in column_type:
        # Generate realistic decimal values (e.g., for prices, percentages)
        return f"{fake.pyfloat(min_value=0.01, max_value=9999.99, right_digits=2)}"
    
    elif "DOUBLE" in column_type or "FLOAT" in column_type:
        return f"{fake.pyfloat(min_value=0.0001, max_value=99999.9999, right_digits=4)}"
    
    else:
        # Default to realistic string data for unknown types
        return f"'{fake.word()}'"


def generate_contextual_value(column_name: str) -> str:
    """Creates contextual fake data based on column name patterns"""
    lower_name = column_name.lower()
    
    # Generate contextual data based on common column name patterns
    if "email" in lower_name:
        return fake.email()
    elif "phone" in lower_name:
        return fake.phone_number()
    elif "address" in lower_name:
        return fake.address().replace('\n', ', ')
    elif "city" in lower_name:
        return fake.city()
    elif "state" in lower_name:
        return fake.state()
    elif "country" in lower_name:
        return fake.country()
    elif "zip" in lower_name or "postal" in lower_name:
        return fake.zipcode()
    elif "first" in lower_name and "name" in lower_name:
        return fake.first_name()
    elif "last" in lower_name and "name" in lower_name:
        return fake.last_name()
    elif "name" in lower_name or "username" in lower_name:
        return fake.user_name()
    elif "company" in lower_name:
        return fake.company()
    elif "job" in lower_name or "title" in lower_name:
        return fake.job()
    elif "description" in lower_name:
        return fake.sentence(nb_words=random.randint(5, 15))
    elif "url" in lower_name or "website" in lower_name:
        return fake.url()
    elif "uuid" in lower_name or "guid" in lower_name:
        return str(fake.uuid4())
    elif "price" in lower_name or "cost" in lower_name:
        return f"{fake.pyfloat(min_value=1.00, max_value=999.99, right_digits=2)}"
    elif "product" in lower_name:
        products = ["Laptop", "Smartphone", "Headphones", "Tablet", "Monitor", "Keyboard", "Mouse", "Speaker", "Camera", "Watch"]
        return fake.random_element(products)
    elif "category" in lower_name:
        categories = ["Electronics", "Clothing", "Books", "Home & Garden", "Sports", "Automotive", "Health", "Beauty", "Food", "Toys"]
        return fake.random_element(categories)
    elif "color" in lower_name:
        return fake.color_name()
    elif "status" in lower_name:
        statuses = ["active", "inactive", "pending", "completed", "cancelled"]
        return fake.random_element(statuses)
    else:
        # Fallback to varied realistic data
        options = [
            fake.first_name(),
            fake.last_name(),
            fake.company(),
            fake.job(),
            fake.city(),
            fake.word(),
            fake.sentence(nb_words=random.randint(3, 8)),
        ]
        return fake.random_element(options) 