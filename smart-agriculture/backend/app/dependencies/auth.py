from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.lib.supabase_client import supabase
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    if supabase is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.",
        )

    token = credentials.credentials

    # Validate token with Supabase (uses service role key on server)
    try:
        res = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_data = None
    # supabase-py returns object with 'data' key
    if isinstance(res, dict) and res.get("data"):
        user_data = res["data"].get("user") if isinstance(res["data"], dict) else res["data"]
    elif hasattr(res, "data") and res.data:
        user_data = res.data.get("user") if isinstance(res.data, dict) else res.data

    if not user_data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    email = user_data.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing email")

    # Map Supabase user to local User model by email. Create profile if it doesn't exist.
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # create a lightweight user profile (no password required)
        user = User(
            full_name=user_data.get("user_metadata", {}).get("full_name") or "",
            email=email,
            phone=user_data.get("user_metadata", {}).get("phone"),
            password_hash="",
            role="farmer",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is inactive")

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
