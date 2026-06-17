import React from 'react';
import Link from 'next/link';
import { Database, ShieldCheck, LogOut, Activity } from 'lucide-react';
import { logoutSuperAdmin } from '@/app/actions/superadmin';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-300">
      {/* Sidebar Oscuro para Modo Dios */}
      <aside className="w-64 bg-black border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-red-500 font-black text-xl tracking-tight">
            <ShieldCheck size={28} />
            <span>GOD MODE</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">CarwashOS Core</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/system-core" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-950/30 text-red-400 font-medium border border-red-900/50 hover:bg-red-900/40 transition-colors">
            <Database size={18} />
            Franquicias
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 font-medium cursor-not-allowed">
            <Activity size={18} />
            Sistema & Logs
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form action={logoutSuperAdmin}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 font-medium transition-colors">
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 overflow-auto bg-[#0a0f18]">
        {children}
      </main>
    </div>
  );
}
