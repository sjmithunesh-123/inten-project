from __future__ import annotations

from pathlib import Path

from app.core.config import get_settings
from app.ml.crop_model import CropRecommendationModel
from app.ml.disease_model import DiseaseModel

settings = get_settings()


def load_ml_models():
    disease_model = DiseaseModel(model_path=settings.disease_model_path)
    crop_model = CropRecommendationModel(model_path=settings.crop_model_path)
    disease_model.load_model()
    crop_model.load_model()
    return {"disease_model": disease_model, "crop_model": crop_model}
