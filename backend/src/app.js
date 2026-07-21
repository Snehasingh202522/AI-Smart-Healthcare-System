const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const healthRoutes = require('./routes/healthRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalReportRoutes = require('./routes/medicalReportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();

// ✅ Allow multiple frontend ports
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to HealthCare AI API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical-reports', medicalReportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/doctors', doctorRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

module.exports = app;
