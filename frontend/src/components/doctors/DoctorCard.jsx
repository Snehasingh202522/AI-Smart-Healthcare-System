import React, { useState } from "react";
import {
  MapPin,
  Star,
  Briefcase,
  Building2,
  IndianRupee,
  Navigation,
  Phone,
  CheckCircle,
} from "lucide-react";

import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Card from "../common/Card";
import Button from "../common/Button";
import AppointmentModal from "../appointments/AppointmentModal";
import { useAuth } from "../../context/AuthContext";

const DoctorCard = ({
  doctor = {},
  onSelect,
  isSelected,
}) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // =========================================================
  // DOCTOR NAME
  // =========================================================

  const getDoctorName = () => {
    const directName =
      doctor.name ||
      doctor.doctorName ||
      doctor.fullName;

    if (
      typeof directName === "string" &&
      directName.trim()
    ) {
      const cleanName = directName.trim();

      return cleanName.startsWith("Dr.")
        ? cleanName
        : `Dr. ${cleanName}`;
    }

    const firstName =
      doctor.user?.firstName ||
      doctor.firstName ||
      "";

    const lastName =
      doctor.user?.lastName ||
      doctor.lastName ||
      "";

    const combinedName =
      `${firstName} ${lastName}`.trim();

    if (combinedName) {
      return combinedName.startsWith("Dr.")
        ? combinedName
        : `Dr. ${combinedName}`;
    }

    if (doctor.hospital) {
      return `Healthcare Center`;
    }

    return "Doctor";
  };

  const doctorName = getDoctorName();

  const cleanName = doctorName
    .replace(/^Dr\.\s*/i, "")
    .trim();

  const nameParts = cleanName.split(" ");

  const firstName =
    nameParts[0] || "Doctor";

  const lastName =
    nameParts.slice(1).join(" ") || "";

  // =========================================================
  // RATING
  // =========================================================

  const rating =
    typeof doctor.rating === "object"
      ? Number(doctor.rating?.average || 0)
      : Number(doctor.rating || 0);

  // =========================================================
  // REGISTERED DOCTOR / EXTERNAL CENTER
  // =========================================================

  const isRegistered =
    doctor.source === "registered";

  // =========================================================
  // AVAILABILITY
  // =========================================================
  //
  // Registered doctors:
  // - Only show Closed when backend explicitly says false.
  // - Missing isOpen means Available.
  //
  // External centers:
  // - Show Open/Closed only when backend gives isOpen.
  // - Otherwise show Nearby.
  // =========================================================

  const hasOpenStatus =
    typeof doctor.isOpen === "boolean";

  let statusText = "Nearby";
  let statusClass =
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";

  if (isRegistered) {
    if (
      hasOpenStatus &&
      doctor.isOpen === false
    ) {
      statusText = "Closed";

      statusClass =
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    } else {
      statusText = "Available";

      statusClass =
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
  } else if (hasOpenStatus) {
    if (doctor.isOpen) {
      statusText = "Open";

      statusClass =
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    } else {
      statusText = "Closed";

      statusClass =
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
  }

  // =========================================================
  // BOOKING
  // =========================================================

  const canBook =
    isRegistered &&
    Boolean(
      doctor._id ||
        doctor.id ||
        doctor.user?._id
    );

  const handleBook = (e) => {
    e.stopPropagation();

    if (canBook) {
      setModalOpen(true);
    }
  };

  // =========================================================
  // DIRECTIONS
  // =========================================================

  const handleDirections = (e) => {
    e.stopPropagation();

    const query = encodeURIComponent(
      doctor.hospital ||
        doctor.name ||
        doctor.doctorName ||
        doctorName
    );

    window.open(
      `https://www.google.com/maps/search/${query}`,
      "_blank"
    );
  };

  // =========================================================
  // CALL
  // =========================================================

  const handleCall = (e) => {
    e.stopPropagation();

    if (doctor.phone) {
      window.open(`tel:${doctor.phone}`);
    }
  };

  return (
    <>
      <Card
        hover
        onClick={() => onSelect?.(doctor)}
        className={`
          cursor-pointer overflow-hidden
          transition-all duration-200
          ${
            isSelected
              ? "border-primary-500 ring-2 ring-primary-500/20"
              : ""
          }
        `}
      >
        <div className="flex gap-4">
          {/* =================================================
              AVATAR
          ================================================= */}

          <Avatar
            firstName={firstName}
            lastName={lastName}
            src={doctor.photo}
            size="lg"
          />

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="min-w-0 flex-1">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {/* DOCTOR NAME */}

                <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                  {doctorName}
                </h3>

                {/* SPECIALIZATION */}

                <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
                  {doctor.specialization ||
                    (isRegistered
                      ? "General Physician"
                      : "Healthcare Center")}
                </p>
              </div>

              {/* STATUS */}

              <Badge className={statusClass}>
                {isRegistered &&
                  doctor.isVerified && (
                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  )}

                {statusText}
              </Badge>
            </div>

            {/* =================================================
                DETAILS
            ================================================= */}

            <div className="mt-3 grid gap-2 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
              {/* HOSPITAL */}

              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 shrink-0" />

                <span className="truncate">
                  {doctor.hospital ||
                    doctor.address ||
                    "Healthcare Center"}
                </span>
              </div>

              {/* RATING */}

              {rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-500" />

                  <span>
                    {rating.toFixed(1)} / 5
                  </span>
                </div>
              )}

              {/* EXPERIENCE */}

              {doctor.experience &&
                Number(doctor.experience) > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 shrink-0" />

                    <span>
                      {doctor.experience} years exp.
                    </span>
                  </div>
                )}

              {/* CONSULTATION FEE */}

              {doctor.consultationFee !==
                undefined &&
                doctor.consultationFee !==
                  null && (
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-4 w-4 shrink-0" />

                    <span>
                      ₹{doctor.consultationFee}
                    </span>
                  </div>
                )}

              {/* DISTANCE */}

              <div className="flex items-center gap-1.5">
                <Navigation className="h-4 w-4 shrink-0" />

                <span>
                  {doctor.distance !==
                    undefined &&
                  doctor.distance !== null
                    ? `${Number(
                        doctor.distance
                      ).toFixed(1)} km away`
                    : "Nearby"}
                </span>
              </div>

              {/* CITY */}

              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0" />

                <span>
                  {doctor.city ||
                    doctor.location?.city ||
                    "Meerut"}
                </span>
              </div>
            </div>

            {/* =================================================
                PATIENT ACTIONS
            ================================================= */}

            {user &&
              user.role === "patient" && (
                <>
                  {/* BOOK APPOINTMENT */}

                  {canBook && (
                    <div className="mt-4">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={handleBook}
                      >
                        Book Appointment
                      </Button>
                    </div>
                  )}

                  {/* CALL + DIRECTIONS */}

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {doctor.phone ? (
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-sm transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                        onClick={handleCall}
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-sm opacity-50 dark:border-gray-600"
                      >
                        <Phone className="h-4 w-4" />
                        Unavailable
                      </button>
                    )}

                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2 text-sm transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                      onClick={handleDirections}
                    >
                      <Navigation className="h-4 w-4" />
                      Directions
                    </button>
                  </div>

                  {/* EXTERNAL CENTER MESSAGE */}

                  {!canBook && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Online booking is available only
                      for registered doctors.
                    </p>
                  )}
                </>
              )}
          </div>
        </div>
      </Card>

      {/* =====================================================
          APPOINTMENT MODAL
      ===================================================== */}

      {canBook && (
        <AppointmentModal
          isOpen={modalOpen}
          onClose={() =>
            setModalOpen(false)
          }
          doctor={doctor}
        />
      )}
    </>
  );
};

export default DoctorCard;