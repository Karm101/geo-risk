'use client'

import { useEffect, useState } from 'react'
import { Database } from 'lucide-react'

export default function DatabaseStatusCard() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    lastUpdate: null as string | null,
  })

  const timeAgo = (dateString: string | null) => {
    if (!dateString) return 'No data'
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000)
    
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + " years ago"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + " months ago"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + " days ago"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + " hrs ago"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + " min ago"
    return "Just now"
  }

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/status')
        const data = await res.json()
        if (data.success) {
          setStats({
            totalRecords: data.totalRecords,
            lastUpdate: data.lastUpdate
          })
        }
      } catch (error) {
        console.error("Failed to fetch database status")
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    // FIX: Removed justify-center, kept flex-col and h-full
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl flex flex-col h-full">
      
      {/* Header naturally locks to the top now */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-emerald-500/20 rounded-lg">
          <Database className="w-6 h-6 text-emerald-500" />
        </div>
        <h2 className="text-lg font-bold text-white">Database</h2>
      </div>
      
      {/* FIX: mt-auto pushes this block to the absolute bottom to align with sibling buttons */}
      <div className="space-y-2 mt-auto">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Records:</span>
          <span className="text-white font-semibold">
            {stats.totalRecords.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Last Sync:</span>
          <span className="text-emerald-400 font-semibold">
            {timeAgo(stats.lastUpdate)}
          </span>
        </div>
      </div>
      
    </div>
  )
}