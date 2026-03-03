'use client'

import { useEffect, useState } from 'react'
import { useBatch } from '../../context/BatchContext'
import { STATION_COORDINATES } from '../../lib/stations'

interface RiskSite {
  id: number
  station_id: string
  pli: number
  risk_level: string
}

function getRiskStyle(risk: string) {
  switch (risk) {
    case 'VERY HIGH':
      return 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
    case 'HIGH':
      return 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
    case 'MODERATE':
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    default:
      return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
  }
}

export default function TopRiskSitesTable() {
  const { selectedBatch } = useBatch()
  const [sites, setSites] = useState<RiskSite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!selectedBatch) return
    setIsLoading(true)
    fetch(`/api/data?batch=${encodeURIComponent(selectedBatch)}`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data.length > 0) {
          const top5 = [...result.data]
            .sort((a, b) => b.pli - a.pli)
            .slice(0, 8)
          setSites(top5)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [selectedBatch])

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Top Risk Sites</h2>
        <p className="text-gray-400 text-sm mt-1">Ranked by Pollution Load Index</p>
      </div>

      <div className="overflow-auto">
        {isLoading ? (
          <div className="p-6 text-gray-400 text-sm animate-pulse">Loading risk sites...</div>
        ) : sites.length === 0 ? (
          <div className="p-6 text-gray-400 text-sm">No data for selected batch.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Station</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">PLI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Coordinates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sites.map(site => {
                const coords = STATION_COORDINATES[site.station_id]
                return (
                  <tr key={site.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {site.station_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                      {Number(site.pli).toFixed(3)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getRiskStyle(site.risk_level)}`}>
                        {site.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                      {coords
                        ? `${coords.latitude.toFixed(4)}°N, ${coords.longitude.toFixed(4)}°E`
                        : '—'
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}