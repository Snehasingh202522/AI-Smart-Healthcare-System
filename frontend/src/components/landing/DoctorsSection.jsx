import { Star, Stethoscope } from 'lucide-react';
import { DOCTORS_PREVIEW } from '../../utils/constants';

const DoctorsSection = () => {
  return (
    <section id="doctors" className="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
            Our Doctors
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Meet Our Expert Physicians
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
            Board-certified specialists dedicated to providing exceptional patient care.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DOCTORS_PREVIEW.map((doctor) => (
            <div
              key={doctor.name}
              className="rounded-xl border border-gray-200 bg-white p-6 text-center card-hover dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Stethoscope className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
              <p className="mb-2 text-sm text-primary-600 dark:text-primary-400">{doctor.specialty}</p>
              <p className="mb-3 text-xs text-gray-500">{doctor.experience} experience</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{doctor.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DoctorsSection;
