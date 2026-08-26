from pydantic import BaseModel, ConfigDict


class CropBase(BaseModel):
    crop_name: str
    scientific_name: str | None = None
    description: str | None = None
    season: str | None = None
    soil_type: str | None = None
    water_requirement: str | None = None
    temperature_min: float | None = None
    temperature_max: float | None = None
    ph_min: float | None = None
    ph_max: float | None = None
    rainfall_min: float | None = None
    rainfall_max: float | None = None
    growing_period_days: int | None = None
    image_url: str | None = None


class CropCreate(CropBase):
    pass


class CropUpdate(CropBase):
    pass


class CropOut(CropBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class CropRecommendationRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
