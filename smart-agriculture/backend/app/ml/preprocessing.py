from __future__ import annotations

from PIL import Image
import numpy as np


class ImagePreprocessor:
    @staticmethod
    def preprocess_image(image_path: str):
        image = Image.open(image_path).convert("RGB")
        image = image.resize((224, 224))
        arr = np.array(image, dtype=np.float32) / 255.0
        return arr

    @staticmethod
    def preprocess_numeric_payload(payload: dict):
        return {
            "N": float(payload.get("nitrogen", 0)),
            "P": float(payload.get("phosphorus", 0)),
            "K": float(payload.get("potassium", 0)),
            "temperature": float(payload.get("temperature", 0)),
            "humidity": float(payload.get("humidity", 0)),
            "ph": float(payload.get("ph", 0)),
            "rainfall": float(payload.get("rainfall", 0)),
        }
