import os
import secrets
import hashlib
import base64
import sqlite3
from contextlib import asynccontextmanager
from urllib.parse import urlparse
from typing import Optional
from fastapi import FastAPI, Request, HTTPException, Body
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import httpx
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SESSION_SECRET = os.getenv("SESSION_SECRET")
if not SESSION_SECRET:
    logger.warning(
        "SECURITY & USABILITY WARNING: SESSION_SECRET is not set in the environment. "
        "A random transient secret has been generated. Sessions will NOT survive backend restarts. "
        "Define a stable SESSION_SECRET env var for production to enable restart-proof sessions."
    )
    SESSION_SECRET = secrets.token_urlsafe(32)
SESSION_TTL = timedelta(hours=24)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080/manager.html")
ENVIRONMENT = os.getenv("ENVIRONMENT", "").strip().lower()
REPO_OWNER = os.getenv("GITHUB_REPO_OWNER")
REPO_NAME = os.getenv("GITHUB_REPO_NAME")
DEFAULT_BRANCH = os.getenv("GITHUB_REPO_BRANCH", "main")
ALLOWED_USERS = {u.strip().lower() for u in os.getenv("ALLOWED_USERS", "Ayush-Mgr").split(",") if u.strip()}
VAULT_PREFIX = "vault/"


def is_https_url(url: str) -> bool:
    return url.lower().startswith("https://")


def frontend_origin(url: str) -> str:
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}" if parsed.scheme and parsed.netloc else ""


SESSION_COOKIE_SECURE = ENVIRONMENT == "production" or is_https_url(FRONTEND_URL)
SESSION_COOKIE_SAMESITE = "none" if SESSION_COOKIE_SECURE else "lax"
ALLOW_ORIGINS = [
    origin
    for origin in {
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://ayush-mgr.github.io",
        frontend_origin(FRONTEND_URL),
    }
    if origin
]
DB_PATH = os.getenv("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "sessions.db"))

def utc_now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def get_db_conn():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn

def init_db():
    with get_db_conn() as conn:
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

def create_session(session_id: str, token: str, login: str, avatar_url: str):
    now_str = utc_now_str()
    expires_str = (datetime.now(timezone.utc) + SESSION_TTL).strftime("%Y-%m-%dT%H:%M:%SZ")
    with get_db_conn() as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO sessions (session_id, github_token, user_login, user_avatar_url, created_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (session_id, token, login, avatar_url, now_str, expires_str)
        )
        conn.commit()

def get_session(session_id: str):
    with get_db_conn() as conn:
        cursor = conn.execute(
            "SELECT github_token, user_login, user_avatar_url, created_at, expires_at FROM sessions WHERE session_id = ?",
            (session_id,)
        )
        return cursor.fetchone()

def update_session_expiry(session_id: str):
    expires_str = (datetime.now(timezone.utc) + SESSION_TTL).strftime("%Y-%m-%dT%H:%M:%SZ")
    with get_db_conn() as conn:
        conn.execute(
            "UPDATE sessions SET expires_at = ? WHERE session_id = ?",
            (expires_str, session_id)
        )
        conn.commit()

def delete_session(session_id: str):
    with get_db_conn() as conn:
        conn.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
        conn.commit()

def cleanup_expired_sessions():
    now_str = utc_now_str()
    with get_db_conn() as conn:
        conn.execute("DELETE FROM sessions WHERE expires_at < ?", (now_str,))
        conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    async with httpx.AsyncClient(
        headers={
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Node-Notes-Proxy",
        }
    ) as client:
        app.state.client = client
        yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    https_only=SESSION_COOKIE_SECURE,
    same_site=SESSION_COOKIE_SAMESITE,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.base import BaseHTTPMiddleware
class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/api/vault/save":
            content_length = request.headers.get('content-length')
            if content_length and int(content_length) > 15 * 1024 * 1024: # 15MB
                return JSONResponse(status_code=413, content={"error": "Payload too large"})
        return await call_next(request)

app.add_middleware(MaxBodySizeMiddleware)

CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")


@app.get("/")
async def root():
    return {"status": "Vault Proxy Active", "docs": "/docs"}

def get_pkce_challenge():
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    return verifier, challenge

def is_path_safe(path: str) -> bool:
    if not path or ".." in path or "\\" in path:
        return False
    return path.startswith(VAULT_PREFIX)

def pop_session(request: Request) -> None:
    session_id = request.session.get("session_id")
    if session_id:
        delete_session(session_id)
    request.session.clear()

async def github_proxy(request: Request, method: str, path: str, json_body: Optional[dict] = None):
    cleanup_expired_sessions()
    session_id = request.session.get("session_id")
    token_data = get_session(session_id) if session_id else None

    if not token_data or utc_now_str() > token_data["expires_at"]:
        pop_session(request)
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    update_session_expiry(session_id)

    token = token_data["github_token"]
    url = f"https://api.github.com{path}"
    headers = {
        "Authorization": f"token {token}",
    }
    client = request.app.state.client

    if method == "PUT":
        resp = await client.put(url, headers=headers, json=json_body)
    elif method == "DELETE":
        resp = await client.request("DELETE", url, headers=headers, json=json_body)
    elif method == "GET":
        resp = await client.get(url, headers=headers)
    else:
        resp = await client.request(method, url, headers=headers, json=json_body)

    return JSONResponse(status_code=resp.status_code, content=resp.json())

@app.get("/auth/login")
async def login(request: Request):
    cleanup_expired_sessions()
    state = secrets.token_urlsafe(32)
    verifier, challenge = get_pkce_challenge()

    request.session["oauth_state"] = state
    request.session["pkce_verifier"] = verifier

    return RedirectResponse(
        f"https://github.com/login/oauth/authorize?client_id={CLIENT_ID}"
        f"&scope=repo,user&state={state}&code_challenge={challenge}&code_challenge_method=S256"
    )

@app.get("/auth/callback")
async def callback(request: Request, code: str, state: str):
    cleanup_expired_sessions()
    if state != request.session.get("oauth_state"):
        raise HTTPException(status_code=400, detail="Invalid state")

    verifier = request.session.get("pkce_verifier")
    client = request.app.state.client
    response = await client.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "code": code,
            "code_verifier": verifier,
        },
        headers={"Accept": "application/json"},
    )
    data = response.json()
    token = data.get("access_token")
    if not token:
        return JSONResponse(status_code=400, content={"error": "OAuth failed", "details": data})

    user_resp = await client.get(
        "https://api.github.com/user",
        headers={"Authorization": f"token {token}"},
    )
    
    if user_resp.status_code != 200:
        return JSONResponse(status_code=400, content={"error": "Failed to fetch user profile"})
        
    user_data = user_resp.json()
    github_login = user_data.get("login", "").lower()
    
    if github_login not in ALLOWED_USERS:
        logger.warning(f"SECURITY: Rejected unauthorized login attempt from GitHub user: {github_login}")
        pop_session(request)
        return RedirectResponse(url=f"{FRONTEND_URL}?error=unauthorized")

    session_id = secrets.token_urlsafe(32)
    create_session(
        session_id=session_id,
        token=token,
        login=user_data.get("login"),
        avatar_url=user_data.get("avatar_url")
    )
    request.session["session_id"] = session_id

    return RedirectResponse(url=FRONTEND_URL)

