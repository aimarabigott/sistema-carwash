import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export default async function WorkersSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership || membership.role !== "OWNER") {
    return <div className="text-red-500">Acceso denegado. Solo el dueño puede administrar trabajadores.</div>;
  }

  const businessId = membership.businessId;

  const locations = await prisma.location.findMany({
    where: { businessId }
  });

  // Buscar todos los trabajadores de este negocio
  const workers = await prisma.membership.findMany({
    where: { businessId, role: "WORKER" },
    include: { user: true, location: true }
  });

  async function createWorker(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const locationId = formData.get('locationId') as string;

    if (!name || !email || !password || !locationId) return;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return; // Mejor manejar errores en cliente en un app real, pero servirá para MVP

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, password: hashedPassword }
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          businessId,
          locationId,
          role: "WORKER"
        }
      });
    });

    revalidatePath('/app/settings/workers');
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-6">Mis Lavadores</h3>
      
      <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-8">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Correo (Login)</th>
              <th className="px-4 py-3 font-semibold">Sede Asignada</th>
            </tr>
          </thead>
          <tbody>
            {workers.map(w => (
              <tr key={w.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-900">{w.user.name}</td>
                <td className="px-4 py-3">{w.user.email}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-bold">
                    {w.location?.name || "Sin asignar"}
                  </span>
                </td>
              </tr>
            ))}
            {workers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">No tienes lavadores registrados aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h4 className="font-bold text-slate-800 mb-4">Crear Cuenta para un Lavador</h4>
        <form action={createWorker} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
            <input type="text" name="name" required className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="Luis Lavador" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo de Acceso</label>
            <input type="email" name="email" required className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="luis@tuempresa.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
            <input type="password" name="password" required className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asignar a Sede</label>
            <select name="locationId" required className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white">
              <option value="">Selecciona una sede...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 mt-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto">
              Registrar Lavador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
