# 🛡️ GearGuard — Equipment Maintenance Tracker

> A full-stack web application for tracking and managing industrial equipment maintenance, built for the Adani Hackathon.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Database Setup](#1-database-setup)
  - [Backend Setup](#2-backend-setup)
  - [Frontend Setup](#3-frontend-setup)
- [API Endpoints](#api-endpoints)
- [Pages & Features](#pages--features)
- [Environment Variables](#environment-variables)

---

## Overview

**GearGuard** is a maintenance management system designed to help industrial teams track equipment health, schedule maintenance tasks, manage teams, and monitor users — all from a sleek, dark-themed dashboard.

---

## ✨ Features

- 📊 **Dashboard** — At-a-glance KPIs: total equipment, pending tasks, overdue items, and active teams
- 🔧 **Equipment Management** — Add, edit, delete, and search equipment with status tracking
- 🗂️ **Maintenance Kanban** — Drag-&-drop style task board with Pending / In Progress / Completed columns
- 📅 **Calendar View** — Visual calendar of upcoming and past maintenance events
- 👥 **Teams** — Create and manage maintenance teams
- 👤 **Users** — Manage user accounts and roles
- 🔔 **Toast Notifications** — Real-time success/error feedback
- 🌑 **Premium Dark UI** — Modern glassmorphism design with smooth animations

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework & build tool |
| React Router v6 | Client-side routing |
| Lucide React | Icon library |
| Vanilla CSS | Custom dark theme & animations |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MySQL 2 | Relational database driver |
| CORS | Cross-origin resource sharing |
| dotenv | Environment variable management |
| Nodemon | Dev auto-restart |

---

## 📁 Project Structure

```
gearguard-app/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/               # Axios API helpers
│   │   ├── components/        # Shared UI components (Sidebar, Navbar, Modal, Toast)
│   │   ├── context/           # React Context (ToastContext)
│   │   ├── pages/             # Route-level page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Equipments.jsx
│   │   │   ├── Maintenance.jsx
│   │   │   ├── CalendarPage.jsx
│   │   │   ├── Teams.jsx
│   │   │   └── Users.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── index.html
│
└── server/                    # Node.js + Express backend
    ├── config/
    │   └── db.js              # MySQL connection pool
    ├── controllers/           # Route handler logic
    ├── routes/                # Express route definitions
    │   ├── equipments.js
    │   ├── maintenance.js
    │   ├── teams.js
    │   └── users.js
    ├── database/              # SQL schema & seed files
    ├── server.js              # Entry point
    ├── package.json
    └── .env
```

---

## ✅ Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org)
- **MySQL** v8+ — [Download](https://dev.mysql.com/downloads/)
- **npm** (comes with Node.js)

---

## 🚀 Getting Started

### 1. Database Setup

Open MySQL and create the database, then run the schema and seed files:

```sql
CREATE DATABASE gearguard;
USE gearguard;
```

Then run the SQL files found in `server/database/`:

```bash
mysql -u root -p gearguard < server/database/schema.sql
mysql -u root -p gearguard < server/database/seed.sql
```

---

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create your environment file
copy .env.example .env   # (or manually create .env — see below)

# Start the development server
npm run dev
```

The API will be available at: **http://localhost:5000**

Verify it's running:
```
GET http://localhost:5000/api/health
```

---

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## 🔌 API Endpoints

### Equipment
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/equipments` | Get all equipment |
| POST | `/api/equipments` | Create new equipment |
| PUT | `/api/equipments/:id` | Update equipment |
| DELETE | `/api/equipments/:id` | Delete equipment |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/maintenance` | Get all maintenance tasks |
| POST | `/api/maintenance` | Create maintenance task |
| PUT | `/api/maintenance/:id` | Update task (e.g., change status) |
| DELETE | `/api/maintenance/:id` | Delete task |

### Teams
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/teams` | Get all teams |
| POST | `/api/teams` | Create a team |
| PUT | `/api/teams/:id` | Update team |
| DELETE | `/api/teams/:id` | Delete team |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

---

## 📄 Pages & Features

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | KPI cards, charts, and summary stats |
| `/equipment` | Equipments | Full CRUD table for all machines/tools |
| `/maintenance` | Maintenance | Kanban board for task lifecycle management |
| `/calendar` | Calendar | Date-based view of scheduled maintenance |
| `/teams` | Teams | Team creation and member overview |
| `/users` | Users | User management with role assignment |

---

## ⚙️ Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gearguard
```

---

## 🏆 Built For

**Adani Hackathon** — Industrial Equipment Maintenance Tracking System

---

> Made with ❤️ by the Jadeja Vishwrajsinh
