# 🏥 AI Smart Healthcare System

> **AI-powered full-stack healthcare platform built with the MERN stack, connecting patients, doctors, and administrators through intelligent healthcare workflows.**

The **AI Smart Healthcare System** is a role-based healthcare platform designed to make healthcare access more intelligent, organized, and convenient.

It combines **AI-assisted symptom analysis, smart doctor recommendations, appointment management, prescriptions, medical reports, notifications, and analytics** into a single full-stack application.

---

## 🚀 Key Highlights

* 🤖 **AI Symptom Checker** powered by Google Gemini
* 🩺 **Smart Doctor Recommendation** based on specialization and location
* 📅 **Online Appointment Booking & Management**
* 👨‍⚕️ **Doctor Verification Workflow**
* 💊 **Digital Prescription Management**
* 📄 **Medical Report Management**
* 🔔 **Real-time Notifications**
* 📊 **Role-based Analytics Dashboards**
* 🔐 **JWT Authentication & Role-Based Authorization**
* 🧑‍⚕️ **Patient, Doctor & Admin Workflows**
* 📍 **Location-aware healthcare discovery**
* 📱 Responsive modern healthcare UI

---

## 👥 User Roles

### 👤 Patient

Patients can:

* Register and securely log in
* Analyze symptoms using AI
* View AI-generated preliminary health insights
* Find doctors by specialization and location
* View verified doctors
* Book appointments
* Track appointment status
* View prescriptions
* Upload and manage medical reports
* Track symptom history
* Receive notifications
* View wellness-related insights

### 👨‍⚕️ Doctor

Doctors can:

* Register and manage their profile
* Wait for admin verification
* View appointment requests
* Confirm, schedule, complete, reject or cancel appointments
* View patient information
* Create prescriptions
* View patient medical history and reports
* Manage schedules
* View practice analytics
* Receive appointment notifications

### 🛡️ Admin

Administrators can:

* View system analytics
* Manage users
* Verify doctor applications
* Approve or reject doctors
* Activate/deactivate accounts
* Monitor appointment-related activity
* Manage system notifications
* Update administrator settings

---

# 🤖 AI Features

## AI Symptom Checker

Patients can enter their symptoms and receive a **preliminary AI-assisted assessment**.

The system can:

1. Accept reported symptoms
2. Ask relevant follow-up questions
3. Analyze the provided information using Google Gemini
4. Generate possible health insights
5. Provide general recommendations
6. Store symptom history for future reference

> ⚠️ AI-generated results are informational only and are **not a medical diagnosis**.

---

# 🩺 Smart Doctor Recommendation

The platform helps patients discover suitable doctors using:

* Medical specialization
* Patient location
* Doctor location
* Verified doctor status
* Availability information

The system combines registered doctors with location-aware healthcare discovery to make doctor selection easier.

---

# 📅 Appointment Management

The complete appointment lifecycle is supported:

```text
Patient
   ↓
Select Verified Doctor
   ↓
Choose Date & Time
   ↓
Book Appointment
   ↓
Doctor Receives Notification
   ↓
Doctor Confirms / Rejects / Schedules
   ↓
Patient Receives Notification
   ↓
Appointment Completed
```

Supported appointment statuses include:

* Pending
* Confirmed
* Scheduled
* Completed
* Cancelled
* Rejected
* No-show

---

# 💊 Prescription Management

Doctors can create digital prescriptions for patients.

Prescription workflow:

```text
Doctor
   ↓
Select Patient
   ↓
Enter Diagnosis
   ↓
Add Medicines
   ↓
Save Prescription
   ↓
Patient Receives Notification
```

Patients can then securely access their prescriptions from their dashboard.

---

# 🔔 Notification System

The system provides role-based notifications for important healthcare events.

Examples include:

* New appointment request
* Appointment confirmation
* Appointment scheduling
* Appointment rejection
* Appointment cancellation
* Appointment completion
* New prescription
* Doctor verification-related events

---

# 📊 Analytics

The application provides analytics dashboards according to user role.

### Patient Analytics

* Health-related insights
* Symptom patterns
* Appointment information
* Wellness observations

### Doctor Analytics

* App
