import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Verificar si es SuperAdmin
  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, role: "SUPER_ADMIN" }
  });

  if (!membership) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-3xl font-bold text-slate-800">Acceso Restringido</h2>
        <p className="text-slate-500 mt-2 mb-4">Solo el Super Administrador de CarwashOS puede ver esta zona.</p>
        <form action={async () => {
          'use server';
          // Backdoor temporal para desarrollo: Convertirse a sí mismo en SuperAdmin
          const mySession = await auth();
          if (mySession?.user?.id) {
            await prisma.membership.updateMany({
              where: { userId: mySession.user.id },
              data: { role: "SUPER_ADMIN" }
            });
            revalidatePath('/app/admin');
          }
        }}>
          <button type="submit" className="text-sm bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200">
            [DevMode] Hacerme SuperAdmin
          </button>
        </form>
      </div>
    );
  }

  // Si es SuperAdmin, cargar TODO el ecosistema SaaS
  const businesses = await prisma.business.findMany({
    include: {
      locations: true,
      memberships: {
        include: { user: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  async function updateSubscription(formData: FormData) {
    'use server';
    const businessId = formData.get('businessId') as string;
    const action = formData.get('action') as string;

    if (!businessId || !action) return;

    if (action === "freeze") {
      // Bloquear acceso poniendo fecha pasada
      await prisma.business.update({
        where: { id: businessId },
        data: { subscriptionEnd: new Date(Date.now() - 86400000) } // Ayer
      });
    } else if (action === "add_month") {
      // Dar un mes
      await prisma.business.update({
        where: { id: businessId },
        data: { subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      });
    }

    revalidatePath('/app/admin');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel Dios (SuperAdmin)</h1>
        <p className="text-slate-500 mt-1">Control total sobre todas las franquicias Carwash registradas en el SaaS.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Franquicia</th>
              <th className="px-6 py-4 font-semibold">Dueño (Email)</th>
              <th className="px-6 py-4 font-semibold">Métricas</th>
              <th className="px-6 py-4 font-semibold">Suscripción</th>
              <th className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.map(b => {
              const owner = b.memberships.find(m => m.role === "OWNER" || m.role === "SUPER_ADMIN")?.user;
              const isExpired = b.subscriptionEnd && b.subscriptionEnd < new Date();
              
              return (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{b.name}</div>
                    <div className="text-xs text-slate-400">ID: {b.id.substring(0,8)}</div>
                  </td>
                  <td className="px-6 py-4">
                    {owner ? (
                      <div>
                        <div className="font-medium text-slate-800">{owner.name}</div>
                        <div className="text-xs text-slate-500">{owner.email}</div>
                      </div>
                    ) : 'Sin dueño'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <div><span className="font-semibold text-slate-700">{b.locations.length}</span> Sedes</div>
                      <div><span className="font-semibold text-slate-700">{b.memberships.length}</span> Usuarios</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isExpired ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Expirada
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activa ({b.subscriptionEnd ? new Date(b.subscriptionEnd).toLocaleDateString() : 'Trial'})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={updateSubscription} className="flex justify-end gap-2">
                      <input type="hidden" name="businessId" value={b.id} />
                      <button 
                        type="submit" 
                        name="action" 
                        value="freeze"
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Congelar
                      </button>
                      <button 
                        type="submit" 
                        name="action" 
                        value="add_month"
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        +1 Mes
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
