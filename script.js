import { supabase } from "./supabase.js";


// =====================================================
// CONFIGURATION
// =====================================================

const API_BASE_URL = "https://task-management-app-akhh.onrender.com";


// =====================================================
// DOM ELEMENTS
// =====================================================

const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");

const showSignupButton = document.querySelector("#showSignup");
const signupCard = document.querySelector("#signupCard");

const addTaskButton = document.querySelector("#addTaskBtn");
const taskFormCard = document.querySelector("#taskFormCard");
const cancelTaskButton = document.querySelector("#cancelTaskBtn");

const taskForm = document.querySelector("#taskForm");
const tasksContainer = document.querySelector("#tasksContainer");


// =====================================================
// AUTH HELPERS
// =====================================================

async function getAccessToken() {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
        return null;
    }

    return session.access_token;
}


// =====================================================
// SIGN UP
// =====================================================

if (signupForm) {

    signupForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const name = document.querySelector("#signupName").value.trim();
        const email = document.querySelector("#signupEmail").value.trim();
        const password = document.querySelector("#signupPassword").value;

        if (!name || !email || !password) {
            alert("Please fill all fields.");
            return;
        }

        try {

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (data.user) {

                alert(
                    "Account created successfully! Please check your email if verification is required."
                );

                signupForm.reset();
            }

        } catch (error) {

            console.error("Signup error:", error);

            alert(error.message);
        }

    });

}


// =====================================================
// LOGIN
// =====================================================

if (loginForm) {

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const email = document.querySelector("#loginEmail").value.trim();
        const password = document.querySelector("#loginPassword").value;

        try {

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            alert("Login successful! 🎉");

            loginForm.reset();

            await loadTasks();

        } catch (error) {

            console.error("Login error:", error);

            alert(error.message);
        }

    });

}


// =====================================================
// SHOW SIGNUP
// =====================================================

if (showSignupButton) {

    showSignupButton.addEventListener("click", function () {

        if (signupCard) {

            signupCard.classList.add("active");

            signupCard.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    });

}


// =====================================================
// LOGOUT
// =====================================================

async function logout() {

    const { error } = await supabase.auth.signOut();

    if (error) {

        console.error("Logout error:", error);

        alert(error.message);

        return;
    }

    tasksContainer.innerHTML = `
        <div class="task-card">
            <h3>Please Login</h3>
            <p>Login to view and manage your tasks.</p>
        </div>
    `;

    alert("Logged out successfully.");
}


// =====================================================
// OPEN TASK FORM
// =====================================================

if (addTaskButton) {

    addTaskButton.addEventListener("click", async function () {

        const token = await getAccessToken();

        if (!token) {

            alert("Please login first.");

            document.querySelector("#login")?.scrollIntoView({
                behavior: "smooth"
            });

            return;
        }

        taskFormCard.classList.add("active");

    });

}


// =====================================================
// CANCEL TASK FORM
// =====================================================

if (cancelTaskButton) {

    cancelTaskButton.addEventListener("click", function () {

        taskForm.reset();

        taskFormCard.classList.remove("active");

    });

}


// =====================================================
// CREATE TASK
// =====================================================

if (taskForm) {

    taskForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const token = await getAccessToken();

        if (!token) {

            alert("Please login first.");

            return;
        }

        const title = document.querySelector("#taskTitle").value.trim();

        const description =
            document.querySelector("#taskDescription").value.trim();

        const status =
            document.querySelector("#taskStatus").value;

        if (!title) {

            alert("Task title is required.");

            return;
        }

        try {

            const response = await fetch(
                `${API_BASE_URL}/tasks`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title: title,
                        description: description,
                        status: status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.detail || "Failed to create task"
                );
            }

            alert("Task created successfully! ✅");

            taskForm.reset();

            taskFormCard.classList.remove("active");

            await loadTasks();

        } catch (error) {

            console.error("Create task error:", error);

            alert(error.message);
        }

    });

}


// =====================================================
// LOAD TASKS
// =====================================================

