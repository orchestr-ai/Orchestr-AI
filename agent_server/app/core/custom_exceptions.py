from enum import Enum

from fastapi import HTTPException


class CustomHTTPException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str):
        super().__init__(status_code, detail=detail)
        self.error_code = error_code


class CustomException(Exception):
    def __init__(self, status_code: int, message: str, error_code: str):
        super().__init__(message)
        self.error_code = error_code
        self.status_code = status_code
