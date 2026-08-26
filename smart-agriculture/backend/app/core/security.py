from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

import bcrypt as _bcrypt

from app.core.config import get_settings

settings = get_settings()
# Use a simple PBKDF2 hasher for new passwords to avoid passlib bcrypt backend issues.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # If stored hash appears to be bcrypt ($2*), verify with bcrypt directly to avoid passlib bcrypt import issues
    try:
        if isinstance(hashed_password, str) and hashed_password.startswith("$2"):
            return _bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        pass

    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    if not isinstance(password, str):
        password = str(password)
    return pwd_context.hash(password)


def create_access_token(subject: str, role: str, expires_delta: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_delta or settings.access_token_expire_minutes
    )
    to_encode = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(subject: str, role: str, expires_delta: int | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=expires_delta or settings.refresh_token_expire_days
    )
    to_encode = {"sub": subject, "role": role, "type": "refresh", "exp": expire}
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str):
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
