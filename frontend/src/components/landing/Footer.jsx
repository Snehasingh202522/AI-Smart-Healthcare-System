import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Heart className="h-7 w-7 text-primary-400" />
              <span className="text-xl font-bold text-white">HealthCare AI</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Empowering healthcare through intelligent technology. Better care, smarter decisions, healthier lives.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {['Home', 'About', 'Services', 'Doctors'].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="transition-colors hover:text-primary-400">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Services</h3>
            <ul className="space-y-2 text-sm">
              {['Consultations', 'Health Monitoring', 'Digital Records', 'AI Insights'].map((item) => (
                <li key={item}>
                  <span className="text-gray-400">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-400" />
                support@healthcareai.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-400" />
                +1 (800) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-400" />
                123 Health Street, Medical City
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HealthCare AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="text-gray-500 transition-colors hover:text-primary-400">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
