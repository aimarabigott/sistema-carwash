import React from 'react';
import PosClient from './PosClient';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function POSPage(props: { searchParams: Promise<{ sede?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Obtener la membresía del usuario para saber a qué Negocio y Sede (Location) pertenece
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { location: true }
  });

  if (!membership) {
    return <div className="p-10 text-center text-xl text-red-500 font-bold">Error: Sin acceso al sistema.</div>;
  }

  // Si el usuario cambia la sede en el selector (Solo para Owners)
  const searchParamsValue = searchParams.sede;
  let locationId = membership.locationId;
  
  if (searchParamsValue && (membership.role === 'OWNER' || membership.role === 'SUPER_ADMIN')) {
    locationId = searchParamsValue;
  }

  if (!locationId) {
    return <div className="p-10 text-center text-xl text-red-500 font-bold">Error: No tienes una sede asignada para operar el POS.</div>;
  }

  // Obtener todas las sedes si es Dueño para el selector
  let ownerLocations = [];
  if (membership.role === 'OWNER' || membership.role === 'SUPER_ADMIN') {
    ownerLocations = await prisma.location.findMany({
      where: { businessId: membership.businessId },
      select: { id: true, name: true }
    });
  }

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

  // 3. Obtener listado de placas frecuentes
  const frequentCustomers = await prisma.transaction.findMany({
    where: { locationId, customerPlate: { not: null } },
    select: { customerPlate: true, customerName: true, customerPhone: true, vehicleType: true },
    distinct: ['customerPlate'],
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-slate-900 text-white p-4 text-center font-bold text-sm tracking-widest flex justify-between items-center">
        <span>SISTEMA POS TÁCTIL</span>
        <span className="text-blue-400">Sede Activa</span>
      </div>
      <PosClient 
        products={products} 
        activeTransactions={activeTransactions} 
        frequentCustomers={frequentCustomers}
        role={membership.role}
        locations={ownerLocations}
        currentLocationId={locationId}
      />
    </div>
  );
}
