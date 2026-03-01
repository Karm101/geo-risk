"use client";

"fixed"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-xl shadow-rose-600/50">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Geo-RISK</h1>
              <p className="text-gray-400 text-lg">Decision Support System</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur">
              <Shield className="w-6 h-6 text-rose-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-1">Mines and Geosciences Bureau</h3>
                <p className="text-sm text-gray-400">Heavy metal contamination monitoring and risk assessment</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur">
              <Database className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-1">Real-time Data Integration</h3>
                <p className="text-sm text-gray-400">PostGIS pipeline for geospatial analysis</p>
              </div>
            </div>
          </div>

          {/* Logos */}
          <div className="flex items-center gap-6 pt-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center mb-2">
                <Shield className="w-12 h-12 text-blue-400" />
              </div>
              <p className="text-xs text-gray-400">MGB</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center mb-2">
                <Shield className="w-12 h-12 text-green-400" />
              </div>
              <p className="text-xs text-gray-400">DENR</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">MGB/LGU Login</h2>
            <p className="text-gray-400">Access the Geo-RISK dashboard</p>
          </div>

          {/* Database Status */}
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-emerald-400">Database Status</h3>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>PostGIS Server:</span>
                <span className="text-emerald-400">Connected</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Last Sync:</span>
                <span className="text-emerald-400">2 min ago</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Active Records:</span>
                <span className="text-emerald-400">1,247</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your MGB ID"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white font-semibold rounded-lg hover:from-rose-700 hover:to-rose-800 transition-all shadow-lg shadow-rose-600/50"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              Authorized personnel only • DENR-MGB Philippines
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
