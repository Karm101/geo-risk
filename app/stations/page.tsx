'use client'
import { useState, useEffect, useCallback } from 'react'
import { GeoRiskSidebar } from '../components/GeoRiskSidebar'
import { MapPin, Plus, Eye, EyeOff, Trash2, Pencil, Check, X, AlertTriangle } from 'lucide-react'
import AddStationModal from '../components/AddStationModal'
import dynamic from 'next/dynamic'

// ─── Types ────────────────────────────────────────────────────────────────────

type Station = {
  station_id: string
  river:      string | null
  barangay:   string | null
  latitude:   number | null
  longitude:  number | null
  elevation:  number | null
  is_hidden:  boolean
  is_deleted: boolean
  created_at: string | null
}

type FormState = {
  station_id: string
  river:      string
  barangay:   string
  latitude:   string
  longitude:  string
  elevation:  string
}

const EMPTY_FORM: FormState = {
  station_id: '', river: '', barangay: '',
  latitude: '', longitude: '', elevation: '',
}

// ─── Mini map (SSR-disabled) ──────────────────────────────────────────────────

const StationsPreviewMap = dynamic(() => import('../components/StationsPreviewMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-xl">
      <div className="w-8 h-8 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
    </div>
  )
})

// ─── Shared styles ────────────────────────────────────────────────────────────

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid #1e2535',
  verticalAlign: 'middle',
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontFamily: "'Space Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.12em',
  color: '#475569',
  textTransform: 'uppercase',
  borderBottom: '1px solid #1e2535',
  textAlign: 'left',
  background: '#0a0d12',
}

