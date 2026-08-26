from pydantic import BaseModel, ConfigDict


class PlantBase(BaseModel):
    plant_name: str
    scientific_name: str | None = None
    category: str | None = None
    description: str | None = None
    image_url: str | None = None


class PlantCreate(PlantBase):
    pass


class PlantUpdate(PlantBase):
    pass


class PlantOut(PlantBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
