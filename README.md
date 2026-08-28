# 🚀 Task Management Application

A full-stack Task Management Application built to demonstrate user authentication, task CRUD operations, API integration, database management, and responsive web design.

## 🌐 Live Demo

**Frontend:**  
https://funny-khapse-1d6cd0.netlify.app/

**Backend API:**  
https://task-management-app-akhh.onrender.com/

**GitHub Repository:**  
https://github.com/santoshml-lab/task-management-app

## ✨ Features

- 🔐 User Authentication
- 👤 User-specific task management
- ➕ Create tasks
- 📋 View tasks
- ✏️ Update tasks
- 🗑️ Delete tasks
- 📊 Task status tracking
- 📱 Responsive design
- 🔒 Authentication-based authorization
- ⚡ REST API integration
- 🗄️ Supabase database integration

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Responsive Design

### Backend
- Python
- FastAPI
- Uvicorn
- REST API

### Database & Authentication
- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)

### Deployment
- Netlify — Frontend
- Render — Backend

## 🏗️ Project Structure

```text
task-management-app/
│
├── index.html
├── style.css
├── script.js
├── supabase.js
├── README.md
│
└── backend/
    ├── app.py
    └── requirements.txt
🔑 Authentication
The application uses Supabase Authentication for user signup and login.
After authentication, the user's access token is sent to the FastAPI backend using a Bearer token.
User Login
     ↓
Supabase Authentication
     ↓
Access Token
     ↓
FastAPI Backend
     ↓
Authenticated User
     ↓
User's Tasks
📋 Task CRUD Operations
The application supports complete CRUD functionality:
Operation
Description
Create
Create a new task
Read
Display user's tasks
Update
Modify task title/status
Delete
Remove a task
⚙️ API Endpoints
Health Check
GET /
Get Tasks
GET /tasks
Returns authenticated user's tasks.
Create Task
POST /tasks
Example request:
{
  "title": "Complete project",
  "description": "Finish the task management application",
  "status": "pending"
}
Update Task
PUT /tasks/{task_id}
Delete Task
DELETE /tasks/{task_id}
🗄️ Database
The application uses a tasks table in Supabase.
tasks
├── id
├── title
├── description
├── status
├── user_id
└── created_at
Each task is associated with its authenticated user through user_id.
🔒 Security
The application uses:
Supabase Authentication
Bearer access tokens
User-specific task filtering
PostgreSQL Row Level Security (RLS)
Environment variables for backend credentials
Sensitive keys and passwords are not stored in the source code.
🚀 Local Setup
1. Clone the repository
git clone https://github.com/santoshml-lab/task-management-app.git
2. Open the project
cd task-management-app
3. Install backend dependencies
pip install -r backend/requirements.txt
4. Set environment variables
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
5. Start the FastAPI backend
uvicorn backend.app:app --reload
The API will run locally at:
http://127.0.0.1:8000
📱 Responsive Design
The application is designed to work across:
💻 Desktop
📱 Mobile
📟 Tablet
🎯 Learning Outcomes
This project demonstrates practical understanding of:
Full-stack application structure
Frontend and backend integration
REST API development
Authentication and authorization
CRUD operations
Database integration
Supabase
FastAPI
Responsive web development
Deployment using Netlify and Render
👨‍💻 Author
Santosh Kumar Yadav
GitHub:
https://github.com/santoshml-lab⁠�
📄 Project Status
Completed ✅
This project was developed as part of a full-stack development internship task.
