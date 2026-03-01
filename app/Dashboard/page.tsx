"use client";

import { GeoRiskSidebar } from '../components/GeoRiskSidebar';
import { AlertTriangle, Activity, Shield, TrendingUp, MapPin } from 'lucide-react';

export default function Dashboard() {
  const riskSites = [
    { id: 1, station: 'DVO-R3', pli: 4.8, risk: 'high', lat: 7.2456, lng: 126.3412 },
    { id: 2, station: 'DVO-R6', pli: 3.6, risk: 'high', lat: 7.2012, lng: 126.2234 },
    { id: 3, station: 'DVO-R5', pli: 2.4, risk: 'moderate', lat: 7.2678, lng: 126.3789 },
    { id: 4, station: 'DVO-R1', pli: 1.8, risk: 'moderate', lat: 7.2134, lng: 126.2891 },
    { id: 5, station: 'DVO-R2', pli: 1.2, risk: 'moderate', lat: 7.2345, lng: 126.3012 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-950">
      <GeoRiskSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
            <p className="text-gray-400">Heavy metal contamination monitoring - Davao Oriental</p>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Highest Risk Site */}
            <div className="bg-gradient-to-br from-rose-600 to-rose-700 rounded-xl p-6 shadow-xl shadow-rose-600/20">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/30 rounded-full text-xs font-semibold text-white backdrop-blur">
                  HIGH RISK
                </span>
              </div>
              <h3 className="text-white/80 text-sm font-medium mb-2">Highest Risk Site</h3>
              <p className="text-3xl font-bold text-white mb-1">DVO-R3</p>
              <p className="text-white/70 text-sm">PLI: 4.8 | Mati River</p>
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-sm text-white/80">
                <MapPin className="w-4 h-4" />
                <span>7.2456°N, 126.3412°E</span>
              </div>
            </div>

            {/* Average PLI */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-amber-500" />
                </div>
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Average PLI</h3>
              <p className="text-3xl font-bold text-white mb-1">2.63</p>
              <p className="text-gray-400 text-sm">Across 6 sampling stations</p>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-amber-500 to-rose-600 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-400">Moderate</span>
                </div>
              </div>
            </div>

            {/* DENR Compliance */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400">
                  CLASS C
                </span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">DENR Compliance Status</h3>
              <p className="text-3xl font-bold text-white mb-1">67%</p>
              <p className="text-gray-400 text-sm">Meets Class C water quality</p>
              <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
                <p>DAO 2016-08 Standards</p>
              </div>
            </div>
          </div>

          {/* Risk Sites Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Risk Sites Table */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Top Risk Sites</h2>
                <p className="text-gray-400 text-sm mt-1">Ranked by Pollution Load Index</p>
              </div>
              <div className="overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Station</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">PLI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Risk Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Coordinates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {riskSites.map((site) => (
                      <tr key={site.id} className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {site.station}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                          {site.pli}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                            site.risk === 'high' 
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {site.risk.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                          {site.lat.toFixed(4)}°N, {site.lng.toFixed(4)}°E
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">System Status</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Active Monitoring Stations</span>
                    <span className="text-2xl font-bold text-white">6</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>All stations reporting</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">High Risk Sites</span>
                    <span className="text-2xl font-bold text-rose-400">2</span>
                  </div>
                  <div className="text-xs text-gray-400">Require immediate attention</div>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Moderate Risk Sites</span>
                    <span className="text-2xl font-bold text-amber-400">3</span>
                  </div>
                  <div className="text-xs text-gray-400">Under regular monitoring</div>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Low Risk Sites</span>
                    <span className="text-2xl font-bold text-emerald-400">1</span>
                  </div>
                  <div className="text-xs text-gray-400">Within safe limits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
