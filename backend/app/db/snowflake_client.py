# backend/app/db/snowflake_client.py
import os
import json
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

SNOWFLAKE_USER = os.getenv("SNOWFLAKE_USER")
SNOWFLAKE_PASSWORD = os.getenv("SNOWFLAKE_PASSWORD")
SNOWFLAKE_ACCOUNT = os.getenv("SNOWFLAKE_ACCOUNT")
SNOWFLAKE_WAREHOUSE = os.getenv("SNOWFLAKE_WAREHOUSE", "SENSORYX_WH")
SNOWFLAKE_DATABASE = os.getenv("SNOWFLAKE_DATABASE", "SENSORYX_DB")
SNOWFLAKE_ROLE = os.getenv("SNOWFLAKE_ROLE", "SENSORYX_ROLE")

MOCK_ENABLED = not (SNOWFLAKE_USER and SNOWFLAKE_PASSWORD and SNOWFLAKE_ACCOUNT)

if not MOCK_ENABLED:
    try:
        import snowflake.connector
        from snowflake.connector import DictCursor
        from snowflake.connector.errors import Error as SnowflakeError
    except ImportError:
        MOCK_ENABLED = True


class SnowflakeClient:
    def __init__(self):
        self.connection_pool = []
        self.pool_size = 5
        self.initialized = False

    async def _get_connection(self):
        if MOCK_ENABLED:
            return MockSnowflakeConnection()

        if not self.connection_pool:
            await self._initialize_pool()

        return self.connection_pool[0]

    async def _initialize_pool(self):
        if self.initialized:
            return

        try:
            conn = snowflake.connector.connect(
                user=SNOWFLAKE_USER,
                password=SNOWFLAKE_PASSWORD,
                account=SNOWFLAKE_ACCOUNT,
                warehouse=SNOWFLAKE_WAREHOUSE,
                database=SNOWFLAKE_DATABASE,
                role=SNOWFLAKE_ROLE,
                session_parameters={
                    'QUERY_TAG': 'sensoryx_api',
                    'TIMEZONE': 'America/New_York'
                }
            )
            self.connection_pool.append(conn)
            self.initialized = True
            await self._initialize_schema()
        except Exception as e:
            print(f"Snowflake connection failed: {e}")

    async def _initialize_schema(self):
        conn = await self._get_connection()
        cursor = conn.cursor()

        # Multi-layer architecture: RAW → STAGING → ANALYTICS
        schemas = [
            "CREATE SCHEMA IF NOT EXISTS RAW",
            "CREATE SCHEMA IF NOT EXISTS STAGING",
            "CREATE SCHEMA IF NOT EXISTS ANALYTICS",
            "CREATE SCHEMA IF NOT EXISTS AUDIT"
        ]

        for schema_sql in schemas:
            cursor.execute(schema_sql)

        # RAW layer - ingested data as-is
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS RAW.SYMPTOM_EVENTS (
                EVENT_ID STRING PRIMARY KEY,
                INGESTED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
                USER_ID STRING,
                SYMPTOM_DESCRIPTION STRING,
                PATIENT_DATA VARIANT,
                VECTOR_EMBEDDING ARRAY,
                SOURCE_TYPE STRING,
                RAW_PAYLOAD VARIANT
            ) CLUSTER BY (INGESTED_AT, USER_ID)
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS RAW.DIAGNOSIS_EVENTS (
                EVENT_ID STRING PRIMARY KEY,
                SYMPTOM_EVENT_ID STRING,
                TIMESTAMP TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
                AI_MODEL STRING,
                CONDITIONS VARIANT,
                URGENCY_LEVEL STRING,
                RECOMMENDATIONS VARIANT,
                CONFIDENCE_SCORES VARIANT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS RAW.FINANCIAL_EVENTS (
                EVENT_ID STRING PRIMARY KEY,
                USER_ID STRING,
                TIMESTAMP TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
                TRANSACTION_TYPE STRING,
                AMOUNT FLOAT,
                CATEGORY STRING,
                MERCHANT STRING,
                KNOT_TRANSACTION_ID STRING,
                METADATA VARIANT
            ) CLUSTER BY (TIMESTAMP, USER_ID, CATEGORY)
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS RAW.VOICE_TRANSCRIPTS (
                TRANSCRIPT_ID STRING PRIMARY KEY,
                USER_ID STRING,
                CREATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
                AUDIO_FILENAME STRING,
                TRANSCRIBED_TEXT STRING,
                LANGUAGE STRING,
                DURATION_SECONDS FLOAT,
                ELEVENLABS_MODEL STRING
            )
        """)

        # STAGING layer - validated and enriched
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS STAGING.SYMPTOM_RECORDS (
                RECORD_ID STRING PRIMARY KEY,
                PROCESSED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
                USER_ID STRING NOT NULL,
                SYMPTOM_TEXT STRING NOT NULL,
                NORMALIZED_SYMPTOM STRING,
                MATCHED_CONDITIONS VARIANT,
                SEVERITY_SCORE FLOAT,
                EMBEDDING_VECTOR ARRAY,
                METADATA VARIANT
            )
        """)

        # ANALYTICS layer - aggregated insights
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ANALYTICS.USER_HEALTH_TIMELINE (
                USER_ID STRING,
                REPORT_DATE DATE,
                TOTAL_SYMPTOMS INT,
                UNIQUE_CONDITIONS ARRAY,
                SEVERITY_TREND STRING,
                TOTAL_MEDICAL_SPEND FLOAT,
                HIGH_RISK_FLAGS VARIANT,
                PRIMARY KEY (USER_ID, REPORT_DATE)
            ) CLUSTER BY (REPORT_DATE)
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ANALYTICS.CONDITION_PATTERNS (
                CONDITION_NAME STRING PRIMARY KEY,
                TOTAL_CASES INT,
                AVG_COST FLOAT,
                COMMON_SYMPTOMS ARRAY,
                SEASONAL_TREND VARIANT,
                UPDATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP()
            )
        """)

        # AUDIT layer - HIPAA compliance
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS AUDIT.DATA_ACCESS_LOG (
                LOG_ID STRING PRIMARY KEY,
                TIMESTAMP TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
                USER_ID STRING,
                ACTION STRING,
                RESOURCE_TYPE STRING,
                RESOURCE_ID STRING,
                IP_ADDRESS STRING,
                REQUEST_METADATA VARIANT,
                DATA_RETENTION_PERIOD INT DEFAULT 2555
            ) CLUSTER BY (TIMESTAMP)
        """)

        conn.commit()

    async def insert_symptom_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        conn = await self._get_connection()
        cursor = conn.cursor()

        try:
            event_id = record.get("id", f"evt_{datetime.utcnow().timestamp()}")

            cursor.execute("""
                INSERT INTO RAW.SYMPTOM_EVENTS
                (EVENT_ID, USER_ID, SYMPTOM_DESCRIPTION, PATIENT_DATA, SOURCE_TYPE, RAW_PAYLOAD)
                SELECT %s, %s, %s, PARSE_JSON(%s), %s, PARSE_JSON(%s)
            """, (
                event_id,
                record.get("user_id", "anonymous"),
                record.get("description", ""),
                json.dumps(record.get("patient_data", {})),
                record.get("source", "api"),
                json.dumps(record)
            ))

            await self._log_audit_event("INSERT", "SYMPTOM_RECORD", event_id, record.get("user_id"))

            conn.commit()
            return {"status": "success", "event_id": event_id, "layer": "RAW"}

        except Exception as e:
            conn.rollback()
            return {"status": "error", "error": str(e)}

    async def insert_diagnosis_event(self, symptom_id: str, diagnosis_data: Dict) -> Dict:
        conn = await self._get_connection()
        cursor = conn.cursor()

        try:
            event_id = f"diag_{datetime.utcnow().timestamp()}"

            cursor.execute("""
                INSERT INTO RAW.DIAGNOSIS_EVENTS
                (EVENT_ID, SYMPTOM_EVENT_ID, AI_MODEL, CONDITIONS, URGENCY_LEVEL, RECOMMENDATIONS, CONFIDENCE_SCORES)
                SELECT %s, %s, %s, PARSE_JSON(%s), %s, PARSE_JSON(%s), PARSE_JSON(%s)
            """, (
                event_id,
                symptom_id,
                diagnosis_data.get("model", "gemini-pro"),
                json.dumps(diagnosis_data.get("conditions", [])),
                diagnosis_data.get("urgency_level", "medium"),
                json.dumps(diagnosis_data.get("recommendations", [])),
                json.dumps(diagnosis_data.get("confidence_scores", {}))
            ))

            conn.commit()
            return {"status": "success", "event_id": event_id}

        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def batch_insert_financial_transactions(self, transactions: List[Dict]) -> Dict:
        conn = await self._get_connection()
        cursor = conn.cursor()

        try:
            insert_data = [
                (
                    tx.get("id", f"tx_{i}"),
                    tx.get("user_id"),
                    tx.get("type", "medical"),
                    tx.get("amount", 0),
                    tx.get("category", "unknown"),
                    tx.get("merchant", ""),
                    tx.get("knot_id"),
                    json.dumps(tx.get("metadata", {}))
                )
                for i, tx in enumerate(transactions)
            ]

            cursor.executemany("""
                INSERT INTO RAW.FINANCIAL_EVENTS
                (EVENT_ID, USER_ID, TRANSACTION_TYPE, AMOUNT, CATEGORY, MERCHANT, KNOT_TRANSACTION_ID, METADATA)
                SELECT %s, %s, %s, %s, %s, %s, %s, PARSE_JSON(%s)
            """, insert_data)

            conn.commit()
            return {"status": "success", "inserted": len(transactions)}

        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def get_user_health_timeline(self, user_id: str, days: int = 90) -> List[Dict]:
        conn = await self._get_connection()
        cursor = conn.cursor(DictCursor)

        try:
            cursor.execute("""
                SELECT
                    DATE_TRUNC('day', INGESTED_AT) as date,
                    COUNT(DISTINCT EVENT_ID) as symptom_count,
                    ARRAY_AGG(DISTINCT SYMPTOM_DESCRIPTION) as symptoms,
                    AVG(CASE
                        WHEN RAW_PAYLOAD:urgency_level = 'high' THEN 3
                        WHEN RAW_PAYLOAD:urgency_level = 'medium' THEN 2
                        ELSE 1
                    END) as avg_severity
                FROM RAW.SYMPTOM_EVENTS
                WHERE USER_ID = %s
                AND INGESTED_AT >= DATEADD(day, -%s, CURRENT_TIMESTAMP())
                GROUP BY date
                ORDER BY date DESC
            """, (user_id, days))

            return cursor.fetchall()

        except Exception as e:
            return []

    async def get_spending_analytics(self, user_id: str, months: int = 12) -> Dict:
        conn = await self._get_connection()
        cursor = conn.cursor(DictCursor)

        try:
            cursor.execute("""
                SELECT
                    CATEGORY,
                    SUM(AMOUNT) as total_spent,
                    COUNT(*) as transaction_count,
                    AVG(AMOUNT) as avg_transaction,
                    MIN(TIMESTAMP) as first_transaction,
                    MAX(TIMESTAMP) as last_transaction
                FROM RAW.FINANCIAL_EVENTS
                WHERE USER_ID = %s
                AND TIMESTAMP >= DATEADD(month, -%s, CURRENT_TIMESTAMP())
                GROUP BY CATEGORY
                ORDER BY total_spent DESC
            """, (user_id, months))

            results = cursor.fetchall()

            cursor.execute("""
                SELECT SUM(AMOUNT) as total
                FROM RAW.FINANCIAL_EVENTS
                WHERE USER_ID = %s
                AND TIMESTAMP >= DATEADD(month, -%s, CURRENT_TIMESTAMP())
            """, (user_id, months))

            total_row = cursor.fetchone()

            return {
                "by_category": results,
                "total_spending": total_row['TOTAL'] if total_row else 0,
                "period_months": months
            }

        except Exception as e:
            return {"error": str(e)}

    async def get_condition_insights(self) -> List[Dict]:
        conn = await self._get_connection()
        cursor = conn.cursor(DictCursor)

        try:
            cursor.execute("""
                WITH symptom_conditions AS (
                    SELECT
                        d.CONDITIONS,
                        s.SYMPTOM_DESCRIPTION,
                        s.INGESTED_AT
                    FROM RAW.DIAGNOSIS_EVENTS d
                    JOIN RAW.SYMPTOM_EVENTS s ON d.SYMPTOM_EVENT_ID = s.EVENT_ID
                    WHERE d.TIMESTAMP >= DATEADD(month, -6, CURRENT_TIMESTAMP())
                )
                SELECT
                    condition.VALUE:name::STRING as condition_name,
                    COUNT(*) as case_count,
                    ARRAY_AGG(DISTINCT SYMPTOM_DESCRIPTION) as common_symptoms,
                    DATE_TRUNC('month', INGESTED_AT) as month
                FROM symptom_conditions,
                LATERAL FLATTEN(input => CONDITIONS) condition
                GROUP BY condition_name, month
                ORDER BY case_count DESC
                LIMIT 20
            """)

            return cursor.fetchall()

        except Exception as e:
            return []

    async def query_time_travel(self, table: str, timestamp: datetime) -> List[Dict]:
        conn = await self._get_connection()
        cursor = conn.cursor(DictCursor)

        try:
            cursor.execute(f"""
                SELECT * FROM {table}
                AT(TIMESTAMP => '{timestamp.isoformat()}'::TIMESTAMP_LTZ)
                LIMIT 100
            """)

            return cursor.fetchall()

        except Exception as e:
            return []

    async def _log_audit_event(self, action: str, resource_type: str, resource_id: str, user_id: Optional[str] = None):
        if MOCK_ENABLED:
            return

        conn = await self._get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO AUDIT.DATA_ACCESS_LOG
                (LOG_ID, USER_ID, ACTION, RESOURCE_TYPE, RESOURCE_ID, REQUEST_METADATA)
                SELECT %s, %s, %s, %s, %s, PARSE_JSON(%s)
            """, (
                f"log_{datetime.utcnow().timestamp()}",
                user_id or "system",
                action,
                resource_type,
                resource_id,
                json.dumps({"timestamp": datetime.utcnow().isoformat()})
            ))
            conn.commit()
        except:
            pass


class MockSnowflakeConnection:
    def __init__(self):
        self.mock_file = "/tmp/sensoryx_snowflake_mock.jsonl"

    def cursor(self, cursor_type=None):
        return MockCursor(self.mock_file)

    def commit(self):
        pass

    def rollback(self):
        pass


class MockCursor:
    def __init__(self, mock_file):
        self.mock_file = mock_file
        self.results = []

    def execute(self, sql, params=None):
        try:
            with open(self.mock_file, "a") as f:
                f.write(json.dumps({"sql": sql[:100], "params": str(params)[:100]}) + "\n")
        except:
            pass

    def executemany(self, sql, data):
        self.execute(sql, f"batch_{len(data)}_records")

    def fetchall(self):
        return []

    def fetchone(self):
        return None
