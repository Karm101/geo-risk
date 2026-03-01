'use client';

interface Activity {
  id: string;
  station: string;
  parameter: string;
  status: 'High' | 'Moderate' | 'Low';
  date: string;
}

const activities: Activity[] = [
  { id: '1', station: 'DVO-R3', parameter: 'PLI Index', status: 'High', date: '2026-02-28' },
  { id: '2', station: 'DVO-R1', parameter: 'Nickel (Ni)', status: 'Moderate', date: '2026-02-28' },
  { id: '3', station: 'DVO-R4', parameter: 'Chromium (Cr)', status: 'Low', date: '2026-02-27' },
];

export function RecentActivity() {
  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'High': return 'bg-rose-900/20 text-rose-400 border border-rose-500/30';
      case 'Moderate': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'Low': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Station</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 text-sm text-white">{activity.station}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">{activity.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}