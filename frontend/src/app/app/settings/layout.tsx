import Link from "next/link";
import { MapPin, Users } from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar de Configuración */}
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Configuración</h2>
        <nav className="space-y-1">
          <Link href="/app/settings/locations" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors">
            <MapPin size={18} />
            <span>Mis Sedes</span>
          </Link>
          <Link href="/app/settings/workers" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors">
            <Users size={18} />
            <span>Lavadores</span>
          </Link>
        </nav>
      </aside>

      {/* Contenido de la configuración */}
      <main className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        {children}
      </main>
    </div>
  );
}
