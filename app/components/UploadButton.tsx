'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'

const RIVERS = [
  { value: '', label: 'Unspecified' },
  { value: 'Mapagba (MPG)', label: 'Mapagba (MPG)' },
  { value: 'Pintatagan (PTG)', label: 'Pintatagan (PTG)' },
  { value: 'Maputi (MPT)', label: 'Maputi (MPT)' },
]

export default function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [river, setRiver] = useState('')
  const [collectionStart, setCollectionStart] = useState('')
  const [collectionEnd, setCollectionEnd] = useState('')
  const router = useRouter()

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rows: results.data,
              river: river || null,
              collectionStart: collectionStart || null,
              collectionEnd: collectionEnd || null,
            }),
          })

          const dbResult = await response.json()

          if (dbResult.success) {
            alert(`Success! Inserted ${dbResult.inserted} records into PostGIS.`)
            router.push('?', { scroll: false })
          } else {
            alert(`Error: ${dbResult.error || "Something went wrong with the database."}`)
          }
        } catch (error) {
          console.error(error)
          alert("Failed to send data to the server.")
        } finally {
          setIsUploading(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }
    })
  }

  const inputClass = "w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500"

  return (
      <div className="space-y-3">
        <input
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1">River (optional)</label>
          <select value={river} onChange={(e) => setRiver(e.target.value)} className={inputClass} disabled={isUploading}>
            {RIVERS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Collection start</label>
            <input type="date" value={collectionStart} onChange={(e) => setCollectionStart(e.target.value)} className={inputClass} disabled={isUploading} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Collection end</label>
            <input type="date" value={collectionEnd} onChange={(e) => setCollectionEnd(e.target.value)} className={inputClass} disabled={isUploading} />
          </div>
        </div>

        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-lg hover:from-rose-700 hover:to-rose-800 transition-all shadow-lg shadow-rose-600/30 disabled:opacity-50"
        >
          {isUploading ? 'Processing Pipeline...' : 'Select File'}
        </button>
      </div>
    )
}
