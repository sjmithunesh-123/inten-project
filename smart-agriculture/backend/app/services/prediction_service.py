from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.crop_recommendation import CropRecommendation
from app.models.disease_prediction import DiseasePrediction


class PredictionService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_predictions(self, user_id: int, page: int, limit: int, search: str | None = None):
        query = self.db.query(DiseasePrediction).filter(DiseasePrediction.user_id == user_id)
        if search:
            query = query.filter(DiseasePrediction.predicted_class.ilike(f"%{search}%"))
        total = query.count()
        items = query.order_by(DiseasePrediction.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
        return {"items": items, "total": total, "page": page, "limit": limit}

    def get_user_recommendations(self, user_id: int):
        return self.db.query(CropRecommendation).filter(CropRecommendation.user_id == user_id).order_by(CropRecommendation.created_at.desc()).all()

    def get_dashboard_summary(self, user_id: int):
        disease_count = self.db.query(DiseasePrediction).filter(DiseasePrediction.user_id == user_id).count()
        crop_count = self.db.query(CropRecommendation).filter(CropRecommendation.user_id == user_id).count()
        last_prediction = self.db.query(DiseasePrediction).filter(DiseasePrediction.user_id == user_id).order_by(DiseasePrediction.created_at.desc()).first()
        last_recommendation = self.db.query(CropRecommendation).filter(CropRecommendation.user_id == user_id).order_by(CropRecommendation.created_at.desc()).first()
        return {
            "total_predictions": disease_count + crop_count,
            "disease_detections": disease_count,
            "crop_recommendations": crop_count,
            "latest_prediction": last_prediction,
            "latest_recommendation": last_recommendation,
        }
