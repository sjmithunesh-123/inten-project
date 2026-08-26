from __future__ import annotations

from pathlib import Path
import joblib
import numpy as np
import time
from typing import Any

from app.core.config import get_settings
from app.ml.preprocessing import ImagePreprocessor

settings = get_settings()


class CropRecommendationModel:
    def __init__(self, model_path: str | None = None):
        self.model_path = model_path or settings.crop_model_path
        self.model: Any | None = None
        self.model_file: Path | None = None

    def load_model(self):
        path = Path(self.model_path)
        if not path.exists():
            raise FileNotFoundError(f"Crop model path not found: {self.model_path}")

        candidates = list(path.glob('**/*.joblib')) + list(path.glob('**/*.pkl')) + list(path.glob('**/*.model'))
        if not candidates:
            raise FileNotFoundError(f"No supported model file found in {self.model_path}")

        model_file = candidates[0]
        loaded = joblib.load(model_file)
        self.model = loaded
        self.model_file = model_file
        return {"status": "loaded", "path": str(model_file)}

    def predict(self, payload: dict) -> dict:
        if self.model is None:
            raise RuntimeError("Crop model is not loaded")

        start = time.time()
        prepared = ImagePreprocessor.preprocess_numeric_payload(payload)
        # Feature vector order: N,P,K,temperature,humidity,ph,rainfall
        order = [
            prepared.get('N', 0.0),
            prepared.get('P', 0.0),
            prepared.get('K', 0.0),
            prepared.get('temperature', 0.0),
            prepared.get('humidity', 0.0),
            prepared.get('ph', 0.0),
            prepared.get('rainfall', 0.0),
        ]
        X = np.array(order, dtype=float).reshape(1, -1)

        model = self.model
        try:
            pred = model.predict(X)
            label = pred[0] if hasattr(pred, '__iter__') else str(pred)

            confidence = 0.0
            if hasattr(model, 'predict_proba'):
                probs = model.predict_proba(X)
                confidence = float(probs.max())

            return {
                'crop': str(label),
                'confidence': round(float(confidence) * 100.0, 2),
                'prepared': prepared,
                'processing_time_ms': int((time.time() - start) * 1000),
            }
        except Exception as exc:
            raise RuntimeError(f"Crop model inference failed: {exc}") from exc
