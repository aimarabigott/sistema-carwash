'use client';

import React, { useState } from 'react';
import { ShieldAlert, KeyRound } from 'lucide-react';
import { loginSuperAdmin } from '@/app/actions/superadmin';

export default function SuperAdminLogin() {
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    const res = await loginSuperAdmin(formData);
    if (res?.error) {
      setError(res.error);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f18] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black border border-red-900/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Adorno brillante rojo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <div className="flex justify-center mb-6 text-red-500">
          <ShieldAlert size={48} />
        </div>
        
        <h1 className="text-2xl font-black text-white text-center mb-2 tracking-tight">Acceso Restringido</h1>
        <p className="text-slate-400 text-center text-sm mb-8">Esta área es de acceso exclusivo para la administración de CarwashOS.</p>

        <form action={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contraseña Maestra</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input 
                type="password" 
                name="password"
                required
                className="w-full bg-slate-900 border border-slate-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-slate-600"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm text-center font-medium bg-red-950/50 py-2 rounded-lg border border-red-900/50">{error}</div>}

          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]"
          >
            Verificar Identidad
          </button>
        </form>
      </div>
    </div>
  );
}
