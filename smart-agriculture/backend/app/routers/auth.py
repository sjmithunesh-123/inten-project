from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenPayload, UserProfileOut
from app.services.auth_service import AuthService
from app.utils.response import success_response

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    # Registration is now handled by Supabase Auth on the frontend.
    # Keep this endpoint as deprecated to avoid accidental usage.
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Registration is handled by Supabase Auth. Use the Supabase client on the frontend to sign up.",
    )


@router.post("/login", response_model=dict)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Login should be performed via Supabase Auth from the frontend.
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Login is handled by Supabase Auth. Use the Supabase client on the frontend to sign in.",
    )


@router.get("/me", response_model=dict)
def get_me(current_user: User = Depends(get_current_user)):
    return success_response("Profile retrieved", UserProfileOut.model_validate(current_user).model_dump())


@router.post("/refresh", response_model=dict)
def refresh_token():
    return success_response("Refresh token endpoint ready", {})


@router.post("/logout", response_model=dict)
def logout():
    return success_response("Logout successful", {})
