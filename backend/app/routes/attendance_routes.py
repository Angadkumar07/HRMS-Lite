from fastapi import APIRouter, HTTPException, Query
from pymongo.errors import DuplicateKeyError

from app.database import attendance_collection, employees_collection
from app.models.attendance_model import AttendanceDocument
from app.schemas.attendance_schema import AttendanceResponse, MarkAttendanceRequest

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


def _serialize(doc: dict) -> AttendanceResponse:
    return AttendanceResponse(
        employee_id=doc["employee_id"],
        date=doc["date"],
        status=doc["status"],
    )


@router.post("", status_code=201, response_model=dict)
async def mark_attendance(payload: MarkAttendanceRequest):
    employee = await employees_collection.find_one({"employee_id": payload.employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    document = AttendanceDocument(
        employee_id=payload.employee_id,
        date=payload.date,
        status=payload.status,
    )
    try:
        await attendance_collection.insert_one(document.model_dump())
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="Attendance for this employee on the given date already exists",
        )
    return {"success": True, "message": "Attendance marked successfully"}


@router.get("/daily", status_code=200, response_model=dict)
async def get_attendance_by_date(date: str = Query(..., description="Date in YYYY-MM-DD format")):
    cursor = attendance_collection.find({"date": date}, {"_id": 0})
    records = [_serialize(doc).model_dump() async for doc in cursor]
    return {"success": True, "data": records}


@router.get("/{employee_id}", status_code=200, response_model=dict)
async def get_attendance_by_employee(employee_id: str):
    employee = await employees_collection.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    cursor = attendance_collection.find({"employee_id": employee_id}, {"_id": 0})
    records = [_serialize(doc).model_dump() async for doc in cursor]
    return {"success": True, "data": records}
