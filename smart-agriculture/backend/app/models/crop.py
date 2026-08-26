from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    crop_name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    scientific_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    season: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    soil_type: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    water_requirement: Mapped[str | None] = mapped_column(String(100), nullable=True)
    temperature_min: Mapped[float | None] = mapped_column(nullable=True)
    temperature_max: Mapped[float | None] = mapped_column(nullable=True)
    ph_min: Mapped[float | None] = mapped_column(nullable=True)
    ph_max: Mapped[float | None] = mapped_column(nullable=True)
    rainfall_min: Mapped[float | None] = mapped_column(nullable=True)
    rainfall_max: Mapped[float | None] = mapped_column(nullable=True)
    growing_period_days: Mapped[int | None] = mapped_column(nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    recommendations: Mapped[list["CropRecommendation"]] = relationship(back_populates="crop")
