'use client'
import { useEffect, useState, useRef } from 'react'
import { MapPin, Clock, Layers, Hash, ChevronDown } from 'lucide-react'
import { useBatch } from '../context/BatchContext'

// ─── Coverage Area Card (static) ─────────────────────────────────────────────

export function CoverageCard() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-emerald-400" />
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coverage Area</h3>
      </div>
      <p className="text-2xl font-bold text-white">450 km²</p>
      <p className="text-xs text-gray-400 mt-1">Davao Oriental, Philippines</p>
    </div>
  )
}

// ─── Sampling Points Card (dynamic) ──────────────────────────────────────────

export function SamplingPointsCard() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCount(data.totalRecords)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sampling Points</h3>
      </div>
      <p className="text-2xl font-bold text-white">
        {count === null
          ? <span className="text-gray-500 animate-pulse">—</span>
          : count.toLocaleString()
        }
      </p>
      <p className="text-xs text-gray-400 mt-1">Active monitoring records</p>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`
  return `${Math.floor(diff / 2592000)} months ago`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

// ─── Last Updated Card (dynamic) ─────────────────────────────────────────────

export function LastUpdatedCard() {
  const { selectedBatch } = useBatch()
  const [createdAt, setCreatedAt] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const batch = selectedBatch || data.latestBatch
          fetch(`/api/batch-info?batch=${encodeURIComponent(batch)}`)
            .then(res => res.json())
            .then(batchData => {
              if (batchData.success) setCreatedAt(batchData.createdAt)
            })
        }
      })
      .catch(() => {})
  }, [selectedBatch])

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-rose-400" />
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Uploaded</h3>
      </div>
      <p className="text-2xl font-bold text-white">
        {createdAt
          ? timeAgo(createdAt)
          : <span className="text-gray-500 animate-pulse">—</span>
        }
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {createdAt ? `Uploaded on ${formatDate(createdAt)}` : 'No uploads yet'}
      </p>
    </div>
  )
}

// ─── Batch Selector Card ──────────────────────────────────────────────────────

export function BatchSelectorCard() {
  const { selectedBatch, setSelectedBatch, allBatches } = useBatch()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayBatch = selectedBatch || allBatches[0] || 'No batches'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (batchId: string) => {
    setIsDropdownOpen(false)
    setSelectedBatch(batchId)
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Hash className="w-4 h-4 text-emerald-500" />
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selected Batch</h3>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg font-mono text-sm transition-all focus:outline-none ${
            isDropdownOpen
              ? 'bg-gray-700/60 text-emerald-400'
              : 'bg-gray-900 text-white hover:bg-gray-700 hover:text-emerald-400 hover:ring-1 hover:ring-gray-600'
          }`}
          title={displayBatch}
        >
          <span className="truncate">{displayBatch}</span>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && allBatches.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              {allBatches.map((batchId) => (
                <button
                  key={batchId}
                  onClick={() => handleSelect(batchId)}
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

      <p className="text-xs text-gray-500 mt-2">
        {allBatches.length} batch{allBatches.length !== 1 ? 'es' : ''} available
      </p>
    </div>
  )
}