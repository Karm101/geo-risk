'use client'
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useMemo } from 'react'
import StationMarker, { StationData } from './StationMarker'
import type { LayerType } from './StationMarker'
import { STATION_COORDINATES } from '../lib/stations'

const MIN_ZOOM_FOR_RIVERS = 9

// ─── Layer config ─────────────────────────────────────────────────────────────

const LAYER_CONFIG: Record<LayerType, {
  label: string
  borderColor: string
  legend: { color: string; shape: 'circle' | 'square'; label: string }[]
}> = {
  pli: {
    label: 'PLI Index',
    borderColor: '#f43f5e',
    legend: [
      { color: '#a855f7', shape: 'circle', label: 'Very High >3' },
      { color: '#f43f5e', shape: 'circle', label: 'High 2–3' },
      { color: '#f59e0b', shape: 'circle', label: 'Moderate 1–2' },
      { color: '#10b981', shape: 'circle', label: 'Low <1' },
    ]
  },
  igeo: {
    label: 'Metal Risk',
    borderColor: '#38bdf8',
    legend: [
      { color: '#f43f5e', shape: 'square', label: 'Pb' },
      { color: '#f97316', shape: 'square', label: 'Cd' },
      { color: '#eab308', shape: 'square', label: 'Cu' },
      { color: '#38bdf8', shape: 'square', label: 'Zn' },
      { color: '#64748b', shape: 'square', label: 'Other' },
    ]
  },
  risk: {
    label: 'Risk Zones',
    borderColor: '#f59e0b',
    legend: [
      { color: '#a855f7', shape: 'circle', label: 'Critical PLI >3' },
      { color: '#f43f5e', shape: 'circle', label: 'High PLI >2' },
      { color: '#334155', shape: 'circle', label: 'Below threshold' },
    ]
  }
}

// ─── Internal components ──────────────────────────────────────────────────────