function IconBtn({ onClick, color, title, children, disabled }: {
  onClick: (e: any) => void
  color: string
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        borderRadius: '6px',
        padding: '5px',
        color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

// ─── Inline edit row ──────────────────────────────────────────────────────────

function EditRow({ station, onSave, onCancel }: {
  station: Station
  onSave: (data: Partial<Station>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    river:     station.river      ?? '',
    barangay:  station.barangay   ?? '',
    latitude:  station.latitude   != null ? String(station.latitude)  : '',
    longitude: station.longitude  != null ? String(station.longitude) : '',
    elevation: station.elevation  != null ? String(station.elevation) : '',
  })

  const inp = (key: keyof typeof form) => (
    <input
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={{
        background: '#0a0d12', border: '1px solid #334155',
        borderRadius: '6px', padding: '4px 8px',
        color: '#e2e8f0', fontFamily: "'Space Mono', monospace",
        fontSize: '11px', width: '100%',
      }}
    />
  )

  return (
    <tr style={{ background: '#111520' }}>
      <td style={tdStyle}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#94a3b8' }}>
          {station.station_id}
        </span>
      </td>
      <td style={tdStyle}>{inp('river')}</td>
      <td style={tdStyle}>{inp('barangay')}</td>
      <td style={tdStyle}>{inp('latitude')}</td>
      <td style={tdStyle}>{inp('longitude')}</td>
      <td style={tdStyle}>{inp('elevation')}</td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <IconBtn onClick={() => onSave({
            river:     form.river     || null,
            barangay:  form.barangay  || null,
            latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
            longitude: form.longitude ? parseFloat(form.longitude) : null,
            elevation: form.elevation ? parseFloat(form.elevation) : null,
          })} color="#22c55e" title="Save">
            <Check className="w-3.5 h-3.5" />
          </IconBtn>
          <IconBtn onClick={onCancel} color="#64748b" title="Cancel">
            <X className="w-3.5 h-3.5" />
          </IconBtn>
        </div>
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StationsPage() {
  const [stations, setStations]       = useState<Station[]>([])
  const [loading, setLoading]         = useState(true)
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [showAdd, setShowAdd]         = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  const [selected, setSelected]       = useState<string | null>(null)

  const fetchStations = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/stations')
      const json = await res.json()
      if (json.success) setStations(json.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStations() }, [fetchStations])

  const handleToggleHide = async (station: Station) => {
    const res  = await fetch('/api/stations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ station_id: station.station_id, is_hidden: !station.is_hidden }),
    })
    const json = await res.json()
    if (json.success) setStations(prev =>
      prev.map(s => s.station_id === station.station_id ? { ...s, is_hidden: !s.is_hidden } : s)
    )
  }

  const handleDelete = async (station_id: string) => {
    if (!confirm(`Soft-delete "${station_id}"? It will no longer appear on the map.`)) return
    const res  = await fetch('/api/stations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ station_id }),
    })
    const json = await res.json()
    if (json.success) setStations(prev =>
      prev.map(s => s.station_id === station_id ? { ...s, is_deleted: true } : s)
    )
  }

  const handleSaveEdit = async (station_id: string, data: Partial<Station>) => {
    const res  = await fetch('/api/stations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ station_id, ...data }),
    })
    const json = await res.json()
    if (json.success) {
      setStations(prev => prev.map(s => s.station_id === station_id ? json.data : s))
      setEditingId(null)
    }
  }

  const handleAdd = async (form: FormState) => {
    const res  = await fetch('/api/stations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        station_id: form.station_id.trim(),
        river:      form.river     || null,
        barangay:   form.barangay  || null,
        latitude:   form.latitude  ? parseFloat(form.latitude)  : null,
        longitude:  form.longitude ? parseFloat(form.longitude) : null,
        elevation:  form.elevation ? parseFloat(form.elevation) : null,
      }),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error)
    setStations(prev => [...prev, json.data])
  }

  const visible  = stations.filter(s => !s.is_deleted)
  const filtered = showDeleted ? stations : visible

  const activeCount  = visible.filter(s => !s.is_hidden).length
  const hiddenCount  = visible.filter(s =>  s.is_hidden).length
  const deletedCount = stations.filter(s =>  s.is_deleted).length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0d12' }}>
      <GeoRiskSidebar />

      <main style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ padding: '32px' }}>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>
                  Stations
                </h1>
                <p className="text-gray-400">
                  Manage sampling station locations and visibility
                </p>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 18px', borderRadius: '10px',
                  background: '#f43f5e', border: 'none',
                  color: 'white', cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 700,
                  boxShadow: '0 0 20px #f43f5e30',
                }}
              >
                <Plus className="w-4 h-4" /> Add Station
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {[
                { label: 'Active',  value: activeCount,  color: '#22c55e' },
                { label: 'Hidden',  value: hiddenCount,  color: '#f59e0b' },
                { label: 'Deleted', value: deletedCount, color: '#ef4444' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#111520', border: '1px solid #1e2535',
                  borderRadius: '10px', padding: '12px 20px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '20px', fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Body: table + mini map */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

            {/* Table */}
            <div style={{ background: '#111520', border: '1px solid #1e2535', borderRadius: '12px', overflow: 'hidden' }}>
              {/* Toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', borderBottom: '1px solid #1e2535',
              }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {filtered.length} station{filtered.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setShowDeleted(v => !v)}
                  style={{
                    fontFamily: "'Space Mono', monospace", fontSize: '9px',
                    color: showDeleted ? '#f43f5e' : '#334155',
                    background: 'none',
                    border: `1px solid ${showDeleted ? '#f43f5e40' : '#1e2535'}`,
                    borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                    letterSpacing: '0.08em',
                  }}
                >
                  {showDeleted ? 'Hide deleted' : 'Show deleted'}
                </button>
              </div>

              {loading
                ? <div style={{ padding: '40px', textAlign: 'center', fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#475569' }}>Loading...</div>
                : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Station', 'River', 'Barangay', 'Lat', 'Lng', 'Elev (m)', 'Actions'].map(h => (
                            <th key={h} style={thStyle}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(station => {
                          if (editingId === station.station_id) return (
                            <EditRow
                              key={station.station_id}
                              station={station}
                              onSave={data => handleSaveEdit(station.station_id, data)}
                              onCancel={() => setEditingId(null)}
                            />
                          )

                          return (
                            <tr
                              key={station.station_id}
                              onClick={() => setSelected(station.station_id)}
                              style={{
                                background: selected === station.station_id ? '#1e253530' : 'transparent',
                                opacity: station.is_deleted ? 0.35 : station.is_hidden ? 0.6 : 1,
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                              }}
                            >
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <MapPin style={{ width: '14px', height: '14px', color: station.is_hidden ? '#475569' : '#f43f5e', flexShrink: 0 }} />
                                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', fontWeight: 700, color: '#e2e8f0' }}>
                                    {station.station_id}
                                  </span>
                                  {station.is_deleted && (
                                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#ef4444', border: '1px solid #ef444440', borderRadius: '4px', padding: '1px 5px' }}>
                                      deleted
                                    </span>
                                  )}
                                  {station.is_hidden && !station.is_deleted && (
                                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#f59e0b', border: '1px solid #f59e0b40', borderRadius: '4px', padding: '1px 5px' }}>
                                      hidden
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={tdStyle}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#94a3b8' }}>{station.river ?? '—'}</span></td>
                              <td style={tdStyle}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#94a3b8' }}>{station.barangay ?? '—'}</span></td>
                              <td style={tdStyle}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#64748b' }}>{station.latitude?.toFixed(4) ?? '—'}</span></td>
                              <td style={tdStyle}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#64748b' }}>{station.longitude?.toFixed(4) ?? '—'}</span></td>
                              <td style={tdStyle}><span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#64748b' }}>{station.elevation ?? '—'}</span></td>
                              <td style={tdStyle}>
                                {!station.is_deleted && (
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    <IconBtn onClick={e => { e.stopPropagation(); setEditingId(station.station_id) }} color="#38bdf8" title="Edit">
                                      <Pencil style={{ width: '14px', height: '14px' }} />
                                    </IconBtn>
                                    <IconBtn onClick={e => { e.stopPropagation(); handleToggleHide(station) }} color="#f59e0b" title={station.is_hidden ? 'Unhide' : 'Hide'}>
                                      {station.is_hidden
                                        ? <Eye    style={{ width: '14px', height: '14px' }} />
                                        : <EyeOff style={{ width: '14px', height: '14px' }} />
                                      }
                                    </IconBtn>
                                    <IconBtn onClick={e => { e.stopPropagation(); handleDelete(station.station_id) }} color="#ef4444" title="Delete">
                                      <Trash2 style={{ width: '14px', height: '14px' }} />
                                    </IconBtn>
                                  </div>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>

            {/* Mini map */}
            <div style={{
              background: '#111520', border: '1px solid #1e2535',
              borderRadius: '12px', overflow: 'hidden',
              position: 'sticky', top: '24px',
            }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #1e2535' }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Location Preview
                </span>
              </div>
              <div style={{ height: '420px' }}>
                <StationsPreviewMap
                  stations={stations.filter(s => !s.is_deleted && s.latitude != null && s.longitude != null)}
                  selectedId={selected}
                  onSelect={setSelected}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAdd && (
        <AddStationModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />
      )}
    </div>
  )
}


// todo: styling... horrendous