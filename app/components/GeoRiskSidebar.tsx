'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Database, Settings, LogOut } from 'lucide-react';

export function GeoRiskSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { id: 'maps', icon: Map, label: 'Interactive Maps', path: '/maps' },
    { id: 'data', icon: Database, label: 'Data Management', path: '/data' },
  ];

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg flex items-center justify-center">
            <Map className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Geo-RISK</h1>
            <p className="text-xs text-gray-400">MGB Decision Support</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <li key={item.id}>
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all mt-2" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
        <div className="mt-4 px-4">
          <p className="text-xs text-gray-500">© 2026 MGB Philippines</p>
        </div>
      </div>
    </aside>
  );
}