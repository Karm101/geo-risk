"use client";

import { GeoRiskSidebar } from '../components/GeoRiskSidebar';
import { Upload, Database, Download } from 'lucide-react';
import UploadButton from '../components/UploadButton';
import DataTable from '../components/DataTable';
import DatabaseMonitor from '../components/DatabaseMonitor';
import DatabaseStatusCard from '../components/DatabaseStatusCard';
// 1. IMPORT THE NEW COMPONENT
import BatchHistory from '../components/BatchHistory';

export default function DataManagement() {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <GeoRiskSidebar />

      <main className="flex-1 min-h-0 flex flex-col overflow-auto">
        <div className="p-8 flex flex-col gap-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Data Management</h1>
            <p className="text-gray-400">Upload and manage sampling data</p>
          </div>

          {/* Upload Section (Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-600/20 rounded-lg">
                  <Upload className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-lg font-bold text-white">Upload Data</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">Import CSV or Excel files</p>
              <UploadButton />
            </div>

            {/* LIVE Database Status Card */}
            <DatabaseStatusCard />

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

          {/* 2. INSERT BATCH HISTORY HERE */}
          <BatchHistory />

          {/* Real-time PostGIS Pipeline Monitor */}
          <DatabaseMonitor />

          {/* Sampling Data Table */}
          <div className="mt-4 flex-1 min-h-0">
            <DataTable />
          </div>
        </div>
      </main>
    </div>
  );
}