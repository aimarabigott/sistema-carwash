import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import LocationCard from "./LocationCard";

export const dynamic = 'force-dynamic';

export default async function LocationsSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id },
    include: { business: true }
  });

  if (!membership || membership.role !== "OWNER") {
    return <div className="text-red-500">Acceso denegado. Solo el dueño puede ver esto.</div>;
  }

  const locations = await prisma.location.findMany({
    where: { businessId: membership.businessId }
  });

  async function createLocation(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    if (!name) return;

    const session = await auth();
    const mem = await prisma.membership.findFirst({ where: { userId: session?.user?.id } });
    if (!mem?.businessId) return;

    await prisma.location.create({
      data: {
        name,
        businessId: mem.businessId
      }
    });

    revalidatePath('/app/settings/locations');
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-6">Mis Sedes (Sucursales)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {locations.map(loc => (
          <LocationCard key={loc.id} location={loc} />
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100">
        <h4 className="font-bold text-slate-800 mb-4">Agregar Nueva Sede</h4>
        <form action={createLocation} className="flex gap-4 max-w-md">
          <input 
            type="text" 
            name="name" 
            placeholder="Ej: Sede Miraflores" 
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Crear
          </button>
        </form>
      </div>
    </div>
  );
}
