import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Stethoscope,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
  Search,
  Calendar,
  ArrowRight,
  LocateFixed,
} from "lucide-react";

import { doctorRecommendationService } from "../services/authService";
import { useToast } from "../hooks/useToast";
import Card from "../components/common/Card";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

const SmartDoctorRecommendationPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");

  const [specialist, setSpecialist] = useState(
    state?.specialist || ""
  );

  const [symptoms, setSymptoms] = useState(
    state?.symptoms || ""
  );

  const [userLocation, setUserLocation] = useState({
    city: state?.city || "",
    latitude: state?.latitude ?? null,
    longitude: state?.longitude ?? null,
  });

  // =========================================================
  // GET COORDINATES FROM CITY
  // =========================================================

  const getCoordinatesFromCity = async (city) => {
    const cleanCity = city.trim();

    if (!cleanCity) {
      throw new Error("Please enter a city");
    }

    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `format=jsonv2&limit=1&countrycodes=in&` +
      `q=${encodeURIComponent(cleanCity + ", India")}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Unable to find city");
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`City "${cleanCity}" not found`);
    }

    return {
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
    };
  };

  // =========================================================
  // GET CITY FROM CURRENT COORDINATES
  // =========================================================

  const getCityFromCoordinates = async (
    latitude,
    longitude
  ) => {
    try {
      const url =
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=jsonv2&lat=${latitude}&lon=${longitude}`;

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        return "";
      }

      const data = await res.json();

      return (
        data?.address?.city ||
        data?.address?.town ||
        data?.address?.municipality ||
        data?.address?.village ||
        data?.address?.state_district ||
        data?.address?.state ||
        ""
      );
    } catch (err) {
      console.warn(
        "Reverse geocoding failed:",
        err.message
      );

      return "";
    }
  };

  // =========================================================
  // DETECT CURRENT LOCATION
  // =========================================================

  const detectCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation is not supported by your browser."
          )
        );
        return;
      }

      setLocationLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;

            const city =
              await getCityFromCoordinates(
                latitude,
                longitude
              );

            const detectedLocation = {
              city,
              latitude,
              longitude,
            };

            setUserLocation(detectedLocation);

            resolve(detectedLocation);
          } catch (err) {
            reject(err);
          } finally {
            setLocationLoading(false);
          }
        },
        (geoError) => {
          setLocationLoading(false);

          if (geoError.code === 1) {
            reject(
              new Error(
                "Location permission denied. Please allow location access or enter your city manually."
              )
            );
          } else if (geoError.code === 2) {
            reject(
              new Error(
                "Unable to determine your location. Please enter your city manually."
              )
            );
          } else {
            reject(
              new Error(
                "Location detection timed out. Please enter your city manually."
              )
            );
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        }
      );
    });
  }, []);

  // =========================================================
  // DOCTOR NAME HELPER
  // =========================================================
  // Different APIs may return the doctor's name in different
  // fields. This handles all common formats safely.
  // =========================================================

  const getDoctorName = (doctor) => {
    if (!doctor) {
      return "Doctor";
    }

    const directName =
      doctor.name ||
      doctor.doctorName ||
      doctor.fullName ||
      doctor.doctor?.name ||
      doctor.doctor?.doctorName;

    if (
      typeof directName === "string" &&
      directName.trim()
    ) {
      return directName.trim().startsWith("Dr.")
        ? directName.trim()
        : `Dr. ${directName.trim()}`;
    }

    const firstName =
      doctor.user?.firstName ||
      doctor.firstName ||
      doctor.doctor?.user?.firstName ||
      "";

    const lastName =
      doctor.user?.lastName ||
      doctor.lastName ||
      doctor.doctor?.user?.lastName ||
      "";

    const combinedName =
      `${firstName} ${lastName}`.trim();

    if (combinedName) {
      return combinedName.startsWith("Dr.")
        ? combinedName
        : `Dr. ${combinedName}`;
    }

    const username =
      doctor.user?.name ||
      doctor.user?.username ||
      doctor.username ||
      "";

    if (
      typeof username === "string" &&
      username.trim()
    ) {
      return username.trim().startsWith("Dr.")
        ? username.trim()
        : `Dr. ${username.trim()}`;
    }

    return "Verified Doctor";
  };

  // =========================================================
  // DOCTOR INITIAL
  // =========================================================

  const getDoctorInitial = (doctor) => {
    const name = getDoctorName(doctor)
      .replace(/^Dr\.\s*/i, "")
      .trim();

    return name?.charAt(0)?.toUpperCase() || "D";
  };

  // =========================================================
  // FETCH RECOMMENDED DOCTORS
  // =========================================================

  const fetchRecommendedDoctors = useCallback(
    async (locationOverride = null) => {
      if (!specialist) {
        setError(
          "No specialist recommendation provided. Please use the AI Symptom Checker first."
        );
        return;
      }

      setLoading(true);
      setError("");

      try {
        let finalLocation = {
          ...(locationOverride || userLocation),
        };

        // -----------------------------------------------------
        // CITY EXISTS BUT COORDINATES ARE MISSING
        // -----------------------------------------------------

        if (
          finalLocation.city?.trim() &&
          (!Number.isFinite(
            Number(finalLocation.latitude)
          ) ||
            !Number.isFinite(
              Number(finalLocation.longitude)
            ))
        ) {
          const coords =
            await getCoordinatesFromCity(
              finalLocation.city
            );

          finalLocation = {
            ...finalLocation,
            ...coords,
          };

          setUserLocation(finalLocation);
        }

        // -----------------------------------------------------
        // NO LOCATION AVAILABLE
        // -----------------------------------------------------

        const hasCoordinates =
          Number.isFinite(
            Number(finalLocation.latitude)
          ) &&
          Number.isFinite(
            Number(finalLocation.longitude)
          );

        const hasCity =
          Boolean(finalLocation.city?.trim());

        if (!hasCity && !hasCoordinates) {
          try {
            const detectedLocation =
              await detectCurrentLocation();

            finalLocation = detectedLocation;

            toast.success(
              detectedLocation.city
                ? `Location detected: ${detectedLocation.city}`
                : "Location detected successfully."
            );
          } catch (locationError) {
            console.warn(
              "Automatic location detection failed:",
              locationError.message
            );

            throw new Error(
              "Please enter your city or allow location access to get doctor recommendations."
            );
          }
        }

        // -----------------------------------------------------
        // FINAL LOCATION VALIDATION
        // -----------------------------------------------------

        const validCity =
          Boolean(finalLocation.city?.trim());

        const validCoordinates =
          Number.isFinite(
            Number(finalLocation.latitude)
          ) &&
          Number.isFinite(
            Number(finalLocation.longitude)
          );

        if (!validCity && !validCoordinates) {
          throw new Error(
            "Please provide your city or allow location access."
          );
        }

        // -----------------------------------------------------
        // API PAYLOAD
        // -----------------------------------------------------

        const payload = {
          city: finalLocation.city?.trim() || "",
          specialist: specialist.trim(),
          latitude: validCoordinates
            ? Number(finalLocation.latitude)
            : null,
          longitude: validCoordinates
            ? Number(finalLocation.longitude)
            : null,
          radius: 25,
        };

        console.log(
          "SMART DOCTOR PAYLOAD:",
          payload
        );

        const response =
          await doctorRecommendationService.searchDoctors(
            payload
          );

        console.log(
          "SMART DOCTOR RESPONSE:",
          response
        );

        const data =
          response?.data ?? response;

        const registeredDoctors =
          Array.isArray(
            data?.registeredDoctors
          )
            ? data.registeredDoctors.filter(
                (doc) =>
                  doc.source === "registered" &&
                  doc.isVerified
              )
            : [];

        console.log(
          "REGISTERED VERIFIED DOCTORS:",
          registeredDoctors
        );

        if (registeredDoctors.length === 0) {
          setError(
            `No verified ${specialist} doctors found in your area. Try expanding your search or checking nearby cities.`
          );

          setDoctors([]);
        } else {
          setDoctors(registeredDoctors);
        }
      } catch (err) {
        console.error(
          "Failed to fetch recommended doctors:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch recommended doctors";

        setError(message);
        setDoctors([]);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [
      specialist,
      userLocation,
      detectCurrentLocation,
      toast,
    ]
  );

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    if (specialist) {
      fetchRecommendedDoctors();
    }
  }, [specialist]);

  // =========================================================
  // BOOK APPOINTMENT
  // =========================================================

  const handleBookAppointment = (doctor) => {
    navigate("/patient/appointments", {
      state: {
        preselectedDoctor: doctor,
        fromRecommendation: true,
        specialist: specialist,
        symptoms: symptoms,
      },
    });
  };

  // =========================================================
  // RECOMMENDATION REASONS
  // =========================================================

  const getRecommendationReason = (doctor) => {
    const reasons = [];

    if (doctor.specialization && specialist) {
      const specialistLower =
        specialist.toLowerCase();

      const specializationLower =
        doctor.specialization.toLowerCase();

      if (
        specializationLower.includes(
          specialistLower
        ) ||
        specialistLower.includes(
          specializationLower
        )
      ) {
        reasons.push(
          `Specializes in ${doctor.specialization}`
        );
      }
    }

    if (doctor.isVerified) {
      reasons.push("Verified doctor");
    }

    if (
      doctor.experience &&
      Number(doctor.experience) > 0
    ) {
      reasons.push(
        `${doctor.experience}+ years of experience`
      );
    }

    if (
      doctor.availability === "available"
    ) {
      reasons.push("Currently available");
    }

    if (
      doctor.distance !== undefined &&
      doctor.distance !== null &&
      Number(doctor.distance) < 10
    ) {
      reasons.push(
        `Within ${Number(
          doctor.distance
        ).toFixed(1)} km`
      );
    }

    if (reasons.length === 0) {
      reasons.push(
        "Matches your healthcare requirements"
      );
    }

    return reasons;
  };

  // =========================================================
  // MATCH SCORE
  // =========================================================

  const calculateMatchScore = (doctor) => {
    let score = 0;

    if (doctor.isVerified) {
      score += 30;
    }

    if (
      doctor.experience &&
      Number(doctor.experience) > 5
    ) {
      score += 20;
    }

    if (
      doctor.availability === "available"
    ) {
      score += 15;
    }

    if (
      doctor.distance !== undefined &&
      doctor.distance !== null &&
      Number(doctor.distance) < 10
    ) {
      score += 20;
    }

    if (
      doctor.distance !== undefined &&
      doctor.distance !== null &&
      Number(doctor.distance) < 5
    ) {
      score += 15;
    }

    return Math.min(score, 100);
  };

  // =========================================================
  // NO SPECIALIST
  // =========================================================

  if (!specialist) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold !text-white">
            <Stethoscope className="h-8 w-8 text-cyan-400" />
            Smart Doctor Recommendations
          </h2>

          <p className="mt-1 !text-blue-200">
            AI-powered doctor recommendations based on your symptoms
          </p>
        </div>

        <Card className="!border-blue-500/30 !bg-gradient-to-br !from-[#102f63] !to-[#071a3d]">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-5 rounded-full bg-blue-500/10 p-4">
              <AlertCircle className="h-14 w-14 text-blue-300" />
            </div>

            <h3 className="mb-2 text-lg font-semibold !text-white">
              No Specialist Recommendation
            </h3>

            <p className="mb-6 max-w-md !text-blue-200">
              Please use the AI Symptom Checker first to get personalized doctor recommendations based on your symptoms.
            </p>

            <Button
              onClick={() =>
                navigate(
                  "/patient/symptom-checker"
                )
              }
            >
              Go to AI Symptom Checker
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold !text-white">
          <Stethoscope className="h-8 w-8 text-cyan-400" />
          Smart Doctor Recommendations
        </h2>

        <p className="mt-1 !text-blue-200">
          AI-recommended {specialist} based on your symptoms
        </p>
      </div>

      {/* =====================================================
          SYMPTOMS
      ===================================================== */}

      {symptoms && (
        <Card className="!border-blue-400/30 !bg-gradient-to-r !from-[#123b78] !to-[#0a2858]">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-cyan-400/10 p-2.5">
              <Stethoscope className="h-5 w-5 text-cyan-300" />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold !text-white">
                Based on your symptoms:
              </h3>

              <p className="mt-1 text-sm !text-blue-100">
                {symptoms}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* =====================================================
          LOCATION
      ===================================================== */}

      <Card className="!border-blue-400/25 !bg-gradient-to-r !from-[#0d3268] !to-[#0a244d]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-cyan-400/10 p-2.5">
              <MapPin className="h-5 w-5 text-cyan-300" />
            </div>

            <div>
              <h3 className="font-semibold !text-white">
                Search Location
              </h3>

              <p className="mt-1 text-sm !text-blue-200">
                {userLocation.city
                  ? `Searching near ${userLocation.city}`
                  : "Use your current location to find nearby doctors."}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={
              locationLoading || loading
            }
            onClick={async () => {
              try {
                setError("");

                const detectedLocation =
                  await detectCurrentLocation();

                toast.success(
                  detectedLocation.city
                    ? `Location detected: ${detectedLocation.city}`
                    : "Location detected"
                );

                await fetchRecommendedDoctors(
                  detectedLocation
                );
              } catch (err) {
                setError(err.message);
                toast.error(err.message);
              }
            }}
          >
            <LocateFixed className="mr-2 h-4 w-4" />

            {locationLoading
              ? "Detecting..."
              : "Use My Location"}
          </Button>
        </div>
      </Card>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <Card className="!border-blue-400/20 !bg-[#0b2148]">
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />

            <p className="mt-4 !text-blue-100">
              Finding the best {specialist} for you...
            </p>

            {userLocation.city && (
              <p className="mt-1 text-xs !text-blue-300">
                Searching near {userLocation.city}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && !loading && (
        <Card className="!border-red-500/40 !bg-gradient-to-r !from-[#4a1725] !to-[#321426]">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-500/10 p-2.5">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>

            <div className="flex-1">
              <h4 className="font-semibold !text-red-200">
                No Recommendations Available
              </h4>

              <p className="mt-1 text-sm !text-red-300">
                {error}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    fetchRecommendedDoctors()
                  }
                >
                  <Search className="mr-2 h-4 w-4" />
                  Try Again
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate(
                      "/patient/find-doctors",
                      {
                        state: {
                          specialist,
                          city:
                            userLocation.city,
                        },
                      }
                    )
                  }
                >
                  Find Doctors Manually
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* =====================================================
          RESULTS
      ===================================================== */}

      {!loading &&
        !error &&
        doctors.length > 0 && (
          <div className="space-y-5">
            {/* Results Header */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium !text-blue-100">
                  Found {doctors.length} verified{" "}
                  {specialist} near you
                </p>

                {userLocation.city && (
                  <p className="mt-1 text-xs !text-blue-300">
                    <MapPin className="mr-1 inline h-3.5 w-3.5" />
                    {userLocation.city}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() =>
                  fetchRecommendedDoctors()
                }
              >
                <Search className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>

            {/* =================================================
                DOCTOR CARDS
            ================================================= */}

            {[...doctors]
              .sort(
                (a, b) =>
                  calculateMatchScore(b) -
                  calculateMatchScore(a)
              )
              .map((doctor, index) => {
                const doctorName =
                  getDoctorName(doctor);

                const doctorInitial =
                  getDoctorInitial(doctor);

                const matchScore =
                  calculateMatchScore(doctor);

                return (
                  <Card
                    key={
                      doctor._id ||
                      doctor.id ||
                      `${doctorName}-${index}`
                    }
                    className="group relative overflow-hidden !border-blue-400/30 !bg-gradient-to-br !from-[#123466] !via-[#0d2854] !to-[#081c3e] !p-0 shadow-xl shadow-blue-950/30"
                  >
                    {/* Top glow */}

                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

                    {/* Best Match */}

                    {index === 0 && (
                      <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 shadow-lg">
                        <span className="text-xs font-bold !text-white">
                          ⭐ Best Match
                        </span>
                      </div>
                    )}

                    <div className="p-5 md:p-6">
                      <div className="flex flex-col gap-6 lg:flex-row">
                        {/* =================================================
                            LEFT / DOCTOR INFO
                        ================================================= */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}

                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-xl font-bold !text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-300/20">
                              {doctorInitial}
                            </div>

                            {/* Doctor Details */}

                            <div className="min-w-0 flex-1">
                              {/* NAME */}

                              <div className="flex flex-wrap items-center gap-2 pr-20">
                                <h3 className="text-xl font-bold leading-tight !text-white">
                                  {doctorName}
                                </h3>

                                {doctor.isVerified && (
                                  <Badge className="!border !border-green-400/30 !bg-green-500/15 !text-green-300">
                                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                    Verified
                                  </Badge>
                                )}
                              </div>

                              {/* SPECIALIZATION */}

                              <p className="mt-2 text-sm font-semibold !text-cyan-300">
                                {doctor.specialization ||
                                  specialist}
                              </p>

                              {/* DETAILS */}

                              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                                {doctor.experience &&
                                  Number(
                                    doctor.experience
                                  ) > 0 && (
                                    <span className="flex items-center gap-1.5 !text-blue-100">
                                      <Star className="h-4 w-4 text-yellow-400" />
                                      <span>
                                        {
                                          doctor.experience
                                        }{" "}
                                        years experience
                                      </span>
                                    </span>
                                  )}

                                {doctor.hospital && (
                                  <span className="flex items-center gap-1.5 !text-blue-100">
                                    <Stethoscope className="h-4 w-4 text-blue-300" />

                                    <span>
                                      {
                                        doctor.hospital
                                      }
                                    </span>
                                  </span>
                                )}
                              </div>

                              {/* DISTANCE */}

                              {doctor.distance !==
                                undefined &&
                                doctor.distance !==
                                  null && (
                                  <div className="mt-2 flex items-center gap-1.5 text-sm !text-blue-100">
                                    <MapPin className="h-4 w-4 text-cyan-300" />

                                    <span>
                                      {Number(
                                        doctor.distance
                                      ).toFixed(1)}{" "}
                                      km away
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* =================================================
                              WHY RECOMMENDED
                          ================================================= */}

                          <div className="mt-5 rounded-xl !border !border-blue-300/20 !bg-[#061936]/80 p-4 shadow-inner">
                            <p className="mb-3 text-xs font-bold uppercase tracking-wider !text-cyan-300">
                              Why recommended
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {getRecommendationReason(
                                doctor
                              ).map(
                                (
                                  reason,
                                  idx
                                ) => (
                                  <span
                                    key={idx}
                                    className="rounded-full !border !border-blue-300/20 !bg-blue-500/10 px-3 py-1.5 text-xs font-medium !text-blue-100"
                                  >
                                    {reason}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        {/* =================================================
                            RIGHT / SCORE + ACTIONS
                        ================================================= */}

                        <div className="flex flex-col gap-3 lg:w-48 lg:border-l lg:border-blue-300/15 lg:pl-6">
                          {/* MATCH SCORE */}

                          <div className="rounded-xl !border !border-cyan-400/20 !bg-cyan-400/5 p-3 text-center">
                            <div className="text-3xl font-extrabold !text-cyan-300">
                              {matchScore}%
                            </div>

                            <p className="mt-1 text-xs font-medium !text-blue-200">
                              Match Score
                            </p>
                          </div>

                          {/* BOOK */}

                          <Button
                            className="w-full"
                            onClick={() =>
                              handleBookAppointment(
                                doctor
                              )
                            }
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Appointment
                          </Button>

                          {/* VIEW ALL */}

                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              navigate(
                                "/patient/find-doctors",
                                {
                                  state: {
                                    specialist,
                                    city:
                                      userLocation.city,
                                  },
                                }
                              )
                            }
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            View All Doctors
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}

      {/* =========================================================
          EMPTY STATE
      ========================================================= */}

      {!loading &&
        !error &&
        doctors.length === 0 && (
          <EmptyState
            icon={Stethoscope}
            title="No Recommendations Found"
            description={`We couldn't find any verified ${specialist} doctors in your area. Try expanding your search or check nearby cities.`}
          />
        )}
    </div>
  );
};

export default SmartDoctorRecommendationPage;