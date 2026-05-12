'use client'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

type Station = {
  station_id: string
  river:      string | null
  barangay:   string | null
  latitude:   number | null
  longitude:  number | null
  is_hidden:  boolean
}

type Props = {
  stations:   Station[]
  selectedId: string | null
  onSelect:   (id: string) => void
}

// Auto-fit map bounds when stations change or selection changes
function BoundsFitter({ stations, selectedId }: { stations: Station[]; selectedId: string | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedId) {
      const s = stations.find(s => s.station_id === selectedId)
      if (s?.latitude && s?.longitude) {
        map.flyTo([s.latitude, s.longitude], 13, { duration: 0.8 })
        return
      }
    }

    const coords = stations
      .filter(s => s.latitude != null && s.longitude != null)
      .map(s => [s.latitude!, s.longitude!] as [number, number])

    if (coords.length > 0) {
      map.fitBounds(coords, { padding: [24, 24] })
    }
  }, [selectedId, stations, map])

  return null
}

export default function StationsPreviewMap({ stations, selectedId, onSelect }: Props) {
  const defaultCenter: [number, number] = [7.05, 125.98]

  return (
    <MapContainer
      center={defaultCenter}
      zoom={11}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; CartoDB'
      />

      <BoundsFitter stations={stations} selectedId={selectedId} />

      {stations.map(station => {
        if (!station.latitude || !station.longitude) return null
        const isSelected = selectedId === station.station_id
        const isHidden   = station.is_hidden

        return (
          <CircleMarker
            key={station.station_id}
            center={[station.latitude, station.longitude]}
            radius={isSelected ? 10 : 6}
            pathOptions={{
              color:       isSelected ? '#ffffff' : isHidden ? '#475569' : '#f43f5e',
              fillColor:   isSelected ? '#f43f5e' : isHidden ? '#334155' : '#f43f5e',
              fillOpacity: isSelected ? 1 : isHidden ? 0.4 : 0.75,
              weight:      isSelected ? 2 : 1,
            }}
            eventHandlers={{ click: () => onSelect(station.station_id) }}
          >
            <Popup>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                background: '#111520',
                color: '#e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '11px',
                minWidth: '140px',
              }}>
                <div style={{ fontWeight: 700, color: 'white', marginBottom: '4px' }}>{station.station_id}</div>
                {station.river    && <div style={{ color: '#64748b' }}>{station.river}</div>}
                {station.barangay && <div style={{ color: '#64748b' }}>{station.barangay}</div>}
                {station.is_hidden && (
                  <div style={{ color: '#f59e0b', marginTop: '4px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Hidden from map
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}