'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('dregital_admin_auth', JSON.stringify({
        token: 'admin-auth-token',
        time: Date.now()
      }));

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid administrator password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center mx-auto text-white mb-4 border border-neutral-700">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tight uppercase block">
            DREGITAL<span className="text-neutral-500">.</span>
          </span>
          <p className="text-xs text-neutral-400 mt-1">Authorized Staff & Admin Login</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Admin Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter admin password (admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Access Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
          <p className="text-[11px] text-neutral-500">
            Default credentials: <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300 font-mono">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
