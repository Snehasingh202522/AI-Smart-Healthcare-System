import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import {
  MapPin,
  Stethoscope,
  Search,
  LocateFixed,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";

import { doctorRecommendationService } from "../services/authService";
import { useToast } from "../hooks/useToast";
import Card from "../components/common/Card";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";
import DoctorCard from "../components/doctors/DoctorCard";
import DoctorMap from "../components/doctors/DoctorMap";

const FindDoctorsPage = () => {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("distance");

  const [specialist, setSpecialist] = useState(
    state?.specialist || searchParams.get("specialist") || ""
  );

  const [location, setLocation] = useState({
    city: state?.city || "",
    latitude: null,
    longitude: null,
  });

  // ---------------------------------------------------------
  // Get coordinates from city
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // Extract doctors from API response
  // ---------------------------------------------------------

  const extractDoctors = (response) => {
    if (!response) {
      return [];
    }

    const data = response?.data ?? response;

    // Backend response:
    // {
    //   success: true,
    //   data: {
    //     registeredDoctors: [],
    //     externalCenters: []
    //   }
    // }

    if (Array.isArray(data?.registeredDoctors)) {
      const registered = data.registeredDoctors || [];

      const external = Array.isArray(data?.externalCenters)
        ? data.externalCenters
        : [];

      return [...registered, ...external];
    }

    if (Array.isArray(data?.doctors)) {
      return data.doctors;
    }

    if (Array.isArray(data?.externalCenters)) {
      return data.externalCenters;
    }

    if (Array.isArray(data?.healthcareCenters)) {
      return data.healthcareCenters;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  };

  // ---------------------------------------------------------
  // Fetch doctors
  // ---------------------------------------------------------

  const fetchDoctors = useCallback(
    async (spec, loc) => {
      setLoading(true);
      setError("");

      try {
        let finalLocation = {
          city: loc?.city || "",
          latitude: loc?.latitude ?? null,
          longitude: loc?.longitude ?? null,
        };

        // If city exists but coordinates don't,
        // convert city into coordinates first.
        if (
          finalLocation.city.trim() &&
          (!Number.isFinite(finalLocation.latitude) ||
            !Number.isFinite(finalLocation.longitude))
        ) {
          const coords = await getCoordinatesFromCity(
            finalLocation.city
          );

          finalLocation = {
            ...finalLocation,
            ...coords,
          };

          setLocation(finalLocation);
        }

        // Backend needs either city OR coordinates.
        if (
          !finalLocation.city.trim() &&
          (!Number.isFinite(finalLocation.latitude) ||
            !Number.isFinite(finalLocation.longitude))
        ) {
          throw new Error(
            "Please enter a city or use your current location."
          );
        }

        // Backend expects:
        // city, specialist, latitude, longitude, radius
        const payload = {
          city: finalLocation.city.trim(),
          specialist: spec.trim(),
          latitude: finalLocation.latitude,
          longitude: finalLocation.longitude,
          radius: 25,
        };

        console.log("SEARCH PAYLOAD:", payload);

        const response =
          await doctorRecommendationService.searchDoctors(
            payload
          );

        console.log("FULL RESPONSE:", response);

        const doctorList = extractDoctors(response);

        console.log("FOUND DOCTORS:", doctorList);

        setDoctors(doctorList);
        setSelectedDoctor(doctorList[0] || null);
      } catch (err) {
        console.error("Find doctors error:", err);

        let message = "Failed to fetch doctors";

        if (err?.response?.data?.message) {
          message = err.response.data.message;
        } else if (err?.message) {
          message = err.message;
        } else if (err?.code === "ERR_NETWORK") {
          message =
            "Network error. Please check your connection and try again.";
        } else if (err?.code === "ECONNABORTED") {
          message = "Request timed out. Please try again.";
        }

        setDoctors([]);
        setSelectedDoctor(null);
        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // ---------------------------------------------------------
  // Detect current location
  // ---------------------------------------------------------

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLocationLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          let city = "";

          try {
            const url =
              `https://nominatim.openstreetmap.org/reverse?` +
              `format=jsonv2&lat=${latitude}&lon=${longitude}`;

            const res = await fetch(url, {
              headers: {
                Accept: "application/json",
              },
            });

            if (res.ok) {
              const data = await res.json();

              city =
                data?.address?.city ||
                data?.address?.town ||
                data?.address?.municipality ||
                data?.address?.village ||
                data?.address?.state_district ||
                data?.address?.state ||
                "";
            }
          } catch (reverseError) {
            console.warn(
              "Reverse geocoding failed:",
              reverseError.message
            );
          }

          const detectedLocation = {
            city,
            latitude,
            longitude,
          };

          setLocation(detectedLocation);

          toast.success(
            city
              ? `Location detected: ${city}`
              : "Location detected"
          );

          // Automatically search after location detection
          await fetchDoctors(
            specialist,
            detectedLocation
          );
        } catch (error) {
          console.error(
            "Location detection error:",
            error
          );

          toast.error(
            "Location detected, but doctor search failed."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (geoError) => {
        console.error(
          "Geolocation error:",
          geoError
        );

        setLocationLoading(false);

        if (geoError.code === 1) {
          toast.error(
            "Location permission denied. Please allow location access."
          );
        } else if (geoError.code === 2) {
          toast.error(
            "Unable to determine your location."
          );
        } else {
          toast.error(
            "Location detection timed out. Please enter your city manually."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  }, [fetchDoctors, specialist, toast]);

  // ---------------------------------------------------------
  // Search when opened from another page
  // ---------------------------------------------------------

  useEffect(() => {
    if (state?.city) {
      const initialLocation = {
        city: state.city,
        latitude: null,
        longitude: null,
      };

      fetchDoctors(specialist, initialLocation);
    }
  }, [state?.city]);

  // ---------------------------------------------------------
  // Manual search
  // ---------------------------------------------------------

  const handleSearch = async (e) => {
    e.preventDefault();

    const city = location.city.trim();

    if (!city) {
      toast.error(
        "Please enter a city or click Use My Location."
      );
      return;
    }

    await fetchDoctors(specialist, {
      city,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  // ---------------------------------------------------------
  // Sorting
  // ---------------------------------------------------------

  const visibleDoctors = useMemo(() => {
    const sorters = {
      distance: (a, b) =>
        Number(a.distance || 0) -
        Number(b.distance || 0),

      rating: (a, b) =>
        Number(b.rating?.average || 0) -
        Number(a.rating?.average || 0),

      experience: (a, b) =>
        Number(b.experience || 0) -
        Number(a.experience || 0),

      fee: (a, b) =>
        (a.consultationFee ?? Infinity) -
        (b.consultationFee ?? Infinity),
    };

    return [...doctors].sort(
      sorters[sortBy] || sorters.distance
    );
  }, [doctors, sortBy]);

  // ---------------------------------------------------------
  // Patient location for map
  // ---------------------------------------------------------

  const patientLocation =
    Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude)
      ? [location.latitude, location.longitude]
      : null;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Stethoscope className="h-8 w-8 text-primary-600" />
          Find Doctors
        </h2>

        <p className="text-gray-500">
          AI-powered location-based doctor recommendations
        </p>
      </div>

      {/* Search */}

      <Card>
        <form
          onSubmit={handleSearch}
          className="space-y-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {/* Specialist */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Specialist
              </label>

              <input
                value={specialist}
                onChange={(e) =>
                  setSpecialist(e.target.value)
                }
                placeholder="Cardiologist"
                className="w-full rounded-lg border px-4 py-2.5"
              />
            </div>

            {/* City */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                City
              </label>

              <input
                value={location.city}
                onChange={(e) =>
                  setLocation({
                    city: e.target.value,
                    latitude: null,
                    longitude: null,
                  })
                }
                placeholder="Meerut, Delhi, Mumbai..."
                className="w-full rounded-lg border px-4 py-2.5"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Search */}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Search className="h-4 w-4" />

              {loading
                ? "Searching..."
                : "Find Doctors"}
            </button>

            {/* Current Location */}

            <button
              type="button"
              disabled={locationLoading}
              onClick={detectLocation}
              className="inline-flex items-center gap-2 rounded-lg border px-5 py-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <LocateFixed className="h-4 w-4" />

              {locationLoading
                ? "Detecting..."
                : "Use My Location"}
            </button>
          </div>
        </form>
      </Card>

      {/* Loading */}

      {loading && (
        <Card>
          <div className="py-10 text-center">
            <Spinner size="lg" />

            <p className="mt-4">
              Finding doctors near{" "}
              {location.city || "your location"}...
            </p>
          </div>
        </Card>
      )}

      {/* Error */}

      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />

            <div className="flex-1">
              <h4 className="font-semibold text-red-800">
                Search Error
              </h4>

              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setError("");
                fetchDoctors(specialist, location);
              }}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      {/* Empty */}

      {!loading &&
        !error &&
        visibleDoctors.length === 0 && (
          <EmptyState
            icon={MapPin}
            title="No doctors found"
            description="Try another city or specialist."
          />
        )}

      {/* Results */}

      {!loading &&
        visibleDoctors.length > 0 && (
          <>
            {/* Sort */}

            <Card>
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="h-4 w-4" />

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                  className="rounded-lg border px-3 py-2"
                >
                  <option value="distance">
                    Nearest
                  </option>

                  <option value="rating">
                    Highest Rated
                  </option>

                  <option value="experience">
                    Most Experienced
                  </option>

                  <option value="fee">
                    Lowest Fee
                  </option>
                </select>
              </div>
            </Card>

            {/* Results Sections */}

            <div className="space-y-8">
              {/* Registered Doctors */}

              {(() => {
                const registeredDoctors =
                  visibleDoctors.filter(
                    (doc) =>
                      doc.source === "registered"
                  );

                const externalCenters =
                  visibleDoctors.filter(
                    (doc) =>
                      doc.source !== "registered"
                  );

                return (
                  <>
                    {registeredDoctors.length > 0 && (
                      <section>
                        <div className="mb-4 flex items-end justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              Registered Doctors
                            </h3>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Verified doctors registered on HealthCare AI. Online appointment booking is available.
                            </p>
                          </div>

                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {registeredDoctors.length} available
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                          {registeredDoctors.map(
                            (doc) => (
                              <DoctorCard
                                key={
                                  doc._id ||
                                  doc.name
                                }
                                doctor={doc}
                                isSelected={
                                  selectedDoctor?._id ===
                                  doc._id
                                }
                                onSelect={
                                  setSelectedDoctor
                                }
                              />
                            )
                          )}
                        </div>
                      </section>
                    )}

                    {/* External Healthcare Centers */}

                    {externalCenters.length > 0 && (
                      <section>
                        <div className="mb-4 flex items-end justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              Nearby Healthcare Centers
                            </h3>

                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Hospitals and clinics near your selected/current location. These external places do not support appointment booking through this app.
                            </p>
                          </div>

                          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {externalCenters.length} nearby
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                          {externalCenters.map(
                            (doc) => (
                              <DoctorCard
                                key={
                                  doc._id ||
                                  doc.place_id ||
                                  doc.name
                                }
                                doctor={doc}
                                isSelected={
                                  selectedDoctor?._id ===
                                  doc._id
                                }
                                onSelect={
                                  setSelectedDoctor
                                }
                              />
                            )
                          )}
                        </div>
                      </section>
                    )}

                    {/* Map */}

                    <section>
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Location Map
                        </h3>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          View registered doctors and nearby healthcare centers on the map.
                        </p>
                      </div>

                      <DoctorMap
                        doctors={visibleDoctors}
                        patientLocation={
                          patientLocation
                        }
                        selectedDoctor={
                          selectedDoctor
                        }
                        onDoctorSelect={
                          setSelectedDoctor
                        }
                        height="500px"
                      />
                    </section>
                  </>
                );
              })()}
            </div>
          </>
        )}
    </div>
  );
};

export default FindDoctorsPage;