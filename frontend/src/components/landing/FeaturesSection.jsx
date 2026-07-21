import { CheckCircle } from 'lucide-react';
import { FEATURES } from '../../utils/constants';

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl gradient-hero p-8 text-white">
              <h3 className="mb-6 text-2xl font-bold">Why Choose HealthCare AI?</h3>
              <div className="space-y-4">
                {FEATURES.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" />
                    <div>
                      <p className="font-semibold">{feature.title}</p>
                      <p className="text-sm text-white/70">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="mb-3 inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              Features
            </span>
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Built for Modern Healthcare
            </h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
              Our platform is designed with both patients and healthcare professionals in mind,
              offering intuitive tools that simplify complex healthcare workflows.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {['Secure & Private', 'Mobile Ready', 'Real-time Updates', 'Easy Integration'].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
