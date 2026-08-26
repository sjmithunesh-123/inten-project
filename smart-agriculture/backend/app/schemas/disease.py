from pydantic import BaseModel, ConfigDict


class DiseaseBase(BaseModel):
    plant_id: int
    disease_name: str
    description: str | None = None
    symptoms: str | None = None
    prevention: str | None = None
    treatment: str | None = None
    severity: str | None = None
    image_url: str | None = None


class DiseaseCreate(DiseaseBase):
    pass


class DiseaseUpdate(DiseaseBase):
    pass


class DiseaseOut(DiseaseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
