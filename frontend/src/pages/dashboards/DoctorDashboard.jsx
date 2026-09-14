import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  FileText,
  Bell,
  Clock,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  dashboardService,
  appointmentService,
} from "../../services/authService";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import Avatar from "../../components/common/Avatar";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import { getRoleColor, getRoleLabel } from "../../utils/helpers";

const DoctorDashboard = () => {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);

  const fetchDashboard = async () => {
    setLoading(true);

    try {
      const dashboardRes = await dashboardService.getDoctorDashboard();
      setData(dashboardRes);

      const todayRes = await appointmentService.getUpcomingAppointments();
      const pendingRes = await appointmentService.getDoctorAppointments(
        "pending"
      );

      setTodayAppointments(todayRes || []);
      setPendingAppointments(pendingRes?.appointments || []);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await appointmentService.updateAppointmentStatus(id, status);
      await fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-hero !border-0 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Good day, Dr. {user?.lastName}!
            </h2>
            <p className="mt-1 text-white/80">
              Here's your practice overview for today.
            </p>
          </div>

          <Avatar
            firstName={user?.firstName}
            lastName={user?.lastName}
            size="xl"
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value={data?.stats?.todayAppointments ?? 0}
          icon={Calendar}
          color="primary"
        />

        <StatCard
          title="Total Patients"
          value={data?.stats?.totalPatients ?? 0}
          icon={Users}
          color="accent"
        />

        <StatCard
          title="Pending Appointments"
          value={data?.stats?.pendingAppointments ?? 0}
          icon={Clock}
          color="warning"
        />

        <StatCard
          title="Notifications"
          value={data?.stats?.notifications ?? 0}
          icon={Bell}
          color="danger"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Calendar className="h-5 w-5 text-primary-600" />
              Today's Schedule
            </h3>

            {todayAppointments.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No appointments today.
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {apt.patient?.firstName} {apt.patient?.lastName}
                        </p>

                        <p className="text-sm text-gray-500">
                          {apt.time} • {apt.reason}
                        </p>
                      </div>

                      <Badge>{apt.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Clock className="h-5 w-5 text-primary-600" />
              Pending Appointments
            </h3>

            {pendingAppointments.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No pending appointments.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {apt.patient?.firstName} {apt.patient?.lastName}
                        </p>

                        <p className="text-sm text-gray-500">
                          {new Date(apt.date).toLocaleDateString()} •{" "}
                          {apt.time}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Badge className={
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          apt.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                          apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>{apt.status}</Badge>
                        {apt.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateStatus(apt._id, "confirmed")}
                            >
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(apt._id, "rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {apt.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(apt._id, "scheduled")}
                          >
                            Schedule
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-primary-600" />
              Recent Patients
            </h3>

            {data?.recentPatients && data.recentPatients.length > 0 ? (
              <div className="space-y-3">
                {data.recentPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <Avatar
                      firstName={patient.firstName}
                      lastName={patient.lastName}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                Patient history will appear here as appointments are completed.
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Stethoscope className="h-5 w-5 text-primary-600" />
              Profile Summary
            </h3>

            <div className="flex items-center gap-3">
              <Avatar
                firstName={user?.firstName}
                lastName={user?.lastName}
                size="lg"
              />

              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Dr. {user?.firstName} {user?.lastName}
                </p>

                <p className="text-sm text-gray-500">{user?.email}</p>

                <Badge className={`mt-1 ${getRoleColor(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Bell className="h-5 w-5 text-primary-600" />
              Notifications
            </h3>

            <div className="space-y-3">
              {(data?.notifications || []).length === 0 ? (
                <p className="text-sm text-gray-500">
                  No new notifications.
                </p>
              ) : (
                data.notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                  >
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        notif.read ? "bg-gray-300" : "bg-primary-500"
                      }`}
                    />

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {notif.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {(data?.quickActions || []).map((action) => (
                <button
                  key={action.id}
                  disabled={!action.enabled}
                  className="rounded-lg border border-gray-200 p-3 text-center text-xs font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
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

export default DoctorDashboard;