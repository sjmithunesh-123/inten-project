from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.crop_recommendation import CropRecommendation
from app.models.crop import Crop
from app.models.disease_prediction import DiseasePrediction
from app.models.user import User


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_summary(self):
        total_users = self.db.query(User).count()
        active_users = self.db.query(User).filter(User.is_active.is_(True)).count()
        total_disease_predictions = self.db.query(DiseasePrediction).count()
        total_crop_recommendations = self.db.query(CropRecommendation).count()
        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_predictions": total_disease_predictions + total_crop_recommendations,
            "disease_predictions": total_disease_predictions,
            "crop_recommendations": total_crop_recommendations,
        }

    def get_analytics(self):
        disease_distribution = self.db.query(DiseasePrediction.predicted_class, func.count(DiseasePrediction.id)).group_by(DiseasePrediction.predicted_class).all()
        crop_distribution = self.db.query(CropRecommendation.recommended_crop_id, func.count(CropRecommendation.id)).group_by(CropRecommendation.recommended_crop_id).all()
        monthly = self.db.query(func.date_format(DiseasePrediction.created_at, '%Y-%m'), func.count(DiseasePrediction.id)).group_by(func.date_format(DiseasePrediction.created_at, '%Y-%m')).all()
        return {
            "disease_distribution": [{"label": row[0], "value": row[1]} for row in disease_distribution],
            "crop_distribution": [{"label": self.db.query(Crop.crop_name).filter(Crop.id == row[0]).scalar() or "Unknown", "value": row[1]} for row in crop_distribution],
            "monthly_predictions": [{"month": row[0], "count": row[1]} for row in monthly],
        }
