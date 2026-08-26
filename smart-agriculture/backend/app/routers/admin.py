from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.crop import Crop
from app.models.disease import Disease
from app.models.plant import Plant
from app.models.user import User
from app.schemas.crop import CropCreate, CropUpdate
from app.schemas.disease import DiseaseCreate, DiseaseUpdate
from app.schemas.plant import PlantCreate, PlantUpdate
from app.schemas.user import UserUpdate
from app.utils.response import success_response

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
def list_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return success_response("Users retrieved", users)


@router.put("/users/{user_id}")
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(user, field, value)
    db.commit()
    return success_response("User updated", user)


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return success_response("User deleted", {})


@router.get("/plants")
def list_plants(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return success_response("Plants retrieved", db.query(Plant).order_by(Plant.plant_name).all())


@router.post("/plants")
def create_plant(payload: PlantCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    plant = Plant(**payload.model_dump())
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return success_response("Plant created", plant)


@router.put("/plants/{plant_id}")
def update_plant(plant_id: int, payload: PlantUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(plant, field, value)
    db.commit()
    return success_response("Plant updated", plant)


@router.delete("/plants/{plant_id}")
def delete_plant(plant_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    plant = db.query(Plant).filter(Plant.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plant not found")
    db.delete(plant)
    db.commit()
    return success_response("Plant deleted", {})


@router.get("/diseases")
def list_diseases(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return success_response("Diseases retrieved", db.query(Disease).order_by(Disease.disease_name).all())


@router.post("/diseases")
def create_disease(payload: DiseaseCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    disease = Disease(**payload.model_dump())
    db.add(disease)
    db.commit()
    db.refresh(disease)
    return success_response("Disease created", disease)


@router.put("/diseases/{disease_id}")
def update_disease(disease_id: int, payload: DiseaseUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disease not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(disease, field, value)
    db.commit()
    return success_response("Disease updated", disease)


@router.delete("/diseases/{disease_id}")
def delete_disease(disease_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disease not found")
    db.delete(disease)
    db.commit()
    return success_response("Disease deleted", {})


@router.get("/crops")
def list_crops(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    return success_response("Crops retrieved", db.query(Crop).order_by(Crop.crop_name).all())


@router.post("/crops")
def create_crop(payload: CropCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    crop = Crop(**payload.model_dump())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return success_response("Crop created", crop)


@router.put("/crops/{crop_id}")
def update_crop(crop_id: int, payload: CropUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(crop, field, value)
    db.commit()
    return success_response("Crop updated", crop)


@router.delete("/crops/{crop_id}")
def delete_crop(crop_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")
    db.delete(crop)
    db.commit()
    return success_response("Crop deleted", {})
