from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.disease_service import DiseaseService
from app.utils.response import success_response

router = APIRouter(prefix="/disease", tags=["Disease Detection"])


@router.post("/predict")
def predict_disease(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not getattr(current_user, "id", None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    from app.ml.disease_model import DiseaseModel
    model = DiseaseModel(model_path="../ml-models/disease")
    model.load_model()
    service = DiseaseService(db, model)
    result = service.predict(file, current_user.id)
    return success_response("Disease prediction completed", result)


@router.get("/plants")
def list_plants(db: Session = Depends(get_db)):
    from app.models.plant import Plant
    plants = db.query(Plant).order_by(Plant.plant_name).all()
    return success_response("Plants retrieved", [
        {
            "id": plant.id,
            "plant_name": plant.plant_name,
            "scientific_name": plant.scientific_name,
            "category": plant.category,
            "description": plant.description,
        }
        for plant in plants
    ])


@router.get("/diseases")
def list_diseases(db: Session = Depends(get_db), plant_id: int | None = None):
    from app.models.disease import Disease
    query = db.query(Disease)
    if plant_id is not None:
        query = query.filter(Disease.plant_id == plant_id)
    diseases = query.order_by(Disease.disease_name).all()
    return success_response("Diseases retrieved", [
        {
            "id": d.id,
            "plant_id": d.plant_id,
            "disease_name": d.disease_name,
            "severity": d.severity,
            "symptoms": d.symptoms,
            "prevention": d.prevention,
            "treatment": d.treatment,
        }
        for d in diseases
    ])
