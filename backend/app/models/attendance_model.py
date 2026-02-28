from enum import Enum
from pydantic import BaseModel


class AttendanceStatus(str, Enum):
    present = "Present"
    absent = "Absent"


class AttendanceDocument(BaseModel):
    employee_id: str
    date: str
    status: AttendanceStatus
