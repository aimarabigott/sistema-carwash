'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, TrendingUp, Users, Car, Wallet, ArrowUpRight } from 'lucide-react';

export default function DashboardClient({ metrics, chartData }: { metrics: any, chartData: any[] }) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-8">
      
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Panel de Control</h1>
          <p className="text-slate-400">Resumen financiero y rendimiento en tiempo real.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]">
          Descargar Reporte
        </button>
      </header>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={64} />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Ingresos Totales</p>
          <h3 className="text-3xl font-bold text-white mb-4">S/ {metrics.totalRevenue.toFixed(2)}</h3>
          <div className="flex items-center text-emerald-400 text-sm font-medium">
            <ArrowUpRight size={16} className="mr-1" />
            <span>+12.5% vs semana pasada</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Car size={64} />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Lavados Realizados</p>
          <h3 className="text-3xl font-bold text-white mb-4">{metrics.totalWashes}</h3>
          <div className="flex items-center text-emerald-400 text-sm font-medium">
            <ArrowUpRight size={16} className="mr-1" />
            <span>+5 autos nuevos</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet size={64} />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Ticket Promedio</p>
          <h3 className="text-3xl font-bold text-white mb-4">S/ {metrics.averageTicket.toFixed(2)}</h3>
          <div className="flex items-center text-emerald-400 text-sm font-medium">
            <ArrowUpRight size={16} className="mr-1" />
            <span>Excelente rendimiento</span>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Clientes Registrados</p>
          <h3 className="text-3xl font-bold text-white mb-4">{metrics.uniqueCustomers}</h3>
          <div className="flex items-center text-slate-500 text-sm font-medium">
            <span>En base de datos</span>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Ingresos (Area Chart) */}
        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Ingresos de los últimos 7 días</h2>
            <TrendingUp className="text-blue-400" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `S/${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Métodos de Pago (Bar Chart) */}
        <div className="bg-[#1e293b] border border-slate-700/50 p-6 rounded-2xl shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Métodos de Pago</h2>
            <p className="text-sm text-slate-400">Distribución de ingresos</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Efectivo', value: metrics.cashTotal },
                { name: 'Yape/Plin', value: metrics.yapeTotal },
                { name: 'Tarjeta', value: metrics.cardTotal },
              ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#334155'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
