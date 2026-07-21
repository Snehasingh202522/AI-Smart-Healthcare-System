import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import ServicesSection from '../components/landing/ServicesSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import DoctorsSection from '../components/landing/DoctorsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import StatisticsSection from '../components/landing/StatisticsSection';
import CTASection from '../components/landing/CTASection';

const LandingPage = () => {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <FeaturesSection />
      <DoctorsSection />
      <TestimonialsSection />
      <StatisticsSection />
      <CTASection />
    </>
  );
};

export default LandingPage;
