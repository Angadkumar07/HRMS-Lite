import motor.motor_asyncio
from app.core.config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

employees_collection = db["employees"]
attendance_collection = db["attendance"]


async def create_indexes():
    await employees_collection.create_index("employee_id", unique=True)
    await employees_collection.create_index("email", unique=True)
    await attendance_collection.create_index(
        [("employee_id", 1), ("date", 1)], unique=True
    )
