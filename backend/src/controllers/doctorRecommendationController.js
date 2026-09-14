const Doctor = require("../models/Doctor");

const DEFAULT_RADIUS_KM = 25;
const FALLBACK_RADIUS_KM = 75;
const EXTERNAL_LIMIT = 30;

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ---------------------------------------------------------
// Specialist Search Aliases
// ---------------------------------------------------------

const getSpecialistRegex = (specialist) => {
  const value = String(specialist || "")
    .trim()
    .toLowerCase();

  if (!value) {
    return null;
  }

  // General Physician
  if (
    value.includes("general physician") ||
    value.includes("general medicine") ||
    value === "physician"
  ) {
    return /general physician|general medicine|physician|internal medicine/i;
  }

  // Gynecologist / Gynaecologist
  if (
    value.includes("gynecologist") ||
    value.includes("gynaecologist") ||
    value.includes("gynecology") ||
    value.includes("gynaecology")
  ) {
    return /gynecologist|gynaecologist|gynecology|gynaecology|obstetrician|obstetrics/i;
  }

  // Cardiologist
  if (
    value.includes("cardiologist") ||
    value.includes("cardiology")
  ) {
    return /cardiologist|cardiology/i;
  }

  // Dermatologist
  if (
    value.includes("dermatologist") ||
    value.includes("dermatology")
  ) {
    return /dermatologist|dermatology|skin specialist/i;
  }

  // Pediatrician
  if (
    value.includes("pediatrician") ||
    value.includes("paediatrician") ||
    value.includes("pediatrics") ||
    value.includes("paediatrics")
  ) {
    return /pediatrician|paediatrician|pediatrics|paediatrics|child specialist/i;
  }

  // Orthopedic
  if (
    value.includes("orthopedic") ||
    value.includes("orthopaedic")
  ) {
    return /orthopedic|orthopaedic|orthopedics|orthopaedics/i;
  }

  // Neurologist
  if (
    value.includes("neurologist") ||
    value.includes("neurology")
  ) {
    return /neurologist|neurology/i;
  }

  // Psychiatrist
  if (
    value.includes("psychiatrist") ||
    value.includes("psychiatry")
  ) {
    return /psychiatrist|psychiatry|mental health/i;
  }

  // ENT
  if (
    value.includes("ent") ||
    value.includes("otolaryngologist")
  ) {
    return /ent|otolaryngologist|otorhinolaryngology/i;
  }

  // Dentist
  if (
    value.includes("dentist") ||
    value.includes("dental")
  ) {
    return /dentist|dental|dentistry/i;
  }

  // Ophthalmologist
  if (
    value.includes("ophthalmologist") ||
    value.includes("ophthalmology") ||
    value.includes("eye")
  ) {
    return /ophthalmologist|ophthalmology|eye specialist/i;
  }

  // Generic fallback
  return new RegExp(
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i"
  );
};

// ---------------------------------------------------------
// Opening status
// ---------------------------------------------------------

const isOpenNow = (
  openingHours,
  availability = "available"
) => {
  if (availability === "offline") {
    return {
      isOpen: false,
      status: "Offline",
    };
  }

  if (availability === "busy") {
    return {
      isOpen: true,
      status: "Busy",
    };
  }

  if (!openingHours) {
    return {
      isOpen: true,
      status: "Available",
    };
  }

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const now = new Date();
  const today = days[now.getDay()];
  const todayHours = openingHours[today];

  if (!todayHours?.open || !todayHours?.close) {
    return {
      isOpen: true,
      status: "Available",
    };
  }

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const [openHour, openMinute] = String(
    todayHours.open
  )
    .split(":")
    .map(Number);

  const [closeHour, closeMinute] = String(
    todayHours.close
  )
    .split(":")
    .map(Number);

  if (
    !Number.isFinite(openHour) ||
    !Number.isFinite(openMinute) ||
    !Number.isFinite(closeHour) ||
    !Number.isFinite(closeMinute)
  ) {
    return {
      isOpen: true,
      status: "Available",
    };
  }

  const openMinutes =
    openHour * 60 + openMinute;

  const closeMinutes =
    closeHour * 60 + closeMinute;

  // 00:00 - 00:00 = 24 hours
  if (openMinutes === closeMinutes) {
    return {
      isOpen: true,
      status: "Open now",
    };
  }

  // Normal same-day timing
  if (openMinutes < closeMinutes) {
    const open =
      currentMinutes >= openMinutes &&
      currentMinutes < closeMinutes;

    return {
      isOpen: open,
      status: open ? "Open now" : "Closed",
    };
  }

  // Overnight timing
  const open =
    currentMinutes >= openMinutes ||
    currentMinutes < closeMinutes;

  return {
    isOpen: open,
    status: open ? "Open now" : "Closed",
  };
};

// ---------------------------------------------------------
// Registered Doctor Availability
// ---------------------------------------------------------

