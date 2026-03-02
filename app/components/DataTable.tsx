'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import ExportCSVButton from './ExportCSVButton'

const METALS = [
  { id: 'cr', label: 'CR' }, { id: 'mn', label: 'MN' }, { id: 'fe', label: 'FE' },
  { id: 'co', label: 'CO' }, { id: 'ni', label: 'NI' }, { id: 'cu', label: 'CU' },
  { id: 'zn', label: 'ZN' }, { id: 'as', label: 'AS' }, { id: 'cd', label: 'CD' },
  { id: 'hg', label: 'HG' }, { id: 'pb', label: 'PB' }
]

export default function DataTable() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/data')
        const result = await response.json()
        if (result.success) setRecords(result.data)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) return <div className="text-gray-400 p-6 animate-pulse">Loading database records...</div>
  if (records.length === 0) return <div className="text-gray-400 p-6">No active data found. Upload a file to get started!</div>

  return (
    // 1. OUTER WRAPPER: Strict height (h-[600px]) and flex-col
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '900px', maxHeight: '900px' }}>
      
      {/* 2. HEADER*/}
      <div className="flex-none p-6 border-b border-gray-700 flex items-center justify-between bg-gray-800 z-20">
        <div>
          <h2 className="text-xl font-bold text-white">Sampling Data</h2>
          <p className="text-sm text-gray-400 mt-1">Heavy metal concentration measurements</p>
        </div>
        
        {/* Button */}
        <ExportCSVButton data={records} />
        
      </div>
      
      {/* 3. TABLE BODY: flex-1 forces it to ONLY use available space, overflow-auto adds scrollbars */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-gray-800 relative">
        <table className="w-full relative">
          <thead className="sticky top-0 z-10 shadow-md">
            <tr className="bg-gray-900">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Station ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Risk Level</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Batch ID</th>
              
              {METALS.map(metal => (
                <th key={`header-raw-${metal.id}`} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {metal.label} (mg/kg)
                </th>
              ))}

              {METALS.map(metal => (
                <th key={`header-igeo-${metal.id}`} className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  I-GEO ({metal.label})
                </th>
              ))}
              
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">PLI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {records.map((data: any) => (
              <tr key={data.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-white">{data.station_id}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-full ${
                    data.risk_level === 'HIGH' ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30' : 
                    data.risk_level === 'MODERATE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {data.risk_level}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs text-gray-500 font-mono">{data.batch_id}</span>
                </td>
                {METALS.map(metal => (
                  <td key={`cell-raw-${metal.id}-${data.id}`} className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{data[`${metal.id}_mg_kg`] !== null ? data[`${metal.id}_mg_kg`] : 'N/A'}</span>
                  </td>
                ))}
                {METALS.map(metal => (
                  <td key={`cell-igeo-${metal.id}-${data.id}`} className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{data[`igeo_${metal.id}`] !== null ? Number(data[`igeo_${metal.id}`]).toFixed(2) : 'N/A'}</span>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-white font-bold">{Number(data.pli).toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. FOOTER: flex-none so it stays pinned to the bottom */}
      <div className="flex-none p-4 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between z-20">
        <p className="text-sm text-gray-400">Showing {records.length} records</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-all disabled:opacity-50">
            Previous
          </button>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-all disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
      
    </div>
  )
}