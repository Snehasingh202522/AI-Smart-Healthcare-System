import {
  Stethoscope,
  Calendar,
  FileText,
  Heart,
  Shield,
  Brain,
} from 'lucide-react';
import { SERVICES } from '../../utils/constants';

const iconMap = {
  Stethoscope,
  Calendar,
  FileText,
  Heart,
  Shield,
  Brain,
};

const ServicesSection = () => {
  return (
    <section id="services" className="bg-gray-50 py-20 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-accent-100 px-4 py-1 text-sm font-medium text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">
            Our Services
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Comprehensive Healthcare Solutions
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
            From consultations to health monitoring, we provide everything you need for a complete healthcare experience.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = iconMap[service.icon];
            return (
              <div
                key={service.title}
                className="group rounded-xl border border-gray-200 bg-white p-6 card-hover dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 transition-colors group-hover:bg-primary-600 dark:bg-primary-900/30">
                  <Icon className="h-6 w-6 text-primary-600 transition-colors group-hover:text-white dark:text-primary-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
