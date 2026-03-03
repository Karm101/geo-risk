'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation' // 1. Import the router

export default function UploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter() // 2. Initialize the router

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
          const cleanData = results.data.map((row: any) => ({
            sampleName: row["Sample_Name"],
            Cr: row["Cr"], Mn: row["Mn"], Fe: row["Fe"],
            Co: row["Co"], Ni: row["Ni"], Cu: row["Cu"],
            Zn: row["Zn"], As: row["As"], Cd: row["Cd"],
            Hg: row["Hg"], Pb: row["Pb"]
          }))

          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanData),
          })

          const dbResult = await response.json()
          
          if (dbResult.success) {
            alert(`Success! Inserted ${dbResult.inserted} records into PostGIS.`)
            
            // 3. THE HANDSHAKE: Clear the URL so the dashboard snaps to the new "Latest" batch
            router.push('?', { scroll: false })
            
          } else {
            alert("Something went wrong with the database.")
          }
        } catch (error) {
          console.error(error)
          alert("Failed to send data to the server.")
        } finally {
          setIsUploading(false)
          // Also clear the file input so you can upload the same file again if needed
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }
    })
  }

  return (
      <div>
        <input
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
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