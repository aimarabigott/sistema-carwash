'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, Users, Car, Wallet, ArrowUpRight, MapPin, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardClient({ metrics, chartData, locations, currentSede, currentRango }: { metrics: any, chartData: any[], locations: {id: string, name: string}[], currentSede: string, currentRango: string }) {
  const router = useRouter();

  const handleFilterChange = (key: string, value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    router.push(url.toString());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-8">
      
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Panel de Control</h1>
          <p className="text-slate-500 mt-1">Resumen financiero y rendimiento en tiempo real.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {locations && locations.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
              <MapPin size={18} className="text-slate-500" />
              <select 
                className="bg-transparent text-slate-800 focus:outline-none text-sm font-bold cursor-pointer"
                value={currentSede}
                onChange={(e) => handleFilterChange('sede', e.target.value)}
              >
                <option value="all" className="bg-white">Todas las Sedes</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id} className="bg-white">{l.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
            <Calendar size={18} className="text-slate-500" />
            <select 
              className="bg-transparent text-slate-800 focus:outline-none text-sm font-bold cursor-pointer"
              value={currentRango}
              onChange={(e) => handleFilterChange('rango', e.target.value)}
            >
              <option value="7" className="bg-white">Últimos 7 días</option>
              <option value="30" className="bg-white">Últimos 30 días</option>
              <option value="90" className="bg-white">Últimos 3 meses</option>
              <option value="180" className="bg-white">Últimos 6 meses</option>
              <option value="365" className="bg-white">Último año</option>
            </select>
          </div>
        </div>
      </header>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Ingresos</p>
            <h3 className="text-3xl font-black text-slate-900">S/ {metrics.totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all"></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Lavados</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics.totalWashes}</h3>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
            <Car size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-all"></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Ticket Promedio</p>
            <h3 className="text-3xl font-black text-slate-900">S/ {metrics.averageTicket.toFixed(2)}</h3>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl text-amber-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-all"></div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Clientes Únicos</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics.uniqueCustomers}</h3>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl text-purple-600">
            <Users size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Tendencias */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Tendencia de Ingresos</h2>
            <button className="text-blue-500 text-sm font-bold flex items-center gap-1 hover:text-blue-600 transition-colors">
              Ver Reporte <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown por Métodos de Pago */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Wallet className="text-slate-500" size={20} /> Origen de Fondos
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="font-bold text-slate-700">Efectivo</span>
                </div>
                <span className="font-black text-slate-900">S/ {metrics.cashTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="font-bold text-slate-700">Yape / Plin</span>
                </div>
                <span className="font-black text-slate-900">S/ {metrics.yapeTotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-bold text-slate-700">Tarjetas</span>
                </div>
                <span className="font-black text-slate-900">S/ {metrics.cardTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%" minHeight={100}>
                <BarChart data={[
                  { name: 'Efectivo', amount: metrics.cashTotal, fill: '#34d399' },
                  { name: 'Yape', amount: metrics.yapeTotal, fill: '#a855f7' },
                  { name: 'Tarjeta', amount: metrics.cardTotal, fill: '#3b82f6' }
                ]} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" hide />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', color: '#0f172a' }}/>
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
