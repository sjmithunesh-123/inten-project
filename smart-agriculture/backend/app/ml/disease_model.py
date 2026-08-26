from __future__ import annotations

from pathlib import Path
import time
import joblib
import numpy as np
from typing import Any

from app.core.config import get_settings
from app.ml.preprocessing import ImagePreprocessor

settings = get_settings()


def _image_to_features(arr: np.ndarray, n_features: int) -> np.ndarray:
    # Basic engineered features: means, stds, and color histograms per channel
    means = arr.mean(axis=(0, 1))  # 3
    stds = arr.std(axis=(0, 1))  # 3
    # hist: 16 bins per channel
    bins = 16
    hist = []
    for c in range(arr.shape[2]):
        h, _ = np.histogram(arr[:, :, c], bins=bins, range=(0.0, 1.0))
        hist.extend(h.tolist())
    feats = np.concatenate([means, stds, np.array(hist, dtype=float)])
    if feats.size >= n_features:
        return feats[:n_features].reshape(1, -1)
    # pad with zeros
    pad = np.zeros(n_features - feats.size, dtype=float)
    return np.concatenate([feats, pad]).reshape(1, -1)


class DiseaseModel:
    def __init__(self, model_path: str | None = None):
        self.model_path = model_path or settings.disease_model_path
        self.model: Any | None = None
        self.model_file: Path | None = None

    def load_model(self):
        path = Path(self.model_path)
        if not path.exists():
            raise FileNotFoundError(f"Disease model path not found: {self.model_path}")

        # look for common serialized model files (joblib/pkl)
        candidates = list(path.glob('**/*.joblib')) + list(path.glob('**/*.pkl')) + list(path.glob('**/*.model'))
        if not candidates:
            # no serialised model found; still return a lightweight marker so caller
            # can decide whether to treat as available. We keep behavior consistent
            # with previous code and raise here so the app can fall back.
            raise FileNotFoundError(f"No supported model file found in {self.model_path}")

        model_file = candidates[0]
        loaded = joblib.load(model_file)
        self.model = loaded
        self.model_file = model_file
        return {"status": "loaded", "path": str(model_file)}

    def predict(self, image_path: str) -> dict:
        if self.model is None:
            raise RuntimeError("Disease model is not loaded")

        start = time.time()
        arr = ImagePreprocessor.preprocess_image(image_path)

        # prepare feature vector according to model expectations
        model = self.model
        X = None
        try:
            if hasattr(model, 'n_features_in_'):
                n_features = int(getattr(model, 'n_features_in_'))
                if arr.size == n_features:
                    X = arr.ravel().reshape(1, -1)
                else:
                    X = _image_to_features(arr, n_features)
            else:
                # default: try flattened image, else mean per channel
                try:
                    X = arr.ravel().reshape(1, -1)
                except Exception:
                    X = arr.mean(axis=(0, 1)).reshape(1, -1)

            pred = model.predict(X)
            label = pred[0] if hasattr(pred, '__iter__') else str(pred)

            confidence = 0.0
            if hasattr(model, 'predict_proba'):
                probs = model.predict_proba(X)
                confidence = float(probs.max())
            elif hasattr(model, 'decision_function'):
                try:
                    scores = model.decision_function(X)
                    # convert to a 0-1 confidence proxy
                    confidence = float(np.max(1.0 / (1.0 + np.exp(-scores))))
                except Exception:
                    confidence = 0.0

            status = 'diseased' if str(label).lower() not in ('healthy', 'normal', 'none') else 'healthy'

            return {
                'plant': None,
                'disease': str(label),
                'confidence': round(float(confidence) * 100.0, 2),
                'status': status,
                'processing_time_ms': int((time.time() - start) * 1000),
                'preprocessed_shape': list(arr.shape),
            }
        except Exception as exc:
            raise RuntimeError(f"Model inference failed: {exc}") from exc
