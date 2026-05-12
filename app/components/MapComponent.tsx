'use client'
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useMemo } from 'react'
import MapLocationHUD from './MapLocationHUD'
import StationMarker, { StationData } from './StationMarker'
import MapAdminWidget, { AdminLayerKey } from './MapAdminWidget'
import type { LayerType } from './StationMarker'
import type { BasemapType } from './MapLayerWidget'
import { STATION_COORDINATES } from '../lib/stations'
import * as turf from '@turf/turf'

function HoverInfoTracker({ geoData, onLocationChange }: { geoData: any, onLocationChange: (info: any) => void }) {
  useMapEvents({
    mousemove: (e) => {
      const point = turf.point([e.latlng.lng, e.latlng.lat]);
      
      const findName = (data: any, key: string) => {
        if (!data || !data.features) return '—';
        // Point-in-polygon check against the specific GeoJSON layer
        const found = data.features.find((f: any) => turf.booleanPointInPolygon(point, f));
        // Target the specific adm#_en property provided
        return found ? found.properties[key] : '—';
      };

      onLocationChange({
        region: findName(geoData.regions, 'adm1_en'),
        province: findName(geoData.provinces, 'adm2_en'),
        municipality: findName(geoData.municipalities, 'adm3_en'),
        barangay: findName(geoData.barangays, 'adm4_en')
      });
    },
  });
  return null;
}

// ─── Constants & Layer Config ────────────────────────────────────────────────

const MIN_ZOOM_FOR_RIVERS = 9

const ADMIN_LAYERS = {
  regions: '/mindanao_regions_simplified.geojson',
  provinces: '/mindanao_provinces.geojson',
  municipalities: '/mindanao_municipalities.geojson',
  barangays: '/mindanao_barangays.geojson',
} as const

const BASEMAP_TILES: Record<BasemapType, { url: string; attribution: string }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CartoDB</a>',
  },
  topo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, USGS, NOAA',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
  },
}

const LAYER_CONFIG = {
  pli: {
    label: 'PLI Index',
    borderColor: '#f43f5e',
    legend: [
      { color: '#ef4444', shape: 'circle', label: 'Very High  >3' },
      { color: '#f97316', shape: 'circle', label: 'High  2–3' },
      { color: '#eab308', shape: 'circle', label: 'Moderate  1–2' },
      { color: '#22c55e', shape: 'circle', label: 'Low  <1' },
    ]
  },
  igeo: {
    label: 'Metal Risk',
    borderColor: '#38bdf8',
    legend: [
      { color: '#ef4444', shape: 'square', label: 'Pb / Cd' },
      { color: '#f97316', shape: 'square', label: 'Hg / As' },
      { color: '#eab308', shape: 'square', label: 'Cu / Ni' },
      { color: '#a3e635', shape: 'square', label: 'Cr / Zn' },
      { color: '#2dd4bf', shape: 'square', label: 'Co / Mn / Fe' },
    ]
  },
  risk: {
    label: 'Risk Zones',
    borderColor: '#f59e0b',
    legend: [
      { color: '#ef4444', shape: 'circle', label: 'Critical  PLI >3' },
      { color: '#f97316', shape: 'circle', label: 'High  PLI >2' },
      { color: '#334155', shape: 'circle', label: 'Below threshold' },
    ]
  }
}

// ─── Helper Components ──────────────────────────────────────────────────────

function ZoomTracker({ onZoom }: { onZoom: (z: number) => void }) {
  useMapEvents({ zoomend: (e) => onZoom(e.target.getZoom()) })
  return null
}

