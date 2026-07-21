import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';
import MedicalReportsPage from './pages/MedicalReportsPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import SymptomHistoryPage from './pages/SymptomHistoryPage';
import FindDoctorsPage from './pages/FindDoctorsPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
        <Route
          element={<DashboardLayout role="patient" title="Patient Dashboard" />}
        >
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/appointments" element={<AppointmentsPage />} />
          <Route path="/patient/medical-reports" element={<MedicalReportsPage />} />
          <Route path="/patient/symptom-checker" element={<SymptomCheckerPage />} />
          <Route path="/patient/symptom-history" element={<SymptomHistoryPage />} />
          <Route path="/patient/find-doctors" element={<FindDoctorsPage />} />
          <Route path="/patient/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
        <Route
          element={<DashboardLayout role="doctor" title="Doctor Dashboard" />}
        >
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route
          element={<DashboardLayout role="admin" title="Admin Dashboard" />}
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
