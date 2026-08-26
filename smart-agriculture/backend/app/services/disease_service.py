from __future__ import annotations

from datetime import datetime
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.disease import Disease
from app.models.disease_prediction import DiseasePrediction
from app.models.plant import Plant
from app.ml.disease_model import DiseaseModel
from app.utils.file_handler import save_uploaded_file
from app.utils.validators import validate_image_upload

settings = get_settings()


class DiseaseService:
    def __init__(self, db: Session, model: DiseaseModel):
        self.db = db
        self.model = model

    def predict(self, file: UploadFile, user_id: int) -> dict:
        validate_image_upload(file)
        saved_path = save_uploaded_file(file)

        try:
            result = self.model.predict(saved_path)
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"ML prediction failed: {str(exc)}") from exc

        plant_name = result.get("plant")
        disease_name = result.get("disease")
        confidence = float(result.get("confidence", 0.0))
        status = result.get("status", "unknown")
        plant = self.db.query(Plant).filter(Plant.plant_name.ilike(plant_name)).first() if plant_name else None
        disease = None
        if plant:
            disease = self.db.query(Disease).filter(Disease.plant_id == plant.id, Disease.disease_name.ilike(disease_name)).first() if disease_name else None

        prediction = DiseasePrediction(
            user_id=user_id,
            plant_id=plant.id if plant else 1,
            disease_id=disease.id if disease else None,
            image_path=saved_path,
            predicted_class=disease_name or "unknown",
            confidence_score=confidence,
            prediction_status=status,
            processing_time_ms=result.get("processing_time_ms", 0),
        )
        self.db.add(prediction)
        self.db.commit()
        self.db.refresh(prediction)

        return {
            "prediction_id": prediction.id,
            "plant": plant.plant_name if plant else (plant_name or "Unknown"),
            "disease": disease.disease_name if disease else (disease_name or "Unknown"),
            "confidence": float(prediction.confidence_score),
            "status": prediction.prediction_status,
            "severity": disease.severity if disease and disease.severity else "medium",
            "symptoms": disease.symptoms if disease else "Symptoms info unavailable.",
            "prevention": disease.prevention if disease else "Prevention info unavailable.",
            "treatment": disease.treatment if disease else "Treatment info unavailable.",
        }

    def get_plants(self):
        return self.db.query(Plant).order_by(Plant.plant_name).all()

    def get_diseases(self, plant_id: int | None = None):
        query = self.db.query(Disease)
        if plant_id is not None:
            query = query.filter(Disease.plant_id == plant_id)
        return query.order_by(Disease.disease_name).all()
