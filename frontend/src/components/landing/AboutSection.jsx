import { Target, Eye, Award } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="mb-3 inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              About Us
            </span>
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Revolutionizing Healthcare with Technology
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              HealthCare AI is a next-generation healthcare platform designed to bridge the gap
              between patients and healthcare providers. We combine cutting-edge technology with
              compassionate care to deliver exceptional health outcomes.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Our platform empowers patients to take control of their health journey while giving
              doctors the tools they need to provide the best possible care.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {[
              {
                icon: Target,
                title: 'Our Mission',
                description: 'Make quality healthcare accessible to everyone, everywhere.',
              },
              {
                icon: Eye,
                title: 'Our Vision',
                description: 'A world where AI and human expertise work together for better health.',
              },
              {
                icon: Award,
                title: 'Our Values',
                description: 'Integrity, innovation, and patient-first approach in everything we do.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center card-hover dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                  <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
