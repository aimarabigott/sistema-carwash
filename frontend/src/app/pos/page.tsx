import React from 'react';
import { ShoppingCart, Car, Smartphone, CheckCircle, CreditCard, Banknote, Trash2 } from 'lucide-react';

export default function POSPage() {
  // Simulación estática de datos (luego se conectará a Prisma)
  const products = [
    { id: '1', name: 'Lavado Básico', price: 20, category: 'LAVADO', color: 'bg-blue-500' },
    { id: '2', name: 'Lavado Salón', price: 60, category: 'LAVADO', color: 'bg-indigo-500' },
    { id: '3', name: 'Encerado', price: 30, category: 'SERVICIO_ADICIONAL', color: 'bg-purple-500' },
    { id: '4', name: 'Silicona Llanta', price: 5, category: 'PRODUCTO_AUTO', color: 'bg-slate-700' },
    { id: '5', name: 'Gaseosa Inka Cola', price: 3, category: 'SNACK', color: 'bg-yellow-500' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* LADO IZQUIERDO: Catálogo de Servicios (70% en PC, Oculto/Pestaña en Móvil) */}
      <div className="w-full lg:w-2/3 p-6 flex flex-col h-full overflow-hidden">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Punto de Venta</h1>
          <p className="text-slate-500">Selecciona los servicios a cobrar</p>
        </header>

        {/* Categorías (Filtros) */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {['Todos', 'Lavados', 'Adicionales', 'Snacks'].map((cat) => (
            <button key={cat} className="px-5 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-medium hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm whitespace-nowrap">
              {cat}
            </button>
          ))}
        </div>

        {/* Grilla de Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pb-20 pr-2">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all active:scale-95 group flex flex-col justify-between min-h-[140px]">
              <div className="flex justify-between items-start mb-2">
                <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center text-white shadow-sm`}>
                  {p.category === 'LAVADO' ? <Car size={20} /> : <ShoppingCart size={20} />}
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">S/ {p.price}</span>
              </div>
              <h3 className="font-semibold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{p.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* LADO DERECHO: Ticket / Carrito (30% en PC, Ocupa 100% si se despliega en móvil) */}
      <div className="hidden lg:flex w-1/3 bg-white border-l border-slate-200 p-6 flex-col shadow-2xl z-10 h-full relative">
        
        {/* Cabecera del Ticket */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
          <h2 className="text-xl font-bold text-slate-800">Ticket Actual</h2>
          <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Lista de Items (Vacía por ahora) */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
            <ShoppingCart size={48} className="mb-4" />
            <p>El carrito está vacío</p>
          </div>
          {/* Aquí irían los items:
          <div className="flex justify-between items-center mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Lavado Salón</p>
              <p className="text-xs text-slate-500">S/ 60.00 x 1</p>
            </div>
            <p className="font-bold text-slate-800">S/ 60.00</p>
          </div>
          */}
        </div>

        {/* Inputs del Cliente (Placa y Celular para WhatsApp) */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Placa del Auto (ABC-123)" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase transition-all" />
          </div>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="tel" placeholder="Celular (WhatsApp)" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
          </div>
        </div>

        {/* Resumen Total */}
        <div className="mt-6 bg-slate-900 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-400 font-medium">Subtotal</span>
            <span className="font-semibold">S/ 0.00</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-700 mt-3 pt-3">
            <span className="text-lg text-slate-300">TOTAL</span>
            <span className="text-3xl font-bold text-blue-400">S/ 0.00</span>
          </div>
        </div>

        {/* Botones de Pago */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button className="flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors shadow-sm active:scale-95">
            <Banknote size={20} />
            Efectivo
          </button>
          <button className="flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm active:scale-95">
            <CreditCard size={20} />
            Tarjeta/Yape
          </button>
        </div>
      </div>

    </div>
  );
}
