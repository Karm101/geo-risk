'use client'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH'
export type LayerType = 'pli' | 'igeo' | 'risk'

export type StationData = {
  station_id: string
  batch_id: string
  latitude: number
  longitude: number
  pli: number
  risk_level: RiskLevel
  cr_mg_kg: number | null
  mn_mg_kg: number | null
  fe_mg_kg: number | null
  co_mg_kg: number | null
  ni_mg_kg: number | null
  cu_mg_kg: number | null
  zn_mg_kg: number | null
  as_mg_kg: number | null
  cd_mg_kg: number | null
  hg_mg_kg: number | null
  pb_mg_kg: number | null
  igeo_cr: number | null
  igeo_mn: number | null
  igeo_fe: number | null
  igeo_co: number | null
  igeo_ni: number | null
  igeo_cu: number | null
  igeo_zn: number | null
  igeo_as: number | null
  igeo_cd: number | null
  igeo_hg: number | null
  igeo_pb: number | null
}

type Props = {
  station: StationData
  activeLayer: LayerType
  zoom: number
}

// ─── Master metal registry ────────────────────────────────────────────────────
// All possible metals, in priority order for dominant metal selection.
// Color is assigned by index so it stays stable regardless of which subset is present.

const METAL_REGISTRY = [
  { igeoKey: 'igeo_pb', concKey: 'pb_mg_kg', label: 'Pb', color: '#f43f5e' },
  { igeoKey: 'igeo_cd', concKey: 'cd_mg_kg', label: 'Cd', color: '#f97316' },
  { igeoKey: 'igeo_hg', concKey: 'hg_mg_kg', label: 'Hg', color: '#eab308' },
  { igeoKey: 'igeo_as', concKey: 'as_mg_kg', label: 'As', color: '#10b981' },
  { igeoKey: 'igeo_cu', concKey: 'cu_mg_kg', label: 'Cu', color: '#38bdf8' },
  { igeoKey: 'igeo_zn', concKey: 'zn_mg_kg', label: 'Zn', color: '#818cf8' },
  { igeoKey: 'igeo_ni', concKey: 'ni_mg_kg', label: 'Ni', color: '#e879f9' },
  { igeoKey: 'igeo_co', concKey: 'co_mg_kg', label: 'Co', color: '#fb7185' },
  { igeoKey: 'igeo_cr', concKey: 'cr_mg_kg', label: 'Cr', color: '#34d399' },
  { igeoKey: 'igeo_mn', concKey: 'mn_mg_kg', label: 'Mn', color: '#fbbf24' },
  { igeoKey: 'igeo_fe', concKey: 'fe_mg_kg', label: 'Fe', color: '#60a5fa' },
] as const

const RISK_COLORS: Record<RiskLevel, string> = {
  'LOW':       '#10b981',
  'MODERATE':  '#f59e0b',
  'HIGH':      '#f43f5e',
  'VERY HIGH': '#a855f7',
}

// ─── Dynamic helpers ──────────────────────────────────────────────────────────

// Returns only the metals that have non-null igeo values for this station
function getPresentMetals(station: StationData) {
  return METAL_REGISTRY.filter(
    m => station[m.igeoKey as keyof StationData] !== null
  ).map(m => ({
    ...m,
    igeoValue: Number(station[m.igeoKey as keyof StationData]),
    concValue: station[m.concKey as keyof StationData] !== null 
                 ? Number(station[m.concKey as keyof StationData]) 
                 : null,
  }))
}

function getDominantMetal(station: StationData) {
  const present = getPresentMetals(station)
  if (present.length === 0) return null

  return present.reduce((best, m) =>
    m.igeoValue > best.igeoValue ? m : best
  )
}

function getPinSize(riskLevel: RiskLevel): number {
  return { 'LOW': 12, 'MODERATE': 14, 'HIGH': 16, 'VERY HIGH': 18 }[riskLevel]
}

