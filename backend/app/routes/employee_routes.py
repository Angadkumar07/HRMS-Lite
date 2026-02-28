from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError

from app.database import employees_collection
from app.models.employee_model import EmployeeDocument
from app.schemas.employee_schema import CreateEmployeeRequest, EmployeeResponse

router = APIRouter(prefix="/api/employees", tags=["Employees"])


def _serialize(doc: dict) -> EmployeeResponse:
    return EmployeeResponse(
        employee_id=doc["employee_id"],
        full_name=doc["full_name"],
        email=doc["email"],
        department=doc["department"],
        created_at=doc["created_at"],
    )


@router.post("", status_code=201, response_model=dict)
async def create_employee(payload: CreateEmployeeRequest):
    document = EmployeeDocument(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
    )
    try:
        await employees_collection.insert_one(document.model_dump())
    except DuplicateKeyError as exc:
        field = "employee_id" if "employee_id" in str(exc) else "email"
        raise HTTPException(
            status_code=409,
            detail=f"An employee with this {field} already exists",
        )
    return {"success": True, "message": "Employee created successfully"}


@router.get("", status_code=200, response_model=dict)
async def get_all_employees():
    cursor = employees_collection.find({}, {"_id": 0})
    employees = [_serialize(doc).model_dump() async for doc in cursor]
    if not employees:
        return {"success": True, "data": [], "message": "No employees found"}
    return {"success": True, "data": employees}


@router.delete("/{employee_id}", status_code=200, response_model=dict)
async def delete_employee(employee_id: str):
    result = await employees_collection.delete_one({"employee_id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"success": True, "message": "Employee deleted successfully"}
