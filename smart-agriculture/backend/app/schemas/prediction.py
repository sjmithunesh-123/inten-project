from pydantic import BaseModel, ConfigDict


class DiseasePredictionSubmit(BaseModel):
    plant_id: int | None = None
    disease_id: int | None = None


class PredictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    plant_id: int
    disease_id: int | None = None
    image_path: str | None = None
    predicted_class: str | None = None
    confidence_score: float | None = None
    prediction_status: str | None = None
    processing_time_ms: int | None = None
    created_at: str | None = None


class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    recommended_crop_id: int
    confidence_score: float | None = None
    created_at: str | None = None
