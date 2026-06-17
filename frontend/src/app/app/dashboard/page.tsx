import React from 'react';
import DashboardClient from './DashboardClient';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage(props: { searchParams: Promise<{ sede?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Aislar: Obtener a qué franquicia pertenece el dueño
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership || !membership.businessId) {
    return <div className="p-10 text-center text-xl text-red-500 font-bold">Error: No tienes una empresa asignada.</div>;
  }

  // RBAC: Bloquear a los trabajadores (Lavadores)
  if (membership.role === "WORKER") {
    redirect('/app/pos');
  }

  // Obtener todas las sedes de este negocio
  const locations = await prisma.location.findMany({
    where: { businessId: membership.businessId },
    select: { id: true, name: true }
  });
  
  let locationIdsToFilter = locations.map(l => l.id);
  if (searchParams.sede && searchParams.sede !== "all") {
    locationIdsToFilter = [searchParams.sede];
  }

  // Extraer SÓLO las transacciones de las sedes filtradas (Tenant Isolation)
  const transactions = await prisma.transaction.findMany({
    where: { 
      status: 'COMPLETED',
      locationId: { in: locationIdsToFilter }
    },
    orderBy: { createdAt: 'asc' }
  });

  // Calcular KPIs principales
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalWashes = transactions.length;
  const averageTicket = totalWashes > 0 ? totalRevenue / totalWashes : 0;
  
  const uniquePlates = new Set(transactions.map(tx => tx.customerPlate).filter(Boolean));
  const uniqueCustomers = uniquePlates.size;

  const cashTotal = transactions.filter(t => t.paymentMethod === 'CASH').reduce((sum, tx) => sum + tx.totalAmount, 0);
  const yapeTotal = transactions.filter(t => t.paymentMethod === 'YAPE' || t.paymentMethod === 'PLIN').reduce((sum, tx) => sum + tx.totalAmount, 0);
  const cardTotal = transactions.filter(t => t.paymentMethod === 'CARD').reduce((sum, tx) => sum + tx.totalAmount, 0);

  let chartData: {date: string, revenue: number}[] = [];
  const grouped: Record<string, number> = {};
  
  // Rellenar últimos 7 días con cero
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('es-ES', { weekday: 'short' });
    grouped[dateStr] = 0;
  }

  transactions.forEach(tx => {
    const dateStr = tx.createdAt.toLocaleDateString('es-ES', { weekday: 'short' });
    if (grouped[dateStr] !== undefined) {
      grouped[dateStr] += tx.totalAmount;
    }
  });
  
  chartData = Object.keys(grouped).map(k => ({ date: k, revenue: grouped[k] }));

  const metrics = {
    totalRevenue,
    totalWashes,
    averageTicket,
    uniqueCustomers,
    cashTotal,
    yapeTotal,
    cardTotal
  };

  return <DashboardClient metrics={metrics} chartData={chartData} locations={locations} currentSede={searchParams.sede || "all"} />;
}
