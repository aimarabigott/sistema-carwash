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
    
    // Disparar el Webhook hacia el Worker de WhatsApp (No bloqueante)
    if (phone) {
      // Construir el texto del ticket
      const ticketText = `🧾 *TICKET DE LAVADO*\n🚗 Placa: ${plate || 'N/A'}\n\n*Servicios:*\n${items.map(i => `- ${i.name} (S/${i.price})`).join('\n')}\n\n💰 *Total Pagado:* S/ ${total.toFixed(2)}\n💳 *Método:* ${paymentMethod}\n\n¡Gracias por preferirnos! 🌊`;
      
      const workerUrl = process.env.WHATSAPP_WORKER_URL || 'http://localhost:3001';
      
      // Enviamos la petición y no usamos 'await' para que la pantalla no se congele esperando a WhatsApp
      fetch(`${workerUrl}/send-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phone, 
          text: ticketText, 
          apiKey: process.env.WORKER_API_KEY || 'CARWASH_SECRET_123' 
        })
      }).catch(err => console.error("Error disparando webhook de WhatsApp:", err));
    }

    return { success: true, transactionId: transaction.id };

  } catch (error: any) {
    console.error("Error procesando pago:", error);
    return { success: false, error: error.message || "Error desconocido" };
  }
}
