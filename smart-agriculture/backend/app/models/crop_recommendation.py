from __future__ import annotations

from datetime import datetime

from sqlalchemy import DECIMAL, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    nitrogen: Mapped[float] = mapped_column(DECIMAL(8, 2), nullable=False)
    phosphorus: Mapped[float] = mapped_column(DECIMAL(8, 2), nullable=False)
    potassium: Mapped[float] = mapped_column(DECIMAL(8, 2), nullable=False)
    temperature: Mapped[float] = mapped_column(DECIMAL(5, 2), nullable=False)
    humidity: Mapped[float] = mapped_column(DECIMAL(5, 2), nullable=False)
    ph: Mapped[float] = mapped_column(DECIMAL(4, 2), nullable=False)
    rainfall: Mapped[float] = mapped_column(DECIMAL(8, 2), nullable=False)
    recommended_crop_id: Mapped[int] = mapped_column(ForeignKey("crops.id"), nullable=False, index=True)
    confidence_score: Mapped[float] = mapped_column(DECIMAL(5, 2), nullable=False, default=0.0, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user: Mapped["User"] = relationship(back_populates="crop_recommendations")
    crop: Mapped["Crop"] = relationship(back_populates="recommendations")
