from pydantic import BaseModel, ConfigDict


class UserCreate(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    password: str
    role: str = "farmer"
    location: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    location: str | None = None
    is_active: bool | None = None
    role: str | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone: str | None = None
    role: str
    location: str | None = None
    profile_image: str | None = None
    is_active: bool
