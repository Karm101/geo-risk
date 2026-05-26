"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Database, CheckCircle2, AlertCircle, Loader2, Fingerprint } from 'lucide-react';

const DEMO_ACCOUNTS: Record<string, string> = {
  'MGB-ADMIN': 'admin123',
  'LGU-DAVAO': 'davao2024'
};

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<string>('');

  // --- Real-time Database Monitor State ---
  const [dbStats, setDbStats] = useState({
    status: 'Connecting...',
    latency: 0,
    totalRecords: 0
  });

  // --- Real-time Polling Effect ---
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.success) {
          setDbStats({
            status: 'Connected',
            latency: data.latency || 0,
            totalRecords: data.totalRecords || 0
          });
        } else {
          setDbStats(prev => ({ ...prev, status: 'Disconnected' }));
        }
      } catch (error) {
        setDbStats(prev => ({ ...prev, status: 'Disconnected' }));
      }
    }
    
    fetchStatus(); // Initial fetch
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Please provide both MGB ID and password.');
      setIsLoading(false);
      return;
    }

    setAuthStatus('Establishing secure connection...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setAuthStatus('Verifying clearance level...');
    await new Promise(resolve => setTimeout(resolve, 800));

    if (DEMO_ACCOUNTS[username] && DEMO_ACCOUNTS[username] === password) {
      setAuthStatus('Access Granted. Decrypting dashboard...');
      localStorage.setItem('geo-risk-auth', username);
      await new Promise(resolve => setTimeout(resolve, 600));
      router.push('/dashboard');
    } else {
      setError('Unauthorized access. Invalid MGB credentials detected.');
      setIsLoading(false);
      setAuthStatus('');
    }
  };

  const isConnected = dbStats.status === 'Connected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-rose-600/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-600/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side - Branding */}
        <div className="text-white space-y-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-600 to-rose-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-rose-900/50 border border-rose-500/20">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight">Geo-RISK</h1>
              <p className="text-gray-400 text-xl font-mono mt-1 tracking-widest uppercase">Decision Support System</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-5 bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-md">
              <Shield className="w-6 h-6 text-rose-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Mines and Geosciences Bureau</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Advanced heavy metal contamination monitoring and spatial risk assessment protocols.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-gray-900/50 rounded-xl border border-gray-800 backdrop-blur-md">
              <Database className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">Encrypted PostGIS Pipeline</h3>
                <p className="text-sm text-gray-400 leading-relaxed">Real-time geospatial data integration and structured environmental analytics.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-8 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint className="w-6 h-6 text-rose-500" />
              <h2 className="text-2xl font-bold text-white">System Access</h2>
            </div>
            <p className="text-gray-400 font-mono text-sm">Authenticate to access Geo-RISK node</p>
          </div>

          {/* FUNCTIONAL Database Status Widget */}
          <div className="mb-8 p-4 bg-gray-950/50 border border-gray-800 rounded-xl transition-colors duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <h3 className="font-mono text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Node Status: {isConnected ? 'Online' : dbStats.status === 'Connecting...' ? 'Establishing Link...' : 'Offline'}
              </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-gray-500">SERVER</div>
                <div className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
                  {isConnected ? 'SECURE' : 'UNREACHABLE'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">LATENCY</div>
                <div className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
                  {isConnected ? `${dbStats.latency}ms` : '--'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">RECORDS</div>
                <div className={isConnected ? 'text-blue-400' : 'text-gray-600'}>
                  {isConnected ? dbStats.totalRecords.toLocaleString() : '--'}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-medium text-gray-400 mb-2 uppercase tracking-wider">
                MGB Identification
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                placeholder="e.g. MGB-ADMIN"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 disabled:opacity-50 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Security Passkey
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 disabled:opacity-50 transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !isConnected}
              className="relative w-full py-3.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-500 transition-all shadow-lg shadow-rose-900/20 disabled:opacity-80 overflow-hidden group"
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-mono text-sm tracking-wide">{authStatus}</span>
                  </>
                ) : (
                  <span className="font-mono tracking-wider">
                    {isConnected ? 'INITIALIZE LOGIN' : 'AWAITING CONNECTION'}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="text-xs font-mono text-gray-500 bg-gray-950/50 p-3 rounded-lg border border-gray-800/50">
              <span className="text-gray-400 font-bold block mb-1">DEMO CREDENTIALS:</span>
              ID: <span className="text-emerald-400">MGB-ADMIN</span> | Pass: <span className="text-emerald-400">admin123</span><br/>
              ID: <span className="text-blue-400">LGU-DAVAO</span> | Pass: <span className="text-blue-400">davao2024</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}