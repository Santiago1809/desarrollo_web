import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          ¿Listo para tu{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-amber-600">nuevo look</span>?
        </h2>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
          Reserva tu cita en menos de un minuto y únete a miles de clientes 
          satisfechos que confían en Edge Timer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/agendar"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-zinc-900 bg-amber-500 rounded-full hover:bg-amber-400 transition-all hover:scale-105 shadow-lg shadow-amber-500/25"
          >
            <Calendar className="h-5 w-5" />
            Agendar Ahora
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/registro"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border border-zinc-600 rounded-full hover:bg-zinc-800 transition-all"
          >
            Crear Cuenta Gratis
          </Link>
        </div>

        {/* Benefits */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Sin costo de registro
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Cancelación flexible
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Recordatorios automáticos
          </div>
        </div>
      </div>
    </section>
  );
}
