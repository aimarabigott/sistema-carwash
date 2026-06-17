'use server';

import prisma from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

async function sendWhatsAppMessage(locationId: string, phone: string, message: string) {
  const WHATSAPP_API = process.env.NEXT_PUBLIC_WHATSAPP_URL;
  if (!WHATSAPP_API || !phone) return;
  try {
    await fetch(`${WHATSAPP_API}/send/${locationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message })
    });
  } catch (e) {
    console.error('Error enviando WhatsApp:', e);
  }
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export async function processTransaction(items: CartItem[], plate: string, phone: string, paymentMethod: PaymentMethod, customerName?: string, vehicleType?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'No autorizado' };

    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id }
    });
    if (!membership || !membership.locationId) return { error: 'No tienes una sede asignada.' };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const transaction = await prisma.transaction.create({
      data: {
        locationId: membership.locationId,
        workerId: session.user.id,
        customerPlate: plate || null,
        customerPhone: phone || null,
        customerName: customerName || null,
        vehicleType: vehicleType || null,
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

    if (phone) {
      await sendWhatsAppMessage(
        membership.locationId, 
        phone, 
        `🚗 Hola ${customerName || ''}, tu lavado por S/${total.toFixed(2)} (Placa: ${plate || 'S/N'}) se ha registrado exitosamente. ¡Gracias por preferirnos!`
      );
    }

    revalidatePath('/app/pos');
    revalidatePath('/app/dashboard');
    return { success: true, transactionId: transaction.id };
  } catch (error) {
    return { error: 'Hubo un error al procesar el pago' };
  }
}

export async function startTransaction(items: CartItem[], plate: string, phone: string, customerName?: string, vehicleType?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'No autorizado' };

    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id }
    });
    if (!membership || !membership.locationId) return { error: 'No tienes una sede asignada.' };

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await prisma.transaction.create({
      data: {
        locationId: membership.locationId,
        workerId: session.user.id,
        customerPlate: plate || null,
        customerPhone: phone || null,
        customerName: customerName || null,
        vehicleType: vehicleType || null,
        paymentMethod: 'CASH', // Dummy payment, will change on complete
        totalAmount: total,
        status: 'IN_PROGRESS',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtSale: item.price
          }))
        }
      }
    });

    if (phone) {
      await sendWhatsAppMessage(
        membership.locationId, 
        phone, 
        `🚗 Hola ${customerName || ''}, hemos recibido tu vehículo (Placa: ${plate || 'S/N'}). Te avisaremos automáticamente por aquí cuando el lavado esté finalizado. ¡Gracias!`
      );
    }

    revalidatePath('/app/pos');
    return { success: true };
  } catch (error) {
    return { error: 'Hubo un error al iniciar el servicio' };
  }
}

export async function completeTransaction(transactionId: string, paymentMethod: PaymentMethod) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: 'No autorizado' };

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'COMPLETED',
        paymentMethod: paymentMethod
      }
    });

    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (transaction && transaction.customerPhone) {
      await sendWhatsAppMessage(
        transaction.locationId,
        transaction.customerPhone,
        `✨ ¡Tu vehículo (Placa: ${transaction.customerPlate || 'S/N'}) ya está listo y reluciente! Total cobrado: S/${transaction.totalAmount.toFixed(2)}. ¡Te esperamos pronto!`
      );
    }

    revalidatePath('/app/pos');
    revalidatePath('/app/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'Hubo un error al cobrar el servicio' };
  }
}
