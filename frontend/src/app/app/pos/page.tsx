import React from 'react';
import PosClient from './PosClient';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function POSPage() {
  
  // 1. Verificar si hay un negocio creado (Migración de datos inicial)
  let location = await prisma.location.findFirst();
  
  if (!location) {
    // Modo "Semilla": Si la base de datos está en blanco (recién desplegada), creamos datos falsos
    const business = await prisma.business.create({ data: { name: "Carwash Principal" } });
    location = await prisma.location.create({ data: { name: "Sede Central", businessId: business.id } });
    
    // Crear productos de prueba
    await prisma.product.createMany({
      data: [
        { name: "Lavado Básico", category: "LAVADO", price: 20, locationId: location.id },
        { name: "Lavado Salón", category: "LAVADO", price: 60, locationId: location.id },
        { name: "Encerado 3M", category: "SERVICIO_ADICIONAL", price: 35, locationId: location.id },
        { name: "Ambientador Pino", category: "PRODUCTO_AUTO", price: 5, stock: 100, locationId: location.id }
      ]
    });
  }

  // 2. Traer productos reales de la base de datos de esta sede
  const products = await prisma.product.findMany({
    where: { locationId: location.id },
    orderBy: { category: 'asc' }
  });

  return <PosClient products={products} />;
}
