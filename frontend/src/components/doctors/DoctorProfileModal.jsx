import { useState } from 'react';
import { MapPin, Star, Briefcase, Building2, IndianRupee, Clock, Phone, Mail, Calendar, X, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Button from "../common/Button";
import Card from "../common/Card";

const OPEN_STATUS_CONFIG = {
  true: { label: 'Open Now', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  false: { label: 'Closed', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

const DoctorProfileModal = ({ doctor, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!doctor) return null;

  const openStatus = OPEN_STATUS_CONFIG[doctor.isOpen] || OPEN_STATUS_CONFIG.false;
  const doctorName = doctor.user ? `${doctor.user.firstName} ${doctor.user.lastName}` : doctor.name || 'Unknown';
  const nameParts = doctorName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const rating = doctor.rating?.average || doctor.rating || 0;
  const totalReviews = doctor.rating?.totalReviews || 0;

  const handleBookAppointment = () => {
    navigate('/patient/appointments', { state: { doctorId: doctor._id, doctorName } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Doctor Profile
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Doctor Header */}
          <div className="flex gap-4">
            <Avatar
              firstName={firstName}
              lastName={lastName}
              src={doctor.photo}
              size="xl"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{doctorName}</h2>
                  <p className="text-lg text-primary-600 dark:text-primary-400">{doctor.specialization}</p>
                </div>
                <Badge className={openStatus.className}>{openStatus.label}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 shrink-0 text-yellow-500" />
                  <span>{rating.toFixed(1)} / 5</span>
                  <span className="text-gray-400">({totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span>{doctor.experience} years experience</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital & Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">Hospital</h4>
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Building2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{doctor.hospital || 'N/A'}</span>
              </div>
              {doctor.location?.address && (
                <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{doctor.location.address}</span>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Navigation className="h-4 w-4 shrink-0" />
                <span>{doctor.distance} km away</span>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">Consultation Fee</h4>
              <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                <IndianRupee className="h-6 w-6" />
                <span>{doctor.consultationFee}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">per consultation</p>
            </div>
          </div>

          {/* Contact Information */}
          {doctor.user && (
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Contact Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{doctor.user.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{doctor.user.email || 'Not provided'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Opening Hours */}
          {doctor.openingHours && (
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Opening Hours</h4>
              <div className="grid gap-2 text-sm">
                {Object.entries(doctor.openingHours || {}).map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="capitalize">{day}</span>
                    <span>
                      {hours.open && hours.close
                        ? `${hours.open} - ${hours.close}`
                        : 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {doctor.bio && (
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">About</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{doctor.bio}</p>
            </div>
          )}

          {/* Diseases Treated */}
          {doctor.diseasesTreated && doctor.diseasesTreated.length > 0 && (
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">Areas of Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {doctor.diseasesTreated.map((disease, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {disease}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Verification Status */}
          {doctor.isVerified && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <Star className="h-5 w-5" />
                <span className="font-medium">Verified Doctor</span>
              </div>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                This doctor's credentials have been verified by our team.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1"
              icon={Calendar}
              onClick={handleBookAppointment}
            >
              Book Appointment
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              icon={Phone}
              onClick={() => {
                if (doctor.user?.phone) {
                  window.open(`tel:${doctor.user.phone}`);
                }
              }}
            >
              Call Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DoctorProfileModal;
