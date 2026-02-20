# ResolveNow – Online Complaint Registration and Management System

A full-stack platform for submitting, tracking, and resolving complaints. Users register, submit complaints with attachments, track status, and chat with assigned agents. Admins assign complaints to agents and view statistics.

## Features

- **User registration & login** – JWT auth, optional email verification
- **Complaint submission** – Title, description, category, priority, address, contact, purchase date, file attachments
- **Tracking & notifications** – Real-time status, in-app notifications, email notifications (when SMTP configured)
- **User–agent chat** – Real-time messaging via Socket.io (with HTTP fallback)
- **Assigning & routing** – Admin assigns complaints to agents; agents see only their assigned list
- **Security** – Password hashing, JWT, role-based access (user, agent, admin)
- **Feedback** – Users can rate and comment after resolution

## Tech Stack

- **Frontend:** React (Vite), React Router, Bootstrap, React Bootstrap, Axios, Socket.io client, React Hot Toast
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Socket.io, Multer (uploads), Nodemailer (optional)
- **Real-time:** Socket.io for chat and live updates

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, optional SMTP and FRONTEND_URL
npm install
npm run dev
```

Server runs at `http://localhost:5000`.

Create first admin (optional):

```bash
node scripts/seedAdmin.js
# Default: admin@resolvenow.com / admin123 (set ADMIN_EMAIL, ADMIN_PASSWORD in .env to override)
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`. Vite proxy forwards `/api`, `/uploads`, and `/socket.io` to the backend.

### 3. Environment

**Backend `.env`:**

- `PORT` – default 5000
- `MONGODB_URI` – e.g. `mongodb://localhost:27017/resolvenow`
- `JWT_SECRET` – strong random string
- `JWT_EXPIRE` – e.g. `7d`
- `FRONTEND_URL` – e.g. `http://localhost:3000` (CORS and Socket.io)
- Optional: `SMTP_*` for verification and notification emails
- Optional: `UPLOAD_PATH`, `MAX_FILE_SIZE` for file uploads

## Scripts

- **Backend:** `npm start` (production), `npm run dev` (nodemon)
- **Frontend:** `npm run dev`, `npm run build`, `npm run preview`

## API Overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`, `POST /api/auth/verify-email`
- `POST /api/complaints`, `GET /api/complaints/my`, `GET /api/complaints/list` (agent/admin), `GET /api/complaints/:id`, `PUT /api/complaints/:id/status`, `PUT /api/complaints/:id/assign` (admin), `POST /api/complaints/:id/feedback`
- `GET /api/messages/:complaintId`, `POST /api/messages/:complaintId`
- `GET /api/notifications`, `GET /api/notifications/unread-count`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`
- `GET /api/users/agents`, `POST /api/users/agents` (admin), `GET /api/users/stats` (admin)

## Roles

- **user** – Submit complaints, view own complaints, chat, submit feedback
- **agent** – View assigned complaints, update status, resolve, chat with users
- **admin** – All of the above, plus assign complaints to agents, create agents, view stats

## License

MIT.
