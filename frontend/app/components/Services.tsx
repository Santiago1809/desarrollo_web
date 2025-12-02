import { Scissors, Paintbrush, Sparkles, Crown, Flame, Droplets } from "lucide-react";

const services = [
  {
    icon: Scissors,
    name: "Corte Clásico",
    description: "Corte tradicional con tijera y máquina, incluye lavado y styling.",
    price: "$25.000",
    duration: "30 min",
  },
  {
    icon: Crown,
    name: "Corte Premium",
    description: "Corte personalizado con consultoría de estilo y productos premium.",
    price: "$45.000",
    duration: "45 min",
  },
  {
    icon: Paintbrush,
    name: "Barba Completa",
    description: "Perfilado, afeitado con navaja caliente y tratamiento facial.",
    price: "$30.000",
    duration: "30 min",
  },
  {
    icon: Sparkles,
    name: "Corte + Barba",
    description: "El combo perfecto: corte premium más arreglo de barba completo.",
    price: "$65.000",
    duration: "60 min",
  },
  {
    icon: Flame,
    name: "Diseño Artístico",
    description: "Diseños personalizados, líneas y figuras con máquina de precisión.",
    price: "$35.000",
    duration: "40 min",
  },
  {
    icon: Droplets,
    name: "Tratamiento Capilar",
    description: "Hidratación profunda, masaje capilar y productos revitalizantes.",
    price: "$40.000",
    duration: "35 min",
  },
];

export default function Services() {
  return (
    <section id="servicios" className="py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">
            Nuestros Servicios
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white">
            Servicios de Primera
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
            Ofrecemos una amplia gama de servicios para que luzcas increíble en todo momento.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.name}
              className="group relative p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 rounded-xl mb-4 group-hover:bg-amber-500/20 transition-colors">
                <service.icon className="h-6 w-6 text-amber-500" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                {service.name}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm leading-relaxed">
                {service.description}
              </p>

              {/* Price & Duration */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-2xl font-bold text-amber-500">
                  {service.price}
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-500">
                  {service.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
