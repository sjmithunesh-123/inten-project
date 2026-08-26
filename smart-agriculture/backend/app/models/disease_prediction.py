from __future__ import annotations

from datetime import datetime

from sqlalchemy import DECIMAL, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    plant_id: Mapped[int] = mapped_column(ForeignKey("plants.id"), nullable=False, index=True)
    disease_id: Mapped[int | None] = mapped_column(ForeignKey("diseases.id"), nullable=True, index=True)
    image_path: Mapped[str] = mapped_column(String(500), nullable=False)
    predicted_class: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    confidence_score: Mapped[float] = mapped_column(DECIMAL(5, 2), nullable=False, default=0.0, index=True)
    prediction_status: Mapped[str] = mapped_column(Enum("healthy", "diseased", "unknown", name="prediction_status"), default="unknown", nullable=False, index=True)
    processing_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user: Mapped["User"] = relationship(back_populates="disease_predictions")
    plant: Mapped["Plant"] = relationship(back_populates="disease_predictions")
    disease: Mapped["Disease"] = relationship(back_populates="predictions")
