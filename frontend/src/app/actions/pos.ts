'use server';

import prisma from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export async function processTransaction(items: CartItem[], plate: string, phone: string, paymentMethod: PaymentMethod) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'No autorizado' };

    // Buscar a qué sede pertenece el trabajador actual
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id }
    });

    if (!membership || !membership.locationId) {
      return { error: 'No tienes una sede asignada para registrar ventas.' };
    }

    const locationId = membership.locationId;
    const workerId = session.user.id;

    if (!items || items.length === 0) {
      return { error: 'El carrito está vacío' };
    }

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Creación Atómica en Prisma (Transacción DB) SÓLO en la sede del trabajador
    const transaction = await prisma.transaction.create({
      data: {
        locationId,
        workerId,
        customerPlate: plate || null,
        customerPhone: phone || null,
        paymentMethod,
        totalAmount: total,
        status: 'COMPLETED',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtSale: item.price
          }))
        }
      }
    });

    revalidatePath('/app/pos');
    revalidatePath('/app/dashboard');
    
    // Disparar Webhook hacia el Worker de WhatsApp
    if (phone) {
      const ticketText = `🧾 *TICKET DE LAVADO*\n🚗 Placa: ${plate || 'N/A'}\n\n*Servicios:*\n${items.map(i => `- ${i.name} (S/${i.price})`).join('\n')}\n\n💰 *Total Pagado:* S/ ${total.toFixed(2)}\n💳 *Método:* ${paymentMethod}\n\n¡Gracias por preferirnos! 🌊`;
      
      const workerUrl = process.env.WHATSAPP_WORKER_URL || 'http://localhost:3001';
      
      fetch(`${workerUrl}/send-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: phone, 
          text: ticketText, 
          apiKey: process.env.WORKER_API_KEY || 'CARWASH_SECRET_123' 
        })
      }).catch(err => console.error("Error Webhook WhatsApp:", err));
    }

    return { success: true, transactionId: transaction.id };

  } catch (error) {
    console.error("Error processing transaction:", error);
    return { error: 'Hubo un error al procesar el pago' };
  }
}
