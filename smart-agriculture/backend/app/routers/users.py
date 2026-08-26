from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate
from app.utils.response import success_response

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
def get_user_me(current_user: User = Depends(get_current_user)):
    return success_response("Profile retrieved", current_user)


@router.put("/me")
def update_user_me(payload: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return success_response("Profile updated", current_user)
