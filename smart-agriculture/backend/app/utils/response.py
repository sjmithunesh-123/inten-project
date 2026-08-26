from typing import Any


def success_response(message: str, data: Any = None):
    return {"success": True, "message": message, "data": data}


def error_response(message: str, error_code: str = "ERROR", status_code: int = 400):
    return {"success": False, "message": message, "error_code": error_code}, status_code
