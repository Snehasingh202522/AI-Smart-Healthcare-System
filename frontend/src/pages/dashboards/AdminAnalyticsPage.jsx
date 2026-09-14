import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { getAdminAnalytics } from '../../services/adminService';
import {
  Users,
  Stethoscope,
  Calendar,
  TrendingUp,
  Activity,
  UserCheck,
} from 'lucide-react';

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getAdminAnalytics();

        setAnalytics(response?.data || response);
      } catch (err) {
        console.error('Failed to fetch admin analytics:', err);
        setError(
          err?.response?.data?.message ||
            'Failed to load analytics'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-gray-600">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-600">
        No analytics data available.
      </div>
    );
  }

  const users = analytics.users || {};
  const doctors = analytics.doctors || {};
  const appointments = analytics.appointments || {};
  const monthlyAppointments = analytics.monthlyAppointments || [];

  const appointmentStatusData = [
    {
      name: 'Pending',
      value: appointments.pending || 0,
      color: '#f59e0b',
    },
    {
      name: 'Confirmed',
      value: appointments.confirmed || 0,
      color: '#8b5cf6',
    },
    {
      name: 'Scheduled',
      value: appointments.scheduled || 0,
      color: '#3b82f6',
    },
    {
      name: 'Completed',
      value: appointments.completed || 0,
      color: '#10b981',
    },
    {
      name: 'Cancelled',
      value: appointments.cancelled || 0,
      color: '#ef4444',
    },
    {
      name: 'Rejected',
      value: appointments.rejected || 0,
      color: '#6b7280',
    },
    {
      name: 'No Show',
      value: appointments.noShow || 0,
      color: '#f97316',
    },
  ];

  const userData = [
    {
      name: 'Patients',
      value: users.patients || 0,
      color: '#3b82f6',
    },
    {
      name: 'Doctors',
      value: users.doctors || 0,
      color: '#10b981',
    },
    {
      name: 'Admins',
      value: users.admins || 0,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Activity className="h-8 w-8 text-blue-600" />
            Analytics Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comprehensive overview of platform performance and user activity
          </p>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Total Users</p>
              <h2 className="mt-2 text-3xl font-bold">
                {users.total || 0}
              </h2>
            </div>
            <Users className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100">Total Patients</p>
              <h2 className="mt-2 text-3xl font-bold">
                {users.patients || 0}
              </h2>
            </div>
            <UserCheck className="h-8 w-8 text-emerald-200" />
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">Total Doctors</p>
              <h2 className="mt-2 text-3xl font-bold">
                {doctors.total || 0}
              </h2>
              <p className="mt-1 text-xs text-purple-200">
                {doctors.verified || 0} verified · {doctors.pending || 0} pending
              </p>
            </div>
            <Stethoscope className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-100">Total Appointments</p>
              <h2 className="mt-2 text-3xl font-bold">
                {appointments.total || 0}
              </h2>
            </div>
            <Calendar className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Appointment Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Calendar className="h-5 w-5 text-blue-600" />
              Appointment Overview
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Current appointment status distribution
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="h-4 w-4" />
            <span>Total: {appointments.total || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Pending
            </p>
            <p className="mt-1 text-xl font-bold text-amber-900 dark:text-amber-100">
              {appointments.pending || 0}
            </p>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-center dark:border-purple-800 dark:bg-purple-900/20">
            <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
              Confirmed
            </p>
            <p className="mt-1 text-xl font-bold text-purple-900 dark:text-purple-100">
              {appointments.confirmed || 0}
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Scheduled
            </p>
            <p className="mt-1 text-xl font-bold text-blue-900 dark:text-blue-100">
              {appointments.scheduled || 0}
            </p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center dark:border-emerald-800 dark:bg-emerald-900/20">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Completed
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-900 dark:text-emerald-100">
              {appointments.completed || 0}
            </p>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
            <p className="text-xs font-medium text-red-700 dark:text-red-300">
              Cancelled
            </p>
            <p className="mt-1 text-xl font-bold text-red-900 dark:text-red-100">
              {appointments.cancelled || 0}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-600 dark:bg-gray-700/50">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Rejected
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
              {appointments.rejected || 0}
            </p>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center dark:border-orange-800 dark:bg-orange-900/20">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
              No Show
            </p>
            <p className="mt-1 text-xl font-bold text-orange-900 dark:text-orange-100">
              {appointments.noShow || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Appointments */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Monthly Appointments
          </h2>

          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            Appointments during the last 6 months
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAppointments}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />

                <YAxis
                  allowDecimals={false}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e3a5f',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />

                <Bar
                  dataKey="count"
                  name="Appointments"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Users className="h-5 w-5 text-blue-600" />
            User Distribution
          </h2>

          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
            Users by role
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {userData.map((entry, index) => (
                    <Cell
                      key={`user-cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e3a5f',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Appointment Status Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
          <Calendar className="h-5 w-5 text-blue-600" />
          Appointment Status Distribution
        </h2>

        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Distribution of all appointment statuses
        </p>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={appointmentStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {appointmentStatusData.map((entry, index) => (
                  <Cell
                    key={`status-cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e3a5f',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;