export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
};

export const DASHBOARD_ROUTES = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Doctors', href: '#doctors' },
  { label: 'Contact', href: '#contact' },
];

export const SERVICES = [
  {
    icon: 'Stethoscope',
    title: 'Expert Consultations',
    description: 'Connect with certified healthcare professionals for personalized medical advice.',
  },
  {
    icon: 'Calendar',
    title: 'Smart Scheduling',
    description: 'Book appointments seamlessly with our intelligent scheduling system.',
  },
  {
    icon: 'FileText',
    title: 'Digital Records',
    description: 'Secure, centralized medical records accessible anytime, anywhere.',
  },
  {
    icon: 'Heart',
    title: 'Health Monitoring',
    description: 'Track your health metrics and receive proactive wellness insights.',
  },
  {
    icon: 'Shield',
    title: 'Secure Platform',
    description: 'HIPAA-compliant security ensuring your health data stays protected.',
  },
  {
    icon: 'Brain',
    title: 'AI-Powered Insights',
    description: 'Advanced analytics to help you make informed health decisions.',
  },
];

export const FEATURES = [
  {
    title: '24/7 Access',
    description: 'Healthcare services available round the clock from any device.',
  },
  {
    title: 'Role-Based Dashboards',
    description: 'Tailored experiences for patients, doctors, and administrators.',
  },
  {
    title: 'Real-Time Notifications',
    description: 'Stay updated with appointment reminders and health alerts.',
  },
  {
    title: 'Modern Interface',
    description: 'Intuitive, responsive design built for seamless user experience.',
  },
];

export const DOCTORS_PREVIEW = [
  {
    name: 'Dr. Sarah Mitchell',
    specialty: 'Cardiologist',
    experience: '15 years',
    rating: 4.9,
    image: null,
  },
  {
    name: 'Dr. James Chen',
    specialty: 'Neurologist',
    experience: '12 years',
    rating: 4.8,
    image: null,
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrician',
    experience: '10 years',
    rating: 4.9,
    image: null,
  },
  {
    name: 'Dr. Michael Park',
    specialty: 'Orthopedic Surgeon',
    experience: '18 years',
    rating: 4.7,
    image: null,
  },
];

export const TESTIMONIALS = [
  {
    name: 'Jennifer Adams',
    role: 'Patient',
    content: 'HealthCare AI transformed how I manage my health. The platform is intuitive and my doctor visits are now seamless.',
    rating: 5,
  },
  {
    name: 'Dr. Robert Kim',
    role: 'Cardiologist',
    content: 'As a physician, this platform helps me focus on patient care rather than administrative tasks. Highly recommended.',
    rating: 5,
  },
  {
    name: 'Maria Santos',
    role: 'Patient',
    content: 'The digital health records feature saved me during an emergency abroad. Everything I needed was accessible instantly.',
    rating: 5,
  },
];

export const STATISTICS = [
  { label: 'Active Patients', value: '50K+', icon: 'Users' },
  { label: 'Expert Doctors', value: '500+', icon: 'Stethoscope' },
  { label: 'Consultations', value: '100K+', icon: 'MessageCircle' },
  { label: 'Satisfaction Rate', value: '98%', icon: 'Star' },
];
