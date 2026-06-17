'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Clock, Car, Users } from 'lucide-react';

export default function LiveClient({ transactions, locations, currentSede }: { transactions: any[], locations: any[], currentSede: string }) {
  const router = useRouter();

  useEffect(() => {
    // Auto-refresh cada 10 segundos
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const handleSedeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href);
    url.searchParams.set('sede', e.target.value);
    router.push(url.toString());
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-red-200"></div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cámaras en Vivo</h1>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-2 rounded-xl">
          <MapPin size={18} className="text-slate-500" />
          <select 
            className="bg-transparent text-slate-800 font-bold outline-none cursor-pointer"
            value={currentSede}
            onChange={handleSedeChange}
          >
            <option value="all">Ver Todas las Sedes</option>
            {locations.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {transactions.map(tx => (
          <div key={tx.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="bg-yellow-400 p-1 text-center text-xs font-black tracking-widest text-yellow-900 uppercase">
              Lavando Ahora
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{tx.customerPlate || 'SIN PLACA'}</h3>
                  <p className="text-sm font-medium text-slate-500">{tx.customerName || 'Cliente Anónimo'} ({tx.vehicleType || 'Auto'})</p>
                </div>
                <div className="bg-slate-100 px-2 py-1 rounded text-sm font-bold text-slate-800">
                  S/ {tx.totalAmount.toFixed(2)}
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400"/>
                  <span className="font-bold">{tx.location.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-slate-400"/>
                  <span>Lavador: <span className="font-bold">{tx.worker?.name || 'Desconocido'}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400"/>
                  <span>Inicio: <span className="font-bold">{new Date(tx.createdAt).toLocaleTimeString()}</span></span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Servicios</div>
                <ul className="text-sm text-slate-800 space-y-1">
                  {tx.items.map((item: any) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.quantity}x {item.product.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <Car size={64} className="text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No hay vehículos lavándose en este momento</h3>
          </div>
        )}
      </div>
    </div>
  );
}
