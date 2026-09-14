import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

import {
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from '../../services/adminService';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await getAdminNotifications({
        page: 1,
        limit: 50,
      });

      const data = response?.data || response;

      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch admin notifications:', err);

      setError(
        err?.response?.data?.message ||
          'Failed to load notifications'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAdminNotificationAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId
            ? {
                ...notif,
                read: true,
                readAt: new Date(),
              }
            : notif
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(
        'Failed to mark notification as read:',
        err
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAdminNotificationsAsRead();

      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          read: true,
          readAt: new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        'Failed to mark all notifications as read:',
        err
      );
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatDate = (date) => {
    if (!date) return '';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNotificationIcon = (notification) => {
    const type = String(
      notification?.type || ''
    ).toLowerCase();

    if (type.includes('appointment')) {
      return <Calendar className="h-5 w-5" />;
    }

    if (type.includes('prescription')) {
      return <FileText className="h-5 w-5" />;
    }

    if (type.includes('doctor')) {
      return <CheckCircle className="h-5 w-5" />;
    }

    return <Bell className="h-5 w-5" />;
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-[500px] rounded-2xl bg-[#07152f] p-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
            <Bell className="h-7 w-7 animate-pulse text-blue-400" />
          </div>

          <p className="text-sm font-medium text-slate-300">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error) {
    return (
      <div className="min-h-[500px] rounded-2xl bg-[#07152f] p-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">

          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>

          <h2 className="text-lg font-semibold text-white">
            Unable to Load Notifications
          </h2>

          <p className="mt-2 max-w-md text-sm text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() => fetchNotifications()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 rounded-2xl bg-[#07152f] p-5 text-white sm:p-6 lg:p-8">

      {/* ================= HEADER ================= */}

      <div className="rounded-2xl border border-blue-900/50 bg-gradient-to-br from-[#0b1f45] via-[#0a1b3b] to-[#08162f] p-6 shadow-xl shadow-blue-950/20">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-400/20">
              <Bell className="h-7 w-7 text-blue-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Stay updated with important system notifications.
              </p>
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-800/60 bg-blue-950/40 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:border-blue-600 hover:bg-blue-900/40 hover:text-white"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </button>
            )}

            <div className="inline-flex items-center gap-2 rounded-lg border border-blue-800/50 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300">
              <Bell className="h-4 w-4" />
              {unreadCount} unread
            </div>

          </div>

        </div>

      </div>

      {/* ================= SUMMARY BAR ================= */}

      <div className="grid gap-4 sm:grid-cols-2">

        <div className="rounded-xl border border-blue-900/50 bg-[#0a1b3b] p-5">
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Notifications
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {notifications.length}
              </p>
            </div>

          </div>
        </div>

        <div className="rounded-xl border border-blue-900/50 bg-[#0a1b3b] p-5">
          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Unread Notifications
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {unreadCount}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* ================= NOTIFICATION LIST ================= */}

      <div className="overflow-hidden rounded-2xl border border-blue-900/50 bg-[#0a1b3b] shadow-xl shadow-blue-950/20">

        <div className="border-b border-blue-900/50 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-white">
            Recent Notifications
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            System updates and important healthcare platform activity.
          </p>
        </div>

        {notifications.length === 0 ? (

          /* ================= EMPTY STATE ================= */

          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
              <Bell className="h-8 w-8 text-slate-500" />
            </div>

            <h2 className="text-lg font-semibold text-white">
              No notifications
            </h2>

            <p className="mt-2 max-w-sm text-sm text-slate-500">
              You don't have any notifications right now.
            </p>

          </div>

        ) : (

          /* ================= NOTIFICATION ITEMS ================= */

          <div className="divide-y divide-blue-900/40">

            {notifications.map((notification) => (

              <div
                key={notification._id}
                onClick={() =>
                  !notification.read &&
                  handleMarkAsRead(notification._id)
                }
                className={`group flex gap-4 p-5 transition sm:p-6 ${
                  notification.read
                    ? 'bg-[#0a1b3b] hover:bg-[#0d2248]'
                    : 'bg-blue-950/40 hover:bg-blue-900/30'
                } ${
                  !notification.read
                    ? 'cursor-pointer'
                    : ''
                }`}
              >

                {/* ICON */}

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    notification.read
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20'
                  }`}
                >
                  {getNotificationIcon(notification)}
                </div>

                {/* CONTENT */}

                <div className="min-w-0 flex-1">

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <h3
                          className={`text-sm sm:text-base ${
                            notification.read
                              ? 'font-medium text-slate-300'
                              : 'font-semibold text-white'
                          }`}
                        >
                          {notification.title || 'Notification'}
                        </h3>

                        {!notification.read && (
                          <span className="inline-flex shrink-0 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-400 ring-1 ring-blue-500/20">
                            New
                          </span>
                        )}

                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {notification.message ||
                          notification.description ||
                          'You have a new notification.'}
                      </p>

                    </div>

                  </div>

                  {/* DATE */}

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(notification.createdAt)}
                  </div>

                </div>

                {/* UNREAD INDICATOR */}

                {!notification.read && (
                  <div className="mt-2 hidden h-2.5 w-2.5 shrink-0 rounded-full bg-blue-400 shadow-lg shadow-blue-500/40 sm:block" />
                )}

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ================= REFRESH ================= */}

      {notifications.length > 0 && (
        <div className="flex justify-center">

          <button
            type="button"
            onClick={() => fetchNotifications(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-800/60 bg-[#0a1b3b] px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-600 hover:bg-blue-900/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? 'animate-spin' : ''
              }`}
            />

            {refreshing
              ? 'Refreshing...'
              : 'Refresh Notifications'}
          </button>

        </div>
      )}

    </div>
  );
};

export default AdminNotificationsPage;