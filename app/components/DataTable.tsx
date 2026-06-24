'use client'

import { useEffect, useState, useMemo } from 'react'
import ExportCSVButton from './ExportCSVButton'
import { useBatch } from '../context/BatchContext'
import { Search, Filter, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'

const METALS = [
  { id: 'cr', symbol: 'Cr', name: 'Chromium',  tooltip: 'Chromium (Cr) — measured concentration in mg/kg. Background: 90 mg/kg (Turekian & Wedepohl, 1961).' },
  { id: 'mn', symbol: 'Mn', name: 'Manganese', tooltip: 'Manganese (Mn) — measured concentration in mg/kg. Background: 850 mg/kg.' },
  { id: 'fe', symbol: 'Fe', name: 'Iron',      tooltip: 'Iron (Fe) — measured concentration in mg/kg. Background: 47,200 mg/kg.' },
  { id: 'co', symbol: 'Co', name: 'Cobalt',    tooltip: 'Cobalt (Co) — measured concentration in mg/kg. Background: 20 mg/kg.' },
  { id: 'ni', symbol: 'Ni', name: 'Nickel',    tooltip: 'Nickel (Ni) — measured concentration in mg/kg. Background: 68 mg/kg.' },
  { id: 'cu', symbol: 'Cu', name: 'Copper',    tooltip: 'Copper (Cu) — measured concentration in mg/kg. Background: 45 mg/kg.' },
  { id: 'zn', symbol: 'Zn', name: 'Zinc',      tooltip: 'Zinc (Zn) — measured concentration in mg/kg. Background: 95 mg/kg.' },
  { id: 'as', symbol: 'As', name: 'Arsenic',   tooltip: 'Arsenic (As) — measured concentration in mg/kg. Background: 13 mg/kg.' },
  { id: 'cd', symbol: 'Cd', name: 'Cadmium',   tooltip: 'Cadmium (Cd) — measured concentration in mg/kg. Background: 0.3 mg/kg.' },
  { id: 'hg', symbol: 'Hg', name: 'Mercury',   tooltip: 'Mercury (Hg) — measured concentration in mg/kg. Background: 0.4 mg/kg.' },
  { id: 'pb', symbol: 'Pb', name: 'Lead',      tooltip: 'Lead (Pb) — measured concentration in mg/kg. Background: 20 mg/kg.' },
]

const IGEO_TOOLTIP = (symbol: string, name: string) =>
  `Geo-accumulation Index for ${name} (${symbol}). Igeo = log₂(C ÷ 1.5B). < 0 = unpolluted, 0–1 = moderate, 1–2 = moderately polluted, > 3 = strongly polluted.`

const ITEMS_PER_PAGE = 50

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null

function igeoColor(val: number | null): string {
  if (val === null) return 'text-gray-600'
  if (val < 0)  return 'text-emerald-400'
  if (val < 1)  return 'text-teal-400'
  if (val < 2)  return 'text-amber-400'
  if (val < 3)  return 'text-orange-400'
  if (val < 4)  return 'text-rose-400'
  if (val < 5)  return 'text-rose-500'
  return 'text-purple-400'
}

export default function DataTable() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
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
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [activeBatch])

  const filteredRecords = useMemo(() => records.filter((data: any) => {
    const matchesSearch = data.station_id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = riskFilter === 'ALL' || data.risk_level === riskFilter
    return matchesSearch && matchesRisk
  }), [records, searchTerm, riskFilter])

  const sortedRecords = useMemo(() => {
    const items = [...filteredRecords]
    if (!sortConfig) return items
    return items.sort((a, b) => {
      const av = a[sortConfig.key], bv = b[sortConfig.key]
      if (av == null) return 1
      if (bv == null) return -1
      const an = Number(av), bn = Number(bv)
      if (!isNaN(an) && !isNaN(bn)) return sortConfig.direction === 'asc' ? an - bn : bn - an
      const as_ = String(av).toLowerCase(), bs = String(bv).toLowerCase()
      return sortConfig.direction === 'asc' ? as_.localeCompare(bs) : bs.localeCompare(as_)
    })
  }, [filteredRecords, sortConfig])

  useEffect(() => { setCurrentPage(1) }, [searchTerm, riskFilter, sortConfig])

  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / ITEMS_PER_PAGE))
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentRecords = sortedRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleSort = (key: string) => {
    setSortConfig(prev =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )
  }

  const SortableHeader = ({
    label, sortKey, align = 'left', tooltip,
  }: { label: React.ReactNode; sortKey: string; align?: 'left' | 'center'; tooltip?: string }) => {
    const isActive = sortConfig?.key === sortKey
    return (
      <th
        onClick={() => handleSort(sortKey)}
        title={tooltip}
        className={`px-4 py-3 text-xs font-semibold text-gray-400 tracking-wider whitespace-nowrap cursor-pointer select-none hover:bg-gray-800/80 transition-colors group ${tooltip ? 'cursor-help' : ''}`}
      >
        <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
          <span className={isActive ? 'text-white' : ''}>{label}</span>
          <span className="transition-colors">
            {isActive
              ? sortConfig.direction === 'asc'
                ? <ChevronUp className="w-3.5 h-3.5 text-rose-400" />
                : <ChevronDown className="w-3.5 h-3.5 text-rose-400" />
              : <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100" />
            }
          </span>
        </div>
      </th>
    )
  }

  if (isLoading) return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 flex items-center gap-3 text-gray-400">
      <div className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
      Loading database records...
    </div>
  )

  if (records.length === 0) return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-gray-400">
      No active data found. Upload a file to get started.
    </div>
  )

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '900px' }}>

      {/* Header & Filters */}
      <div className="flex-none px-6 py-5 border-b border-gray-700 bg-gray-800/95 z-20 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Sampling Data</h2>
            <p className="text-sm text-gray-400 mt-0.5">Heavy metal concentration measurements per station</p>
          </div>
          <ExportCSVButton data={sortedRecords} />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search station ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors w-56 placeholder-gray-500 font-mono"
            />
          </div>

          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <div className="pl-3 pr-2 py-2 border-r border-gray-700">
              <Filter className="w-4 h-4 text-gray-500" />
            </div>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="pl-2 pr-6 py-2 bg-gray-900 text-sm text-white focus:outline-none cursor-pointer appearance-none font-mono"
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
              {filteredRecords.length} result{filteredRecords.length !== 1 ? 's' : ''}
            </span>
          )}

          <span className="ml-auto text-xs text-gray-600 font-mono">
            Hover column headers for definitions
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-gray-800 relative">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            {/* Column group labels */}
            <tr className="bg-gray-900 border-b border-gray-800">
              <th colSpan={4} className="px-4 py-1.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest border-r border-gray-800">
                Station Info
              </th>
              <th colSpan={11} className="px-4 py-1.5 text-center text-[10px] font-semibold text-blue-500/70 uppercase tracking-widest border-r border-gray-800">
                Concentration (mg/kg)
              </th>
              <th colSpan={11} className="px-4 py-1.5 text-center text-[10px] font-semibold text-amber-500/70 uppercase tracking-widest">
                Geo-accumulation Index (I<sub>geo</sub>)
              </th>
            </tr>
            <tr className="bg-gray-900 border-b border-gray-700">
              <SortableHeader label="Station" sortKey="station_id" tooltip="Unique station identifier (e.g. S-01). Each station is a fixed geographic sampling point along the river." />
              <SortableHeader label="Risk" sortKey="risk_level" tooltip="Risk level derived from PLI: LOW (<1), MODERATE (1–2), HIGH (2–3), VERY HIGH (>3)." />
              <SortableHeader label="PLI" sortKey="pli" align="center" tooltip="Pollution Load Index — geometric mean of all Contamination Factors. PLI > 1 indicates measurable heavy metal pollution above natural background." />
              <SortableHeader label="Batch" sortKey="batch_id" tooltip="Batch ID of the CSV upload this record belongs to. Used to group records from the same field campaign." />
              {METALS.map(m => (
                <SortableHeader
                  key={`h-raw-${m.id}`}
                  sortKey={`${m.id}_mg_kg`}
                  align="center"
                  tooltip={m.tooltip}
                  label={<span className="font-mono">{m.symbol}</span>}
                />
              ))}
              {METALS.map(m => (
                <SortableHeader
                  key={`h-igeo-${m.id}`}
                  sortKey={`igeo_${m.id}`}
                  align="center"
                  tooltip={IGEO_TOOLTIP(m.symbol, m.name)}
                  label={<span className="font-mono">I<sub>geo</sub>·{m.symbol}</span>}
                />
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700/60">
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={26} className="px-6 py-12 text-center text-gray-500 italic text-sm">
                  No records match the current filters.
                </td>
              </tr>
            ) : currentRecords.map((data: any) => (
              <tr key={data.id} className="hover:bg-gray-700/40 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm font-bold text-white font-mono">{data.station_id}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full ${
                    data.risk_level === 'VERY HIGH' ? 'bg-red-600/20 text-red-400 border border-red-500/30' :
                    data.risk_level === 'HIGH'      ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30' :
                    data.risk_level === 'MODERATE'  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {data.risk_level}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className={`text-sm font-bold font-mono ${
                    data.pli > 3 ? 'text-red-400' :
                    data.pli > 2 ? 'text-rose-400' :
                    data.pli > 1 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {data.pli != null ? Number(data.pli).toFixed(2) : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs text-gray-500 font-mono">{data.batch_id}</span>
                </td>
                {METALS.map(m => {
                  const val = data[`${m.id}_mg_kg`]
                  return (
                    <td key={`c-raw-${m.id}-${data.id}`} className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`text-xs font-mono ${val != null ? 'text-gray-300' : 'text-gray-600'}`}>
                        {val != null ? Number(val).toFixed(2) : '—'}
                      </span>
                    </td>
                  )
                })}
                {METALS.map(m => {
                  const val = data[`igeo_${m.id}`]
                  const num = val != null ? Number(val) : null
                  return (
                    <td key={`c-igeo-${m.id}-${data.id}`} className="px-4 py-3 whitespace-nowrap text-center">
                      <span className={`text-xs font-mono font-semibold ${igeoColor(num)}`}>
                        {num != null ? num.toFixed(2) : '—'}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex-none px-6 py-3 bg-gray-900/60 border-t border-gray-700 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          <span className="text-white font-medium">{sortedRecords.length > 0 ? startIndex + 1 : 0}</span>
          {' – '}
          <span className="text-white font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, sortedRecords.length)}</span>
          {' of '}
          <span className="text-white font-bold">{sortedRecords.length}</span>
          {' records'}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 font-mono">Page {currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  )
}
