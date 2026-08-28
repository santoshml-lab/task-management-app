from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from supabase import create_client, Client


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

supabase: Client | None = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(
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
# HOME
# =====================================================

@app.get("/")
def home():
    return {
        "message": "TaskFlow API is running 🚀"
    }


# =====================================================
# GET ALL TASKS
# =====================================================

@app.get("/tasks")
def get_tasks():

    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase is not configured"
        )

    response = (
        supabase
        .table("tasks")
        .select("*")
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
def create_task(task: TaskCreate):

    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase is not configured"
        )

    response = (
        supabase
        .table("tasks")
        .insert({
            "title": task.title,
            "description": task.description,
            "status": task.status
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
    task: TaskUpdate
):

    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase is not configured"
        )

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
def delete_task(task_id: int):

    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase is not configured"
        )

    response = (
        supabase
        .table("tasks")
        .delete()
        .eq("id", task_id)
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
