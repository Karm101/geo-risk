'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { useSearchParams } from 'next/navigation' // 1. Import URL listener
import ExportCSVButton from './ExportCSVButton'

const METALS = [
  { id: 'cr', label: 'CR' }, { id: 'mn', label: 'MN' }, { id: 'fe', label: 'FE' },
  { id: 'co', label: 'CO' }, { id: 'ni', label: 'NI' }, { id: 'cu', label: 'CU' },
  { id: 'zn', label: 'ZN' }, { id: 'as', label: 'AS' }, { id: 'cd', label: 'CD' },
  { id: 'hg', label: 'HG' }, { id: 'pb', label: 'PB' }
]

const ITEMS_PER_PAGE = 50 // You can change this to 100 if you prefer!

export default function DataTable() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1) // 2. State for our current page

  // 3. Listen to the URL to know which batch to fetch
  const searchParams = useSearchParams()
  const activeBatch = searchParams.get('batch')

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // Append the active batch to the API call if it exists
        const fetchUrl = activeBatch ? `/api/data?batch=${activeBatch}` : '/api/data'
        const response = await fetch(fetchUrl)
        const result = await response.json()
        if (result.success) {
          setRecords(result.data)
          setCurrentPage(1) // Reset to page 1 whenever we swap batches!
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [activeBatch]) // 4. The magic array! This triggers a re-fetch when the URL changes.

  if (isLoading) return <div className="text-gray-400 p-6 animate-pulse">Loading database records...</div>
  if (records.length === 0) return <div className="text-gray-400 p-6">No active data found. Upload a file to get started!</div>

  // 5. Pagination Math
  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentRecords = records.slice(startIndex, endIndex) // Only grab the 50 rows we need

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '900px', maxHeight: '900px' }}>
      
      {/* HEADER */}
      <div className="flex-none p-6 border-b border-gray-700 flex items-center justify-between bg-gray-800 z-20">
        <div>
          <h2 className="text-xl font-bold text-white">Sampling Data</h2>
          <p className="text-sm text-gray-400 mt-1">Heavy metal concentration measurements</p>
        </div>
        {/* Pass ONLY the paginated records or the FULL records? Let's pass full records so the CSV has everything */}
        <ExportCSVButton data={records} />
      </div>
      
      {/* TABLE BODY */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-gray-800 relative">
        <table className="w-full relative">
          <thead className="sticky top-0 z-10 shadow-md">
            <tr className="bg-gray-900">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Station ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Risk Level</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Batch ID</th>
              
              {METALS.map(metal => (
                <th key={`header-raw-${metal.id}`} className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {metal.label} (mg/kg)
                </th>
              ))}

              {METALS.map(metal => (
                <th key={`header-igeo-${metal.id}`} className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  I-GEO ({metal.label})
                </th>
              ))}
              
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">PLI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {/* Map over currentRecords instead of records! */}
            {currentRecords.map((data: any) => (
              <tr key={data.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-bold text-white">{data.station_id}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-full ${
                    data.risk_level === 'VERY HIGH' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' :
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

                {METALS.map(metal => {
                  const val = data[`${metal.id}_mg_kg`];
                  return (
                    <td key={`cell-raw-${metal.id}-${data.id}`} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm ${val !== null ? 'text-gray-300' : 'text-gray-500 italic'}`}>
                        {val !== null ? val : 'N/A'}
                      </span>
                    </td>
                  );
                })}

                {METALS.map(metal => {
                  const val = data[`igeo_${metal.id}`];
                  return (
                    <td key={`cell-igeo-${metal.id}-${data.id}`} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm ${val !== null ? 'text-gray-300' : 'text-gray-500 italic'}`}>
                        {val !== null ? Number(val).toFixed(2) : 'N/A'}
                      </span>
                    </td>
                  );
                })}

                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm text-white font-bold">{Number(data.pli).toFixed(2)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex-none p-4 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between z-20">
        <p className="text-sm text-gray-400">
          Showing <span className="text-white font-medium">{startIndex + 1}</span> to <span className="text-white font-medium">{Math.min(endIndex, records.length)}</span> of <span className="text-white font-bold">{records.length}</span> records
        </p>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
    </div>
  )
}