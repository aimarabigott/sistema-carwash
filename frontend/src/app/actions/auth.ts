'use server'

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerBusiness(data: FormData) {
  try {
    const name = data.get("name") as string
    const email = data.get("email") as string
    const password = data.get("password") as string
    const businessName = data.get("businessName") as string

    if (!email || !password || !businessName) {
      return { error: "Todos los campos son obligatorios" }
    }

    // Check si el usuario existe
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "El correo ya está registrado" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear Usuario, Negocio (Tenant) y Membresía (RBAC) en transacción atómica
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      })

      const business = await tx.business.create({
        data: {
          name: businessName,
          isTrial: true,
          subscriptionEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 días de prueba
        }
      })

      const location = await tx.location.create({
        data: {
          businessId: business.id,
          name: "Sede Principal"
        }
      })

      await tx.membership.create({
        data: {
          userId: user.id,
          businessId: business.id,
          role: "OWNER",
          locationId: location.id
        }
      })
    })

    return { success: true }
  } catch (error: any) {
    console.error(error)
    return { error: "Error interno del servidor al crear la cuenta" }
  }
}