function MouseTracker({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    mousemove: (e) => {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
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
      style={(feature) => ({
        color: '#00ADE3',
        weight: feature?.properties?.waterway === 'river' ? 3 : 1,
        opacity: 0.6,
        lineCap: 'round',
        lineJoin: 'round'
      })}
    />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MapComponent({
  activeLayer,
  activeBasemap = 'dark',
}: {
  activeLayer: LayerType
  activeBasemap?: BasemapType
}) {

  const [hoverInfo, setHoverInfo] = useState({
    region: '—',
    province: '—',
    municipality: '—',
    barangay: '—'
  });

  const [zoom, setZoom] = useState(11);
  const [coords, setCoords] = useState({ lat: 7.0500, lng: 125.9800 });
  const defaultCenter: [number, number] = [7.05, 125.98]
  const [stations, setStations] = useState<StationData[]>([])
  const [geoData, setGeoData] = useState<any>({})

  // Admin Layer Visibility State
  const [adminVisibility, setAdminVisibility] = useState<Record<AdminLayerKey, boolean>>({
    regions: true,
    provinces: true,
    municipalities: false,
    barangays: false,
  })

  const toggleAdminLayer = (key: AdminLayerKey) => {
    setAdminVisibility(prev => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    const fetchJson = (url: string, key: string) => 
      fetch(url).then(res => res.json()).then(data => setGeoData((prev: any) => ({ ...prev, [key]: data })));

    fetchJson('/export.geojson', 'rivers');
    fetchJson('/davao-oriental.geojson', 'province');

    Object.entries(ADMIN_LAYERS).forEach(([key, url]) => {
      fetch(url)
        .then(res => res.json())
        .then(data => setGeoData((prev: any) => ({ ...prev, [key]: data })))
        .catch(err => console.error(`Failed to load ${key}:`, err));
    });

    fetch('/api/data')
      .then(res => res.json())
      .then(result => { if (result.success) setStations(result.data) });
  }, []);

  const stationDataMap = useMemo(() => {
    return Object.fromEntries(stations.map(s => [s.station_id, s]))
  }, [stations])

  const config = LAYER_CONFIG[activeLayer]
  const tileConfig = BASEMAP_TILES[activeBasemap]

  return (
    <div
      className="w-full h-full relative z-0 rounded-xl overflow-hidden shadow-2xl"
      style={{
        border: `3px solid ${config.borderColor}`,
        boxShadow: `0 0 20px ${config.borderColor}40, 0 0 60px ${config.borderColor}15, inset 0 0 20px ${config.borderColor}05`,
        transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {/* 1. Left-side Admin Widget */}
      <MapAdminWidget visibleLayers={adminVisibility} toggleLayer={toggleAdminLayer} />

      {/* 2. Top-left Layer Badge - Simplified Position */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(10,13,18,0.85)',
        border: `1px solid ${config.borderColor}40`,
        borderRadius: '8px',
        padding: '5px 10px',
        backdropFilter: 'blur(8px)',
        marginLeft: '0px', 
        transition: 'all 0.3s ease'
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

      {/* ─── Top Middle Mouse Widget (Coordinates) ─── */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1001,
        background: 'rgba(17,21,32,0.92)',
        border: '1px solid #1e2535',
        backdropFilter: 'blur(12px)',
        borderRadius: '10px',
        padding: '4px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'none',
      }}>
        {/* LAT */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#475569', fontWeight: 700 }}>LAT</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#e2e8f0', minWidth: '60px', textAlign: 'right' }}>
            {coords.lat.toFixed(4)}
          </span>
        </div>

        <div style={{ width: '1px', height: '12px', background: '#1e2535' }} />

        {/* LNG */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#475569', fontWeight: 700 }}>LNG</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#e2e8f0', minWidth: '70px', textAlign: 'right' }}>
            {coords.lng.toFixed(4)}
          </span>
        </div>
      </div>

      <MapLocationHUD hoverInfo={hoverInfo} />

      <MapContainer center={[7.05, 125.98]} zoom={11} className="w-full h-full" zoomControl={false}>
        <ZoomTracker onZoom={setZoom} />
        <MouseTracker onMove={(lat, lng) => setCoords({ lat, lng })} />
        <HoverInfoTracker 
          geoData={geoData} 
          onLocationChange={(info) => setHoverInfo(info)} 
        />

        <TileLayer key={activeBasemap} url={tileConfig.url} attribution={tileConfig.attribution} />

        {/* ── Mindanao Admin Borders ── */}
        {geoData.regions && adminVisibility.regions && (
          <GeoJSON data={geoData.regions} style={{ color: '#ff4444', weight: 4, fillOpacity: 0 }} />
        )}
        {geoData.provinces && adminVisibility.provinces && (
          <GeoJSON data={geoData.provinces} style={{ color: '#ffa500', weight: 2, dashArray: '5, 10', fillOpacity: 0 }} />
        )}
        {geoData.municipalities && adminVisibility.municipalities && (
          <GeoJSON data={geoData.municipalities} style={{ color: '#ffff00', weight: 1, dashArray: '2, 5', fillOpacity: 0 }} />
        )}
        {geoData.barangays && adminVisibility.barangays && (
          <GeoJSON data={geoData.barangays} style={{ color: '#a855f7', weight: 0.5, fillOpacity: 0.05 }} />
        )}

        {geoData.rivers && <RiverLayer data={geoData.rivers} />}

        {/* ── Sampling Station Pins ── */}
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
                  ...(dbData ?? { pli: 0, risk_level: 'LOW', batch_id: '—' })
                }}
                activeLayer={activeLayer}
                zoom={zoom}
              />
            )
          })}
      </MapContainer>

      {/* 3. Footer Legend */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        zIndex: 1000,
        background: 'rgba(10,13,18,0.88)',
        borderTop: `1px solid ${config.borderColor}30`,
        backdropFilter: 'blur(8px)',
        padding: '13px 26px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.12em',
          color: '#475569',
          textTransform: 'uppercase',
          marginRight: '10px',
        }}>
          {activeLayer === 'igeo' ? 'Pin color = dominant metal' : 'Pin size + color = PLI risk level'}
        </span>

        <div style={{ width: '1px', height: '20px', background: '#1e2535', marginRight: '10px' }} />

        {config.legend.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            <div style={{
              width: '16px', height: '16px',
              background: item.color,
              borderRadius: item.shape === 'circle' ? '50%' : '3px',
              boxShadow: item.color !== '#334155' ? `0 0 8px ${item.color}` : 'none',
            }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px', color: '#94a3b8' }}>
              {item.label}
            </span>
          </div>
        ))}

        <div style={{ flex: 1 }} />

        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#475569' }}>
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