async function loadTasks() {

    const token = await getAccessToken();

    if (!token) {

        tasksContainer.innerHTML = `
            <div class="task-card">
                <h3>Login Required 🔐</h3>
                <p>
                    Please login to view your personal tasks.
                </p>
            </div>
        `;

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/tasks`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail || "Failed to load tasks"
            );
        }

        renderTasks(data.tasks || []);

    } catch (error) {

        console.error("Load tasks error:", error);

        tasksContainer.innerHTML = `
            <div class="task-card">
                <h3>Unable to load tasks</h3>
                <p>${error.message}</p>
            </div>
        `;
    }

}


// =====================================================
// RENDER TASKS
// =====================================================

function renderTasks(tasks) {

    if (!tasks.length) {

        tasksContainer.innerHTML = `
            <div class="task-card">
                <h3>No Tasks Yet 📋</h3>
                <p>
                    Click "+ Add Task" to create your first task.
                </p>
            </div>
        `;

        return;
    }

    tasksContainer.innerHTML = "";

    tasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        card.innerHTML = `
            <div class="task-card-header">

                <h3>${escapeHTML(task.title)}</h3>

                <span class="status ${escapeHTML(task.status)}">
                    ${formatStatus(task.status)}
                </span>

            </div>

            <p>
                ${escapeHTML(task.description || "No description")}
            </p>

            <div class="task-actions">

                <button
                    class="edit-btn"
                    data-id="${task.id}"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    data-id="${task.id}"
                >
                    Delete
                </button>

            </div>
        `;

        tasksContainer.appendChild(card);

    });


    // Edit buttons

    document.querySelectorAll(".edit-btn").forEach(button => {

        button.addEventListener("click", function () {

            editTask(this.dataset.id);

        });

    });


    // Delete buttons

    document.querySelectorAll(".delete-btn").forEach(button => {

        button.addEventListener("click", function () {

            deleteTask(this.dataset.id);

        });

    });

}


// =====================================================
// UPDATE TASK
// =====================================================

async function editTask(taskId) {

    const token = await getAccessToken();

    if (!token) {

        alert("Please login first.");

        return;
    }

    const newTitle = prompt("Enter new task title:");

    if (newTitle === null) {
        return;
    }

    const title = newTitle.trim();

    if (!title) {

        alert("Task title cannot be empty.");

        return;
    }

    const newStatus = prompt(
        "Enter status: pending, in-progress, or completed"
    );

    if (newStatus === null) {
        return;
    }

    const status = newStatus.trim();

    const validStatuses = [
        "pending",
        "in-progress",
        "completed"
    ];

    if (!validStatuses.includes(status)) {

        alert(
            "Invalid status. Use pending, in-progress, or completed."
        );

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/tasks/${taskId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    title: title,
                    status: status
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail || "Failed to update task"
            );
        }

        alert("Task updated successfully! ✏️");

        await loadTasks();

    } catch (error) {

        console.error("Update task error:", error);

        alert(error.message);
    }

}


// =====================================================
// DELETE TASK
// =====================================================

async function deleteTask(taskId) {

    const token = await getAccessToken();

    if (!token) {

        alert("Please login first.");

        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/tasks/${taskId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.detail || "Failed to delete task"
            );
        }

        alert("Task deleted successfully! 🗑️");

        await loadTasks();

    } catch (error) {

        console.error("Delete task error:", error);

        alert(error.message);
    }

}


// =====================================================
// FORMAT STATUS
// =====================================================

function formatStatus(status) {

    if (status === "in-progress") {
        return "In Progress";
    }

    if (status === "completed") {
        return "Completed";
    }

    return "Pending";
}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// =====================================================
// AUTH STATE
// =====================================================

supabase.auth.onAuthStateChange(
    async (event, session) => {

        console.log("Auth event:", event);

        if (session) {

            await loadTasks();

        } else {

            tasksContainer.innerHTML = `
                <div class="task-card">
                    <h3>Login Required 🔐</h3>
                    <p>
                        Please login to view and manage your tasks.
                    </p>
                </div>
            `;
        }

    }
);


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    await loadTasks();

});
