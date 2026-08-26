import os
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings

settings = get_settings()
allowed_exts = {ext.strip().lower() for ext in settings.allowed_extensions.split(',') if ext.strip()}


def validate_image_upload(file: UploadFile) -> None:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file selected")

    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Allowed: JPG, JPEG, PNG, WEBP",
        )

    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Invalid MIME type")

    if file.size and file.size > settings.max_upload_size:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds maximum allowed size")


def safe_upload_path(filename: str) -> str:
    root_dir = Path(settings.upload_dir)
    root_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(filename).name
    if safe_name in {"", ".", ".."}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid filename")
    return str(root_dir / safe_name)


def ensure_model_path(path_value: str, label: str) -> str:
    full_path = Path(path_value)
    if not full_path.exists():
        raise FileNotFoundError(f"{label} model not found at: {path_value}")
    return str(full_path)
