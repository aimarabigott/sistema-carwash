'use client';

import React, { useState } from 'react';
import { ShoppingCart, Car, Smartphone, Trash2, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { processTransaction, CartItem } from '@/app/actions/pos';

export default function PosClient({ products }: { products: any[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [plate, setPlate] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { id: crypto.randomUUID(), productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleCheckout = async (paymentMethod: 'CASH' | 'CARD' | 'YAPE' | 'PLIN') => {
    if (cart.length === 0) return alert('El carrito está vacío');
    setIsProcessing(true);

    const result = await processTransaction(cart, plate, phone, paymentMethod);
    
    setIsProcessing(false);
    if (result.success) {
      alert('¡Venta registrada con éxito!');
      setCart([]);
      setPlate('');
      setPhone('');
    } else {
      alert('Error: ' + result.error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* LADO IZQUIERDO: Catálogo */}
      <div className="w-full lg:w-2/3 p-6 flex flex-col h-full overflow-hidden">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Punto de Venta</h1>
          <p className="text-slate-500">Selecciona los servicios a cobrar</p>
        </header>

        {/* Grilla de Productos */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pb-20 pr-2">
          {products.map((p) => (
            <div 
              key={p.id} 
              onClick={() => addToCart(p)}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all active:scale-95 group flex flex-col justify-between min-h-[140px]"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-sm">
                  {p.category === 'LAVADO' ? <Car size={20} /> : <ShoppingCart size={20} />}
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">S/ {p.price}</span>
              </div>
              <h3 className="font-semibold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{p.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* LADO DERECHO: Ticket */}
      <div className="hidden lg:flex w-1/3 bg-white border-l border-slate-200 p-6 flex-col shadow-2xl z-10 h-full relative">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
          <h2 className="text-xl font-bold text-slate-800">Ticket Actual</h2>
          <button onClick={() => setCart([])} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
              <ShoppingCart size={48} className="mb-4" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 group">
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">S/ {item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-slate-800">S/ {(item.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Inputs */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={plate} onChange={e => setPlate(e.target.value)}
              type="text" placeholder="Placa del Auto (Ej. ABC-123)" 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase transition-all" 
            />
          </div>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={phone} onChange={e => setPhone(e.target.value)}
              type="tel" placeholder="Celular (WhatsApp)" 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" 
            />
          </div>
        </div>

        {/* Total */}
        <div className="mt-6 bg-slate-900 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex justify-between items-center mt-3">
            <span className="text-lg text-slate-300">TOTAL</span>
            <span className="text-3xl font-bold text-blue-400">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Botones de Pago */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button 
            disabled={isProcessing} onClick={() => handleCheckout('CASH')}
            className="flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Banknote size={20} />}
            Efectivo
          </button>
          <button 
            disabled={isProcessing} onClick={() => handleCheckout('YAPE')}
            className="flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
            Tarjeta/Yape
          </button>
        </div>
      </div>
    </div>
  );
}
