from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.dashboard_service import DashboardService
from app.utils.response import success_response

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = DashboardService(db)
    result = service.get_summary()
    return success_response("Dashboard summary retrieved", result)


@router.get("/analytics")
def analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = DashboardService(db)
    return success_response("Analytics retrieved", service.get_analytics())
