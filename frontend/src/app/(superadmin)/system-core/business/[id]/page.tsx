import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { checkSuperAdmin } from '@/app/actions/superadmin';
import { redirect } from 'next/navigation';
import { ArrowLeft, MapPin, Users, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BusinessDetail({ params }: { params: Promise<{ id: string }> }) {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) redirect('/system-core/login');

  const resolvedParams = await params;
  const businessId = resolvedParams.id;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      locations: true,
      memberships: {
        include: { user: true, location: true }
      }
    }
  });

  if (!business) return <div className="text-white p-10">Franquicia no encontrada</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link href="/system-core" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 text-sm font-bold">
        <ArrowLeft size={16} /> Volver al Hub
      </Link>
      
      <header className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight">{business.name}</h1>
        <p className="text-slate-400 mt-2 text-sm">Inspección de recursos de franquicia.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Sedes */}
        <div className="bg-[#111622] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-blue-400 font-bold mb-6 text-lg">
            <MapPin size={20} /> Sedes Operativas ({business.locations.length})
          </div>
          <div className="space-y-4">
            {business.locations.map(loc => (
              <div key={loc.id} className="bg-[#161d2d] p-4 rounded-xl border border-slate-800/50 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{loc.name}</div>
                  <div className="text-xs text-slate-500 mt-1">ID: {loc.id}</div>
                </div>
                <div>
                  {loc.whatsappConnected ? (
                    <span className="bg-emerald-900/30 text-emerald-400 text-xs px-2 py-1 rounded font-bold">WA Conectado</span>
                  ) : (
                    <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded font-bold">WA Desconectado</span>
                  )}
                </div>
              </div>
            ))}
            {business.locations.length === 0 && <p className="text-slate-500 text-sm">No tiene sedes registradas.</p>}
          </div>
        </div>

        {/* Usuarios */}
        <div className="bg-[#111622] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-purple-400 font-bold mb-6 text-lg">
            <Users size={20} /> Personal Registrado ({business.memberships.length})
          </div>
          <div className="space-y-4">
            {business.memberships.map(m => (
              <div key={m.id} className="bg-[#161d2d] p-4 rounded-xl border border-slate-800/50 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{m.user.name || 'Sin nombre'}</div>
                  <div className="text-xs text-slate-400 mt-1">{m.user.email}</div>
                  {m.location && <div className="text-[10px] text-slate-500 mt-1 uppercase">Sede: {m.location.name}</div>}
                </div>
                <div className="text-right">
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded font-bold tracking-widest">{m.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
