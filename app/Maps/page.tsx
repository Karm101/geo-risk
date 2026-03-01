"use client";

import { useState } from 'react';
import { GeoRiskSidebar } from '../components/GeoRiskSidebar';
import { Layers, MapPin } from 'lucide-react';

type LayerType = 'igeo' | 'pli' | 'biodiversity';

export default function InteractiveMaps() {
  const [activeLayer, setActiveLayer] = useState<LayerType>('pli');

  return (
    <div className="flex min-h-screen bg-gray-950">
      <GeoRiskSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Interactive Maps</h1>
            <p className="text-gray-400">Geospatial visualization of contamination data</p>
          </div>

          {/* Map Container */}
          <div className="relative">
            {/* Layer Toggle Widget */}
            <div className="absolute top-6 right-6 z-10 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-white">Map Layers</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveLayer('igeo')}
                  className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    activeLayer === 'igeo'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  I-GEO Index
                </button>
                <button
                  onClick={() => setActiveLayer('pli')}
                  className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    activeLayer === 'pli'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  PLI Index
                </button>
                <button
                  onClick={() => setActiveLayer('biodiversity')}
                  className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    activeLayer === 'biodiversity'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Biodiversity
                </button>
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase">Risk Levels</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-rose-600 rounded-full border-2 border-white/20"></div>
                    <span className="text-xs text-gray-300">High Risk (&gt; 3.0)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white/20"></div>
                    <span className="text-xs text-gray-300">Moderate (1.0 - 3.0)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white/20"></div>
                    <span className="text-xs text-gray-300">Low Risk (&lt; 1.0)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" style={{ height: '700px' }}>
                {/* Placeholder Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-700/50 rounded-2xl mb-6 border border-gray-600">
                      <MapPin className="w-12 h-12 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">LEAFLET JS CONTAINER</h3>
                    <p className="text-gray-400 mb-4">Interactive Map Visualization</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600/20 border border-rose-600/30 rounded-lg">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-rose-400">Layer: {activeLayer.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Grid Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Mock Map Points */}
                <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-rose-600 rounded-full border-4 border-white/30 shadow-xl shadow-rose-600/50 animate-pulse"></div>
                <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-amber-500 rounded-full border-4 border-white/30 shadow-xl shadow-amber-500/50"></div>
                <div className="absolute bottom-1/3 right-1/3 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white/30 shadow-xl shadow-emerald-500/50"></div>
                <div className="absolute top-1/3 right-1/4 w-7 h-7 bg-amber-500 rounded-full border-4 border-white/30 shadow-xl shadow-amber-500/50"></div>

                {/* Map Attribution */}
                <div className="absolute bottom-4 left-4 px-3 py-2 bg-gray-900/80 backdrop-blur rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400">Davao Oriental, Philippines</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Coverage Area</h3>
              <p className="text-lg font-bold text-white">450 km²</p>
              <p className="text-xs text-gray-400 mt-1">Davao Oriental region</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Sampling Points</h3>
              <p className="text-lg font-bold text-white">6 Stations</p>
              <p className="text-xs text-gray-400 mt-1">Active monitoring sites</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Last Updated</h3>
              <p className="text-lg font-bold text-white">2 hours ago</p>
              <p className="text-xs text-gray-400 mt-1">Real-time monitoring</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
