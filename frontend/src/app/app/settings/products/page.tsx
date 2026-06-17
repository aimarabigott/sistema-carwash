import React from "react";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function ProductsSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id }
  });

  if (!membership || membership.role !== "OWNER") {
    return <div className="text-red-500">Acceso denegado.</div>;
  }

  const locations = await prisma.location.findMany({
    where: { businessId: membership.businessId },
    include: { products: true }
  });

  async function createProduct(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as any;
    const locationId = formData.get('locationId') as string;
    const applyToAll = formData.get('applyToAll') === 'on';

    if (!name || isNaN(price) || !category) return;

    if (applyToAll) {
      // Create for all locations
      const allLocations = await prisma.location.findMany({
        where: { businessId: membership.businessId },
        select: { id: true }
      });
      
      const productsData = allLocations.map(loc => ({
        name,
        price,
        category,
        locationId: loc.id
      }));

      await prisma.product.createMany({
        data: productsData
      });
    } else {
      if (!locationId) return;
      await prisma.product.create({
        data: { name, price, category, locationId }
      });
    }
    
    revalidatePath('/app/settings/products');
  }

  async function deleteProduct(formData: FormData) {
    'use server';
    const id = formData.get('productId') as string;
    if (!id) return;
    await prisma.product.delete({ where: { id } });
    revalidatePath('/app/settings/products');
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-6">Mis Servicios y Productos</h3>

      {locations.map(loc => (
        <div key={loc.id} className="mb-8">
          <h4 className="font-bold text-lg text-slate-800 mb-3 border-b pb-2">{loc.name}</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {loc.products.map(p => (
              <div key={p.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                <div className="font-bold text-slate-800">{p.name}</div>
                <div className="text-sm text-slate-500">{p.category}</div>
                <div className="text-lg font-extrabold text-blue-600 mt-2">S/ {p.price.toFixed(2)}</div>
                
                <form action={deleteProduct} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="productId" value={p.id} />
                  <button type="submit" className="text-red-500 hover:bg-red-100 p-1 rounded-md text-xs font-bold">Eliminar</button>
                </form>
              </div>
            ))}
            {loc.products.length === 0 && (
              <div className="col-span-3 text-sm text-slate-500 italic p-4 bg-slate-50 rounded-lg">No hay productos en esta sede.</div>
            )}
          </div>
        </div>
      ))}

      <div className="pt-6 border-t border-slate-100">
        <h4 className="font-bold text-slate-800 mb-4">Agregar Nuevo Producto</h4>
        <form action={createProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
            <input type="text" name="name" required className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium" placeholder="Ej: Lavado VIP" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
            <select name="category" required className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium">
              <option value="LAVADO">Lavado</option>
              <option value="SERVICIO_ADICIONAL">Servicio Adicional</option>
              <option value="PRODUCTO_AUTO">Producto de Auto</option>
              <option value="SNACK">Snack/Bebida</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio (S/)</label>
            <input type="number" step="0.10" name="price" required className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium" placeholder="25.00" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asignar a Sede</label>
            <select name="locationId" className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium mb-2">
              <option value="">Selecciona una sede...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" name="applyToAll" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Aplicar a todas mis sedes
            </label>
          </div>
          <div className="lg:col-span-4 mt-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
