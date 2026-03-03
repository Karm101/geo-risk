'use client'

import { FlaskConical } from 'lucide-react'

interface DominantPollutantProps {
  metal: string
  symbol: string
  igeo: number
  classification: string
}

function getStyle(classification: string) {
  switch (classification) {
    case 'Practically Unpolluted':
      return { color: 'text-emerald-500', bg: 'bg-emerald-500/20', gradient: 'from-emerald-400 to-emerald-500', progress: 5 }
    case 'Unpolluted to Moderate':
      return { color: 'text-teal-400', bg: 'bg-teal-500/20', gradient: 'from-teal-400 to-teal-500', progress: 20 }
    case 'Moderately Polluted':
      return { color: 'text-amber-400', bg: 'bg-amber-500/20', gradient: 'from-amber-400 to-amber-500', progress: 40 }
    case 'Moderate to Strongly Polluted':
      return { color: 'text-orange-400', bg: 'bg-orange-500/20', gradient: 'from-orange-400 to-orange-500', progress: 58 }
    case 'Strongly Polluted':
      return { color: 'text-rose-400', bg: 'bg-rose-500/20', gradient: 'from-rose-400 to-rose-500', progress: 74 }
    case 'Strongly to Extremely Polluted':
      return { color: 'text-rose-500', bg: 'bg-rose-600/20', gradient: 'from-rose-500 to-rose-600', progress: 88 }
    case 'Extremely Polluted':
      return { color: 'text-purple-400', bg: 'bg-purple-500/20', gradient: 'from-purple-500 to-purple-600', progress: 100 }
    default:
      return { color: 'text-gray-400', bg: 'bg-gray-500/20', gradient: 'from-gray-400 to-gray-500', progress: 0 }
  }
}

export default function DominantPollutantCard({ metal, symbol, igeo, classification }: DominantPollutantProps) {
  const style = getStyle(classification)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${style.bg}`}>
          <FlaskConical className={`w-6 h-6 ${style.color}`} />
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider ${style.color} bg-gray-900/50 px-2 py-1 rounded-lg`}>
          {symbol}
        </span>
      </div>

      <div className="mt-auto">
        <h3 className="text-gray-400 text-sm font-medium mb-2">Dominant Pollutant</h3>
        <p className="text-3xl font-bold text-white mb-1">{metal}</p>
        <p className="text-gray-400 text-sm">Avg. Igeo: {igeo.toFixed(2)}</p>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700/50">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${style.gradient} transition-all duration-1000 ease-out`}
                style={{ width: `${style.progress}%` }}
              ></div>
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${style.color}`}>
              {classification}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}