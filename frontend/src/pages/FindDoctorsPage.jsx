import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Stethoscope, Search, LocateFixed, AlertCircle } from 'lucide-react';
import { doctorService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import DoctorCard from '../components/doctors/DoctorCard';
import DoctorMap from '../components/doctors/DoctorMap';

const DEFAULT_LOCATION = { latitude: 19.076, longitude: 72.8777, city: 'Mumbai' };

const FindDoctorsPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [disease, setDisease] = useState(searchParams.get('disease') || '');
  const [diseases, setDiseases] = useState(
    searchParams.get('diseases') ? searchParams.get('diseases').split(',') : []
  );
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [matchedSpecializations, setMatchedSpecializations] = useState([]);
  const [error, setError] = useState(null);

  const fetchDoctors = useCallback(async (diseaseList, loc) => {
    if (diseaseList.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await doctorService.recommendDoctors({
        diseases: diseaseList,
        latitude: loc.latitude,
        longitude: loc.longitude,
        city: loc.city,
        limit: 15,
      });

      setDoctors(response.data.doctors);
      setMatchedSpecializations(response.data.matchedSpecializations || []);
      if (response.data.doctors.length > 0) {
        setSelectedDoctor(response.data.doctors[0]);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch doctor recommendations';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLocationLoading(false);
        toast.success('Location detected successfully');
      },
      () => {
        setLocationLoading(false);
        toast.error('Unable to detect location. Using default location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  useEffect(() => {
    const diseaseList = diseases.length > 0 ? diseases : disease ? [disease] : [];
    if (diseaseList.length > 0 && location.latitude && location.longitude) {
      fetchDoctors(diseaseList, location);
    }
  }, [diseases, disease, location, fetchDoctors]);

  const handleSearch = (e) => {
    e.preventDefault();
    const diseaseList = disease.trim() ? [disease.trim()] : [];
    if (diseaseList.length === 0) {
      toast.error('Please enter a disease or condition');
      return;
    }
    setDiseases(diseaseList);
    fetchDoctors(diseaseList, location);
  };

  const patientLocation = [location.latitude, location.longitude];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Stethoscope className="h-8 w-8 text-primary-600" />
          Find Doctors
        </h2>
        <p className="mt-1 text-gray-500">
          AI-powered location-based doctor recommendations near you
        </p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Disease / Condition
              </label>
              <input
                type="text"
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="e.g., Headache, Diabetes, Asthma"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                City
              </label>
              <input
                type="text"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Your city"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" icon={Search} loading={loading}>
              Find Doctors
            </Button>
            <Button
              type="button"
              variant="outline"
              icon={LocateFixed}
              loading={locationLoading}
              onClick={detectLocation}
            >
              Use My Location
            </Button>
          </div>

          {matchedSpecializations.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recommended specialists: {matchedSpecializations.join(', ')}
            </p>
          )}
        </form>
      </Card>

      {loading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Finding best doctors near you...</p>
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {!loading && !error && doctors.length === 0 && (disease || diseases.length > 0) && (
        <EmptyState
          icon={MapPin}
          title="No doctors found"
          description="Try adjusting your search criteria or location"
        />
      )}

      {!loading && doctors.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {doctors.length} Doctor{doctors.length !== 1 ? 's' : ''} Found
            </h3>
            <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
              {doctors.map((doc) => (
                <DoctorCard
                  key={doc._id}
                  doctor={doc}
                  isSelected={selectedDoctor?._id === doc._id}
                  onSelect={setSelectedDoctor}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Map View</h3>
            <DoctorMap
              doctors={doctors}
              patientLocation={patientLocation}
              selectedDoctor={selectedDoctor}
              onDoctorSelect={setSelectedDoctor}
              height="600px"
            />
          </div>
        </div>
      )}

      {!loading && !disease && diseases.length === 0 && (
        <Card className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            Search for doctors
          </h3>
          <p className="mt-2 text-gray-500">
            Enter a disease or use the{' '}
            <Link to="/patient/symptom-checker" className="text-primary-600 hover:underline">
              AI Symptom Checker
            </Link>{' '}
            to get automatic recommendations.
          </p>
        </Card>
      )}
    </div>
  );
};

export default FindDoctorsPage;
