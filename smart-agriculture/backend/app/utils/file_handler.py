from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import get_settings

settings = get_settings()


def generate_secure_filename(original_name: str) -> str:
    ext = Path(original_name).suffix.lower()
    unique = uuid.uuid4().hex
    return f"{unique}{ext}"


def save_uploaded_file(file: UploadFile) -> str:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = generate_secure_filename(file.filename or "upload.bin")
    destination = upload_dir / filename
    with destination.open("wb") as buffer:
        while chunk := file.file.read(8192):
            buffer.write(chunk)
    return str(destination)
