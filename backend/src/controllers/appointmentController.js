const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");

// ================= CREATE APPOINTMENT =================
const createAppointment = asyncHandler(async (req, res) => {
  const { doctor, date, time, reason, notes, symptoms, priority } = req.body;
  const patientId = req.user._id;

  let doctorUserId;
  let doctorName = "";
  let hospital = "";
  let specialization = "";

  // Handle both Doctor._id and User._id from frontend
  // First try to find the doctor in Doctor model
  const doctorDoc = await Doctor.findById(doctor).populate("user");

  if (doctorDoc) {
    // Use the User._id from the Doctor model
    doctorUserId = doctorDoc.user?._id;

    if (!doctorUserId) {
      throw new ApiError(404, "Doctor user account not found");
    }

    doctorName =
      doctorDoc.name ||
      `${doctorDoc.user?.firstName || ""} ${
        doctorDoc.user?.lastName || ""
      }`.trim();

    hospital = doctorDoc.hospital || "Healthcare Center";
    specialization = doctorDoc.specialization || "General Physician";
  } else {
    // If not in Doctor model, check if it's a direct User._id
    const doctorUser = await User.findById(doctor);

    if (!doctorUser || doctorUser.role !== "doctor") {
      throw new ApiError(404, "Doctor not found");
    }

    doctorUserId = doctorUser._id;

    doctorName = `${doctorUser.firstName || ""} ${
      doctorUser.lastName || ""
    }`.trim();

    // Try to get additional info from Doctor model if User exists
    const doctorProfile = await Doctor.findOne({ user: doctorUserId });

    if (doctorProfile) {
      hospital = doctorProfile.hospital || "Healthcare Center";
      specialization =
        doctorProfile.specialization || "General Physician";
    } else {
      hospital = "Healthcare Center";
      specialization = "General Physician";
    }
  }

  const appointmentDate = new Date(`${date}T${time}`);

  if (appointmentDate <= new Date()) {
    throw new ApiError(
      400,
      "Appointment cannot be scheduled in the past"
    );
  }

  // Validate time format
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

  if (!timeRegex.test(time)) {
    throw new ApiError(
      400,
      "Invalid time format. Use HH:MM format"
    );
  }

  // Validate date format
  if (isNaN(appointmentDate.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }

  // Enhanced conflict detection with time range overlap
  const appointmentTime = time.split(":");
  const appointmentHour = parseInt(appointmentTime[0], 10);
  const appointmentMinute = parseInt(appointmentTime[1], 10);

  const appointmentStartMinutes =
    appointmentHour * 60 + appointmentMinute;

  const appointmentEndMinutes =
    appointmentStartMinutes + 30;

  // Create date range for the day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Check for doctor conflicts within the same day
  const doctorConflicts = await Appointment.find({
    doctor: doctorUserId,
    date: {
      $gte: dayStart,
      $lt: dayEnd,
    },
    status: {
      $in: ["pending", "scheduled", "confirmed"],
    },
  });

  for (const conflict of doctorConflicts) {
    const conflictTime = conflict.time.split(":");

    const conflictHour = parseInt(conflictTime[0], 10);
    const conflictMinute = parseInt(conflictTime[1], 10);

    const conflictStartMinutes =
      conflictHour * 60 + conflictMinute;

    const conflictEndMinutes =
      conflictStartMinutes + 30;

    // Check for time overlap
    if (
      appointmentStartMinutes < conflictEndMinutes &&
      appointmentEndMinutes > conflictStartMinutes
    ) {
      throw new ApiError(
        400,
        `Doctor already has an appointment at ${conflict.time}. Please choose a different time.`
      );
    }
  }

  // Check for patient conflicts within the same day
  const patientConflicts = await Appointment.find({
    patient: patientId,
    date: {
      $gte: dayStart,
      $lt: dayEnd,
    },
    status: {
      $in: ["pending", "scheduled", "confirmed"],
    },
  });

  for (const conflict of patientConflicts) {
    const conflictTime = conflict.time.split(":");

    const conflictHour = parseInt(conflictTime[0], 10);
    const conflictMinute = parseInt(conflictTime[1], 10);

    const conflictStartMinutes =
      conflictHour * 60 + conflictMinute;

    const conflictEndMinutes =
      conflictStartMinutes + 30;

    // Check for time overlap
    if (
      appointmentStartMinutes < conflictEndMinutes &&
      appointmentEndMinutes > conflictStartMinutes
    ) {
      throw new ApiError(
        400,
        `You already have an appointment at ${conflict.time}. Please choose a different time.`
      );
    }
  }

  // Additional check: exact same appointment
  const exactDuplicate = await Appointment.findOne({
    patient: patientId,
    doctor: doctorUserId,
    date: appointmentDate,
    time: time,
    status: {
      $in: ["pending", "scheduled", "confirmed"],
    },
  });

  if (exactDuplicate) {
    throw new ApiError(
      400,
      "You already have an identical appointment booked with this doctor at this time."
    );
  }

  const appointment = await Appointment.create({
    patient: patientId,
    doctor: doctorUserId,
    doctorName,
    hospital,
    specialization,
    date: appointmentDate,
    time,
    reason,
    notes,
    symptoms: symptoms || [],
    priority: priority || "medium",
    status: "pending",
  });

  await appointment.populate(
    "doctor",
    "firstName lastName email phone avatar"
  );

  await appointment.populate(
    "patient",
    "firstName lastName email phone"
  );

  // ================= NOTIFICATIONS =================
  try {
    // Notification for doctor
    const existingDoctorNotification =
      await Notification.findOne({
        recipient: doctorUserId,
        type: "appointment_booked",
        relatedAppointment: appointment._id,
      });

    if (!existingDoctorNotification) {
      await Notification.create({
        recipient: doctorUserId,
        type: "appointment_booked",
        title: "New Appointment Request",
        message: `You have a new appointment request from ${appointment.patient.firstName} ${appointment.patient.lastName}.`,
        relatedAppointment: appointment._id,
      });
    }

    // Notification for patient
    await Notification.create({
      recipient: patientId,
      type: "appointment_booked",
      title: "Appointment Request Sent",
      message: `Your appointment request with Dr. ${doctorName} has been sent successfully.`,
      relatedAppointment: appointment._id,
    });

    // ================= ADMIN NOTIFICATION =================
    const adminUsers = await User.find({
      role: "admin",
      isActive: true,
    }).select("_id");

    const patientName =
      `${appointment.patient.firstName || ""} ${
        appointment.patient.lastName || ""
      }`.trim() || "A patient";

    const formattedDate =
      appointment.date instanceof Date
        ? appointment.date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : date;

    for (const admin of adminUsers) {
      await Notification.create({
        recipient: admin._id,
        type: "appointment_booked",
        title: "New Appointment Booked",
        message: `${patientName} booked an appointment with Dr. ${doctorName} for ${formattedDate} at ${appointment.time}.`,
        relatedAppointment: appointment._id,
      });
    }
  } catch (notificationError) {
    console.error(
      "Failed to create notification:",
      notificationError
    );
    // Don't fail the appointment if notification fails
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        appointment,
        "Appointment booked successfully"
      )
    );
});