function createPinIcon(
  color: string,
  size: number,
  shape: 'circle' | 'square',
  label: string,
  sublabel: string,
  dimmed: boolean,
  showLabel: boolean,
) {
  const fontSize = Math.max(8, Math.round(size * 0.45))
  const glow = dimmed ? 'none' : `drop-shadow(0 0 6px ${color})`
  const opacity = dimmed ? 0.25 : 1

  const dot = `<div class="station-dot" style="
    width:${size}px;
    height:${size}px;
    background:${color};
    opacity:${opacity};
    border-radius:${shape === 'circle' ? '50%' : '3px'};
    border:1px solid rgba(255,255,255,0.6);
    filter:${glow};
    box-shadow: 0 0 8px ${color}80;
    transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor:pointer;
  "></div>`

  const markup = `
    <style>
      /* 1. Scale the Dot */
      .leaflet-marker-icon:hover .station-dot {
        transform: scale(2.0) translateY(-2px);
        opacity: 1 !important;
        box-shadow: 0 0 20px ${color} !important;
        border-color: white !important;
      }

      /* 2. Scale the Label */
      .leaflet-marker-icon:hover .station-label {
        transform: scale(1.3) translateY(2px); /* Slightly grows and shifts down */
        background: rgba(0, 0, 0, 0.95) !important; /* Darkens for contrast */
        color: white !important;
        border-color: ${color} !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        z-index: 1000;
      }
    </style>

    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:5px;
      opacity:${opacity};
    ">
      ${dot}
      ${showLabel ? `<span class="station-label" style="
        font-family:'Space Mono',monospace;
        font-size:${fontSize}px;
        color:rgba(255,255,255,${dimmed ? 0.3 : 0.85});
        white-space:nowrap;
        background:rgba(0,0,0,0.75);
        padding:2px 6px;
        border-radius:3px;
        border:1px solid ${dimmed ? 'rgba(255,255,255,0.05)' : color + '50'};
        letter-spacing:0.03em;
        pointer-events: none;
        transition: all 0.2s ease-out; /* Smooth transition for the label */
      ">${label} · ${sublabel}</span>` : ''}
    </div>`

  const totalHeight = size + 3 + Math.max(14, fontSize + 4)

  return L.divIcon({
    html: markup,
    className: '',
    iconSize: [size * 3, totalHeight],
    iconAnchor: [(size * 3) / 2, size / 2],
  })
}

// ─── Popup Content ────────────────────────────────────────────────────────────

function PopupContent({ station }: { station: StationData }) {
  const dominant = getDominantMetal(station)
  const riskColor = RISK_COLORS[station.risk_level]
  const presentMetals = getPresentMetals(station)
  const maxIgeo = Math.max(...presentMetals.map(m => Math.abs(m.igeoValue)), 1)

  return (
    <div style={{
      fontFamily: "'Space Mono', monospace",
      background: '#111520',
      color: '#e2e8f0',
      borderRadius: '12px',
      padding: '18px',
      minWidth: '275px',
      fontSize: '14px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontWeight: 700, fontSize: '13px', color: 'white' }}>{station.station_id}</span>
        <span style={{
          padding: '2px 8px',
          borderRadius: '20px',
          fontSize: '9px',
          fontWeight: 700,
          background: `${riskColor}25`,
          color: riskColor,
          border: `1px solid ${riskColor}50`,
        }}>{station.risk_level}</span>
      </div>

      {/* PLI Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#94a3b8' }}>
        <span>PLI Score</span>
        <span style={{ color: riskColor, fontWeight: 700 }}>{Number(station.pli).toFixed(3)}</span>
      </div>

      {/* Dominant Metal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#94a3b8' }}>
        <span>Dominant Metal</span>
        <span>
          {dominant
            ? <span style={{ color: dominant.color, fontWeight: 700 }}>
                {dominant.label}{' '}
                <span style={{ color: '#64748b' }}>({dominant.igeoValue.toFixed(2)})</span>
              </span>
            : <span style={{ color: '#475569' }}>No data</span>
          }
        </span>
      </div>

      <div style={{ borderTop: '1px solid #1e2535', margin: '8px 0' }} />

      {/* Igeo Bar Chart — only present metals */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{
          fontSize: '9px', color: '#475569',
          letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px'
        }}>
          Igeo Values
          {presentMetals.length > 0 && (
            <span style={{ color: '#334155', marginLeft: '6px' }}>
              ({presentMetals.length} metal{presentMetals.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        {presentMetals.length === 0
          ? <div style={{ color: '#475569', fontSize: '10px' }}>No data uploaded yet</div>
          : presentMetals.map(({ label, igeoValue, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ width: '18px', color: '#64748b', fontSize: '9px' }}>{label}</span>
              <div style={{ flex: 1, height: '5px', background: '#1e2535', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min((Math.abs(igeoValue) / maxIgeo) * 100, 100)}%`,
                  height: '100%',
                  background: igeoValue > 0 ? color : '#334155',
                  borderRadius: '3px',
                }} />
              </div>
              <span style={{
                fontSize: '9px',
                color: igeoValue > 0 ? color : '#475569',
                width: '32px',
                textAlign: 'right',
              }}>
                {igeoValue.toFixed(2)}
              </span>
            </div>
          ))
        }
      </div>

      <div style={{ borderTop: '1px solid #1e2535', margin: '8px 0' }} />

      {/* Batch + Coordinates */}
      <div style={{ color: '#475569', fontSize: '9px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span>Batch</span>
          <span style={{ color: '#64748b' }}>{station.batch_id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Coords</span>
          <span style={{ color: '#64748b' }}>{station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StationMarker({ station, activeLayer, zoom }: Props) {
  const dominant = getDominantMetal(station)
  const riskColor = RISK_COLORS[station.risk_level]

  const shape: 'circle' | 'square' = activeLayer === 'igeo' ? 'square' : 'circle'
  const color = activeLayer === 'igeo'
    ? (dominant?.color ?? '#64748b')   // fallback gray if no metals present
    : riskColor


  const baseSize = getPinSize(station.risk_level)

  const pliValue = Number(station.pli) || 0
  const pliMultiplier = 1 + (Math.min(pliValue, 5) * 0.04) 
  const intensityBaseSize = baseSize * pliMultiplier

  const zoomFactor = zoom / 11
  const clampedZoom = Math.min(Math.max(zoomFactor, 0.7), 1.5)

  const scaledSize = Math.max(8, Math.round(intensityBaseSize * clampedZoom))

  const dimmed = activeLayer === 'risk' &&
    (station.risk_level === 'LOW' || station.risk_level === 'MODERATE')

  const sublabel = activeLayer === 'igeo'
    ? (dominant?.label ?? '—')
    : `PLI ${Number(station.pli).toFixed(2)}`

  const MIN_ZOOM_FOR_LABELS = 11

  const icon = useMemo(
    () => createPinIcon(color, scaledSize, shape, station.station_id, sublabel, dimmed, zoom >= MIN_ZOOM_FOR_LABELS),
    // 👇 Ensure station.pli is in the dependency array so the intensity math recalculates!
    [color, scaledSize, shape, station.station_id, station.pli, sublabel, dimmed, zoom] 
  )

  return (
    <Marker
      key={`${station.station_id}-${activeLayer}-${station.pli}`} 
      position={[station.latitude, station.longitude]}
      icon={icon}
      // 👇 This ensures the hovered pin jumps to the front of the stack
      riseOnHover={true} 
      zIndexOffset={activeLayer === 'risk' ? 100 : 0} // Optional: boost priority for specific layers
    >
      <Popup
        minWidth={275}
        offset={[0, -5]}
        className="georisk-popup"
      >
        <PopupContent station={station} />
      </Popup>
    </Marker>
  )
}