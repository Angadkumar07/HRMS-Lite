from pydantic import BaseModel, field_validator
from app.models.attendance_model import AttendanceStatus
import re


class MarkAttendanceRequest(BaseModel):
    employee_id: str
    date: str
    status: AttendanceStatus

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, value: str) -> str:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            raise ValueError("date must be in YYYY-MM-DD format")
        return value


class AttendanceResponse(BaseModel):
    employee_id: str
    date: str
    status: AttendanceStatus
