"use client";

import { useState, useEffect } from 'react';
import { GeoRiskSidebar } from '../components/GeoRiskSidebar';
import HighestRiskCard from '../components/dashboard/HighestRiskCard';
import AveragePLICard from '../components/dashboard/AveragePLICard';
import TopRiskSitesTable from '../components/dashboard/TopRiskSitesTable';
import DominantPollutantCard from '../components/dashboard/DominantPollutantCard';
import SystemStatusCard from '../components/dashboard/SystemStatusCard';
import { useBatch } from '../context/BatchContext';

export default function Dashboard() {
  const { selectedBatch } = useBatch();
  const [averagePli, setAveragePli] = useState(0);
  const [stationCount, setStationCount] = useState(0);
  const [loadingPli, setLoadingPli] = useState(true);
  const [dominantPollutant, setDominantPollutant] = useState<{
    metal: string, symbol: string, igeo: number, classification: string
  } | null>(null)
  const [riskDistribution, setRiskDistribution] = useState({ LOW: 0, MODERATE: 0, HIGH: 0, 'VERY HIGH': 0 })

  useEffect(() => {
    if (!selectedBatch) return;

    const fetchStats = async () => {
      setLoadingPli(true);
      try {
        const res = await fetch(`/api/batch-stats?batch=${encodeURIComponent(selectedBatch)}`);
        const data = await res.json();
        if (!data.success) return;
        setAveragePli(data.averagePli);
        setStationCount(data.stationCount);
        setDominantPollutant(data.dominantPollutant);
        setRiskDistribution(data.riskDistribution)
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoadingPli(false);
      }
    };

    fetchStats();
  }, [selectedBatch]);

  return (
    <div className="flex min-h-screen bg-gray-950">
      <GeoRiskSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
            <p className="text-gray-400">Heavy metal contamination monitoring - Davao Oriental</p>
          </div>

          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <HighestRiskCard />

            {loadingPli ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl flex items-center justify-center">
                <p className="text-gray-400 text-sm">Loading PLI...</p>
              </div>
            ) : (
              <AveragePLICard averagePli={averagePli} stationCount={stationCount} />
            )}

            {loadingPli ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl flex items-center justify-center">
                <p className="text-gray-400 text-sm">Loading...</p>
              </div>
            ) : dominantPollutant ? (
              <DominantPollutantCard {...dominantPollutant} />
            ) : null}
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopRiskSitesTable />

           <SystemStatusCard
            stationCount={stationCount}
            riskDistribution={riskDistribution}
            loading={loadingPli}
          />
          </div>
        </div>
      </main>
    </div>
  );
}