@app.post("/auth/logout")
async def logout(request: Request):
    pop_session(request)
    return {"status": "ok"}

@app.get("/auth/status")
async def auth_status(request: Request):
    cleanup_expired_sessions()
    session_id = request.session.get("session_id")
    token_data = get_session(session_id) if session_id else None

    if not token_data or utc_now_str() > token_data["expires_at"]:
        pop_session(request)
        return {"authenticated": False}

    update_session_expiry(session_id)

    return {
        "authenticated": True,
        "user": {
            "login": token_data["user_login"],
            "avatar_url": token_data["user_avatar_url"]
        }
    }


@app.get("/api/vault/notes")
async def get_notes(request: Request):
    return await github_proxy(
        request,
        "GET",
        f"/repos/{REPO_OWNER}/{REPO_NAME}/git/trees/{DEFAULT_BRANCH}?recursive=1",
    )

@app.get("/api/vault/content/{path:path}")
async def get_content(request: Request, path: str):
    if not is_path_safe(path):
        raise HTTPException(status_code=403, detail="Unsafe path")
    return await github_proxy(request, "GET", f"/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}")

@app.post("/api/vault/save")
async def save_note(request: Request, body: dict = Body(...)):
    path = body.get("path")
    if not is_path_safe(path):
        raise HTTPException(status_code=403, detail="Unsafe path")
    return await github_proxy(request, "PUT", f"/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}", body)

@app.post("/api/vault/delete")
async def delete_note(request: Request, body: dict = Body(...)):
    path = body.get("path")
    if not is_path_safe(path):
        raise HTTPException(status_code=403, detail="Unsafe path")
    return await github_proxy(request, "DELETE", f"/repos/{REPO_OWNER}/{REPO_NAME}/contents/{path}", body)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
