from datetime import datetime
from pydantic import BaseModel, EmailStr


class CreateEmployeeRequest(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str


class EmployeeResponse(BaseModel):
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime
