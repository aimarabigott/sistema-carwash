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

  // 1. Obtener SÓLO los productos de esta Sede (Tenant Isolation)
  let products = await prisma.product.findMany({
    where: { locationId }
  });

  // 2. Si la sede no tiene productos, creamos unos de prueba automáticamente
  if (products.length === 0) {
    await prisma.product.createMany({
      data: [
        { name: "Lavado Básico", category: "LAVADO", price: 20.00, locationId },
        { name: "Lavado Premium", category: "LAVADO", price: 45.00, locationId },
        { name: "Encerado Carnauba", category: "SERVICIO_ADICIONAL", price: 30.00, locationId },
        { name: "Limpieza de Asientos", category: "SERVICIO_ADICIONAL", price: 80.00, locationId },
        { name: "Aromatizante Pino", category: "PRODUCTO_AUTO", price: 5.00, locationId },
        { name: "Agua Mineral", category: "SNACK", price: 3.50, locationId },
      ]
    });
    // Volver a consultar
    products = await prisma.product.findMany({ where: { locationId } });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white p-4 text-center font-bold text-sm tracking-widest shadow-md flex justify-between items-center">
        <span>SISTEMA POS TÁCTIL - CARWASHOS</span>
        <span className="text-blue-400">Sede: {membership.location?.name}</span>
      </div>
      <PosClient products={products} />
    </div>
  );
}
