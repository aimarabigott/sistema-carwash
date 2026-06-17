import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { Car, Phone } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership || !membership.businessId) return null;

  // Obtener transacciones completadas
  const transactions = await prisma.transaction.findMany({
    where: { 
      status: 'COMPLETED',
      location: { businessId: membership.businessId } // Filtramos por todo el negocio
    },
    orderBy: { createdAt: 'desc' }
  });

  // Agrupar por Placa para armar un CRM Básico
  const clientsMap: Record<string, { plate: string, phone: string, visitCount: number, totalSpent: number, lastVisit: Date }> = {};

  transactions.forEach(tx => {
    if (!tx.customerPlate) return;
    const plate = tx.customerPlate.toUpperCase();
    
    if (!clientsMap[plate]) {
      clientsMap[plate] = {
        plate,
        phone: tx.customerPhone || 'Sin teléfono',
        visitCount: 0,
        totalSpent: 0,
        lastVisit: tx.createdAt
      };
    }

    clientsMap[plate].visitCount += 1;
    clientsMap[plate].totalSpent += tx.totalAmount;
    
    // Si la transaccion actual tiene telefono y el mapa no, actualizamos
    if (tx.customerPhone && clientsMap[plate].phone === 'Sin teléfono') {
      clientsMap[plate].phone = tx.customerPhone;
    }
  });

  // Convertir a Array y ordenar por número de visitas
  const clients = Object.values(clientsMap).sort((a, b) => b.visitCount - a.visitCount);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Directorio de Clientes</h1>
        <p className="text-slate-500 mt-1">Extraído automáticamente de todas tus ventas. Identifica a tus clientes más fieles.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Auto (Placa)</th>
              <th className="px-6 py-4 font-semibold">Teléfono / WhatsApp</th>
              <th className="px-6 py-4 font-semibold text-center">Visitas Totales</th>
              <th className="px-6 py-4 font-semibold">Dinero Dejado</th>
              <th className="px-6 py-4 font-semibold text-right">Última Visita</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map(c => (
              <tr key={c.plate} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg"><Car size={16} className="text-slate-600"/></div>
                    <span className="font-bold text-slate-900 tracking-widest">{c.plate}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    {c.phone}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-xs">
                    {c.visitCount}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-emerald-600">
                  S/ {c.totalSpent.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right text-xs text-slate-500">
                  {c.lastVisit.toLocaleDateString()}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                  Aún no hay clientes registrados con placas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
