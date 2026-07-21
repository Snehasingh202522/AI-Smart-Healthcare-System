import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../../utils/constants';

const TestimonialsSection = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-accent-100 px-4 py-1 text-sm font-medium text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">
            Testimonials
          </span>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            What Our Users Say
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative rounded-xl border border-gray-200 bg-white p-6 card-hover dark:border-gray-800 dark:bg-gray-900"
            >
              <Quote className="absolute right-4 top-4 h-8 w-8 text-primary-100 dark:text-primary-900/30" />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
