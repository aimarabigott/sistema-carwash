'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function updateWhatsappStatus(locationId: string, status: boolean) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'No autorizado' };

  await prisma.location.update({
    where: { id: locationId },
    data: { whatsappConnected: status }
  });

  revalidatePath('/app/settings/locations');
  return { success: true };
}
