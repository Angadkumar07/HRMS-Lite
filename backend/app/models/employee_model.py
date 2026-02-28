from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr, Field


class EmployeeDocument(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
