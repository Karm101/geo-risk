'use client'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useState } from 'react'

export type AdminLayerKey = 'regions' | 'provinces' | 'municipalities' | 'barangays'

type Props = {
  visibleLayers: Record<AdminLayerKey, boolean>
  toggleLayer: (key: AdminLayerKey) => void
}

const ADMIN_OPTIONS: { id: AdminLayerKey; label: string; color: string }[] = [
  { id: 'regions',        label: 'Regions',        color: '#ff4444' },
  { id: 'provinces',      label: 'Provinces',      color: '#ffa500' },
  { id: 'municipalities', label: 'Municipalities', color: '#ffff00' },
  { id: 'barangays',      label: 'Barangays',      color: '#a855f7' },
]

export default function MapAdminWidget({ visibleLayers, toggleLayer }: Props) {
  const [minimized, setMinimized] = useState(false)

  return (
    <div
      className="absolute bottom-14 right-4 z-[1000] rounded-xl shadow-2xl"
      style={{
        background: 'rgba(17,21,32,0.92)',
        border: '1px solid #1e2535',
        backdropFilter: 'blur(12px)',
        minWidth: '192px',
        padding: '14px',
        // Smooth out the container resize
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
        <Globe className="w-4 h-4" style={{ color: '#475569' }} />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: '#94a3b8',
            textTransform: 'uppercase',
            fontWeight: 700,
            flex: 1,
            // Prevent text jitter during animation
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          Boundaries
        </span>
        <button
          onClick={() => setMinimized(!minimized)}
          style={{ 
            color: '#475569', 
            transition: 'color 0.2s ease',
            outline: 'none' 
          }}
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
          maxHeight: minimized ? '0px' : '500px',
          opacity: minimized ? 0 : 1,
          overflow: 'hidden',
          // cubic-bezier provides that "pro" feel compared to "ease"
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
          willChange: 'max-height, opacity'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '2px' }}>
          {ADMIN_OPTIONS.map((layer) => {
            const isActive = visibleLayers[layer.id]
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  fontWeight: isActive ? 700 : 400,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out',
                  color: isActive ? '#e2e8f0' : '#64748b',
                  background: isActive ? `${layer.color}18` : '#0a0d12',
                  border: `1px solid ${isActive ? `${layer.color}50` : '#1e2535'}`,
                  boxShadow: isActive ? `0 0 12px ${layer.color}20` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '3px',
                      border: `1px solid ${isActive ? layer.color : '#334155'}`,
                      background: isActive ? layer.color : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {isActive && <Check className="w-2.5 h-2.5 text-black" strokeWidth={4} />}
                  </div>
                  {layer.label}
                </div>
                <div 
                   style={{ 
                     width: '12px', 
                     height: '2px', 
                     background: layer.color,
                     borderRadius: '1px',
                     opacity: isActive ? 1 : 0.3,
                     transition: 'opacity 0.2s ease'
                   }} 
                />
              </button>
            )
          })}
        </div>
        
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '8px', 
          borderTop: '1px solid #1e2535',
          fontFamily: "'Space Mono', monospace",
          fontSize: '8px',
          color: '#334155',
          textAlign: 'center',
          letterSpacing: '0.05em',
          // Prevent text wrapping during the collapse
          whiteSpace: 'nowrap'
        }}>
          TOGGLE TO STACK LAYERS
        </div>
      </div>
    </div>
  )
}