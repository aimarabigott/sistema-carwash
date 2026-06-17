import Link from "next/link";
import { ArrowRight, Droplets, CheckCircle, BarChart3, Smartphone } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="text-blue-600" size={28} />
            <span className="font-extrabold text-xl tracking-tight">CarwashOS</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl shadow-sm transition-all">
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
            El sistema operativo para <br className="hidden md:block"/>
            <span className="text-blue-600">Carwashes modernos.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Controla tus ventas, gestiona a tus trabajadores, envía recibos automáticos por WhatsApp y analiza tus ganancias en tiempo real. Todo desde la nube.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Inicia tu prueba de 14 días <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-xl text-lg border border-slate-200 flex items-center justify-center transition-colors">
              Ver características
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">POS Ultra Rápido</h3>
                <p className="text-slate-600 leading-relaxed">Punto de venta táctil diseñado para operar en tablets y celulares. Cobra en menos de 5 segundos.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">WhatsApp Automático</h3>
                <p className="text-slate-600 leading-relaxed">Envía tickets de cobro directamente al WhatsApp de tu cliente sin intervención humana.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Panel de Dueño</h3>
                <p className="text-slate-600 leading-relaxed">Analíticas financieras, proyecciones de ingresos y control de comisiones de trabajadores.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
