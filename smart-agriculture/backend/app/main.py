from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import get_settings
from app.core.database import Base, engine
from app.models.crop import Crop
from app.models.crop_recommendation import CropRecommendation
from app.models.disease import Disease
from app.models.disease_prediction import DiseasePrediction
from app.models.plant import Plant
from app.models.user import User
from app.ml.model_loader import load_ml_models
from app.routers import admin, auth, crops, dashboard, disease, predictions, users

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    try:
        with engine.begin() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        pass

    try:
        loaded = load_ml_models()
        app.state.disease_model = loaded["disease_model"]
        app.state.crop_model = loaded["crop_model"]
    except Exception as exc:
        app.state.disease_model = None
        app.state.crop_model = None

    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Smart Agriculture System for plant disease detection and crop recommendation",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(disease.router, prefix="/api/v1")
app.include_router(crops.router, prefix="/api/v1")
app.include_router(predictions.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.app_name}
