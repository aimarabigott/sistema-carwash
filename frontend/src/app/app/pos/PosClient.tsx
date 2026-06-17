'use client';

import React, { useState } from 'react';
import { ShoppingCart, CheckCircle, Car, Plus, Minus, Trash2, Clock, Phone, Banknote, CreditCard, Play, Users, MapPin, Search, User } from 'lucide-react';
import { startTransaction, completeTransaction } from '@/app/actions/pos';
import { useRouter } from 'next/navigation';

export default function PosClient({ 
  products, 
  activeTransactions = [], 
  frequentCustomers = [],
  role = 'WORKER',
  locations = [],
  currentLocationId = ''
}: { 
  products: any[], 
  activeTransactions?: any[], 
  frequentCustomers?: any[],
  role?: string,
  locations?: any[],
  currentLocationId?: string
}) {
  const router = useRouter();
  
  const [cart, setCart] = useState<any[]>([]);
  const [plate, setPlate] = useState('');
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [vehicleType, setVehicleType] = useState('Auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'POS' | 'BOARD'>('POS');
  const [customerMode, setCustomerMode] = useState<'NUEVO' | 'FRECUENTE'>('NUEVO');

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Auto-fill para clientes frecuentes
  const handlePlateChange = (val: string) => {
    const uppercasePlate = val.toUpperCase();
    setPlate(uppercasePlate);

    if (customerMode === 'FRECUENTE') {
      const found = frequentCustomers.find(c => c.customerPlate === uppercasePlate);
      if (found) {
        setCustomerName(found.customerName || '');
        setPhone(found.customerPhone || '');
        setVehicleType(found.vehicleType || 'Auto');
      } else {
        setCustomerName('');
        setPhone('');
      }
    }
  };

  const handleStartService = async () => {
    if (cart.length === 0) return alert('El carrito está vacío');
    if (!plate) return alert('Debes ingresar la placa para iniciar un lavado');
    if (customerMode === 'NUEVO' && !customerName) return alert('Debes ingresar el nombre del cliente');
    
    setIsProcessing(true);
    const result = await startTransaction(cart, plate, phone, customerName, vehicleType);
    setIsProcessing(false);
    
    if (result.success) {
      setCart([]);
      setPlate('');
      setPhone('');
      setCustomerName('');
      setVehicleType('Auto');
      setActiveTab('BOARD');
    } else {
      alert(result.error);
    }
  };

  const handleComplete = async (txId: string, method: 'CASH' | 'YAPE' | 'CARD') => {
    setIsProcessing(true);
    const result = await completeTransaction(txId, method);
    setIsProcessing(false);
    if (!result.success) alert(result.error);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const url = new URL(window.location.href);
    url.searchParams.set('sede', e.target.value);
    router.push(url.toString());
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-100">
      
      {/* Selector Mobile */}
      <div className="flex md:hidden bg-white border-b border-slate-200">
        <button 
          className={`flex-1 py-3 text-sm font-bold ${activeTab === 'POS' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('POS')}
        >
          Nuevo Servicio
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-bold ${activeTab === 'BOARD' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('BOARD')}
        >
          En Curso ({activeTransactions.length})
        </button>
      </div>

      {/* COLUMNA IZQUIERDA: POS (Productos y Carrito) */}
      <div className={`flex-1 flex flex-col lg:flex-row ${activeTab === 'BOARD' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Productos */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto h-[calc(100vh-120px)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Catálogo</h2>
            
            {/* Selector de Sede para Owner */}
            {(role === 'OWNER' || role === 'SUPER_ADMIN') && locations.length > 0 && (
              <div className="flex items-center gap-2 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm">
                <MapPin size={16} className="text-slate-500" />
                <select 
                  className="bg-transparent text-slate-800 text-sm font-bold outline-none"
                  value={currentLocationId}
                  onChange={handleLocationChange}
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(p => (
              <button 
                key={p.id} 
                onClick={() => addToCart(p)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col justify-between aspect-square"
              >
                <div>
                  <div className="text-xs font-bold text-blue-500 mb-1">{p.category}</div>
                  <div className="font-bold text-slate-800 leading-tight">{p.name}</div>
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-2">
                  S/ {p.price.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Carrito */}
        <div className="w-full lg:w-[450px] bg-white border-l border-slate-200 flex flex-col h-[calc(100vh-120px)] shadow-xl z-10">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart size={20} /> Carrito Actual
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map(item => (
              <div key={item.productId} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <div className="font-bold text-sm text-slate-800">{item.name}</div>
                  <div className="text-blue-600 font-bold text-sm">S/ {item.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="text-slate-400 hover:text-red-500 p-1"><Minus size={14}/></button>
                  <span className="font-bold text-slate-800 text-sm w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="text-slate-400 hover:text-blue-500 p-1"><Plus size={14}/></button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="text-center text-slate-400 mt-10">Selecciona productos para iniciar</div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200">
            {/* TABS DE CLIENTE */}
            <div className="flex mb-4 bg-slate-200 p-1 rounded-lg">
              <button 
                onClick={() => setCustomerMode('NUEVO')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${customerMode === 'NUEVO' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                Cliente Nuevo
              </button>
              <button 
                onClick={() => setCustomerMode('FRECUENTE')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${customerMode === 'FRECUENTE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
              >
                Cliente Frecuente
              </button>
            </div>

            {/* FORMULARIO DE CLIENTE */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Car size={16} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Placa del Auto (Ej: ABC-123)" 
                  value={plate}
                  onChange={e => handlePlateChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {customerMode === 'FRECUENTE' && (
                  <Search size={14} className="absolute right-3 top-3 text-blue-500" />
                )}
              </div>

              {customerMode === 'NUEVO' && (
                <>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Nombre del Cliente" 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Celular (Opcional)" 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <select 
                      value={vehicleType}
                      onChange={e => setVehicleType(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 px-3 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Auto">Auto</option>
                      <option value="Camioneta">Camioneta</option>
                      <option value="Moto">Moto</option>
                      <option value="Van">Van</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </>
              )}

              {customerMode === 'FRECUENTE' && customerName && (
                <div className="bg-green-50 text-green-800 text-xs font-bold p-2 rounded border border-green-200">
                  ✅ Cliente Encontrado: {customerName} ({vehicleType})
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-medium">Total Estimado</span>
              <span className="text-2xl font-extrabold text-slate-900">S/ {total.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleStartService}
              disabled={cart.length === 0 || !plate || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
            >
              {isProcessing ? 'Procesando...' : <><Play size={20} /> Iniciar Lavado</>}
            </button>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: KANBAN (En Curso) */}
      <div className={`w-full md:w-80 lg:w-96 bg-slate-800 flex flex-col h-[calc(100vh-120px)] ${activeTab === 'POS' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock size={20} className="text-yellow-400" /> En Curso
          </h2>
          <span className="bg-slate-700 text-xs font-bold px-2 py-1 rounded-full text-white">{activeTransactions.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTransactions.map(tx => (
            <div key={tx.id} className="bg-slate-700 rounded-xl p-4 shadow-lg border border-slate-600 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-black text-xl text-white tracking-widest">{tx.customerPlate || 'SIN PLACA'}</div>
                  <div className="text-xs text-slate-300 font-medium">{tx.customerName || 'Cliente Anónimo'} ({tx.vehicleType || 'Auto'})</div>
                </div>
                <div className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded">S/ {tx.totalAmount.toFixed(2)}</div>
              </div>
              
              <div className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                <Users size={12} /> Lavador: {tx.worker?.name || 'Desconocido'}
              </div>

              <div className="space-y-1 mb-4">
                {tx.items.map((item: any) => (
                  <div key={item.id} className="text-sm text-slate-300 flex justify-between">
                    <span>{item.quantity}x {item.product.name}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleComplete(tx.id, 'CASH')} disabled={isProcessing} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg flex flex-col items-center gap-1 transition-colors">
                  <Banknote size={16} /> Efectivo
                </button>
                <button onClick={() => handleComplete(tx.id, 'YAPE')} disabled={isProcessing} className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-bold py-2 rounded-lg flex flex-col items-center gap-1 transition-colors">
                  <Phone size={16} /> Yape
                </button>
                <button onClick={() => handleComplete(tx.id, 'CARD')} disabled={isProcessing} className="bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold py-2 rounded-lg flex flex-col items-center gap-1 transition-colors">
                  <CreditCard size={16} /> Tarjeta
                </button>
              </div>
            </div>
          ))}
          
          {activeTransactions.length === 0 && (
            <div className="text-center text-slate-500 mt-10">
              <Car size={48} className="mx-auto mb-4 opacity-20" />
              No hay autos lavándose ahora.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
