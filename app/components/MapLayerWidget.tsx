'use client'
import { Layers, ChevronUp, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { LayerType } from '../maps/page'

type Props = {
  activeLayer: LayerType
  setActiveLayer: (layer: LayerType) => void
}

export default function MapLayerWidget({ activeLayer, setActiveLayer }: Props) {
  const [minimized, setMinimized] = useState(false)

  return (
    <div className="absolute top-6 right-6 z-10 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4">
      <div
        className="flex items-center gap-2"
        style={{ marginBottom: minimized ? 0 : '1rem', transition: 'margin 0.3s ease' }}
      >
        <Layers className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-semibold text-white flex-1">Map Layers</span>
        <button
          onClick={() => setMinimized(!minimized)}
          className="text-gray-600 hover:text-gray-400 transition-colors"
          title={minimized ? 'Expand' : 'Minimize'}
        >
          <ChevronUp
            className="w-4 h-4 transition-transform duration-300 ease-in-out"
            style={{ transform: minimized ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
      </div>

      {/* Animated collapse */}
      <div
        style={{
          maxHeight: minimized ? '0px' : '300px',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <div className="space-y-2">
          {(['igeo', 'pli', 'risk'] as LayerType[]).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                activeLayer === layer
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {layer === 'igeo' ? 'I-GEO Index' : layer === 'pli' ? 'PLI Index' : 'Risk Zones'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}