// ================= PATIENT APPOINTMENTS =================
const getPatientAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  let status = req.query.status;

  if (typeof status === "object" && status !== null) {
    status = status.status;
  }

  // Resource-level authorization: patients can only see their own appointments
  const query = {
    patient: req.user._id,
  };

  if (typeof status === "string" && status.trim()) {
    query.status = status.trim();
  }

  const skip =
    (Number(page) - 1) * Number(limit);

  const appointments = await Appointment.find(query)
    .populate(
      "doctor",
      "firstName lastName email phone avatar"
    )
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total =
    await Appointment.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        appointments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
      },
      "Appointments fetched successfully"
    )
  );
});

// ================= DOCTOR APPOINTMENTS =================
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  let status = req.query.status;

  if (typeof status === "object" && status !== null) {
    status = status.status;
  }

  // Resource-level authorization: doctors can only see their own appointments
  const query = {
    doctor: req.user._id,
  };

  if (typeof status === "string" && status.trim()) {
    query.status = status.trim();
  }

  const skip =
    (Number(page) - 1) * Number(limit);

  const appointments = await Appointment.find(query)
    .populate(
      "patient",
      "firstName lastName email phone dateOfBirth bloodGroup"
    )
    .sort({ date: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total =
    await Appointment.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        appointments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
      },
      "Appointments fetched successfully"
    )
  );
});

// ================= SINGLE APPOINTMENT =================
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate(
      "doctor",
      "firstName lastName email phone avatar"
    )
    .populate(
      "patient",
      "firstName lastName email phone dateOfBirth bloodGroup"
    );

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  if (
    req.user.role === "patient" &&
    appointment.patient._id.toString() !==
      req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  if (
    req.user.role === "doctor" &&
    appointment.doctor._id.toString() !==
      req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointment,
        "Appointment fetched"
      )
    );
});

