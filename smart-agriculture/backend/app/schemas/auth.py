from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    password: str
    role: str = "farmer"
    location: str | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 6:
            raise ValueError("Password must be at least 6 characters long")
        # bcrypt has a 72-byte input limit; reject too-long passwords with a clear validation error
        try:
            if len(value.encode('utf-8')) > 72:
                raise ValueError("Password must be at most 72 bytes when encoded (choose a shorter password)")
        except Exception:
            # if encoding fails for some reason, still allow the value to be validated by hashing later
            pass
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenPayload(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"


class UserProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    phone: str | None = None
    role: str
    location: str | None = None
    profile_image: str | None = None
    is_active: bool
