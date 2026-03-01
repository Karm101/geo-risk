"use client";

import { GeoRiskSidebar } from '../components/GeoRiskSidebar';
import { Upload, Database, Download, FileText } from 'lucide-react';

interface SamplingData {
  id: string;
  station: string;
  lat: number;
  lng: number;
  ni: number;
  cr: number;
  igeo: number;
  pli: number;
  risk: 'high' | 'moderate' | 'low';
}

const samplingData: SamplingData[] = [
  { id: '1', station: 'DVO-R1', lat: 7.2134, lng: 126.2891, ni: 45.2, cr: 23.8, igeo: 1.4, pli: 1.8, risk: 'moderate' },
  { id: '2', station: 'DVO-R2', lat: 7.2345, lng: 126.3012, ni: 38.5, cr: 19.3, igeo: 0.9, pli: 1.2, risk: 'moderate' },
  { id: '3', station: 'DVO-R3', lat: 7.2456, lng: 126.3412, ni: 89.7, cr: 56.4, igeo: 3.2, pli: 4.8, risk: 'high' },
  { id: '4', station: 'DVO-R4', lat: 7.1923, lng: 126.2567, ni: 15.3, cr: 8.9, igeo: 0.2, pli: 0.6, risk: 'low' },
  { id: '5', station: 'DVO-R5', lat: 7.2678, lng: 126.3789, ni: 52.1, cr: 28.6, igeo: 1.8, pli: 2.4, risk: 'moderate' },
  { id: '6', station: 'DVO-R6', lat: 7.2012, lng: 126.2234, ni: 72.4, cr: 41.2, igeo: 2.6, pli: 3.6, risk: 'high' },
];

export default function DataManagement() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <GeoRiskSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Data Management</h1>
            <p className="text-gray-400">Upload and manage sampling data</p>
          </div>

          {/* Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Upload Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-600/20 rounded-lg">
                  <Upload className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-bold text-white">Upload Data</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">Import CSV or Excel files</p>
              <button className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-lg hover:from-rose-700 hover:to-rose-800 transition-all shadow-lg shadow-rose-600/30">
                Select File
              </button>
            </div>

            {/* Database Status */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <Database className="w-6 h-6 text-emerald-500" />
                </div>
                <h2 className="text-lg font-bold text-white">Database</h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Records:</span>
                  <span className="text-white font-semibold">1,247</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Last Sync:</span>
                  <span className="text-emerald-400 font-semibold">2 min ago</span>
                </div>
              </div>
            </div>

            {/* Export Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <Download className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-lg font-bold text-white">Export Data</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">Download reports as PDF</p>
              <button className="w-full py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all">
                Generate Report
              </button>
            </div>
          </div>

          {/* PostGIS Pipeline Placeholder */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-dashed border-gray-600 rounded-xl p-12 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-700/50 rounded-2xl mb-6">
                <Database className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">POSTGIS DATA PIPELINE</h3>
              <p className="text-gray-400 mb-4">Geospatial database integration endpoint</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-400">Connected to PostGIS Server</span>
              </div>
            </div>
          </div>

          {/* Sampling Data Table */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Sampling Data</h2>
                <p className="text-sm text-gray-400 mt-1">Heavy metal concentration measurements</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Export CSV</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Station ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Coordinates
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      NI (mg/kg)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      CR (mg/kg)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      I-GEO
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      PLI
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Risk Level
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {samplingData.map((data) => (
                    <tr key={data.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-white">{data.station}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-400">
                          {data.lat.toFixed(4)}°N<br />
                          {data.lng.toFixed(4)}°E
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white font-medium">{data.ni}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white font-medium">{data.cr}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white font-medium">{data.igeo}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-white font-bold">{data.pli}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-full ${
                          data.risk === 'high' 
                            ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30' 
                            : data.risk === 'moderate'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {data.risk.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-400">Showing {samplingData.length} of {samplingData.length} records</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-all">
                  Previous
                </button>
                <button className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition-all">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
