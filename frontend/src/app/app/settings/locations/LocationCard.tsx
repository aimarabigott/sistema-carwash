'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCcw, X, LogOut } from 'lucide-react';
import { updateWhatsappStatus } from '@/app/actions/locations';

export default function LocationCard({ location }: { location: any }) {
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Esperando...');
  const [isConnected, setIsConnected] = useState(location.whatsappConnected);

  // NOTA: Para producción, esta URL debe venir de las variables de entorno
  const WHATSAPP_API = process.env.NEXT_PUBLIC_WHATSAPP_URL || 'http://localhost:3001';

  useEffect(() => {
    const checkRealStatus = async () => {
      try {
        const res = await fetch(`${WHATSAPP_API}/qr/${location.id}`);
        const data = await res.json();
        
        if (data.connected && !isConnected) {
          setIsConnected(true);
          await updateWhatsappStatus(location.id, true);
        } else if (!data.connected && isConnected) {
          setIsConnected(false);
          await updateWhatsappStatus(location.id, false);
        }
      } catch (e) {
        // Ignorar si el servidor está apagado o en reposo
      }
    };
    
    checkRealStatus();
  }, [location.id, isConnected, WHATSAPP_API]);

  const fetchQR = async () => {
    try {
      const res = await fetch(`${WHATSAPP_API}/qr/${location.id}`);
      const data = await res.json();
      
      if (data.connected) {
        if (!isConnected) {
          setIsConnected(true);
          setShowModal(false);
          await updateWhatsappStatus(location.id, true);
        }
      } else {
        if (data.qr) {
          setQrCode(data.qr);
          setStatus('Escanea este código con tu WhatsApp');
        } else {
          setStatus(data.message || 'Generando código...');
        }
      }
    } catch (e) {
      setStatus('Error de conexión con el servidor de WhatsApp. Asegúrate que esté ejecutándose.');
    }
  };

  const openModal = () => {
    setShowModal(true);
    fetchQR();
    // Iniciar polling
    const interval = setInterval(() => {
      fetchQR();
    }, 5000);
    // Limpiar al cerrar
    return () => clearInterval(interval);
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`${WHATSAPP_API}/logout/${location.id}`, { method: 'POST' });
      setIsConnected(false);
      await updateWhatsappStatus(location.id, false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
      <div>
        <h4 className="font-bold text-slate-800 text-lg mb-1">{location.name}</h4>
        <p className="text-xs text-slate-500 mb-4">ID: {location.id}</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        {isConnected ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Conectado
            </span>
            <button onClick={handleDisconnect} className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1 transition-colors">
              <LogOut size={14} /> Desvincular
            </button>
          </div>
        ) : (
          <button 
            onClick={openModal}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-lg transition-all"
          >
            <Smartphone size={16} /> Vincular WhatsApp
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Vincular {location.name}</h3>
            <p className="text-sm text-slate-500 mb-6">{status}</p>
            
            <div className="bg-slate-100 rounded-xl aspect-square flex items-center justify-center mb-6 overflow-hidden relative">
              {qrCode ? (
                <img src={qrCode} alt="WhatsApp QR" className="w-full h-full object-cover mix-blend-multiply" />
              ) : (
                <RefreshCcw size={32} className="text-slate-300 animate-spin" />
              )}
            </div>

            <p className="text-xs text-slate-400 text-center">
              Abre WhatsApp {'>'} Dispositivos Vinculados {'>'} Vincular Dispositivo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
