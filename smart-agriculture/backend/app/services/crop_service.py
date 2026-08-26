from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.crop import Crop
from app.models.crop_recommendation import CropRecommendation
from app.ml.crop_model import CropRecommendationModel
from app.schemas.crop import CropRecommendationRequest


class CropService:
    def __init__(self, db: Session, model: CropRecommendationModel):
        self.db = db
        self.model = model

    def recommend(self, data: CropRecommendationRequest, user_id: int) -> dict:
        result = self.model.predict(data.model_dump())
        crop_name = result.get("crop")
        crop = self.db.query(Crop).filter(Crop.crop_name.ilike(crop_name)).first() if crop_name else None

        recommendation = CropRecommendation(
            user_id=user_id,
            nitrogen=data.nitrogen,
            phosphorus=data.phosphorus,
            potassium=data.potassium,
            temperature=data.temperature,
            humidity=data.humidity,
            ph=data.ph,
            rainfall=data.rainfall,
            recommended_crop_id=crop.id if crop else 1,
            confidence_score=float(result.get("confidence", 0.0)),
        )
        self.db.add(recommendation)
        self.db.commit()
        self.db.refresh(recommendation)

        if crop is None:
            crop = self.db.query(Crop).filter(Crop.id == recommendation.recommended_crop_id).first()

        return {
            "recommendation_id": recommendation.id,
            "recommended_crop": crop.crop_name if crop else (crop_name or "Unknown"),
            "confidence": float(recommendation.confidence_score),
            "description": crop.description if crop else "Crop information unavailable.",
            "season": crop.season if crop else None,
            "soil_type": crop.soil_type if crop else None,
            "water_requirement": crop.water_requirement if crop else None,
        }

    def get_crops(self):
        return self.db.query(Crop).order_by(Crop.crop_name).all()

    def get_crop(self, crop_id: int):
        return self.db.query(Crop).filter(Crop.id == crop_id).first()
