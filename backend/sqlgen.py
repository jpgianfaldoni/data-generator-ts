from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class Column:
    """Represents a single column in the table"""
    name: str
    type: str
    nullable: bool = True
    comment: Optional[str] = None
    primary_key: bool = False


@dataclass
class TableSchema:
    """Represents the overall table definition"""
    table_name: str
    catalog: str = ""
    schema: str = ""
    columns: List[Column] = field(default_factory=list)
    rows: int = 0  # Number of rows to generate for INSERT

    def generate_create_table_sql(self) -> str:
        """Generates Databricks SQL CREATE TABLE statement"""
        # Build the table name with optional catalog and schema
        table_name = build_table_name(self.catalog, self.schema, self.table_name)
        
        # Start building the CREATE TABLE statement
        sql_parts = [f"CREATE TABLE {table_name} ("]
        
        # Add each column
        primary_key_columns = []
        for i, col in enumerate(self.columns):
            col_def = f"    {col.name} {col.type}"
            
            # Add NULL/NOT NULL constraint
            if not col.nullable or col.primary_key:
                col_def += " NOT NULL"
            
            # Add comment if provided
            if col.comment:
                # Escape single quotes in comments by doubling them
                escaped_comment = col.comment.replace("'", "''")
                col_def += f" COMMENT '{escaped_comment}'"
            
            # Track primary key columns
            if col.primary_key:
                primary_key_columns.append(col.name)
            
            # Add comma if not the last column or if we have primary keys to add
            if i < len(self.columns) - 1 or primary_key_columns:
                col_def += ","
            
            sql_parts.append(col_def)
        
        # Add PRIMARY KEY constraint if we have primary key columns
        if primary_key_columns:
            pk_constraint = f"    PRIMARY KEY ({', '.join(primary_key_columns)})"
            sql_parts.append(pk_constraint)
        
        sql_parts.append(");")
        
        return "\n".join(sql_parts)


def build_table_name(catalog: str, schema: str, table_name: str) -> str:
    """Build the full table name with optional catalog and schema"""
    parts = []
    
    if catalog:
        parts.append(catalog)
    
    if schema:
        parts.append(schema)
    
    parts.append(table_name)
    
    return ".".join(parts) 