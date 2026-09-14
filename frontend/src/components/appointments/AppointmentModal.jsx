import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, X } from "lucide-react";

import { appointmentService } from "../../services/authService";
import Button from "../common/Button";
import { useToast } from "../../hooks/useToast";

const generateTimeSlots = () => {
  const slots = [];
  const start = 9 * 60;
  const end = 17 * 60 + 45;

  for (let m = start; m <= end; m += 15) {
    const h = Math.floor(m / 60);
    const min = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
  }

  return slots;
};

const AppointmentModal = ({ isOpen, onClose, doctor }) => {
  const toast = useToast();

  const { register, handleSubmit, reset } = useForm();

  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setTimeSlots(generateTimeSlots());
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    setLoading(true);

    // CRITICAL: For registered doctors, always use the User._id from the user field
    // The backend expects doctor.user._id (User._id), not Doctor._id
    const doctorUserId = doctor?.user?._id;

    if (!doctorUserId || doctorUserId.length !== 24) {
      toast.error("Invalid doctor ID. Online booking is available only for registered doctors.");
      setLoading(false);
      return;
    }

    // Ensure we're using a valid MongoDB ObjectId
    if (doctor.source === 'external' || doctor.source === 'google') {
      toast.error("Online booking is available only for registered doctors.");
      setLoading(false);
      return;
    }

    const payload = {
      doctor: doctorUserId, // Send User._id, not Doctor._id
      date: data.date,
      time: data.time,
      reason: data.reason,
      notes: data.notes || "",
    };

    try {
      await appointmentService.createAppointment(payload);

      toast.success("Appointment booked successfully");

      reset();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to book appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Book Appointment
          </h2>

          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>

            <input
              type="date"
              {...register("date", { required: true })}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Time</label>

            <select
              {...register("time", { required: true })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select slot</option>

              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Reason</label>

            <input
              type="text"
              {...register("reason", { required: true })}
              placeholder="Reason for appointment"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Notes (Optional)
            </label>

            <textarea
              rows={3}
              {...register("notes")}
              placeholder="Additional information"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-black dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Book
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;