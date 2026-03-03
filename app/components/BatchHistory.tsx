"use client"

import { useState, useEffect } from 'react'
import { Circle, CheckCircle, Archive, History, Calendar, FileText, Layers } from 'lucide-react'
import { useBatch } from '../context/BatchContext'

export default function BatchHistory() {
  const [batches, setBatches] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { selectedBatch, setSelectedBatch } = useBatch()

  useEffect(() => {
    fetchBatches(true) // Show loading text ONLY on the first load
    
    // Silent background polling every 5 seconds
    const interval = setInterval(() => fetchBatches(false), 5000)
    return () => clearInterval(interval)
  }, [])

  // Add a parameter to control the loading state
  const fetchBatches = async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true)
    
    try {
      const res = await fetch('/api/batches')
      const json = await res.json()
      if (json.success) {
        setBatches(json.data)
      }
    } catch (error) {
      console.error("Failed to load batches", error)
    } finally {
      if (isInitialLoad) setIsLoading(false)
    }
  }

  // Determine the active batch from the URL or default to the most recent one
  const activeBatchId = selectedBatch || (batches.length > 0 ? batches[0].batch_id : null)

  const handleSelect = (id: string) => {
      if (id === selectedBatch) {
         setSelectedBatch(batches[0]?.batch_id ?? '')
      } else {
         setSelectedBatch(id)
      }
   }

  const handleArchive = async (batchId: string, e: React.MouseEvent) => {
    e.stopPropagation() 
    
    if (!window.confirm(`Are you sure you want to archive ${batchId}? This will hide it from the dashboard.`)) {
      return
    }

    try {
      const res = await fetch('/api/batches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId })
      })
      
      const json = await res.json()
      if (json.success) {
        setBatches(batches.filter(b => b.batch_id !== batchId))
        
        // If the user archives the batch they are currently viewing we reset the URL
        if (selectedBatch === batchId) {
         setSelectedBatch(batches[0]?.batch_id ?? '')
         }
      } else {
        alert("Failed to archive batch.")
      }
    } catch (error) {
      console.error("Archive error", error)
    }
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl flex flex-col">
       <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-500/20 rounded-lg">
                <History className="text-purple-400 w-5 h-5"/>
             </div>
             <h3 className="text-lg font-bold text-white">Batch Import History</h3>
          </div>
          <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
             Recent Activity
          </div>
       </div>

       <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-gray-400 border-b border-gray-700 bg-gray-900/20 uppercase tracking-wider">
          <div className="col-span-5 pl-2">History Name</div>
          <div className="col-span-3">Date Added</div>
          <div className="col-span-2">Records</div>
          <div className="col-span-2 text-right pr-2">Actions</div>
       </div>

       <div className="flex-1 overflow-auto max-h-[300px] custom-scrollbar">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 animate-pulse">Loading batch history...</div>
          ) : batches.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No active batches found.</div>
          ) : (
            batches.map((batch) => {
               const isSelected = batch.batch_id === activeBatchId

               return (
                  <div
                     key={batch.batch_id}
                     // Added onClick here so clicking anywhere on the row selects it
                     onClick={() => handleSelect(batch.batch_id)}
                     className={`
                        grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-700/50 
                        transition-all duration-300 ease-in-out cursor-pointer group
                        ${isSelected 
                           ? 'bg-blue-600/10 border-l-4 border-l-blue-500' 
                           : 'hover:bg-gray-700/40 border-l-4 border-l-transparent' 
                        }
                     `}
                  >
                     <div className="col-span-5 font-medium text-gray-200 flex items-center gap-3">
                        <Layers className={`shrink-0 w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-gray-600'}`} />
                        <span className="truncate" title={batch.batch_id}>{batch.batch_id}</span>
                     </div>

                     <div className="col-span-3 text-gray-400 text-sm flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 opacity-70"/> 
                        {new Date(batch.created_at).toLocaleDateString()}
                     </div>

                     <div className="col-span-2 text-gray-400 text-sm flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 opacity-70"/> 
                        {Number(batch.record_count).toLocaleString()}
                     </div>

                     <div className="col-span-2 flex justify-end gap-3 pr-2">
                        <button
                           className="group/btn transition-transform active:scale-95"
                           title={isSelected ? "Active Batch" : "Select Batch"}
                        >
                           {isSelected ? (
                              <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500/20" />
                           ) : (
                              <Circle className="w-6 h-6 text-gray-600 group-hover/btn:text-gray-400" />
                           )}
                        </button>

                        <button
                           className="group/archive transition-transform active:scale-95 z-10"
                           title="Archive Batch"
                           onClick={(e) => handleArchive(batch.batch_id, e)}
                        >
                           <Archive className="w-6 h-6 text-gray-600 group-hover/archive:text-rose-400 transition-colors" />
                        </button>
                     </div>
                  </div>
               )
            })
          )}
       </div>
    </div>
  )
}