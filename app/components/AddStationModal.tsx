"use client"

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react'; // Assuming you are using lucide-react for these!

export interface FormState {
  station_id: string;
  river: string;
  barangay: string;
  latitude: string;
  longitude: string;
  elevation: string;
}

const EMPTY_FORM: FormState = {
  station_id: '',
  river: '',
  barangay: '',
  latitude: '',
  longitude: '',
  elevation: ''
};

export default function AddStationModal({ 
  onAdd, 
  onClose,
  initialData
}: {
  onAdd: (form: FormState) => Promise<void>
  onClose: () => void
  initialData?: { latitude: string; longitude: string; barangay: string }
}) {
  const [form, setForm] = useState<FormState>(() => {
    if (initialData) {
      return {
        ...EMPTY_FORM,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        barangay: initialData.barangay
      };
    }
    return EMPTY_FORM;
  });

  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const field = (key: keyof FormState, placeholder: string, required = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
      <label style={{
        fontFamily: "'Space Mono', monospace", fontSize: '9px',
        color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {key.replace('_', ' ')}{required && ' *'}
      </label>
      <input
        value={form[key]}
        placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{
          width: '100%',             // <-- Forces input to fit the grid column
          boxSizing: 'border-box',   // <-- Ensures padding does not add to the total width
          background: '#0a0d12', border: '1px solid #1e2535',
          borderRadius: '8px', padding: '8px 12px',
          color: '#e2e8f0', fontFamily: "'Space Mono', monospace", fontSize: '11px',
        }}
      />
    </div>
  )
  
  const handleSubmit = async () => {
    if (!form.station_id.trim()) { setError('Station ID is required'); return }
    setLoading(true); setError(null)
    try { await onAdd(form); onClose() }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#111520', border: '1px solid #1e2535',
        borderRadius: '16px', padding: '28px', width: '420px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>
            Add Station
          </span>
          <button onClick={onClose} style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {field('station_id', 'e.g. PTG 5', true)}
        {field('river',      'e.g. Pintatagan')}
        {field('barangay',   'e.g. Brgy Maputi')}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {field('latitude',  '7.0858')}
          {field('longitude', '126.023')}
          {field('elevation', '320')}
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e', fontSize: '11px', fontFamily: "'Space Mono', monospace" }}>
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: '8px', border: '1px solid #1e2535',
            background: 'transparent', color: '#64748b', cursor: 'pointer',
            fontFamily: "'Space Mono', monospace", fontSize: '11px',
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '8px 18px', borderRadius: '8px', border: 'none',
            background: loading ? '#1e2535' : '#f43f5e', color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 700,
          }}>
            {loading ? 'Adding...' : 'Add Station'}
          </button>
        </div>
      </div>
    </div>
  )
}