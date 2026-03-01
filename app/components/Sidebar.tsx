'use client';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, BarChart3, Settings, FileText } from 'lucide-react';

export function Sidebar({ activeItem = 'dashboard' }) {
  const router = useRouter();
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { id: 'reports', icon: FileText, label: 'Reports', path: '/data' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen p-6 hidden md:block">
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.id === activeItem ? 'bg-rose-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}