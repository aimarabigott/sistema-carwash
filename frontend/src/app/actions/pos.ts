'use server';

import prisma from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Tipos requeridos
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export async function processTransaction(
  items: CartItem[],
  total: number,
  plate: string,
  phone: string,
  paymentMethod: PaymentMethod
) {
  try {
    // 1. Obtener la sucursal actual (Hardcodeada por ahora hasta implementar el Login)
    const location = await prisma.location.findFirst();
    if (!location) throw new Error("No hay sucursales registradas.");

    // 2. Transacción Atómica: Si algo falla, se revierte todo (Prisma Transaction)
    const transaction = await prisma.$transaction(async (tx) => {
      
      // A. Crear la venta (Ticket principal)
      const sale = await tx.transaction.create({
        data: {
          locationId: location.id,
          workerId: "temporal-worker-id", // Hardcodeado hasta tener Login
          customerPlate: plate || null,
          customerPhone: phone || null,
          paymentMethod,
          totalAmount: total,
          status: 'COMPLETED'
        }
      });

      // B. Insertar todos los items del carrito y descontar inventario si aplica
      for (const item of items) {
        await tx.transactionItem.create({
          data: {
            transactionId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtSale: item.price
          }
        });

        // Opcional: Descontar stock si es un producto físico (ej. Ambientador, Snack)
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product && product.stock !== null && product.stock >= item.quantity) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: product.stock - item.quantity }
          });
        }
      }

      return sale;
    });

    revalidatePath('/pos'); // Refrescar la pantalla de POS
    
    // Aquí dispararemos el Webhook hacia WhatsApp (Render) en la Fase 4
    // fetch('https://tu-render-app.onrender.com/send-ticket', { ... })

    return { success: true, transactionId: transaction.id };

  } catch (error: any) {
    console.error("Error procesando pago:", error);
    return { success: false, error: error.message || "Error desconocido" };
  }
}
