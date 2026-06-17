import React from 'react';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LiveClient from './LiveClient';

export const dynamic = 'force-dynamic';

export default async function LivePage(props: { searchParams: Promise<{ sede?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { location: true }
  });

  if (!membership || membership.role === 'WORKER') {
    redirect('/app/pos'); // Workers don't get access to Live View
  }

  // Obtener todas las sedes del dueño
  const locations = await prisma.location.findMany({
    where: { businessId: membership.businessId },
    select: { id: true, name: true }
  });

  let locationIdsToQuery = locations.map(l => l.id);
  if (searchParams.sede && searchParams.sede !== 'all') {
    locationIdsToQuery = [searchParams.sede];
  }

  // Obtener transacciones "En Curso" (Live)
  const liveTransactions = await prisma.transaction.findMany({
    where: { 
      status: 'IN_PROGRESS',
      locationId: { in: locationIdsToQuery }
    },
    include: { 
      location: true,
      worker: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return <LiveClient transactions={liveTransactions} locations={locations} currentSede={searchParams.sede || 'all'} />;
}
