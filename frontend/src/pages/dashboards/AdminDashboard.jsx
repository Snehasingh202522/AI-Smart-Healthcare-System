import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Stethoscope,
  UserCheck,
  Bell,
  BarChart3,
  Activity,
  Clock,
  Shield,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/authService';
import { getAdminAnalytics } from '../../services/adminService';

import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import { formatDateTime } from '../../utils/helpers';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardResult, analyticsResult] =
          await Promise.allSettled([
            dashboardService.getAdminDashboard(),
            getAdminAnalytics(),
          ]);

        if (dashboardResult.status === 'fulfilled') {
          setData(dashboardResult.value);
        }

        if (analyticsResult.status === 'fulfilled') {
          setAnalytics(analyticsResult.value);
        }
      } catch (error) {
        console.error('Failed to load admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  /*
   * adminService returns response.data.
   * Depending on backend response shape, analytics can be
   * directly inside analytics or inside analytics.data.
   */
  const analyticsData = analytics?.data || analytics || {};

  const totalUsers =
    data?.stats?.totalUsers ??
    analyticsData?.stats?.totalUsers ??
    analyticsData?.totalUsers ??
    0;

  const totalDoctors =
    data?.stats?.totalDoctors ??
    analyticsData?.stats?.totalDoctors ??
    analyticsData?.totalDoctors ??
    0;

  const totalPatients =
    data?.stats?.totalPatients ??
    analyticsData?.stats?.totalPatients ??
    analyticsData?.totalPatients ??
    0;

  const notifications =
    data?.stats?.notifications ??
    analyticsData?.stats?.notifications ??
    analyticsData?.notifications ??
    0;

  const totalAppointments =
    analyticsData?.appointments?.total ??
    analyticsData?.totalAppointments ??
    0;

  const verifiedDoctors =
    analyticsData?.doctors?.verified ??
    analyticsData?.verifiedDoctors ??
    0;

  const pendingDoctors =
    analyticsData?.doctors?.pending ??
    analyticsData?.pendingDoctors ??
    0;

  return (
    <div className="space-y-6">

      {/* ================= HERO ================= */}

      <Card className="gradient-hero !border-0 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Admin Dashboard
            </h2>

            <p className="mt-1 text-white/80">
              Welcome, {user?.firstName}. Manage your healthcare platform.
            </p>
          </div>

          <Avatar
            firstName={user?.firstName}
            lastName={user?.lastName}
            size="xl"
          />
        </div>
      </Card>

      {/* ================= STAT CARDS ================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          color="primary"
        />

        <StatCard
          title="Total Doctors"
          value={totalDoctors}
          icon={Stethoscope}
          color="accent"
        />

        <StatCard
          title="Total Patients"
          value={totalPatients}
          icon={UserCheck}
          color="warning"
        />

        <StatCard
          title="Notifications"
          value={notifications}
          icon={Bell}
          color="danger"
        />

      </div>

      {/* ================= MAIN GRID ================= */}

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ================= LEFT SIDE ================= */}

        <div className="space-y-6 lg:col-span-2">

          {/* ================= ANALYTICS ================= */}

          <Card>
            <div className="flex items-center justify-between">

              <div>
                <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  Analytics Dashboard
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Platform analytics and current insights
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/admin/analytics')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-600 transition hover:bg-primary-50 dark:border-primary-800 dark:text-primary-400 dark:hover:bg-primary-950"
              >
                View Analytics
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>

            {/* Analytics summary */}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              {/* Total Appointments */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                    <CalendarCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total Appointments
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                      {totalAppointments}
                    </p>
                  </div>

                </div>

              </div>

              {/* Verified Doctors */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Verified Doctors
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                      {verifiedDoctors}
                    </p>
                  </div>

                </div>

              </div>

              {/* Pending Doctors */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pending Verification
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                      {pendingDoctors}
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </Card>

          {/* ================= RECENT ACTIVITY ================= */}

          <Card>

            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Activity className="h-5 w-5 text-primary-600" />
              Recent Activity
            </h3>

            <div className="space-y-3">

              {(data?.recentActivity || []).map((activity) => (

                <div
                  key={activity.id}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                >

                  <Clock className="h-4 w-4 text-gray-400" />

                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {activity.action}
                    </p>

                    <p className="text-xs text-gray-500">
                      {formatDateTime(activity.date)}
                    </p>
                  </div>

                </div>

              ))}

              {(data?.recentActivity || []).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent activity available.
                </p>
              )}

            </div>

          </Card>

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="space-y-6">

          {/* ================= NOTIFICATIONS ================= */}

          <Card>

            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Bell className="h-5 w-5 text-primary-600" />
              Notifications
            </h3>

            <div className="space-y-3">

              {(data?.notifications || []).map((notif) => (

                <div
                  key={notif.id}
                  className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                >

                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                      notif.read
                        ? 'bg-gray-300'
                        : 'bg-primary-500'
                    }`}
                  />

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {notif.message}
                  </p>

                </div>

              ))}

              {(data?.notifications || []).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications available.
                </p>
              )}

            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/notifications')}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              View All Notifications
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

          </Card>

          {/* ================= QUICK ACTIONS ================= */}

          <Card>

            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2">

              {(data?.quickActions || []).map((action) => (

                <button
                  key={action.id}
                  disabled={!action.enabled}
                  onClick={() => {

                    if (action.id === 1) {
                      navigate('/admin/user-management');
                    }

                    if (action.id === 2) {
                      navigate('/admin/analytics');
                    }

                    if (action.id === 3) {
                      navigate('/admin/settings');
                    }

                    if (action.id === 4) {
                      navigate('/admin/doctor-verification');
                    }

                  }}
                  className="rounded-lg border border-gray-200 p-3 text-center text-xs font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {action.label}
                </button>

              ))}

            </div>

          </Card>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;