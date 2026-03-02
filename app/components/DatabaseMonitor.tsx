'use client'

import { useEffect, useState, useRef } from 'react'
import { Database, Activity, Layers, ServerCrash, Hash, ChevronDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function DatabaseMonitor() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlBatch = searchParams.get('batch')

  const [stats, setStats] = useState({
    status: 'Connecting...',
    totalRecords: 0,
    totalBatches: 0,
    latestBatch: 'Loading...',
    allBatches: [], 
    latency: 0
  })

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/status')
        const data = await res.json()
        if (data.success) setStats(data)
        else setStats(prev => ({ ...prev, status: 'Disconnected' }))
      } catch (error) {
        setStats(prev => ({ ...prev, status: 'Disconnected' }))
      }
    }
    fetchStatus() 
    const interval = setInterval(fetchStatus, 5000) 
    return () => clearInterval(interval)
  }, [])

  const isConnected = stats.status === 'Connected'
  const displayBatch = urlBatch || stats.latestBatch

  const handleSelectBatch = (batchId: string) => {
    setIsDropdownOpen(false)
    router.push(`?batch=${batchId}`, { scroll: false })
  }

  return (
    <div className={`border-2 border-dashed rounded-xl p-8 transition-colors duration-500 flex flex-col items-center text-center ${
      isConnected ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600' : 'bg-rose-950/20 border-rose-800'
    }`}>
      
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
        isConnected ? 'bg-gray-700/50 text-emerald-500' : 'bg-rose-900/30 text-rose-500'
      }`}>
        {isConnected ? <Database className="w-8 h-8" /> : <ServerCrash className="w-8 h-8" />}
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">POSTGIS DATA PIPELINE</h3>
      
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
        <Hash className="w-4 h-4 text-emerald-500" />
        <span>Selected Batch:</span>
        
        <div className="relative" ref={dropdownRef}>
          {/* UPDATED BUTTON: Added padding, negative margin, and dynamic hover background */}
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-1 px-2 py-1 -mx-2 rounded-lg font-mono transition-all focus:outline-none ${
              isDropdownOpen 
                ? 'bg-gray-700/60 text-emerald-400' 
                : 'text-white hover:bg-gray-700 hover:text-emerald-400 hover:ring-1 hover:ring-gray-600'
            }`}
            title={displayBatch}
          >
            <span className="truncate max-w-[200px]">{displayBatch}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && stats.allBatches.length > 0 && (
            <div className="absolute top-full mt-2 w-max max-w-[300px] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden left-1/2 -translate-x-1/2">
              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {stats.allBatches.map((batchId: string) => (
                  <button
                    key={batchId}
                    onClick={() => handleSelectBatch(batchId)}
                    className={`w-full text-left px-4 py-3 text-sm font-mono transition-colors hover:bg-gray-700 ${
                      displayBatch === batchId ? 'bg-gray-700/50 text-emerald-400 font-bold' : 'text-gray-300'
                    }`}
                  >
                    {batchId}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
      
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-8 ${
        isConnected ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-rose-500/20 border-rose-500/30'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
        <span className={`text-sm font-bold ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isConnected ? 'Connected to PostGIS Server' : 'Connection Failed'}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-xl w-28 flex flex-col items-center">
          <Activity className="w-5 h-5 text-blue-400 mb-2" />
          <div className="text-xl font-bold text-white">{isConnected ? `${stats.latency}ms` : '--'}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Ping</div>
        </div>
        
        <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-xl w-28 flex flex-col items-center">
          <Layers className="w-5 h-5 text-amber-400 mb-2" />
          <div className="text-xl font-bold text-white">{stats.totalBatches}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Batches</div>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 p-4 rounded-xl w-28 flex flex-col items-center">
          <Database className="w-5 h-5 text-purple-400 mb-2" />
          <div className="text-xl font-bold text-white">{stats.totalRecords}</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Records</div>
        </div>
      </div>

    </div>
  )
}