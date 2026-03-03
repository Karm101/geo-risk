'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type BatchContextType = {
  selectedBatch: string | null
  setSelectedBatch: (batch: string) => void
  allBatches: string[]
}

const BatchContext = createContext<BatchContextType>({
  selectedBatch: null,
  setSelectedBatch: () => {},
  allBatches: [],
})

export function BatchProvider({ children }: { children: ReactNode }) {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [allBatches, setAllBatches] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllBatches(data.allBatches)
          // Auto-select latest batch if none selected
          if (!selectedBatch && data.allBatches.length > 0) {
            setSelectedBatch(data.allBatches[0])
          }
        }
      })
      .catch(() => {})
  }, [])

  return (
    <BatchContext.Provider value={{ selectedBatch, setSelectedBatch, allBatches }}>
      {children}
    </BatchContext.Provider>
  )
}

export const useBatch = () => useContext(BatchContext)