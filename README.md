# HRMS Lite

A lightweight **Human Resource Management System** built for a single admin to manage employees and track daily attendance — no authentication required.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Running Locally](#running-locally)
  - [Backend](#backend-setup)
  - [Frontend](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Assumptions & Limitations](#assumptions--limitations)

---

## Project Overview

HRMS Lite provides two core modules:

| Module                  | Features                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Employee Management** | Add, list, and delete employees                                                                                |
| **Attendance Tracking** | Mark attendance (Present / Absent) per employee per day; view full daily summary for all employees on any date |

The system enforces:

- Unique `employee_id` and `email` per employee
- One attendance record per employee per day (duplicate prevention via compound index)
- Strict status values — only `Present` or `Absent` are accepted

---

## Tech Stack

### Backend

| Layer        | Technology                   |
| ------------ | ---------------------------- |
| Language     | Python 3.11+                 |
| Framework    | FastAPI                      |
| Database     | MongoDB (NoSQL)              |
| Async Driver | Motor (async MongoDB driver) |
| Validation   | Pydantic v2                  |
| Server       | Uvicorn                      |
| Config       | pydantic-settings + `.env`   |

### Frontend

| Layer       | Technology           |
| ----------- | -------------------- |
| Framework   | React 18 (Vite)      |
| UI Library  | Material UI (MUI v5) |
| Routing     | React Router DOM v6  |
| HTTP Client | Axios                |
| Font        | Inter (Google Fonts) |

---

## Project Structure

```
assessment/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── database.py              # Motor client + index creation
│   │   ├── core/
│   │   │   ├── config.py            # Environment settings (pydantic-settings)
│   │   │   └── exceptions.py        # Global exception handlers
│   │   ├── models/
│   │   │   ├── employee_model.py    # Employee MongoDB document model
│   │   │   └── attendance_model.py  # Attendance document model + status enum
│   │   ├── schemas/
│   │   │   ├── employee_schema.py   # Request / response schemas
│   │   │   └── attendance_schema.py # Request / response schemas + date validator
│   │   └── routes/
│   │       ├── employee_routes.py   # POST / GET / DELETE /api/employees
│   │       └── attendance_routes.py # POST /api/attendance, GET /api/attendance/daily, GET /api/attendance/{id}
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── index.html
    ├── .env
    └── src/
        ├── main.jsx                 # MUI ThemeProvider + BrowserRouter
        ├── App.jsx                  # Route definitions
        ├── services/
        │   └── api.js               # Axios instance
        ├── layouts/
        │   └── MainLayout.jsx       # Sticky navbar + footer
        ├── components/
        │   ├── Loader.jsx
        │   ├── EmptyState.jsx
        │   ├── ErrorAlert.jsx
        │   ├── PageContainer.jsx
        │   └── ConfirmDialog.jsx
        └── pages/
            ├── EmployeesPage.jsx
            └── AttendancePage.jsx
```

---

## Prerequisites

- **Python** 3.11 or higher
- **Node.js** 18 or higher with npm
- **MongoDB** — either:
  - Running locally (`mongod`)
  - Or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

---

## Running Locally

### Backend Setup

```bash
# 1. Navigate to the backend folder
cd assessment/backend

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create the .env file (see Environment Variables section below)
# Edit .env with your MongoDB connection details

# 5. Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend is available at: **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

---

### Frontend Setup

```bash
# 1. Navigate to the frontend folder
cd assessment/frontend

# 2. Install dependencies
npm install

# 3. Ensure .env is present (see Environment Variables section below)

# 4. Start the development server
npm run dev
```

Frontend is available at: **http://localhost:5173**

> Make sure the backend is running before starting the frontend.

---

## Environment Variables

### Backend — `backend/.env`

```env
# Local MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=hrms_lite

# MongoDB Atlas example
# MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
# DATABASE_NAME=hrms_lite
```

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## API Reference

### Employee Endpoints

| Method   | Endpoint                       | Description        | Success | Error    |
| -------- | ------------------------------ | ------------------ | ------- | -------- |
| `POST`   | `/api/employees`               | Add a new employee | 201     | 400, 409 |
| `GET`    | `/api/employees`               | List all employees | 200     | —        |
| `DELETE` | `/api/employees/{employee_id}` | Delete an employee | 200     | 404      |

### Attendance Endpoints

| Method | Endpoint                                | Description                              | Success | Error         |
| ------ | --------------------------------------- | ---------------------------------------- | ------- | ------------- |
| `POST` | `/api/attendance`                       | Mark attendance for an employee          | 201     | 400, 404, 409 |
| `GET`  | `/api/attendance/daily?date=YYYY-MM-DD` | All employees' attendance for a date     | 200     | 400           |
| `GET`  | `/api/attendance/{employee_id}`         | Full attendance history for one employee | 200     | 404           |

### Error Response Format

All errors return a consistent JSON body:

```json
{
  "success": false,
  "message": "Meaningful error message"
}
```

---

## Assumptions & Limitations

| #   | Description                                                                                                                                                                                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **No authentication** — the system is designed for a single trusted admin. Adding auth is outside the current scope.                                                                                           |
| 2   | **No edit/update for employees** — employee records are immutable after creation. Delete and re-add to correct a mistake.                                                                                      |
| 3   | **One attendance record per employee per day** — enforced by a compound unique index on `(employee_id, date)`. To change a record, the existing one must be deleted directly from the database (no update UI). |
| 4   | **Date format is `YYYY-MM-DD`** — the backend validates this strictly. The frontend date picker enforces it automatically.                                                                                     |
| 5   | **No pagination** — employee and attendance lists return all records. For large datasets (1000+ records), pagination should be added.                                                                          |
| 6   | **CORS is open (`allow_origins=["*"]`)** — suitable for local development. In production, restrict to the deployed frontend origin.                                                                            |
| 7   | **MongoDB indexes are created on every startup** — this is idempotent and safe, but adds a small startup delay on first run.                                                                                   |
