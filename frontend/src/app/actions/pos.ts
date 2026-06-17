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
    return { success: true, transactionId: transaction.id };
  } catch (error) {
    return { error: 'Hubo un error al procesar el pago' };
  }
}

export async function startTransaction(items: CartItem[], plate: string, phone: string) {
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

    revalidatePath('/app/pos');
    revalidatePath('/app/dashboard');
    return { success: true };
  } catch (error) {
    return { error: 'Hubo un error al cobrar el servicio' };
  }
}
