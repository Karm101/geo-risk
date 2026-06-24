"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Database, AlertCircle, Loader2, Fingerprint } from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dbStats, setDbStats] = useState({
    status: 'Connecting...',
    latency: 0,
    totalRecords: 0
  });

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.success) {
          setDbStats({ status: 'Connected', latency: data.latency || 0, totalRecords: data.totalRecords || 0 });
        } else {
          setDbStats(prev => ({ ...prev, status: 'Disconnected' }));
        }
      } catch {
        setDbStats(prev => ({ ...prev, status: 'Disconnected' }));
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
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
              <h2 className="text-2xl font-bold text-white">Sign In</h2>
            </div>
            <p className="text-gray-400 font-mono text-sm">Enter your MGB credentials to continue</p>
          </div>

          {/* DB Status Widget */}
          <div className="mb-8 p-4 bg-gray-950/50 border border-gray-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <h3 className="font-mono text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Database: {isConnected ? 'Online' : dbStats.status === 'Connecting...' ? 'Connecting...' : 'Offline'}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-gray-500">SERVER</div>
                <div className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>{isConnected ? 'ONLINE' : 'OFFLINE'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">LATENCY</div>
                <div className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>{isConnected ? `${dbStats.latency}ms` : '--'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-500">RECORDS</div>
                <div className={isConnected ? 'text-blue-400' : 'text-gray-600'}>{isConnected ? dbStats.totalRecords.toLocaleString() : '--'}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="you@mgb.gov.ph"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 disabled:opacity-50 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Password
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
              className="w-full py-3.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-500 transition-all shadow-lg shadow-rose-900/20 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading
                ? <><Loader2 className="w-5 h-5 animate-spin" /><span className="font-mono text-sm">Signing in...</span></>
                : <span className="font-mono tracking-wider">{isConnected ? 'SIGN IN' : 'AWAITING CONNECTION'}</span>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
