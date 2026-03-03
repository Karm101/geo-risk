'use client'

interface SystemStatusProps {
  stationCount: number
  riskDistribution: {
    LOW: number
    MODERATE: number
    HIGH: number
    'VERY HIGH': number
  }
  loading: boolean
}

export default function SystemStatusCard({ stationCount, riskDistribution, loading }: SystemStatusProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">System Status</h2>
      <div className="space-y-4">

        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Active Monitoring Stations</span>
            <span className="text-2xl font-bold text-white">
              {loading ? '—' : stationCount}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>All stations reporting</span>
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Very High Risk Sites</span>
            <span className="text-2xl font-bold text-purple-400">
              {loading ? '—' : riskDistribution['VERY HIGH']}
            </span>
          </div>
          <div className="text-xs text-gray-400">Require immediate attention</div>
        </div>

        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">High Risk Sites</span>
            <span className="text-2xl font-bold text-rose-400">
              {loading ? '—' : riskDistribution['HIGH']}
            </span>
          </div>
          <div className="text-xs text-gray-400">Require immediate attention</div>
        </div>

        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Moderate Risk Sites</span>
            <span className="text-2xl font-bold text-amber-400">
              {loading ? '—' : riskDistribution['MODERATE']}
            </span>
          </div>
          <div className="text-xs text-gray-400">Under regular monitoring</div>
        </div>

        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Low Risk Sites</span>
            <span className="text-2xl font-bold text-emerald-400">
              {loading ? '—' : riskDistribution['LOW']}
            </span>
          </div>
          <div className="text-xs text-gray-400">Within safe limits</div>
        </div>

      </div>
    </div>
  )
}