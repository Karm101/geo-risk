import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  colorClass?: string;
}

export function StatsCard({ title, value, change, changeType, icon: Icon, colorClass = "text-rose-500" }: StatsCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gray-800 rounded-lg`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        {change && (
          <span className={`text-xs font-medium ${changeType === 'negative' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}