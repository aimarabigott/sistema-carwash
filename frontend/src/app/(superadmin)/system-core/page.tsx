import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { checkSuperAdmin, updateBusinessSubscription, deleteBusiness } from "@/app/actions/superadmin";
import { redirect } from "next/navigation";
import { Trash2, Edit3, Eye, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SystemCorePage() {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) redirect('/system-core/login');

  const businesses = await prisma.business.findMany({
    include: {
      locations: true,
      memberships: { include: { user: true } }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight">Ecosistema Global</h1>
        <p className="text-slate-400 mt-2 text-sm">Monitor de franquicias aisladas en la plataforma B2B.</p>
      </header>

      <div className="bg-[#111622] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#0c101a] border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Franquicia</th>
              <th className="px-6 py-4">Dueño Principal</th>
              <th className="px-6 py-4">Volumen</th>
              <th className="px-6 py-4">Licencia</th>
              <th className="px-6 py-4 text-right">Acciones Peligrosas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {businesses.map(b => {
              const owner = b.memberships.find(m => m.role === "OWNER")?.user;
              const isExpired = b.subscriptionEnd && b.subscriptionEnd < new Date();
              const subDate = b.subscriptionEnd ? new Date(b.subscriptionEnd).toISOString().split('T')[0] : '';
              
              return (
                <tr key={b.id} className="hover:bg-[#161d2d] transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-white text-base">{b.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1">ID: {b.id.substring(0,10)}</div>
                  </td>
                  <td className="px-6 py-5">
                    {owner ? (
                      <div>
                        <div className="font-medium text-slate-200">{owner.name}</div>
                        <div className="text-xs text-slate-500">{owner.email}</div>
                      </div>
                    ) : <span className="text-slate-600 italic">Sin dueño</span>}
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs space-y-1">
                      <div><span className="font-bold text-blue-400">{b.locations.length}</span> Sedes</div>
                      <div><span className="font-bold text-purple-400">{b.memberships.length}</span> Usuarios</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <form action={updateBusinessSubscription} className="flex flex-col gap-2">
                      <input type="hidden" name="businessId" value={b.id} />
                      <div className="flex items-center gap-2">
                        <input 
                          type="date" 
                          name="subscriptionEnd" 
                          defaultValue={subDate}
                          className="bg-[#0a0f18] border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-red-500"
                        />
                        <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded transition-colors" title="Actualizar Fecha">
                          <Edit3 size={14} />
                        </button>
                      </div>
                      <div className="text-[10px]">
                        {isExpired ? <span className="text-red-500 font-bold uppercase">Expirado</span> : <span className="text-emerald-500 font-bold uppercase">Activo</span>}
                      </div>
                    </form>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-3 items-center">
                      <Link 
                        href={`/system-core/business/${b.id}`}
                        className="flex items-center gap-1 text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 px-3 py-2 rounded-lg font-bold transition-colors"
                      >
                        <Eye size={14} /> Inspeccionar
                      </Link>
                      <form action={deleteBusiness} onSubmit={(e) => { if(!confirm('⚠️ PELIGRO: ¿Estás seguro de borrar toda la franquicia y todos sus datos permanentemente?')) e.preventDefault(); }}>
                        <input type="hidden" name="businessId" value={b.id} />
                        <button 
                          type="submit" 
                          className="flex items-center gap-1 text-xs bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white px-3 py-2 rounded-lg font-bold transition-all"
                        >
                          <Trash2 size={14} /> Destruir
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
