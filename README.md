# TaskFlow - Task Management Application

TaskFlow is a full-stack task management web application for creating, updating, deleting, and tracking personal tasks. It includes authentication, protected task APIs, dashboard statistics, filtering, and a responsive interface for desktop and mobile screens.

## 👩‍💻 Author

**Donthu Bhavya Sri**

- GitHub: https://github.com/bhavyasri123-pr
- Repository: https://github.com/bhavyasri123-pr/TaskFlow-Task-Management-App

## Features

- User registration and login
- JWT-based protected routes
- Create, read, update, and delete tasks
- User-specific task access
- Dashboard with total, completed, pending, and overdue task counts
- Task chart visualization
- Search and filter tasks by status or priority
- Task statuses: Pending, In Progress, and Completed
- Local avatar upload on the profile page
- Profile page with user details and task statistics
- Responsive layout for web and mobile screens

## Tech Stack

- Frontend: React, Vite, Axios, React Router, Chart.js
- Backend: Node.js, Express.js, JWT, bcrypt
- Database: MySQL

## Project Structure

```
task-management-app/
  backend/
    config/
    controllers/
    middleware/
    routes/
    schema.sql
    server.js
  frontend/
    src/
      components/
      pages/
      services/
      styles/
```

## Database Setup

1. Open MySQL.
2. Run the SQL script in `backend/schema.sql`.
3. Create a backend environment file from the example:

```
cp backend/.env.example backend/.env
```

4. Update `backend/.env` with your MySQL username, password, database name, and JWT secret.

## Run Backend

```
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:5000`.

## Run Frontend

```
cd frontend
npm install
npm run dev
```

The frontend usually runs on `http://localhost:5173`.

## API Summary

Authentication:

- `POST /api/auth/register` - register user
- `POST /api/auth/login` - login user
- `GET /api/auth/profile` - get logged-in user profile

Tasks:

- `POST /api/tasks` - create task
- `GET /api/tasks` - get all logged-in user's tasks
- `GET /api/tasks/:id` - get single task
- `PUT /api/tasks/:id` - update task
- `DELETE /api/tasks/:id` - delete task

## Completion Status

Completed requirements:

- User authentication and authorization
- CRUD operations for tasks
- API integration between frontend and backend
- Dynamic task handling with dashboard statistics
- Profile avatar upload and improved empty task states
- Responsive design for desktop and mobile screens

