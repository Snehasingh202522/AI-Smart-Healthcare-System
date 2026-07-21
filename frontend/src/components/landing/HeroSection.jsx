import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Users } from 'lucide-react';
import Button from '../common/Button';

const HeroSection = () => {
  return (
    <section id="home" className="gradient-hero relative overflow-hidden pt-16">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              Trusted by 50,000+ patients worldwide
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Smart Healthcare for a{' '}
              <span className="text-accent-300">Healthier Tomorrow</span>
            </h1>

            <p className="mb-8 max-w-lg text-lg text-white/80">
              Experience the future of healthcare with AI-powered insights, seamless appointments,
              and personalized care — all in one secure platform.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" variant="accent" className="shadow-lg shadow-accent-500/25">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#services">
                <Button size="lg" variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  Explore Services
                </Button>
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { icon: Users, label: '50K+ Patients' },
                { icon: Clock, label: '24/7 Support' },
                { icon: Shield, label: 'HIPAA Secure' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <Icon className="mx-auto mb-2 h-6 w-6 text-accent-300" />
                  <p className="text-sm font-medium text-white/90">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="rounded-xl bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent-100 flex items-center justify-center">
                      <span className="text-accent-600 font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Health Check Complete</p>
                      <p className="text-sm text-gray-500">All vitals within normal range</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-bold">Dr</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Dr. Sarah Mitchell</p>
                      <p className="text-sm text-gray-500">Cardiologist • Available Now</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-white p-4 shadow-lg">
                  <p className="text-sm font-medium text-gray-500">Health Score</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-3xl font-bold text-accent-600">92</span>
                    <span className="text-sm text-accent-500 mb-1">Excellent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L60 70C120 60 240 40 360 35C480 30 600 40 720 45C840 50 960 50 1080 45C1200 40 1320 30 1380 25L1440 20V80H0Z" className="fill-white dark:fill-gray-950" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
