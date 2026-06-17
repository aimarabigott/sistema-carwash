import React from 'react';
import PosClient from './PosClient';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function POSPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Obtener la membresía del usuario para saber a qué Negocio y Sede (Location) pertenece
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { location: true }
  });

  if (!membership || !membership.locationId) {
    // Si no tiene sede asignada, no puede usar el POS
    return <div className="p-10 text-center text-xl text-red-500 font-bold">Error: No tienes una sede asignada para operar el POS.</div>;
  }

  const locationId = membership.locationId;

  // 1. Obtener SÓLO los productos de esta Sede
  const products = await prisma.product.findMany({
    where: { locationId }
  });

  // 2. Obtener los servicios "En Curso" para esta Sede
  const activeTransactions = await prisma.transaction.findMany({
    where: { locationId, status: 'IN_PROGRESS' },
    include: { items: { include: { product: true } }, worker: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-slate-900 text-white p-4 text-center font-bold text-sm tracking-widest flex justify-between items-center">
        <span>SISTEMA POS TÁCTIL - CARWASHOS</span>
        <span className="text-blue-400">Sede: {membership.location?.name}</span>
      </div>
      <PosClient products={products} activeTransactions={activeTransactions} />
    </div>
  );
}
