# AI Smart Healthcare System

A production-ready healthcare platform built with the MERN stack, featuring AI-assisted symptom checking, appointment management, prescriptions, and comprehensive doctor-patient workflows.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Tailwind CSS, React Router, Axios, React Hook Form |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt, Express Validator |
| AI | Google Gemini AI |
| Cloud | Cloudinary (configured for file uploads) |

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm
- Google Gemini API Key (for AI features)

## Installation

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Gemini API key

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### 2. Configure Environment Variables

#### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/healthcare_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production
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
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Demo Accounts

```bash
cd backend
npm run seed:demo
```

This creates demo accounts:
- **Patient**: `demo.patient@healthcare-ai.demo` / `Demo123456`
- **Doctor**: `demo.doctor@healthcare-ai.demo` / `Demo123456`

### 4. Start MongoDB

Ensure MongoDB is running locally on `mongodb://localhost:27017` or update `MONGODB_URI` in backend `.env`.

### 5. Run the application

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Demo Testing Guide

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Patient | demo.patient@healthcare-ai.demo | Demo123456 |
| Doctor | demo.doctor@healthcare-ai.demo | Demo123456 |

### End-to-End Test Sequence

#### 1. Patient Flow

1. **Login as Demo Patient**
   - Use the "Demo Patient" button on the login page
   - Enter credentials manually if needed

2. **AI Symptom Checker**
   - Navigate to AI Symptom Checker
   - Enter symptoms (e.g., "headache for 3 days, mild pain")
   - Answer follow-up questions if prompted
   - Review AI assessment and recommendations

3. **Find Doctors**
   - Navigate to Find Doctors
   - Search by specialization or location
   - View verified doctors (demo doctor should appear)

4. **Book Appointment**
   - Select a doctor from the list
   - Choose date and time (must be in the future)
   - Provide reason for visit
   - Confirm booking

5. **View Appointments**
   - Check Appointments page
   - Verify appointment appears with correct status

6. **Wait for Doctor Confirmation**
   - Doctor will receive notification
   - Doctor can confirm/schedule appointment
   - Patient receives notification upon confirmation

#### 2. Doctor Flow

1. **Login as Demo Doctor**
   - Use the "Demo Doctor" button on the login page
   - Enter credentials manually if needed

2. **View Dashboard**
   - Check today's appointments
   - View pending appointment requests
   - Check notifications

3. **Manage Appointments**
   - Review patient appointment request
   - Confirm or schedule appointment
   - Patient receives notification

4. **Create Prescription**
   - Navigate to Prescriptions
   - Select patient from appointments
   - Enter diagnosis and medicines
   - Save prescription
   - Patient receives notification

5. **View Analytics**
   - Check practice analytics
   - Review appointment statistics
   - View patient trends

#### 3. Admin Verification Flow

1. **Login as Admin**
   - Use admin credentials (not included in demo)
   - Navigate to Admin Dashboard

2. **Verify Doctors**
   - View unverified doctors
   - Review doctor profiles
   - Approve or reject doctor applications
   - Only verified doctors appear in Find Doctors

### API Endpoints

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
| POST | `/api/appointments` | Yes | patient | Book appointment |
| GET | `/api/appointments/patient` | Yes | patient | Patient appointments |
| GET | `/api/appointments/doctor` | Yes | doctor | Doctor appointments |
| PATCH | `/api/appointments/:id/status` | Yes | doctor | Update appointment status |
| POST | `/api/ai/symptom-check` | Yes | patient | AI symptom analysis |
| GET | `/api/ai/history` | Yes | patient | Symptom history |
| POST | `/api/prescriptions` | Yes | doctor | Create prescription |
| GET | `/api/prescriptions/patient` | Yes | patient | Patient prescriptions |
| GET | `/api/prescriptions/doctor` | Yes | doctor | Doctor prescriptions |
| GET | `/api/doctors` | Yes | patient, admin | List verified doctors |
| POST | `/api/doctors/recommend` | Yes | patient | Get doctor recommendations |
| GET | `/api/notifications` | Yes | Any | Get notifications |
| POST | `/api/admin/doctors/:doctorId/verify` | Yes | admin | Verify doctor |
| GET | `/api/admin/doctors/unverified` | Yes | admin | Get unverified doctors |

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
| Patient | `/patient/dashboard` | Symptom checker, appointments, prescriptions, medical reports, health score |
| Doctor | `/doctor/dashboard` | Appointments, prescriptions, schedule, analytics, notifications |
| Admin | `/admin/dashboard` | User management, doctor verification, system analytics |

## Features

### Patient Features
- ✅ AI-assisted preliminary symptom assessment with follow-up questions
- ✅ Find doctors by specialization and location
- ✅ Book appointments with verified doctors
- ✅ View appointment history and status
- ✅ Access prescriptions from doctors
- ✅ Upload and manage medical reports
- ✅ Wellness score based on health data
- ✅ Symptom history tracking
- ✅ Real-time notifications

### Doctor Features
- ✅ View and manage appointments
- ✅ Confirm/schedule/cancel appointments
- ✅ Create and manage prescriptions
- ✅ View patient history and reports
- ✅ Analytics and practice insights
- ✅ Schedule management
- ✅ Real-time notifications
- ✅ Profile management

### Admin Features
- ✅ Verify/reject doctor applications
- ✅ Manage user accounts
- ✅ View system analytics
- ✅ User activation/deactivation

### Security Features
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Resource-level authorization
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Protected routes

## Important Medical Disclaimer

**The AI Symptom Checker provides preliminary health assessments for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns.**

The Wellness Score is an indicator based on available health data and is not a medical diagnosis.

## Deployment

### Production Environment Variables

Ensure these are set in your production environment:

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_random_secret
CLIENT_URL=your_production_frontend_url
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Production Build

```bash
# Frontend production build
cd frontend
npm run build

# Backend production start
cd backend
npm start
```

### Deployment Considerations

- Use MongoDB Atlas for production database
- Configure proper CORS for production domain
- Use environment-specific configuration
- Enable HTTPS for production
- Implement proper error logging
- Set up monitoring and alerting
- Use proper secret management (never commit secrets to git)

## Scripts

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev` | backend | Start API with nodemon |
| `npm start` | backend | Start API (production) |
| `npm run seed:doctors` | backend | Seed sample doctors |
| `npm run seed:demo` | backend | Seed demo accounts |
| `npm run dev` | frontend | Start Vite dev server |
| `npm run build` | frontend | Production build |

## Project Structure

```
ai-smart-healthcare-system/
├── backend/
│   └── src/
│       ├── config/          # DB, env, Cloudinary
│       ├── controllers/     # Route handlers
│       ├── middleware/      # Auth, roles, validation, errors
│       ├── models/          # User, Patient, Doctor, Admin, Appointment, Prescription, etc.
│       ├── routes/          # API routes
│       ├── scripts/         # Seed scripts
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

## License

ISC
