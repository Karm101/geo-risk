'use client'
import { Marker, Popup, Tooltip } from 'react-leaflet'
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

// ─── Constants ────────────────────────────────────────────────────────────────

const METALS = [
  { key: 'igeo_pb', label: 'Pb' },
  { key: 'igeo_cd', label: 'Cd' },
  { key: 'igeo_hg', label: 'Hg' },
  { key: 'igeo_as', label: 'As' },
  { key: 'igeo_cu', label: 'Cu' },
  { key: 'igeo_zn', label: 'Zn' },
  { key: 'igeo_ni', label: 'Ni' },
  { key: 'igeo_co', label: 'Co' },
  { key: 'igeo_cr', label: 'Cr' },
  { key: 'igeo_mn', label: 'Mn' },
  { key: 'igeo_fe', label: 'Fe' },
] as const

const RISK_COLORS: Record<RiskLevel, string> = {
  'LOW':       '#10b981',
  'MODERATE':  '#f59e0b',
  'HIGH':      '#f43f5e',
  'VERY HIGH': '#a855f7',
}

const METAL_COLORS = [
  '#f43f5e', '#f97316', '#eab308', '#10b981',
  '#38bdf8', '#818cf8', '#e879f9', '#fb7185',
  '#34d399', '#fbbf24', '#60a5fa',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDominantMetal(station: StationData) {
  let maxVal = -Infinity
  let dominant = { key: 'igeo_pb', label: 'Pb', index: 0 }

  METALS.forEach((metal, index) => {
    const val = station[metal.key as keyof StationData] as number | null
    if (val !== null && val > maxVal) {
      maxVal = val
      dominant = { ...metal, index }
    }
  })

  return { ...dominant, value: maxVal, color: METAL_COLORS[dominant.index] }
}

function getPinSize(riskLevel: RiskLevel): number {
  return { 'LOW': 16, 'MODERATE': 20, 'HIGH': 24, 'VERY HIGH': 28 }[riskLevel]
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

  const dot = shape === 'circle'
    ? `<div style="
        width:${size}px;
        height:${size}px;
        background:${color};
        border-radius:50%;
        border:2px solid rgba(255,255,255,0.3);
        filter:${glow};
        box-shadow:0 0 ${size}px ${color}40;
        transition:transform 0.15s;
      "></div>`
    : `<div style="
        width:${size}px;
        height:${size}px;
        background:${color};
        border-radius:3px;
        border:2px solid rgba(255,255,255,0.3);
        filter:${glow};
        box-shadow:0 0 ${size}px ${color}40;
        transition:transform 0.15s;
      "></div>`

  const markup = `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:3px;
      opacity:${opacity};
      cursor:pointer;
    ">
      ${dot}
      ${showLabel ? `<span style="
        font-family:'Space Mono',monospace;
        font-size:${fontSize}px;
        color:rgba(255,255,255,${dimmed ? 0.3 : 0.85});
        white-space:nowrap;
        background:rgba(0,0,0,0.65);
        padding:1px 5px;
        border-radius:3px;
        border:1px solid ${dimmed ? 'rgba(255,255,255,0.05)' : color + '50'};
        letter-spacing:0.03em;
      ">${label} · ${sublabel}</span>` : ''}
    </div>`

  // Total height = dot + gap + label (~14px)
  const totalHeight = size + 3 + Math.max(14, fontSize + 4)

  return L.divIcon({
    html: markup,
    className: '',
    iconSize: [size * 3, totalHeight],
    iconAnchor: [(size * 3) / 2, size / 2], // anchor at center of dot
  })
}

// ─── Popup Content ────────────────────────────────────────────────────────────

function PopupContent({ station }: { station: StationData }) {
  const dominant = getDominantMetal(station)
  const riskColor = RISK_COLORS[station.risk_level]

  const igeoValues = METALS.map((m, i) => ({
    label: m.label,
    value: station[m.key as keyof StationData] as number | null,
    color: METAL_COLORS[i],
  })).filter(m => m.value !== null) as { label: string; value: number; color: string }[]

  const maxIgeo = Math.max(...igeoValues.map(m => Math.abs(m.value)), 1)

  return (
    <div style={{
      fontFamily: "'Space Mono', monospace",
      background: '#111520',
      color: '#e2e8f0',
      borderRadius: '12px',
      padding: '18px',                              // 14px × 1.25 = ~18px
      minWidth: '275px',                            // 220px × 1.25 = 275px
      fontSize: '14px',                             // 11px × 1.25 = ~14px
      border: `1px solid rgba(255,255,255,0.1)`,    // subtle white border
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
        <span style={{ color: dominant.color, fontWeight: 700 }}>
          {dominant.value === -Infinity
            ? <span style={{ color: '#475569' }}>No data</span>
            : <>{dominant.label} <span style={{ color: '#64748b' }}>({dominant.value.toFixed(2)})</span></>
          }
        </span>
      </div>

      <div style={{ borderTop: '1px solid #1e2535', margin: '8px 0' }} />

      {/* Igeo Bar Chart */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '9px', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Igeo Values
        </div>
        {igeoValues.length === 0
          ? <div style={{ color: '#475569', fontSize: '10px' }}>No data uploaded yet</div>
          : igeoValues.map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ width: '18px', color: '#64748b', fontSize: '9px' }}>{label}</span>
              <div style={{ flex: 1, height: '5px', background: '#1e2535', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min((Math.abs(value) / maxIgeo) * 100, 100)}%`,
                  height: '100%',
                  background: value > 0 ? color : '#334155',
                  borderRadius: '3px',
                }} />
              </div>
              <span style={{ fontSize: '9px', color: value > 0 ? color : '#475569', width: '32px', textAlign: 'right' }}>
                {value.toFixed(2)}
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
  const color = activeLayer === 'igeo' ? dominant.color : riskColor
  const baseSize = getPinSize(station.risk_level)
  const scaledSize = Math.max(4, Math.round(baseSize * Math.pow(zoom / 11, 2)))

  const dimmed = activeLayer === 'risk' &&
    (station.risk_level === 'LOW' || station.risk_level === 'MODERATE')

  // Sublabel: PLI value for pli/risk layers, dominant metal for igeo
  const sublabel = activeLayer === 'igeo'
    ? dominant.value === -Infinity ? '—' : dominant.label
    : `PLI ${Number(station.pli).toFixed(2)}`

  const MIN_ZOOM_FOR_LABELS = 11

  const icon = useMemo(
    () => createPinIcon(color, scaledSize, shape, station.station_id, sublabel, dimmed, zoom >= MIN_ZOOM_FOR_LABELS),
    [color, scaledSize, shape, station.station_id, sublabel, dimmed, zoom]
  )

  return (
    <Marker
      position={[station.latitude, station.longitude]}
      icon={icon}
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