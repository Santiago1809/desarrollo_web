import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Juan Pablo García",
    role: "Cliente frecuente",
    content:
      "Increíble experiencia desde la primera visita. El sistema de citas es súper práctico y los barberos son verdaderos artistas. Mi lugar favorito en Medellín.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Sebastián Restrepo",
    role: "Cliente VIP",
    content:
      "Llevo más de 2 años viniendo a Edge Timer y nunca me han decepcionado. La calidad es consistente y el ambiente es genial. 100% recomendado.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Mateo Londoño",
    role: "Nuevo cliente",
    content:
      "Reservé mi primera cita por la app y quedé impresionado. Todo muy organizado, sin esperas y el resultado fue exactamente lo que quería.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonios" className="py-24 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">
            Testimonios
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
            Miles de clientes satisfechos nos respaldan. Descubre sus experiencias.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 h-8 w-8 text-amber-500/20" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={`star-${testimonial.name}-${i}`}
                    className="h-5 w-5 text-amber-500 fill-amber-500"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-zinc-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-zinc-400">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <span className="text-sm font-medium">4.9 en Google</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-zinc-300 dark:bg-zinc-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">+500 reseñas positivas</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-zinc-300 dark:bg-zinc-700"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">98% clientes satisfechos</span>
          </div>
        </div>
      </div>
    </section>
  );
}
