from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.disease_prediction import DiseasePrediction
    from app.models.crop_recommendation import CropRecommendation


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    # password_hash is nullable because authentication is managed by Supabase Auth
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True, default="")
    role: Mapped[str] = mapped_column(Enum("farmer", "admin", name="user_role"), default="farmer", nullable=False, index=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    profile_image: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    disease_predictions: Mapped[list["DiseasePrediction"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    crop_recommendations: Mapped[list["CropRecommendation"]] = relationship(back_populates="user", cascade="all, delete-orphan")