const getRegisteredDoctorStatus = (availability) => {
  /*
   * Registered doctors are considered available for
   * appointment booking unless their explicit availability
   * says "offline" or "busy".
   *
   * Opening hours are NOT used to mark registered doctors
   * as Closed because they are appointment-booking doctors,
   * not external healthcare centres.
   */

  if (availability === "offline") {
    return {
      isOpen: false,
      status: "Offline",
    };
  }

  if (availability === "busy") {
    return {
      isOpen: true,
      status: "Busy",
    };
  }

  return {
    isOpen: true,
    status: "Available",
  };
};

// ---------------------------------------------------------
// Geoapify Geocoding
// ---------------------------------------------------------

const geocodeCity = async (city) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey || !city) {
    return null;
  }

  try {
    const url =
      `https://api.geoapify.com/v1/geocode/search?` +
      `text=${encodeURIComponent(city + ", India")}` +
      `&limit=1&apiKey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Geoapify geocoding failed:",
        response.status,
        errorText
      );

      return null;
    }

    const data = await response.json();

    const feature = data?.features?.[0];

    if (!feature) {
      return null;
    }

    const coordinates =
      feature.geometry?.coordinates;

    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2
    ) {
      return null;
    }

    return {
      longitude: Number(coordinates[0]),
      latitude: Number(coordinates[1]),
    };
  } catch (error) {
    console.error(
      "Geocoding error:",
      error.message
    );

    return null;
  }
};

// ---------------------------------------------------------
// External Healthcare Centers
// ---------------------------------------------------------

const searchExternalHealthcareCenters = async ({
  latitude,
  longitude,
  radiusKm,
}) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    console.warn(
      "GEOAPIFY_API_KEY not configured."
    );

    return [];
  }

  try {
    const radiusMeters =
      Math.max(radiusKm, 1) * 1000;

    // Valid Geoapify healthcare categories
    const categories =
      "healthcare.hospital,healthcare.clinic_or_praxis";

    const url =
      `https://api.geoapify.com/v2/places?` +
      `categories=${encodeURIComponent(categories)}` +
      `&filter=circle:${longitude},${latitude},${radiusMeters}` +
      `&limit=${EXTERNAL_LIMIT}` +
      `&apiKey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Geoapify healthcare search failed:",
        response.status,
        errorText
      );

      return [];
    }

    const data = await response.json();

    const features = Array.isArray(
      data?.features
    )
      ? data.features
      : [];

    return features.map(
      (feature, index) => {
        const properties =
          feature?.properties || {};

        const coordinates =
          feature?.geometry?.coordinates || [];

        const placeLongitude = toNumber(
          coordinates[0],
          longitude
        );

        const placeLatitude = toNumber(
          coordinates[1],
          latitude
        );

        const distance =
          calculateDistanceKm(
            latitude,
            longitude,
            placeLatitude,
            placeLongitude
          );

        const openingHours =
          properties.opening_hours || null;

        let externalStatus = {
          isOpen: null,
          status: "Hours unavailable",
        };

        if (openingHours) {
          try {
            externalStatus =
              isOpenNow(
                openingHours,
                "available"
              );
          } catch (error) {
            externalStatus = {
              isOpen: null,
              status: "Hours unavailable",
            };
          }
        }

        return {
          _id:
            properties.place_id ||
            properties.datasource?.raw
              ?.place_id ||
            `external-${index}`,

          source: "external",

          bookingAvailable: false,

          name:
            properties.name ||
            properties.address_line1 ||
            "Healthcare Center",

          specialization:
            "Healthcare Center",

          hospital:
            properties.name ||
            properties.address_line1 ||
            "Healthcare Center",

          address:
            properties.formatted ||
            properties.address_line2 ||
            properties.address_line1 ||
            "Address unavailable",

          city:
            properties.city ||
            properties.town ||
            properties.village ||
            "",

          latitude: placeLatitude,

          longitude: placeLongitude,

          distance: Number(
            distance.toFixed(2)
          ),

          rating: {
            average: 0,
            totalReviews: 0,
          },

          consultationFee: 0,

          isOpen:
            externalStatus.isOpen,

          openStatus:
            externalStatus.status,

          availability: "available",

          isVerified: false,

          photo: "",

          location: {
            type: "Point",
            coordinates: [
              placeLongitude,
              placeLatitude,
            ],
          },
        };
      }
    );
  } catch (error) {
    console.error(
      "Geoapify healthcare search failed:",
      error.message
    );

    return [];
  }
};

// ---------------------------------------------------------
// Main Search Doctors
// ---------------------------------------------------------

exports.searchDoctors = async (
  req,
  res
) => {
  try {
    const {
      city = "",
      specialist = "",
      radius = DEFAULT_RADIUS_KM,
      latitude,
      longitude,
    } = req.query;

    const requestedRadius =
      Math.min(
        Math.max(
          toNumber(
            radius,
            DEFAULT_RADIUS_KM
          ),
          1
        ),
        100
      );

    let searchLatitude = toNumber(
      latitude,
      NaN
    );

    let searchLongitude = toNumber(
      longitude,
      NaN
    );

    // -----------------------------------------------------
    // Get Search Location
    // -----------------------------------------------------

    if (
      !Number.isFinite(searchLatitude) ||
      !Number.isFinite(searchLongitude)
    ) {
      if (!city.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide city or latitude/longitude.",
        });
      }

      const location =
        await geocodeCity(
          city.trim()
        );

      if (!location) {
        return res.status(404).json({
          success: false,
          message:
            `Could not find location for ${city}.`,
        });
      }

      searchLatitude =
        location.latitude;

      searchLongitude =
        location.longitude;
    }

    // -----------------------------------------------------
    // Registered Doctors
    // -----------------------------------------------------

    const doctorQuery = {
      isVerified: true,
    };

    // Specialist filter
    const specialistRegex =
      getSpecialistRegex(
        specialist
      );

    if (specialistRegex) {
      doctorQuery.specialization =
        specialistRegex;
    }

    const doctors =
      await Doctor.find(
        doctorQuery
      )
        .populate(
          "user",
          "firstName lastName email phone avatar isActive"
        )
        .lean();

    let registeredDoctors =
      doctors
        .filter((doctor) => {
          return (
            doctor.user &&
            doctor.user.isActive !== false
          );
        })
        .map((doctor) => {
          const doctorLatitude =
            toNumber(
              doctor.latitude,
              doctor.location
                ?.coordinates?.[1]
            );

          const doctorLongitude =
            toNumber(
              doctor.longitude,
              doctor.location
                ?.coordinates?.[0]
            );

          const distance =
            calculateDistanceKm(
              searchLatitude,
              searchLongitude,
              doctorLatitude,
              doctorLongitude
            );

          // IMPORTANT:
          // Registered doctors should remain available
          // unless explicitly marked busy/offline.
          const status =
            getRegisteredDoctorStatus(
              doctor.availability
            );

          return {
            ...doctor,

            _id: String(
              doctor._id
            ),

            source: "registered",

            bookingAvailable: true,

            doctorId: String(
              doctor._id
            ),

            user: {
              ...doctor.user,

              _id: String(
                doctor.user._id
              ),
            },

            doctorName:
              `${doctor.user.firstName || ""} ${
                doctor.user.lastName || ""
              }`.trim(),

            latitude:
              doctorLatitude,

            longitude:
              doctorLongitude,

            distance: Number(
              distance.toFixed(2)
            ),

            rating:
              doctor.rating &&
              typeof doctor.rating ===
                "object"
                ? {
                    average:
                      toNumber(
                        doctor.rating
                          .average,
                        0
                      ),

                    totalReviews:
                      toNumber(
                        doctor.rating
                          .totalReviews,
                        0
                      ),
                  }
                : {
                    average:
                      toNumber(
                        doctor.rating,
                        0
                      ),

                    totalReviews: 0,
                  },

            isOpen:
              status.isOpen,

            openStatus:
              status.status,

            bookingMessage:
              "Available for appointment booking",
          };
        });

    // -----------------------------------------------------
    // Nearby Registered Doctors
    // -----------------------------------------------------

    const nearbyRegisteredDoctors =
      registeredDoctors
        .filter(
          (doctor) =>
            doctor.distance <=
            requestedRadius
        )
        .sort(
          (a, b) =>
            a.distance -
            b.distance
        );

    // -----------------------------------------------------
    // Fallback
    // -----------------------------------------------------

    if (
      nearbyRegisteredDoctors.length ===
      0
    ) {
      registeredDoctors =
        registeredDoctors
          .filter(
            (doctor) =>
              doctor.distance <=
              Math.max(
                requestedRadius,
                FALLBACK_RADIUS_KM
              )
          )
          .sort(
            (a, b) =>
              a.distance -
              b.distance
          )
          .slice(0, 6);
    } else {
      registeredDoctors =
        nearbyRegisteredDoctors;
    }

    // -----------------------------------------------------
    // External Healthcare Centers
    // -----------------------------------------------------

    const externalCenters =
      await searchExternalHealthcareCenters({
        latitude:
          searchLatitude,

        longitude:
          searchLongitude,

        radiusKm:
          requestedRadius,
      });

    externalCenters.sort(
      (a, b) =>
        a.distance -
        b.distance
    );

    // -----------------------------------------------------
    // Response
    // -----------------------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        registeredDoctors,

        externalCenters,

        // Backward compatibility
        doctors:
          registeredDoctors,

        healthcareCenters:
          externalCenters,

        location: {
          latitude:
            searchLatitude,

          longitude:
            searchLongitude,

          city:
            city || "",
        },

        radius:
          requestedRadius,

        counts: {
          registeredDoctors:
            registeredDoctors.length,

          externalCenters:
            externalCenters.length,

          total:
            registeredDoctors.length +
            externalCenters.length,
        },
      },
    });
  } catch (error) {
    console.error(
      "Doctor recommendation error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to search doctors.",
    });
  }
};

// ---------------------------------------------------------
// Export helper
// ---------------------------------------------------------

exports.isOpenNow =
  isOpenNow;