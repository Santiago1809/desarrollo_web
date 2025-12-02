import { CheckCircle, Award, Users, Clock } from "lucide-react";

const features = [
  {
    icon: Award,
    title: "Experiencia Premium",
    description: "Más de 10 años transformando estilos en Medellín.",
  },
  {
    icon: Users,
    title: "Equipo Profesional",
    description: "Barberos certificados y en constante capacitación.",
  },
  {
    icon: Clock,
    title: "Reserva Fácil",
    description: "Sistema de citas online disponible 24/7.",
  },
];

const highlights = [
  "Productos de alta calidad",
  "Ambiente exclusivo y cómodo",
  "Atención personalizada",
  "Precios competitivos",
  "Ubicación céntrica",
  "Estacionamiento disponible",
];

export default function About() {
  return (
    <section id="nosotros" className="py-24 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="text-amber-500 font-semibold text-sm uppercase tracking-wider">
              Sobre Nosotros
            </span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
              Donde el estilo se encuentra con la{" "}
              <span className="text-amber-500">excelencia</span>
            </h2>
            <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              En Edge Timer, no solo cortamos cabello, creamos experiencias. Somos 
              la barbería de referencia en Medellín, donde cada visita es una 
              oportunidad para reinventarte y expresar tu personalidad.
            </p>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Nuestro sistema de agendamiento te permite reservar tu cita de forma 
              rápida y sencilla, eligiendo el barbero y horario que mejor se adapte 
              a tu estilo de vida.
            </p>

            {/* Highlights Grid */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Features Cards */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex gap-4 p-6 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm"
              >
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Stats Box */}
            <div className="p-6 bg-linear-to-br from-amber-500 to-amber-600 rounded-2xl text-white">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold">10+</div>
                  <div className="text-sm text-amber-100">Años</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">5K+</div>
                  <div className="text-sm text-amber-100">Clientes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">15K+</div>
                  <div className="text-sm text-amber-100">Cortes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
