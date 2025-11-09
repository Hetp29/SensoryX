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

        # AI vs Human Doctor Choice Tracking
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS RAW.CONSULTATION_CHOICES (
                CHOICE_ID STRING PRIMARY KEY,
                USER_ID STRING,
                SYMPTOM_EVENT_ID STRING,
                TIMESTAMP TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
                CHOICE_TYPE STRING,
                CONSULTATION_TYPE STRING,
                TIER STRING,
                COST FLOAT,
                REASON VARIANT,
                METADATA VARIANT
            ) CLUSTER BY (TIMESTAMP, USER_ID, CHOICE_TYPE)
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS RAW.AI_CONSULTATIONS (
                CONSULTATION_ID STRING PRIMARY KEY,
                SESSION_ID STRING,
                USER_ID STRING,
                STARTED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
                ENDED_AT TIMESTAMP_LTZ,
                TIER STRING,
                MESSAGE_COUNT INT,
                TOTAL_COST FLOAT,
                SUMMARY VARIANT,
                SATISFACTION_RATING INT,
                METADATA VARIANT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS RAW.DOCTOR_BOOKINGS (
                BOOKING_ID STRING PRIMARY KEY,
                USER_ID STRING,
                DOCTOR_ID STRING,
                BOOKED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
                APPOINTMENT_DATE DATE,
                APPOINTMENT_TIME STRING,
                APPOINTMENT_TYPE STRING,
                SPECIALTY STRING,
                TOTAL_COST FLOAT,
                INSURANCE_COVERAGE FLOAT,
                OUT_OF_POCKET FLOAT,
                STATUS STRING,
                METADATA VARIANT
            )
        """)

        # Notification Tracking
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS RAW.NOTIFICATIONS (
                NOTIFICATION_ID STRING PRIMARY KEY,
                USER_ID STRING,
                NOTIFICATION_TYPE STRING,
                TITLE STRING,
                MESSAGE STRING,
                PRIORITY STRING,
                CHANNELS ARRAY,
                STATUS STRING,
                CREATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP(),
                SCHEDULED_TIME TIMESTAMP_LTZ,
                SENT_AT TIMESTAMP_LTZ,
                READ_AT TIMESTAMP_LTZ,
                METADATA VARIANT
            ) CLUSTER BY (CREATED_AT, USER_ID, NOTIFICATION_TYPE)
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS RAW.NOTIFICATION_DELIVERIES (
                DELIVERY_ID STRING PRIMARY KEY,
                NOTIFICATION_ID STRING,
                CHANNEL STRING,
                DELIVERY_STATUS STRING,
                DELIVERED_AT TIMESTAMP_LTZ,
                ERROR_MESSAGE STRING,
                VOICE_NOTIFICATION_ENABLED BOOLEAN,
                METADATA VARIANT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ANALYTICS.NOTIFICATION_METRICS (
                METRIC_DATE DATE PRIMARY KEY,
                TOTAL_NOTIFICATIONS INT,
                SENT_COUNT INT,
                READ_COUNT INT,
                DISMISSED_COUNT INT,
                FAILED_COUNT INT,
                READ_RATE FLOAT,
                VOICE_NOTIFICATIONS_COUNT INT,
                NOTIFICATIONS_BY_TYPE VARIANT,
                AVG_TIME_TO_READ_MINUTES FLOAT,
                UPDATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP()
            ) CLUSTER BY (METRIC_DATE)
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

        # AI vs Human Doctor Analytics
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ANALYTICS.CHOICE_PATTERNS (
                ANALYSIS_DATE DATE PRIMARY KEY,
                TOTAL_CHOICES INT,
                AI_CHOICES INT,
                HUMAN_CHOICES INT,
                AI_PERCENTAGE FLOAT,
                HUMAN_PERCENTAGE FLOAT,
                AVG_AI_COST FLOAT,
                AVG_HUMAN_COST FLOAT,
                TOTAL_COST_SAVINGS FLOAT,
                TOP_SPECIALTIES ARRAY,
                CHOICE_REASONS VARIANT,
                UPDATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP()
            ) CLUSTER BY (ANALYSIS_DATE)
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ANALYTICS.CONSULTATION_OUTCOMES (
                OUTCOME_ID STRING PRIMARY KEY,
                USER_ID STRING,
                CONSULTATION_TYPE STRING,
                SYMPTOM_CATEGORY STRING,
                OUTCOME STRING,
                SATISFACTION_SCORE INT,
                COST_EFFECTIVENESS FLOAT,
                FOLLOW_UP_NEEDED BOOLEAN,
                TIME_TO_RESOLUTION_DAYS INT,
                CREATED_AT TIMESTAMP_LTZ DEFAULT CURRENT_TIMESTAMP()
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

    async def track_consultation_choice(
        self,
        user_id: str,
        symptom_event_id: str,
        choice_type: str,  # "ai_doctor" or "human_doctor"
        consultation_type: str,  # "free", "premium", "in_person", etc.
        tier: Optional[str] = None,
        cost: float = 0,
        reason: Optional[Dict] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Track user choice between AI and Human doctor consultation
        """
        conn = await self._get_connection()
        cursor = conn.cursor()

        try:
            choice_id = f"choice_{datetime.utcnow().timestamp()}"

            cursor.execute("""
                INSERT INTO RAW.CONSULTATION_CHOICES
                (CHOICE_ID, USER_ID, SYMPTOM_EVENT_ID, CHOICE_TYPE, CONSULTATION_TYPE, TIER, COST, REASON, METADATA)
                SELECT %s, %s, %s, %s, %s, %s, %s, PARSE_JSON(%s), PARSE_JSON(%s)
            """, (
                choice_id,
                user_id,
                symptom_event_id,
                choice_type,
                consultation_type,
                tier or consultation_type,
                cost,
                json.dumps(reason or {}),
                json.dumps(metadata or {})
            ))

            conn.commit()
            return {"status": "success", "choice_id": choice_id}

        except Exception as e:
            conn.rollback()
            return {"status": "error", "error": str(e)}

    async def track_ai_consultation(
        self,
        session_id: str,
        user_id: str,
        tier: str,
        message_count: int,
        total_cost: float,
        summary: Optional[Dict] = None,
        satisfaction_rating: Optional[int] = None
    ) -> Dict:
        """
        Track AI doctor consultation session
        """
        conn = await self._get_connection()
        cursor = conn.cursor()

        try:
            consultation_id = f"ai_consult_{datetime.utcnow().timestamp()}"

            cursor.execute("""
                INSERT INTO RAW.AI_CONSULTATIONS
                (CONSULTATION_ID, SESSION_ID, USER_ID, TIER, MESSAGE_COUNT, TOTAL_COST, SUMMARY, SATISFACTION_RATING)
                SELECT %s, %s, %s, %s, %s, %s, PARSE_JSON(%s), %s
            """, (
                consultation_id,
                session_id,
                user_id,
                tier,
                message_count,
                total_cost,
                json.dumps(summary or {}),
                satisfaction_rating
            ))

            conn.commit()
            return {"status": "success", "consultation_id": consultation_id}

        except Exception as e:
            conn.rollback()
            return {"status": "error", "error": str(e)}

    async def track_doctor_booking(
        self,
        booking_id: str,
        user_id: str,
        doctor_id: str,
        appointment_date: str,
        appointment_time: str,
        appointment_type: str,
        specialty: str,
        total_cost: float,
        insurance_coverage: float = 0,
        out_of_pocket: float = 0,
        status: str = "confirmed",
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Track human doctor booking
        """
        conn = await self._get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                INSERT INTO RAW.DOCTOR_BOOKINGS
                (BOOKING_ID, USER_ID, DOCTOR_ID, APPOINTMENT_DATE, APPOINTMENT_TIME, APPOINTMENT_TYPE,
                 SPECIALTY, TOTAL_COST, INSURANCE_COVERAGE, OUT_OF_POCKET, STATUS, METADATA)
                SELECT %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, PARSE_JSON(%s)
            """, (
                booking_id,
                user_id,
                doctor_id,
                appointment_date,
                appointment_time,
                appointment_type,
                specialty,
                total_cost,
                insurance_coverage,
                out_of_pocket,
                status,
                json.dumps(metadata or {})
            ))

            conn.commit()
            return {"status": "success", "booking_id": booking_id}

        except Exception as e:
            conn.rollback()
            return {"status": "error", "error": str(e)}

    async def get_choice_analytics(self, days: int = 30) -> Dict:
        """
        Get analytics on AI vs Human doctor choices
        """
        conn = await self._get_connection()
        cursor = conn.cursor(DictCursor)

        try:
            cursor.execute("""
                SELECT
                    CHOICE_TYPE,
                    COUNT(*) as total_choices,
                    AVG(COST) as avg_cost,
                    SUM(COST) as total_cost,
                    COUNT(DISTINCT USER_ID) as unique_users
                FROM RAW.CONSULTATION_CHOICES
                WHERE TIMESTAMP >= DATEADD(day, -%s, CURRENT_TIMESTAMP())
                GROUP BY CHOICE_TYPE
            """, (days,))

            results = cursor.fetchall()

            analytics = {
                "period_days": days,
                "by_choice_type": {}
            }

            total_choices = sum(r['TOTAL_CHOICES'] for r in results)

            for row in results:
                choice_type = row['CHOICE_TYPE']
                analytics["by_choice_type"][choice_type] = {
                    "total_choices": row['TOTAL_CHOICES'],
                    "percentage": (row['TOTAL_CHOICES'] / total_choices * 100) if total_choices > 0 else 0,
                    "avg_cost": row['AVG_COST'],
                    "total_cost": row['TOTAL_COST'],
                    "unique_users": row['UNIQUE_USERS']
                }

            # Calculate cost savings
            ai_cost = analytics["by_choice_type"].get("ai_doctor", {}).get("total_cost", 0)
            human_cost = analytics["by_choice_type"].get("human_doctor", {}).get("total_cost", 0)
            ai_choices = analytics["by_choice_type"].get("ai_doctor", {}).get("total_choices", 0)

            # If users chose AI instead of human, estimate savings
            avg_human_cost = 200  # average human doctor visit
            estimated_savings = ai_choices * avg_human_cost - ai_cost

            analytics["cost_savings"] = {
                "ai_total_cost": ai_cost,
                "human_total_cost": human_cost,
                "estimated_savings": estimated_savings
            }

            return analytics

        except Exception as e:
            return {"error": str(e)}


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
