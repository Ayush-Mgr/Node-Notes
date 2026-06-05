import sqlite3
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None
    RealDictCursor = None
from datetime import datetime, timezone, timedelta
from abc import ABC, abstractmethod
import logging

logger = logging.getLogger(__name__)

def utc_now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

class SessionStore(ABC):
    @abstractmethod
    def init_db(self): pass

    @abstractmethod
    def create_session(self, session_id: str, token: str, login: str, avatar_url: str, ttl_hours: int): pass

    @abstractmethod
    def get_session(self, session_id: str): pass

    @abstractmethod
    def update_session_expiry(self, session_id: str, ttl_hours: int): pass

    @abstractmethod
    def delete_session(self, session_id: str): pass

    @abstractmethod
    def cleanup_expired_sessions(self): pass


class SQLiteSessionStore(SessionStore):
    def __init__(self, db_path: str):
        self.db_path = db_path

    def get_db_conn(self):
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        return conn

    def init_db(self):
        with self.get_db_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    github_token TEXT NOT NULL,
                    user_login TEXT,
                    user_avatar_url TEXT,
                    created_at TEXT NOT NULL,
                    expires_at TEXT NOT NULL
                )
            """)
            conn.commit()

    def create_session(self, session_id: str, token: str, login: str, avatar_url: str, ttl_hours: int):
        now_str = utc_now_str()
        expires_str = (datetime.now(timezone.utc) + timedelta(hours=ttl_hours)).strftime("%Y-%m-%dT%H:%M:%SZ")
        with self.get_db_conn() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO sessions (session_id, github_token, user_login, user_avatar_url, created_at, expires_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (session_id, token, login, avatar_url, now_str, expires_str)
            )
            conn.commit()

    def get_session(self, session_id: str):
        with self.get_db_conn() as conn:
            cursor = conn.execute(
                "SELECT github_token, user_login, user_avatar_url, created_at, expires_at FROM sessions WHERE session_id = ?",
                (session_id,)
            )
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None

    def update_session_expiry(self, session_id: str, ttl_hours: int):
        expires_str = (datetime.now(timezone.utc) + timedelta(hours=ttl_hours)).strftime("%Y-%m-%dT%H:%M:%SZ")
        with self.get_db_conn() as conn:
            conn.execute(
                "UPDATE sessions SET expires_at = ? WHERE session_id = ?",
                (expires_str, session_id)
            )
            conn.commit()

    def delete_session(self, session_id: str):
        with self.get_db_conn() as conn:
            conn.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
            conn.commit()

    def cleanup_expired_sessions(self):
        now_str = utc_now_str()
        with self.get_db_conn() as conn:
            conn.execute("DELETE FROM sessions WHERE expires_at < ?", (now_str,))
            conn.commit()


class PostgresSessionStore(SessionStore):
    def __init__(self, db_url: str):
        if psycopg2 is None:
            raise ImportError("psycopg2-binary is required for PostgresSessionStore. Install it via pip.")
        self.db_url = db_url

    def get_db_conn(self):
        return psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)

    def init_db(self):
        with self.get_db_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS sessions (
                        session_id TEXT PRIMARY KEY,
                        github_token TEXT NOT NULL,
                        user_login TEXT,
                        user_avatar_url TEXT,
                        created_at TIMESTAMPTZ NOT NULL,
                        expires_at TIMESTAMPTZ NOT NULL
                    );
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);
                """)
            conn.commit()

    def create_session(self, session_id: str, token: str, login: str, avatar_url: str, ttl_hours: int):
        now = datetime.now(timezone.utc)
        expires = now + timedelta(hours=ttl_hours)
        with self.get_db_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO sessions (session_id, github_token, user_login, user_avatar_url, created_at, expires_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (session_id) DO UPDATE SET
                        github_token = EXCLUDED.github_token,
                        user_login = EXCLUDED.user_login,
                        user_avatar_url = EXCLUDED.user_avatar_url,
                        created_at = EXCLUDED.created_at,
                        expires_at = EXCLUDED.expires_at;
                    """,
                    (session_id, token, login, avatar_url, now, expires)
                )
            conn.commit()

    def get_session(self, session_id: str):
        with self.get_db_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT github_token, user_login, user_avatar_url, created_at, expires_at FROM sessions WHERE session_id = %s",
                    (session_id,)
                )
                row = cursor.fetchone()
                if row:
                    # Convert TIMESTAMPTZ to ISO string for compatibility with callers
                    d = dict(row)
                    d["created_at"] = d["created_at"].strftime("%Y-%m-%dT%H:%M:%SZ")
                    d["expires_at"] = d["expires_at"].strftime("%Y-%m-%dT%H:%M:%SZ")
                    return d
                return None

    def update_session_expiry(self, session_id: str, ttl_hours: int):
        expires = datetime.now(timezone.utc) + timedelta(hours=ttl_hours)
        with self.get_db_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE sessions SET expires_at = %s WHERE session_id = %s",
                    (expires, session_id)
                )
            conn.commit()

    def delete_session(self, session_id: str):
        with self.get_db_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM sessions WHERE session_id = %s", (session_id,))
            conn.commit()

    def cleanup_expired_sessions(self):
        now = datetime.now(timezone.utc)
        with self.get_db_conn() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM sessions WHERE expires_at < %s", (now,))
            conn.commit()
