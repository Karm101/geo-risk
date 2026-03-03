'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, MapPin } from 'lucide-react'
import { useBatch } from '../../context/BatchContext'
import { STATION_COORDINATES } from '../../lib/stations'

export default function HighestRiskCard() {
  const { selectedBatch } = useBatch()
  const [topStation, setTopStation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!selectedBatch) return
    setIsLoading(true)
    fetch(`/api/data?batch=${encodeURIComponent(selectedBatch)}`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data.length > 0) {
          const sorted = [...result.data].sort((a, b) => b.pli - a.pli)
          setTopStation(sorted[0])
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [selectedBatch])

  const coords = topStation ? STATION_COORDINATES[topStation.station_id] : null

  return (
    <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl p-6 shadow-xl shadow-rose-600/20">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <span className="px-3 py-1 bg-white/30 rounded-full text-xs font-semibold text-white backdrop-blur">
          {isLoading ? '...' : topStation?.risk_level ?? '—'}
        </span>
      </div>

      <h3 className="text-white/80 text-sm font-medium mb-2">Highest Risk Site</h3>

      {isLoading ? (
        <p className="text-3xl font-bold text-white/40 animate-pulse mb-1">—</p>
      ) : topStation ? (
        <>
          <p className="text-3xl font-bold text-white mb-1">{topStation.station_id}</p>
          <p className="text-white/70 text-sm">
            PLI: {Number(topStation.pli).toFixed(3)} · {coords?.river ?? '—'} River
          </p>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-sm text-white/80">
            <MapPin className="w-4 h-4" />
            <span>
              {coords
                ? `${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E`
                : 'Coordinates unavailable'
              }
            </span>
          </div>
        </>
      ) : (
        <p className="text-white/50 text-sm">No data for selected batch</p>
      )}
    </div>
  )
}