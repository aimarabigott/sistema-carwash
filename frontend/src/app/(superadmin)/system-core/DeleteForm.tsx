'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { deleteBusiness } from '@/app/actions/superadmin';

export default function DeleteForm({ businessId }: { businessId: string }) {
  return (
    <form action={deleteBusiness} onSubmit={(e) => { if(!confirm('⚠️ PELIGRO: ¿Borrar toda la franquicia y todos sus datos permanentemente?')) e.preventDefault(); }}>
      <input type="hidden" name="businessId" value={businessId} />
      <button 
        type="submit" 
        className="flex items-center gap-1 text-xs bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white px-3 py-2 rounded-lg font-bold transition-all"
      >
        <Trash2 size={14} /> Destruir
      </button>
    </form>
  );
}
