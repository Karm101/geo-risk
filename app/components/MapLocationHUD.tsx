'use client'
import { MapPin, ChevronDown } from 'lucide-react'
import { useState } from 'react'

export type HoverInfo = {
  region: string
  province: string
  municipality: string
  barangay: string
}

type Props = {
  hoverInfo: HoverInfo
}

export default function MapLocationHUD({ hoverInfo }: Props) {
  const [minimized, setMinimized] = useState(false)

  const items = [
    { label: 'REG', val: hoverInfo.region },
    { label: 'PROV', val: hoverInfo.province },
    { label: 'MUNI', val: hoverInfo.municipality },
    { label: 'BRGY', val: hoverInfo.barangay }
  ]

  return (
    <div
      className="absolute bottom-[55px] left-3 z-[1000] rounded-xl shadow-2xl"
      style={{
        background: 'rgba(17,21,32,0.92)',
        border: '1px solid #1e2535',
        backdropFilter: 'blur(12px)',
        minWidth: '240px',
        padding: '14px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'auto', // Needs to be auto for the button to work
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2"
        style={{ 
          marginBottom: minimized ? '0px' : '12px', 
          transition: 'margin 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
      >
        <MapPin className="w-4 h-4" style={{ color: '#475569' }} />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: '#94a3b8',
            textTransform: 'uppercase',
            fontWeight: 700,
            flex: 1,
            whiteSpace: 'nowrap',
          }}
        >
          Spatial Context
        </span>
        <button
          onClick={() => setMinimized(!minimized)}
          style={{ color: '#475569', transition: 'color 0.2s ease' }}
          className="hover:text-slate-300"
        >
          <ChevronDown
            className="w-4 h-4"
            style={{
              transform: minimized ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </button>
      </div>

      {/* Animated Content Wrapper */}
      <div
        style={{
          maxHeight: minimized ? '0px' : '160px',
          opacity: minimized ? 0 : 1,
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
          pointerEvents: 'none' // Items inside are just for display
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
          {items.map((item) => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#64748b', fontWeight: 700 }}>
                {item.label}
              </span>
              <span style={{ 
                fontFamily: "'Space Mono', monospace", 
                fontSize: '11px', 
                color: item.val === '—' ? '#334155' : '#e2e8f0',
                textAlign: 'right',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '170px'
              }}>
                {item.val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}