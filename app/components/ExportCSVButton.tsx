'use client'

import { FileText } from 'lucide-react'

// We define the type so the component knows it's receiving an array of data
interface ExportCSVButtonProps {
  data: any[]
}

const METALS = ['cr', 'mn', 'fe', 'co', 'ni', 'cu', 'zn', 'as', 'cd', 'hg', 'pb']

export default function ExportCSVButton({ data }: ExportCSVButtonProps) {
  
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data to export!")
      return
    }

    // 1. Create the Column Headers
    const rawMetalHeaders = METALS.map(m => `${m.toUpperCase()} (mg/kg)`)
    const igeoHeaders = METALS.map(m => `I-GEO (${m.toUpperCase()})`)
    const headers = [
      "Station ID", "Risk Level", "Batch ID", 
      ...rawMetalHeaders, 
      ...igeoHeaders, 
      "PLI", "Date Uploaded"
    ]

    // 2. Map the database rows to match the headers perfectly
    const csvRows = [headers.join(',')] // Add headers as the first row

    data.forEach(row => {
      // Extract the raw metals and I-GEO scores dynamically
      const rawMetals = METALS.map(m => row[`${m}_mg_kg`] ?? 'N/A')
      const igeoScores = METALS.map(m => row[`igeo_${m}`] ? Number(row[`igeo_${m}`]).toFixed(2) : 'N/A')

      const values = [
        row.station_id,
        row.risk_level,
        row.batch_id,
        ...rawMetals,
        ...igeoScores,
        Number(row.pli).toFixed(2),
        new Date(row.created_at).toLocaleDateString()
      ]

      // Wrap each value in quotes to prevent accidental commas from breaking the columns
      const safeValues = values.map(val => `"${val}"`)
      csvRows.push(safeValues.join(','))
    })

    // 3. Create the downloadable file
    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    // 4. Create a temporary invisible link to trigger the download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `water_sampling_data_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    
    // 5. Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button 
      onClick={handleExport}
      disabled={!data || data.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
    >
      <FileText className="w-4 h-4" />
      <span className="text-sm font-medium">Export CSV</span>
    </button>
  )
}