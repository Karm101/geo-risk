'use client'

import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface AveragePLICardProps {
  averagePli: number;
  stationCount: number;
}

export default function AveragePLICard({ averagePli, stationCount }: AveragePLICardProps) {
  // Determine risk level, colors, and progress width based on domain logic
  let riskLevel = ''
  let colorClass = ''
  let bgClass = ''
  let gradientClass = ''
  let progressWidth = ''
  let TrendIcon = Minus

  if (averagePli < 1.0) {
    riskLevel = 'Low Risk'
    colorClass = 'text-emerald-500'
    bgClass = 'bg-emerald-500/20'
    gradientClass = 'from-emerald-400 to-emerald-500'
    progressWidth = 'w-1/3'
    TrendIcon = TrendingDown // Trending down is good for contamination!
  } else if (averagePli <= 3.0) {
    riskLevel = 'Moderate'
    colorClass = 'text-amber-500'
    bgClass = 'bg-amber-500/20'
    gradientClass = 'from-amber-400 to-amber-500'
    progressWidth = 'w-2/3'
    TrendIcon = Minus
  } else {
    riskLevel = 'High Risk'
    colorClass = 'text-rose-500'
    bgClass = 'bg-rose-500/20'
    gradientClass = 'from-rose-500 to-rose-600'
    progressWidth = 'w-full'
    TrendIcon = TrendingUp
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgClass}`}>
          <Activity className={`w-6 h-6 ${colorClass}`} />
        </div>
        <TrendIcon className={`w-5 h-5 ${colorClass}`} />
      </div>
      
      <div className="mt-auto">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Average PLI</h3>
        {/* Ensures it always shows 2 decimal places */}
        <p className="text-3xl font-bold text-white mb-1">{averagePli.toFixed(2)}</p>
        <p className="text-gray-400 text-sm">Across {stationCount} sampling stations</p>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700/50">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-1000 ease-out ${progressWidth}`}
              ></div>
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>
              {riskLevel}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}