'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function loginSuperAdmin(formData: FormData) {
  const password = formData.get('password') as string;
  const masterPassword = process.env.SUPERADMIN_PASSWORD;

  if (!masterPassword || password !== masterPassword) {
    return { error: 'Contraseña incorrecta' };
  }

  const cookieStore = await cookies();
  cookieStore.set('carwash_god_mode', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: '/'
  });

  redirect('/system-core');
}

export async function logoutSuperAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('carwash_god_mode');
  redirect('/system-core/login');
}

export async function checkSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('carwash_god_mode');
  return token?.value === 'authenticated';
}

export async function deleteBusiness(formData: FormData) {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) throw new Error('No autorizado');

  const businessId = formData.get('businessId') as string;
  if (!businessId) return;

  await prisma.business.delete({
    where: { id: businessId }
  });

  revalidatePath('/system-core');
}

export async function updateBusinessSubscription(formData: FormData) {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) throw new Error('No autorizado');

  const businessId = formData.get('businessId') as string;
  const dateStr = formData.get('subscriptionEnd') as string;
  
  if (!businessId || !dateStr) return;

  await prisma.business.update({
    where: { id: businessId },
    data: { subscriptionEnd: new Date(dateStr) }
  });

  revalidatePath('/system-core');
}
