# AI Smart Healthcare System

A production-ready healthcare platform foundation built with the MERN stack. Phase 1 includes authentication, role-based dashboards, and a premium landing page.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Tailwind CSS, React Router, Axios, React Hook Form |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt, Express Validator |
| Cloud | Cloudinary (configured, uploads in later phase) |

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

## Installation

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Start MongoDB

Ensure MongoDB is running locally on `mongodb://localhost:27017` or update `MONGODB_URI` in backend `.env`.

### 3. Run the application

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Folder Structure

```
ai-smart-healthcare-system/
├── backend/
│   └── src/
│       ├── config/          # DB, env, Cloudinary
│       ├── controllers/     # Route handlers
│       ├── middleware/      # Auth, roles, validation, errors
│       ├── models/          # User, Patient, Doctor, Admin
│       ├── routes/          # API routes
│       ├── services/        # Business logic
│       ├── validators/      # Request validation
│       └── utils/           # Helpers, ApiResponse, ApiError
├── frontend/
│   └── src/
│       ├── assets/
│       ├── components/      # common, auth, landing, dashboard
│       ├── context/         # Auth, Theme
│       ├── hooks/
│       ├── layouts/
│       ├── pages/           # Landing, auth, dashboards
│       ├── services/        # API clients
│       └── utils/
└── README.md
```

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/health` | No | — | Health check |
| POST | `/api/auth/register` | No | — | Register user |
| POST | `/api/auth/login` | No | — | Login |
| POST | `/api/auth/logout` | Yes | Any | Logout |
| GET | `/api/auth/me` | Yes | Any | Current user |
| POST | `/api/auth/forgot-password` | No | — | Send reset email |
| PUT | `/api/auth/reset-password/:token` | No | — | Reset password |
| GET | `/api/users/profile` | Yes | Any | Get profile |
| PUT | `/api/users/profile` | Yes | Any | Update profile |
| GET | `/api/dashboard/patient` | Yes | patient | Patient dashboard |
| GET | `/api/dashboard/doctor` | Yes | doctor | Doctor dashboard |
| GET | `/api/dashboard/admin` | Yes | admin | Admin dashboard |

### Standard Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

## User Roles

| Role | Dashboard Route | Access |
|------|----------------|--------|
| Patient | `/patient/dashboard` | Patient dashboard only |
| Doctor | `/doctor/dashboard` | Doctor dashboard only |
| Admin | `/admin/dashboard` | Admin dashboard only |

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/healthcare_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_RESET_EXPIRE=15m
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## Phase 1 Scope

**Included:**
- Premium healthcare landing page
- JWT authentication (register, login, logout, forgot/reset password)
- Role-based access control (Patient, Doctor, Admin)
- Dashboard layouts with placeholders
- MongoDB integration with User/Patient/Doctor/Admin models
- Dark mode, responsive design, toast notifications

**Not included (future phases):**
- AI features
- Appointment booking
- Medical report upload
- Chatbot
- Prescriptions
- Health prediction

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | backend | Start API with nodemon |
| `npm start` | backend | Start API (production) |
| `npm run dev` | frontend | Start Vite dev server |
| `npm run build` | frontend | Production build |

## License

ISC
