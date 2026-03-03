"use client";

import { useState } from 'react';
import { GeoRiskSidebar } from '../components/GeoRiskSidebar';
import { Layers } from 'lucide-react';
import MapWrapper from '../components/MapWrapper'
import { CoverageCard, SamplingPointsCard, LastUpdatedCard, BatchSelectorCard } from '../components/MapInfoCards'
import MapLayerWidget from '../components/MapLayerWidget'

export type LayerType = 'igeo' | 'pli' | 'risk';

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
            <MapLayerWidget activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
            
            {/* Map */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
              <div style={{ height: '700px' }}>
                <MapWrapper activeLayer={activeLayer} />
              </div>
            </div>

          </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <BatchSelectorCard />
              <CoverageCard />
              <SamplingPointsCard />
              <LastUpdatedCard />
            </div>

        </div>
      </main>
      
    </div>
  );
}