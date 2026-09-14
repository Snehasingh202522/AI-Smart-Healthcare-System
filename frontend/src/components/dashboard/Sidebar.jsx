import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Heart,
  Bell,
  Activity,
  Users,
  User,
  Stethoscope,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Brain,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Heart as Logo } from 'lucide-react';

const SIDEBAR_CONFIG = {
  patient: {
    links: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/patient/dashboard' },
      { label: 'Appointments', icon: Calendar, href: '/patient/appointments' },
      { label: 'Medical Reports', icon: FileText, href: '/patient/medical-reports' },
      { label: 'AI Symptom Checker', icon: Brain, href: '/patient/symptom-checker' },
      { label: 'AI Health Insights', icon: Sparkles, href: '/patient/health-insights' },
      { label: 'Find Doctors', icon: MapPin, href: '/patient/find-doctors' },
      { label: 'Symptom History', icon: Activity, href: '/patient/symptom-history' },
      { label: 'Health Score', icon: Heart, href: '/patient/health-score' },
      { label: 'Prescriptions', icon: Stethoscope, href: '/patient/prescriptions' },
      { label: 'Notifications', icon: Bell, href: '/patient/notifications' },
      { label: 'Profile', icon: User, href: '/patient/profile' },
    ],
  },

  doctor: {
    links: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/doctor/dashboard' },
      { label: 'Schedule', icon: Calendar, href: '/doctor/schedule' },
      { label: 'Prescriptions', icon: Stethoscope, href: '/doctor/prescriptions' },
      { label: 'Notifications', icon: Bell, href: '/doctor/notifications' },
      { label: 'Analytics', icon: BarChart3, href: '/doctor/analytics' },
    ],
  },

  admin: {
    links: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },

      // Existing working features
      {
        label: 'User Management',
        icon: Users,
        href: '/admin/user-management',
      },

      {
        label: 'Doctor Verification',
        icon: Stethoscope,
        href: '/admin/doctor-verification',
      },

      // New Admin features
      {
        label: 'Analytics',
        icon: BarChart3,
        href: '/admin/analytics',
      },

      {
        label: 'Notifications',
        icon: Bell,
        href: '/admin/notifications',
      },

      {
        label: 'Settings',
        icon: Settings,
        href: '/admin/settings',
      },
    ],
  },
};

const Sidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const config =
    SIDEBAR_CONFIG[role] || SIDEBAR_CONFIG.patient;

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-primary-600" />

            <span className="text-lg font-bold text-gray-900 dark:text-white">
              HealthCare AI
            </span>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {config.links.map((link) => {
          const Icon = link.icon;

          const isActive =
            location.pathname === link.href;

          return (
            <Link
              key={link.label}
              to={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />

              {!collapsed && (
                <span className="flex-1">
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;