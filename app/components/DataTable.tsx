'use client'

import { useEffect, useState, useMemo } from 'react'
import ExportCSVButton from './ExportCSVButton'
import { useBatch } from '../context/BatchContext'
import { Search, Filter, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'

const METALS = [
  { id: 'cr', label: 'CR' }, { id: 'mn', label: 'MN' }, { id: 'fe', label: 'FE' },
  { id: 'co', label: 'CO' }, { id: 'ni', label: 'NI' }, { id: 'cu', label: 'CU' },
  { id: 'zn', label: 'ZN' }, { id: 'as', label: 'AS' }, { id: 'cd', label: 'CD' },
  { id: 'hg', label: 'HG' }, { id: 'pb', label: 'PB' }
]

const ITEMS_PER_PAGE = 50

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null

export default function DataTable() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  
  // --- Sorting State ---
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)

  const { selectedBatch: activeBatch } = useBatch()

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const fetchUrl = activeBatch ? `/api/data?batch=${activeBatch}` : '/api/data'
        const response = await fetch(fetchUrl)
        const result = await response.json()
        if (result.success) {
          setRecords(result.data)
          setCurrentPage(1)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [activeBatch])

  // --- 1. Filtering ---
  const filteredRecords = useMemo(() => {
    return records.filter((data: any) => {
      const matchesSearch = data.station_id?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRisk = riskFilter === 'ALL' || data.risk_level === riskFilter
      return matchesSearch && matchesRisk
    })
  }, [records, searchTerm, riskFilter])

  // --- 2. Sorting ---
  const sortedRecords = useMemo(() => {
    let sortableItems = [...filteredRecords]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]

        // Push nulls to the bottom
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1

        // Handle numerical sorting cleanly
        const aNum = Number(aValue)
        const bNum = Number(bValue)

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
        }

        // Fallback to string sorting
        const aString = String(aValue).toLowerCase()
        const bString = String(bValue).toLowerCase()
        if (aString < bString) return sortConfig.direction === 'asc' ? -1 : 1
        if (aString > bString) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [filteredRecords, sortConfig])

  // Reset pagination if filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, riskFilter, sortConfig])

  // --- 3. Pagination ---
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentRecords = sortedRecords.slice(startIndex, endIndex) 

  // --- Sort Handler ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // --- Helper for rendering sortable headers cleanly ---
  const SortableHeader = ({ label, sortKey, align = 'left' }: { label: React.ReactNode, sortKey: string, align?: 'left'|'center' }) => {
    const isActive = sortConfig?.key === sortKey
    return (
      <th 
        onClick={() => handleSort(sortKey)}
        className={`px-6 py-4 text-${align} text-xs font-semibold text-gray-400 tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-gray-800 transition-colors group`}
      >
        <div className={`flex items-center gap-2 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
          {label}
          <span className="text-gray-600 group-hover:text-gray-400 transition-colors">
            {isActive ? (
              sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-rose-400" /> : <ChevronDown className="w-4 h-4 text-rose-400" />
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
            )}
          </span>
        </div>
      </th>
    )
  }

  if (isLoading) return <div className="text-gray-400 p-6 animate-pulse">Loading database records...</div>
  if (records.length === 0) return <div className="text-gray-400 p-6">No active data found. Upload a file to get started!</div>

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '900px', maxHeight: '900px' }}>
      
      {/* HEADER & FILTERS */}
      <div className="flex-none p-6 border-b border-gray-700 bg-gray-800 z-20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Sampling Data</h2>
            <p className="text-sm text-gray-400 mt-1">Heavy metal concentration measurements</p>
          </div>
          <ExportCSVButton data={sortedRecords} />
        </div>

        <div className="flex items-center gap-4 mt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search Station ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors w-64 placeholder-gray-500 font-mono"
            />
          </div>

          <div className="relative flex items-center bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <div className="pl-3 pr-2 py-2 bg-gray-900 border-r border-gray-700">
              <Filter className="w-4 h-4 text-gray-500" />
            </div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="pl-2 pr-8 py-2 bg-gray-900 text-sm text-white focus:outline-none cursor-pointer appearance-none font-mono"
              style={{ minWidth: '140px' }}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="VERY HIGH">Very High</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          
          {(searchTerm !== '' || riskFilter !== 'ALL') && (
            <span className="text-xs text-rose-400 font-mono bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
              {filteredRecords.length} results found
            </span>
          )}
        </div>
      </div>
      
      {/* TABLE BODY */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-gray-800 relative">
        <table className="w-full relative">
          <thead className="sticky top-0 z-10 shadow-md">
            <tr className="bg-gray-900 border-b border-gray-700">
              
              <SortableHeader label="STATION ID" sortKey="station_id" />
              <SortableHeader label="RISK LEVEL" sortKey="risk_level" />
              <SortableHeader label="BATCH ID" sortKey="batch_id" />
              <SortableHeader label="PLI" sortKey="pli" align="center" />
              
              {METALS.map(metal => (
                <SortableHeader 
                  key={`header-raw-${metal.id}`}
                  sortKey={`${metal.id}_mg_kg`}
                  align="center"
                  label={<><span>{metal.label}</span> <span className="lowercase font-normal text-gray-500">(mg/kg)</span></>} 
                />
              ))}

              {METALS.map(metal => (
                <SortableHeader 
                  key={`header-igeo-${metal.id}`}
                  sortKey={`igeo_${metal.id}`}
                  align="center"
                  label={<>I<sub>geo</sub> <span>({metal.label})</span></>} 
                />
              ))}

            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={26} className="px-6 py-12 text-center text-gray-500 italic">
                  No records match the current filter criteria.
                </td>
              </tr>
            ) : (
              currentRecords.map((data: any) => (
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
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-white font-bold">{data.pli !== null ? Number(data.pli).toFixed(2) : 'N/A'}</span>
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

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex-none p-4 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between z-20">
        <p className="text-sm text-gray-400">
          Showing <span className="text-white font-medium">{sortedRecords.length > 0 ? startIndex + 1 : 0}</span> to <span className="text-white font-medium">{Math.min(endIndex, sortedRecords.length)}</span> of <span className="text-white font-bold">{sortedRecords.length}</span> records
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