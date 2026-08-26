from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.prediction_service import PredictionService
from app.utils.response import success_response

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.get("")
def list_predictions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PredictionService(db)
    if current_user.role == "farmer":
        data = service.get_user_predictions(current_user.id, page, limit, search)
    else:
        data = {"items": [], "total": 0, "page": page, "limit": limit}
    return success_response("Predictions retrieved", data)


@router.get("/{prediction_id}")
def get_prediction(prediction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.disease_prediction import DiseasePrediction
    item = db.query(DiseasePrediction).filter(DiseasePrediction.id == prediction_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    if current_user.role == "farmer" and item.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot access another user's prediction history")
    return success_response("Prediction retrieved", item)