function ZoomTracker({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvents({ zoomend: (e) => onZoom(e.target.getZoom()) })
  return null
}

function RiverLayer({ data }: { data: any }) {
  const [visible, setVisible] = useState(true)
  useMapEvents({
    zoomend: (e) => setVisible(e.target.getZoom() >= MIN_ZOOM_FOR_RIVERS)
  })
  if (!visible) return null
  return (
    <GeoJSON
      data={data}
      style={(feature) => {
        const type = feature?.properties?.waterway
        return {
          color: '#7AB1FF',
          weight: type === 'river' ? 3 : type === 'canal' ? 2 : 1,
          opacity: type === 'river' ? 0.9 : 0.6,
          lineCap: 'round',
          lineJoin: 'round'
        }
      }}
    />
  )
}

// ─── Legend dot/square ────────────────────────────────────────────────────────

function LegendShape({ color, shape }: { color: string; shape: 'circle' | 'square' }) {
  return (
    <div style={{
      width: '10px',
      height: '10px',
      background: color,
      borderRadius: shape === 'circle' ? '50%' : '2px',
      flexShrink: 0,
      boxShadow: color !== '#334155' ? `0 0 6px ${color}` : 'none',
    }} />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapComponent({ activeLayer }: { activeLayer: LayerType }) {
  const [zoom, setZoom] = useState(11)
  const defaultCenter: [number, number] = [7.05, 125.98]
  const defaultZoom = 11
  const [riverData, setRiverData] = useState(null)
  const [provinceData, setProvinceData] = useState(null)
  const [stations, setStations] = useState<StationData[]>([])

  useEffect(() => {
    fetch('/export.geojson')
      .then(res => res.json())
      .then(data => setRiverData(data))

    fetch('/davao-oriental.geojson')
      .then(res => res.json())
      .then(data => setProvinceData(data))

    fetch('/api/data')
      .then(res => res.json())
      .then(result => {
        if (result.success) setStations(result.data)
      })
      .catch(() => {})
  }, [])

  const stationDataMap = useMemo(() => {
    return Object.fromEntries(stations.map(s => [s.station_id, s]))
  }, [stations])

  const config = LAYER_CONFIG[activeLayer]

  return (
    <div
      className="w-full h-full relative z-0 rounded-xl overflow-hidden shadow-2xl"
      style={{
        border: `3px solid ${config.borderColor}`,
        boxShadow: `0 0 20px ${config.borderColor}40, 0 0 60px ${config.borderColor}15, inset 0 0 20px ${config.borderColor}05`,
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
    }}
    >
      {/* Layer badge top-left */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(10,13,18,0.85)',
        border: `1px solid ${config.borderColor}40`,
        borderRadius: '8px',
        padding: '5px 10px',
        backdropFilter: 'blur(8px)',
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '9px',
          letterSpacing: '0.15em',
          color: config.borderColor,
          textTransform: 'uppercase',
          fontWeight: 700,
        }}>
          {config.label}
        </span>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: config.borderColor,
          boxShadow: `0 0 6px ${config.borderColor}`,
          animation: 'pulse 2s ease-in-out infinite',
        }} />
      </div>

      {/* Map */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={false}
        style={{ height: '100%' }}
      >
        <ZoomTracker onZoom={setZoom} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
        />

        {provinceData && (
          <GeoJSON
            data={provinceData}
            style={{
              color: '#E3E3E3',
              weight: 4.3,
              opacity: 1,
              fillOpacity: 0
            }}
          />
        )}

        {riverData && <RiverLayer data={riverData} />}

        {Object.entries(STATION_COORDINATES)
          .filter(([_, coords]) => coords.latitude !== null)
          .map(([stationId, coords]) => {
            const dbData = stationDataMap[stationId] ?? null
            return (
              <StationMarker
                key={stationId}
                station={{
                  station_id: stationId,
                  latitude: coords.latitude!,
                  longitude: coords.longitude!,
                  ...(dbData ?? {
                    batch_id: '—',
                    pli: 0,
                    risk_level: 'LOW',
                    cr_mg_kg: null, mn_mg_kg: null, fe_mg_kg: null,
                    co_mg_kg: null, ni_mg_kg: null, cu_mg_kg: null,
                    zn_mg_kg: null, as_mg_kg: null, cd_mg_kg: null,
                    hg_mg_kg: null, pb_mg_kg: null,
                    igeo_cr: null, igeo_mn: null, igeo_fe: null,
                    igeo_co: null, igeo_ni: null, igeo_cu: null,
                    igeo_zn: null, igeo_as: null, igeo_cd: null,
                    igeo_hg: null, igeo_pb: null,
                  })
                }}
                activeLayer={activeLayer}
                zoom={zoom}
              />
            )
          })}
      </MapContainer>

      {/* Footer legend */}
        <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(10,13,18,0.88)',
        borderTop: `1px solid ${config.borderColor}30`,
        backdropFilter: 'blur(8px)',
        padding: '13px 26px',        // 8px × 1.618 ≈ 13px, 16px × 1.618 ≈ 26px
        display: 'flex',
        alignItems: 'center',
        gap: '10px',                 // 6px × 1.618 ≈ 10px
        flexWrap: 'wrap',
        }}>
        {/* Legend label */}
        <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',          // 8px × 1.25 ≈ scaled up one notch
            letterSpacing: '0.12em',
            color: '#475569',
            textTransform: 'uppercase',
            marginRight: '10px',       // 6px × 1.618 ≈ 10px
        }}>
            {activeLayer === 'igeo' ? 'Pin color = dominant metal' : 'Pin size + color = PLI risk level'}
        </span>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: '#1e2535', marginRight: '10px' }} />

        {/* Legend items */}
        {config.legend.map((item) => (
            <div key={item.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',              // 5px × 1.618 ≈ 8px
            marginRight: '16px',     // 10px × 1.618 ≈ 16px
            }}>
            <div style={{
                width: '16px',         // 10px × 1.618 ≈ 16px
                height: '16px',
                background: item.color,
                borderRadius: item.shape === 'circle' ? '50%' : '3px',
                flexShrink: 0,
                boxShadow: item.color !== '#334155' ? `0 0 8px ${item.color}` : 'none',
            }} />
            <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',      // 9px × 1.25 ≈ scaled up
                color: '#94a3b8',
            }}>{item.label}</span>
            </div>
        ))}

        <div style={{ flex: 1 }} />

        {/* Station count */}
        <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',          // 8px × 1.25
            color: '#475569',
        }}>
            {Object.keys(STATION_COORDINATES).length} stations
        </span>
        </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}