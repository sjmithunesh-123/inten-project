from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.crop import Crop
from app.models.user import User
from app.schemas.crop import CropRecommendationRequest
from app.services.crop_service import CropService
from app.utils.response import success_response

router = APIRouter(prefix="/crops", tags=["Crops"])


@router.get("")
def list_crops(db: Session = Depends(get_db)):
    crops = db.query(Crop).order_by(Crop.crop_name).all()
    return success_response("Crops retrieved", [
        {
            "id": crop.id,
            "crop_name": crop.crop_name,
            "scientific_name": crop.scientific_name,
            "season": crop.season,
            "soil_type": crop.soil_type,
            "water_requirement": crop.water_requirement,
            "temperature_min": crop.temperature_min,
            "temperature_max": crop.temperature_max,
            "ph_min": crop.ph_min,
            "ph_max": crop.ph_max,
            "rainfall_min": crop.rainfall_min,
            "rainfall_max": crop.rainfall_max,
        }
        for crop in crops
    ])


@router.get("/{crop_id}")
def get_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    return success_response("Crop retrieved", crop)


@router.post("/recommend")
def recommend_crop(
    payload: CropRecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.ml.crop_model import CropRecommendationModel
    model = CropRecommendationModel(model_path="../ml-models/crop")
    model.load_model()
    service = CropService(db, model)
    result = service.recommend(payload, current_user.id)
    return success_response("Crop recommendation generated", result)