// ================= UPDATE APPOINTMENT =================
const updateAppointment = asyncHandler(async (req, res) => {
  const {
    date,
    time,
    reason,
    notes,
    symptoms,
    priority,
  } = req.body;

  const appointment = await Appointment.findById(
    req.params.id
  );

  if (!appointment) {
    throw new ApiError(
      404,
      "Appointment not found"
    );
  }

  if (
    req.user.role === "patient" &&
    appointment.patient.toString() !==
      req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  if (
    req.user.role === "doctor" &&
    appointment.doctor.toString() !==
      req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  if (
    !["pending", "scheduled"].includes(
      appointment.status
    )
  ) {
    throw new ApiError(
      400,
      "Only pending or scheduled appointments can be rescheduled"
    );
  }

  if (date && time) {
    const newDate = new Date(`${date}T${time}`);

    if (newDate <= new Date()) {
      throw new ApiError(
        400,
        "Appointment cannot be scheduled in the past"
      );
    }

    const clash = await Appointment.findOne({
      doctor: appointment.doctor,
      date: newDate,
      status: {
        $in: ["pending", "scheduled"],
      },
      _id: {
        $ne: appointment._id,
      },
    });

    if (clash) {
      throw new ApiError(
        400,
        "Doctor already has an appointment"
      );
    }

    appointment.date = newDate;
    appointment.time = time;
  }

  if (reason) {
    appointment.reason = reason;
  }

  if (notes !== undefined) {
    appointment.notes = notes;
  }

  if (symptoms) {
    appointment.symptoms = symptoms;
  }

  if (priority) {
    appointment.priority = priority;
  }

  await appointment.save();

  await appointment.populate(
    "doctor",
    "firstName lastName email phone avatar"
  );

  await appointment.populate(
    "patient",
    "firstName lastName email phone"
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointment,
        "Appointment updated"
      )
    );
});

// ================= UPDATE STATUS =================
const updateAppointmentStatus = asyncHandler(
  async (req, res) => {
    // Handle both { status: "value" } and
    // { status: { status: "value" } } formats
    let status = req.body.status;

    if (
      typeof status === "object" &&
      status !== null
    ) {
      status = status.status;
    }

    if (!status || typeof status !== "string") {
      throw new ApiError(
        400,
        "Status is required and must be a string"
      );
    }

    const appointment =
      await Appointment.findById(req.params.id);

    if (!appointment) {
      throw new ApiError(
        404,
        "Appointment not found"
      );
    }

    if (
      req.user.role === "doctor" &&
      appointment.doctor.toString() !==
        req.user._id.toString()
    ) {
      throw new ApiError(
        403,
        "Not authorized"
      );
    }

    const allowedTransitions = {
      pending: ["confirmed", "rejected"],
      confirmed: ["scheduled", "rejected"],
      scheduled: [
        "completed",
        "cancelled",
        "no-show",
      ],
      completed: [],
      cancelled: [],
      rejected: [],
      "no-show": [],
    };

    if (
      !allowedTransitions[appointment.status] ||
      !allowedTransitions[
        appointment.status
      ].includes(status)
    ) {
      throw new ApiError(
        400,
        `Invalid status transition from ${appointment.status} to ${status}`
      );
    }

    await appointment.populate(
      "doctor",
      "firstName lastName email phone avatar"
    );

    await appointment.populate(
      "patient",
      "firstName lastName email phone"
    );

    const oldStatus = appointment.status;

    appointment.status = status;

    await appointment.save();

    // ================= NOTIFICATIONS =================
    try {
      if (oldStatus !== status) {
        const doctorName =
          `${appointment.doctor.firstName || ""} ${
            appointment.doctor.lastName || ""
          }`.trim() || "Doctor";

        const patientName =
          `${appointment.patient.firstName || ""} ${
            appointment.patient.lastName || ""
          }`.trim() || "Patient";

        // -------- PATIENT NOTIFICATIONS --------

        if (status === "confirmed") {
          await Notification.create({
            recipient: appointment.patient._id,
            type: "appointment_accepted",
            title: "Appointment Confirmed",
            message: `Your appointment with Dr. ${doctorName} has been confirmed.`,
            relatedAppointment: appointment._id,
          });
        }

        if (status === "scheduled") {
          await Notification.create({
            recipient: appointment.patient._id,
            type: "appointment_accepted",
            title: "Appointment Scheduled",
            message: `Your appointment with Dr. ${doctorName} has been scheduled.`,
            relatedAppointment: appointment._id,
          });
        }

        if (status === "rejected") {
          await Notification.create({
            recipient: appointment.patient._id,
            type: "appointment_rejected",
            title: "Appointment Rejected",
            message: `Your appointment with Dr. ${doctorName} has been rejected.`,
            relatedAppointment: appointment._id,
          });
        }

        if (status === "completed") {
          await Notification.create({
            recipient: appointment.patient._id,
            type: "appointment_completed",
            title: "Appointment Completed",
            message: `Your appointment with Dr. ${doctorName} has been completed.`,
            relatedAppointment: appointment._id,
          });
        }

        if (
          status === "cancelled" &&
          req.user.role === "doctor"
        ) {
          await Notification.create({
            recipient: appointment.patient._id,
            type: "appointment_cancelled",
            title: "Appointment Cancelled",
            message: `Your appointment with Dr. ${doctorName} has been cancelled by the doctor.`,
            relatedAppointment: appointment._id,
          });
        }

        // -------- ADMIN NOTIFICATION --------

        let adminTitle = "";
        let adminMessage = "";

        if (status === "confirmed") {
          adminTitle = "Appointment Confirmed";
          adminMessage = `Dr. ${doctorName} confirmed the appointment with ${patientName}.`;
        }

        if (status === "scheduled") {
          adminTitle = "Appointment Scheduled";
          adminMessage = `The appointment between Dr. ${doctorName} and ${patientName} has been scheduled.`;
        }

        if (status === "rejected") {
          adminTitle = "Appointment Rejected";
          adminMessage = `Dr. ${doctorName} rejected the appointment request from ${patientName}.`;
        }

        if (status === "completed") {
          adminTitle = "Appointment Completed";
          adminMessage = `The appointment between Dr. ${doctorName} and ${patientName} has been completed.`;
        }

        if (
          status === "cancelled" &&
          req.user.role === "doctor"
        ) {
          adminTitle = "Appointment Cancelled";
          adminMessage = `Dr. ${doctorName} cancelled the appointment with ${patientName}.`;
        }

        if (
          adminTitle &&
          adminMessage
        ) {
          const adminUsers = await User.find({
            role: "admin",
            isActive: true,
          }).select("_id");

          for (const admin of adminUsers) {
            await Notification.create({
              recipient: admin._id,
              type:
                status === "confirmed"
                  ? "appointment_accepted"
                  : status === "rejected"
                  ? "appointment_rejected"
                  : status === "completed"
                  ? "appointment_completed"
                  : "appointment_cancelled",
              title: adminTitle,
              message: adminMessage,
              relatedAppointment:
                appointment._id,
            });
          }
        }
      }
    } catch (error) {
      console.error(
        "Failed to create status notification:",
        error.message
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          appointment,
          "Status updated"
        )
      );
  }
);

// ================= CANCEL =================
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment =
    await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError(
      404,
      "Appointment not found"
    );
  }

  if (
    appointment.patient.toString() !==
    req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "Not authorized"
    );
  }

  if (
    !["pending", "scheduled"].includes(
      appointment.status
    )
  ) {
    throw new ApiError(
      400,
      "Only pending or scheduled appointments can be cancelled"
    );
  }

  appointment.status = "cancelled";

  await appointment.save();

  await appointment.populate(
    "patient",
    "firstName lastName"
  );

  // ================= NOTIFICATIONS =================
  try {
    // Notification for doctor
    await Notification.create({
      recipient: appointment.doctor,
      type: "appointment_cancelled",
      title: "Appointment Cancelled",
      message: `Appointment with ${appointment.patient.firstName} ${appointment.patient.lastName} has been cancelled.`,
      relatedAppointment: appointment._id,
    });

    // Notification for patient
    await Notification.create({
      recipient: appointment.patient,
      type: "appointment_cancelled",
      title: "Appointment Cancelled",
      message: "Your appointment has been cancelled successfully.",
      relatedAppointment: appointment._id,
    });

    // ================= ADMIN NOTIFICATION =================
    const adminUsers = await User.find({
      role: "admin",
      isActive: true,
    }).select("_id");

    const patientName =
      `${appointment.patient.firstName || ""} ${
        appointment.patient.lastName || ""
      }`.trim() || "Patient";

    for (const admin of adminUsers) {
      await Notification.create({
        recipient: admin._id,
        type: "appointment_cancelled",
        title: "Appointment Cancelled",
        message: `${patientName} cancelled an appointment with the doctor.`,
        relatedAppointment: appointment._id,
      });
    }
  } catch (error) {
    console.error(
      "Failed to create cancellation notification:",
      error.message
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointment,
        "Appointment cancelled"
      )
    );
});

// ================= UPCOMING =================
const getUpcomingAppointments = asyncHandler(
  async (req, res) => {
    const query = {
      date: {
        $gte: new Date(),
      },
      status: {
        $in: [
          "pending",
          "confirmed",
          "scheduled",
        ],
      },
    };

    if (req.user.role === "patient") {
      query.patient = req.user._id;
    }

    if (req.user.role === "doctor") {
      query.doctor = req.user._id;
    }

    const appointments =
      await Appointment.find(query)
        .populate(
          "doctor",
          "firstName lastName email phone avatar"
        )
        .populate(
          "patient",
          "firstName lastName email phone"
        )
        .sort({ date: 1 })
        .limit(5);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          appointments,
          "Upcoming appointments fetched"
        )
      );
  }
);

module.exports = {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getUpcomingAppointments,
};