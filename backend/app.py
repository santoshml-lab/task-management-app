from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import os


# =====================================================
# APP
# =====================================================

app = FastAPI(
    title="TaskFlow API",
    description="Task Management Application API",
    version="1.0.0"
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# SUPABASE
# =====================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Supabase environment variables are missing")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# =====================================================
# MODELS
# =====================================================

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "pending"


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None


# =====================================================
# AUTHENTICATION
# =====================================================

def get_user(access_token: str | None):

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

    try:
        user_response = supabase.auth.get_user(access_token)

        if not user_response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        return user_response.user

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token"
        )


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "message": "TaskFlow API is running 🚀"
    }


# =====================================================
# GET USER TASKS
# =====================================================

@app.get("/tasks")
def get_tasks(
    authorization: str | None = Header(default=None)
):

    token = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")

    user = get_user(token)

    response = (
        supabase
        .table("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .execute()
    )

    return {
        "tasks": response.data
    }


# =====================================================
# CREATE TASK
# =====================================================

@app.post("/tasks")
def create_task(
    task: TaskCreate,
    authorization: str | None = Header(default=None)
):

    token = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")

    user = get_user(token)

    response = (
        supabase
        .table("tasks")
        .insert({
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "user_id": user.id
        })
        .execute()
    )

    return {
        "message": "Task created successfully",
        "task": response.data
    }


# =====================================================
# UPDATE TASK
# =====================================================

@app.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    task: TaskUpdate,
    authorization: str | None = Header(default=None)
):

    token = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")

    user = get_user(token)

    update_data = {
        key: value
        for key, value in task.model_dump().items()
        if value is not None
    }

    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No data provided for update"
        )

    response = (
        supabase
        .table("tasks")
        .update(update_data)
        .eq("id", task_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return {
        "message": "Task updated successfully",
        "task": response.data
    }


# =====================================================
# DELETE TASK
# =====================================================

@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    authorization: str | None = Header(default=None)
):

    token = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")

    user = get_user(token)

    response = (
        supabase
        .table("tasks")
        .delete()
        .eq("id", task_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    return {
        "message": "Task deleted successfully"
    }
