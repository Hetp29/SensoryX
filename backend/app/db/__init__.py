# backend/app/db/__init__.py
from .snowflake_client import SnowflakeClient

snowflake_client = SnowflakeClient()

__all__ = ['snowflake_client', 'SnowflakeClient']
