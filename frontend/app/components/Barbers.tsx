import { Star, ExternalLink } from "lucide-react";

const barbers = [
  {
    name: "Carlos Mendoza",
    role: "Master Barber",
    specialty: "Cortes Clásicos & Fades",
    rating: 4.9,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    instagram: "@carlos.barber",
  },
  {
    name: "Andrés Valencia",
    role: "Senior Barber",
    specialty: "Diseños & Arte Capilar",
    rating: 4.8,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    instagram: "@andres.cuts",
  },
  {
    name: "Miguel Torres",
    role: "Barber Specialist",
    specialty: "Barbas & Afeitado Clásico",
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    instagram: "@miguel.style",
  },
  {
    name: "David Ruiz",
    role: "Junior Barber",
    specialty: "Tendencias & Estilos Modernos",
    rating: 4.7,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face",
    instagram: "@david.barber",
  },
];

export default function Barbers() {
  return (
    <section id="barberos" className="py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">
            Nuestro Equipo
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white">
            Conoce a los Expertos
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
            Un equipo de profesionales apasionados listos para transformar tu look.
          </p>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {barbers.map((barber) => (
            <div
              key={barber.name}
              className="group relative bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={barber.image}
                  alt={barber.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      {barber.name}
                    </h3>
                    <p className="text-amber-500 text-sm font-medium">
                      {barber.role}
                    </p>
                  </div>
                  <a
                    href={`https://instagram.com/${barber.instagram.slice(1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-400 hover:text-amber-500 transition-colors"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  {barber.specialty}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {barber.rating}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500">
                    ({barber.reviews} reseñas)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
