import { Users, Stethoscope, MessageCircle, Star } from 'lucide-react';
import { STATISTICS } from '../../utils/constants';

const iconMap = {
  Users,
  Stethoscope,
  MessageCircle,
  Star,
};

const StatisticsSection = () => {
  return (
    <section className="gradient-hero py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATISTICS.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
              <div key={stat.label} className="text-center text-white">
                <Icon className="mx-auto mb-3 h-8 w-8 text-accent-300" />
                <p className="text-3xl font-bold sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-white/70">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
