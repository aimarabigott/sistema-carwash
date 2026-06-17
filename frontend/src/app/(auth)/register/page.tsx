'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Droplets, Loader2, Store } from "lucide-react"
import { registerBusiness } from "@/app/actions/auth"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const res = await registerBusiness(formData)
    
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      // Auto login
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false
      })
      if (!loginRes?.error) {
        router.push("/app/dashboard")
        router.refresh()
      } else {
        router.push("/login")
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-4 py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-center mb-4">
          <Droplets className="text-blue-600" size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-center text-slate-900 mb-2">Crea tu Carwash</h2>
        <p className="text-center text-slate-500 mb-8">Comienza tu prueba gratuita de 14 días</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo (Dueño)</label>
            <input 
              type="text" 
              name="name"
              required 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de tu Carwash</label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                name="businessName"
                required 
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Lavados El Rápido"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              name="email"
              required 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              name="password"
              required 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex justify-center items-center mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Crear Cuenta"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
