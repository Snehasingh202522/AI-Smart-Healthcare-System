import { MapPin, Star, Briefcase, Building2, IndianRupee, Clock, Navigation } from 'lucide-react';
import Avatar from "../common/Avatar";
import Badge from "../common/Badge";
import Card from "../common/Card";

const AVAILABILITY_CONFIG = {
  available: { label: 'Available', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  busy: { label: 'Busy', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  offline: { label: 'Offline', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
};

const DoctorCard = ({ doctor, onSelect, isSelected }) => {
  const availability = AVAILABILITY_CONFIG[doctor.availability] || AVAILABILITY_CONFIG.offline;
  const nameParts = (doctor.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <Card
      hover
      onClick={() => onSelect?.(doctor)}
      className={`cursor-pointer transition-all ${
        isSelected ? 'border-primary-500 ring-2 ring-primary-500/20' : ''
      }`}
    >
      <div className="flex gap-4">
        <Avatar
          firstName={firstName}
          lastName={lastName}
          src={doctor.avatar}
          size="lg"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
              <p className="text-sm text-primary-600 dark:text-primary-400">{doctor.specialization}</p>
            </div>
            <Badge className={availability.className}>{availability.label}</Badge>
          </div>

          <div className="mt-3 grid gap-2 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="truncate">{doctor.hospital}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 shrink-0 text-yellow-500" />
              <span>{doctor.rating} / 5</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span>{doctor.experience} years exp.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4 shrink-0" />
              <span>₹{doctor.consultationFee}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Navigation className="h-4 w-4 shrink-0" />
              <span>{doctor.distance} km away</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{doctor.city}</span>
            </div>
          </div>

          {doctor.specializationMatch === 1 && (
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                <Clock className="mr-1 inline h-3 w-3" />
                Best match for your condition
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DoctorCard;
