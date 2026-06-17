import React from "react";
import Link from "next/link";
import { Droplets, LogOut, LayoutDashboard, Calculator, Settings, ShieldAlert, Users, Play } from "lucide-react";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  let isSuperAdmin = false;
  if (session?.user?.id) {
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id, role: "SUPER_ADMIN" }
    });
    if (membership) isSuperAdmin = true;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar SaaS B2B */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/app/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <Droplets size={24} className="fill-blue-100" />
            <span className="font-extrabold tracking-tight text-lg">CarwashOS</span>
          </Link>
          
          <div className="hidden sm:flex items-center gap-2 ml-4">
            <Link href="/app/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all">
              <LayoutDashboard size={18} />
              <span>Panel Dueño</span>
            </Link>
            <Link href="/app/live" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all">
              <Play size={18} />
              <span>En Vivo</span>
            </Link>
            <Link href="/app/pos" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all">
              <Calculator size={18} />
              <span>Punto de Venta</span>
            </Link>
            <Link href="/app/customers" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all">
              <Users size={18} />
              <span>Clientes</span>
            </Link>
            <Link href="/app/settings/locations" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-all">
              <Settings size={18} />
              <span>Configuración</span>
            </Link>
            {isSuperAdmin && (
              <Link href="/app/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 font-bold transition-all ml-4 border border-red-200">
                <ShieldAlert size={18} />
                <span>Panel Dios</span>
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-bold text-slate-900">{session?.user?.name}</div>
            <div className="text-xs text-slate-500">{session?.user?.email}</div>
          </div>
          
          {/* Mobile Menu Icons */}
          <div className="flex sm:hidden gap-2 mr-2">
            <Link href="/app/dashboard" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <LayoutDashboard size={20} />
            </Link>
            <Link href="/app/pos" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Calculator size={20} />
            </Link>
            <Link href="/app/customers" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Users size={20} />
            </Link>
            <Link href="/app/settings/locations" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Settings size={20} />
            </Link>
          </div>

          {/* Formulario de cierre de sesión usando Server Action nativo si fuera necesario, o Link a API. Para más rápido, usaremos api route */}
          <a href="/api/auth/signout" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <LogOut size={20} />
          </a>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main>
        {children}
      </main>
    </div>
  );
}
