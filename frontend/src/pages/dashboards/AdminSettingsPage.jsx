import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserCog,
} from "lucide-react";
import { changeAdminPassword } from "../../services/adminService";

const AdminSettingsPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Please fill all password fields.");
      return;
    }

    if (formData.currentPassword.length < 1) {
      setError("Current password is required.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (formData.newPassword.length > 128) {
      setError(
        "New password is too long. Maximum 128 characters allowed."
      );
      return;
    }

    if (formData.newPassword === formData.currentPassword) {
      setError(
        "New password must be different from current password."
      );
      return;
    }

    if (!/[A-Z]/.test(formData.newPassword)) {
      setError(
        "New password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[a-z]/.test(formData.newPassword)) {
      setError(
        "New password must contain at least one lowercase letter."
      );
      return;
    }

    if (!/[0-9]/.test(formData.newPassword)) {
      setError(
        "New password must contain at least one number."
      );
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await changeAdminPassword(formData);

      setMessage(
        response?.message ||
          "Admin password changed successfully."
      );

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error(
        "Failed to change admin password:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to change password. Please check your current password and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    name,
    value,
    placeholder,
    show,
    setShow,
  }) => {
    return (
      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-700 bg-[#0b1b3a] py-3.5 pl-11 pr-12 text-sm text-white placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />

        <button
          type="button"
          onClick={() =>
            setShow((prev) => !prev)
          }
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-700/60 hover:text-white"
          aria-label={
            show
              ? "Hide password"
              : "Show password"
          }
        >
          {show ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    );
  };

  const password = formData.newPassword;

  const passwordRules = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number",
      valid: /[0-9]/.test(password),
    },
  ];

  return (
    <div className="min-h-full space-y-6 bg-[#07152f] p-4 text-white sm:p-6 lg:p-8">

      {/* ================= HEADER ================= */}
      <div className="rounded-2xl border border-blue-900/50 bg-gradient-to-r from-[#0c2148] via-[#0a1b3d] to-[#08162f] p-6 shadow-xl shadow-blue-950/20 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10">
              <UserCog className="h-7 w-7 text-blue-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Settings
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Manage your admin account and security settings.
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            Admin Account Secure
          </div>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

        {/* ================= SECURITY CARD ================= */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0a1936] shadow-xl shadow-black/20">

          {/* Card Header */}
          <div className="border-b border-slate-800 bg-[#0c1d3d] px-6 py-5 sm:px-7">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                <KeyRound className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Change Password
                </h2>

                <p className="mt-0.5 text-sm text-slate-400">
                  Update your administrator account password.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 sm:p-7"
          >

            {/* Current Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Current Password
              </label>

              <PasswordInput
                name="currentPassword"
                value={formData.currentPassword}
                placeholder="Enter your current password"
                show={showCurrent}
                setShow={setShowCurrent}
              />
            </div>

            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                New Password
              </label>

              <PasswordInput
                name="newPassword"
                value={formData.newPassword}
                placeholder="Enter your new password"
                show={showNew}
                setShow={setShowNew}
              />

              {/* Password Requirements */}
              <div className="mt-4 rounded-xl border border-slate-800 bg-[#07152f] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Password requirements
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {passwordRules.map((rule) => (
                    <div
                      key={rule.label}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
                        rule.valid
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-800/60 text-slate-500"
                      }`}
                    >
                      {rule.valid ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <div className="h-4 w-4 shrink-0 rounded-full border border-slate-600" />
                      )}

                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Confirm New Password
              </label>

              <PasswordInput
                name="confirmPassword"
                value={formData.confirmPassword}
                placeholder="Confirm your new password"
                show={showConfirm}
                setShow={setShowConfirm}
              />

              {formData.confirmPassword &&
                formData.newPassword ===
                  formData.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Passwords match
                  </div>
                )}
            </div>

            {/* Success Message */}
            {message && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3.5 text-sm text-emerald-400">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="font-medium">
                    Password updated successfully
                  </p>

                  <p className="mt-0.5 text-xs text-emerald-400/70">
                    Your admin account password has been changed.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-sm text-red-400">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="font-medium">
                    Password update failed
                  </p>

                  <p className="mt-0.5 text-xs text-red-400/80">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Button */}
            <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Make sure you remember your new password.
              </p>

              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.currentPassword ||
                  !formData.newPassword ||
                  !formData.confirmPassword
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />

                {loading
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= SECURITY INFO ================= */}
        <div className="space-y-6">

          {/* Security Status */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a1936] p-6 shadow-xl shadow-black/20">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Security Status
                </h3>

                <p className="text-xs text-slate-500">
                  Admin account protection
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/40" />

                <span className="text-sm font-medium text-emerald-400">
                  Account Protected
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Your administrator account is protected with
                password-based authentication.
              </p>
            </div>
          </div>

          {/* Security Tips */}
          <div className="rounded-2xl border border-blue-900/50 bg-gradient-to-br from-[#0c2148] to-[#091833] p-6 shadow-xl shadow-blue-950/20">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Security Tips
                </h3>

                <ul className="mt-3 space-y-3 text-xs leading-5 text-slate-400">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    Use a unique password for your admin account.
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    Never share your administrator password.
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    Use a combination of uppercase, lowercase and numbers.
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    Avoid reusing passwords from other accounts.
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;