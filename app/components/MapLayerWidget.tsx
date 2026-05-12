'use client'
import { Layers, ChevronUp, Map } from 'lucide-react'
import { useState } from 'react'
import type { LayerType } from '../maps/page'

export type BasemapType = 'dark' | 'topo' | 'satellite'

const BASEMAP_OPTIONS: { id: BasemapType; label: string }[] = [
  { id: 'dark',      label: 'Dark'      },
  { id: 'topo',      label: 'Topo'      },
  { id: 'satellite', label: 'Satellite' },
]

type Props = {
  activeLayer: LayerType
  setActiveLayer: (layer: LayerType) => void
  activeBasemap: BasemapType
  setActiveBasemap: (basemap: BasemapType) => void
}

export default function MapLayerWidget({
  activeLayer,
  setActiveLayer,
  activeBasemap,
  setActiveBasemap,
}: Props) {
  const [minimized, setMinimized] = useState(false)

  return (
    <div
      className="absolute top-6 right-6 z-10 rounded-xl shadow-2xl"
      style={{
        background: 'rgba(17,21,32,0.92)',
        border: '1px solid #1e2535',
        backdropFilter: 'blur(12px)',
        minWidth: '192px',
        padding: '14px',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2"
        style={{ marginBottom: minimized ? 0 : '12px', transition: 'margin 0.3s ease' }}
      >
        <Layers className="w-4 h-4" style={{ color: '#475569' }} />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: '#94a3b8',
            textTransform: 'uppercase',
            fontWeight: 700,
            flex: 1,
          }}
        >
          Map Layers
        </span>
        <button
          onClick={() => setMinimized(!minimized)}
          style={{ color: '#475569', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
          title={minimized ? 'Expand' : 'Minimize'}
        >
          <ChevronUp
            className="w-4 h-4"
            style={{
              transform: minimized ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          />
        </button>
      </div>

      {/* Animated collapse */}
      <div
        style={{
          maxHeight: minimized ? '0px' : '400px',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        {/* ── Basemap section ─────────────────────────────────────── */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            <Map className="w-3 h-3" style={{ color: '#334155' }} />
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.14em',
                color: '#334155',
                textTransform: 'uppercase',
              }}
            >
              Basemap
            </span>
          </div>

          {/* 3-way pill toggle */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              background: '#0a0d12',
              borderRadius: '8px',
              padding: '3px',
              border: '1px solid #1e2535',
            }}
          >
            {BASEMAP_OPTIONS.map(({ id, label }) => {
              const isActive = activeBasemap === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveBasemap(id)}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    borderRadius: '6px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.08em',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#e2e8f0' : '#475569',
                    background: isActive ? '#1e2535' : 'transparent',
                    border: isActive ? '1px solid #334155' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: '#1e2535',
            marginBottom: '12px',
          }}
        />

        {/* ── Data layers section ──────────────────────────────────── */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#334155',
              }}
            />
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.14em',
                color: '#334155',
                textTransform: 'uppercase',
              }}
            >
              Data Layers
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(['igeo', 'pli', 'risk'] as LayerType[]).map((layer) => {
              const isActive = activeLayer === layer
              const accentColors: Record<LayerType, string> = {
                igeo: '#38bdf8',
                pli: '#f43f5e',
                risk: '#f59e0b',
              }
              const accent = accentColors[layer]
              return (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
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
                    transition: 'all 0.2s ease',
                    color: isActive ? '#e2e8f0' : '#64748b',
                    background: isActive ? `${accent}18` : '#0a0d12',
                    border: `1px solid ${isActive ? `${accent}50` : '#1e2535'}`,
                    boxShadow: isActive ? `0 0 12px ${accent}20` : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {/* Active indicator dot */}
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isActive ? accent : '#1e2535',
                      boxShadow: isActive ? `0 0 6px ${accent}` : 'none',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  />
                  {layer === 'igeo' ? 'I-GEO Index' : layer === 'pli' ? 'PLI Index' : 'Risk Zones'}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}