"""
Simple Snowflake client wrapper for SensoryX.
Provides `insert_symptom_record(record: dict)` with a mock fallback when credentials are missing.
"""
import os
import json
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

SNOWFLAKE_USER = os.getenv("SNOWFLAKE_USER")
SNOWFLAKE_PASSWORD = os.getenv("SNOWFLAKE_PASSWORD")
SNOWFLAKE_ACCOUNT = os.getenv("SNOWFLAKE_ACCOUNT")
SNOWFLAKE_WAREHOUSE = os.getenv("SNOWFLAKE_WAREHOUSE")
SNOWFLAKE_DATABASE = os.getenv("SNOWFLAKE_DATABASE")
SNOWFLAKE_SCHEMA = os.getenv("SNOWFLAKE_SCHEMA", "PUBLIC")

MOCK_ENABLED = not (SNOWFLAKE_USER and SNOWFLAKE_PASSWORD and SNOWFLAKE_ACCOUNT)

if not MOCK_ENABLED:
    try:
        import snowflake.connector as sf
        _conn = None

        def _get_conn():
            global _conn
            if _conn is None:
                _conn = sf.connect(
                    user=SNOWFLAKE_USER,
                    password=SNOWFLAKE_PASSWORD,
                    account=SNOWFLAKE_ACCOUNT,
                    warehouse=SNOWFLAKE_WAREHOUSE,
                    database=SNOWFLAKE_DATABASE,
                    schema=SNOWFLAKE_SCHEMA,
                )
            return _conn

    except Exception as e:
        print(f"⚠️ Snowflake client failed to import or init: {e}")
        MOCK_ENABLED = True


async def insert_symptom_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a symptom record into Snowflake table `SYMPTOMS` (best-effort).

    Record is expected to be a flat dict with primitive values or JSON-serializable.
    This function uses a simple INSERT ... SELECT approach and falls back to a mock file write.
    """
    if MOCK_ENABLED:
        # append to a local mock file for development
        try:
            with open("/tmp/sensoryx_snowflake_mock.jsonl", "a") as f:
                f.write(json.dumps(record) + "\n")
            return {"status": "mocked", "message": "Saved to /tmp/sensoryx_snowflake_mock.jsonl"}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    # Real Snowflake insertion
    try:
        conn = _get_conn()
        cursor = conn.cursor()

        # Ensure required table exists (simple idempotent create)
        create_sql = f"""
        CREATE TABLE IF NOT EXISTS {SNOWFLAKE_SCHEMA}.SYMPTOMS (
            ID STRING,
            CREATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
            PAYLOAD VARIANT
        )
        """
        cursor.execute(create_sql)

        # Insert record as VARIANT
        insert_sql = f"INSERT INTO {SNOWFLAKE_SCHEMA}.SYMPTOMS (ID, PAYLOAD) SELECT %s, PARSE_JSON(%s)"
        rec_id = record.get("id") or record.get("symptom_id") or "generated_" + str(hash(json.dumps(record)))
        cursor.execute(insert_sql, (rec_id, json.dumps(record)))
        conn.commit()
        return {"status": "inserted", "id": rec_id}

    except Exception as e:
        return {"status": "error", "error": str(e)}
