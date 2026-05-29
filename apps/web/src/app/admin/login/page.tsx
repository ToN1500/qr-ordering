'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to admin
    if (typeof window !== 'undefined' && localStorage.getItem('admin_token')) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use apiFetch utility instead of raw fetch to avoid nested path issues
      // and ensure consistent prefix routing defined in lib/api.ts
      const data = await apiFetch('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });

      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        router.push('/admin');
      } else {
        setError('Unexpected response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <span className="mono text-[10px] uppercase tracking-[0.3em] text-gray-400 block mb-4 font-mono">Terminal Access</span>
          <h1 className="text-4xl font-serif text-black">Staff Login</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="mono text-[10px] uppercase tracking-widest text-gray-400 font-mono block">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-gray-100 bg-gray-50 text-black focus:bg-white focus:outline-none focus:border-black transition-all font-mono text-center tracking-[0.5em]"
              placeholder="••••••"
              required
            />
          </div>

          {error && (
            <p className="text-rose-500 text-[10px] font-mono text-center uppercase tracking-widest animate-pulse">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-black text-white text-[10px] uppercase tracking-[0.3em] font-mono hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Enter Dashboard'}
          </button>
        </form>

        <div className="mt-20 text-center">
          <p className="text-[10px] text-gray-300 font-mono uppercase tracking-widest">
            The Monocle Restaurant Group<br/>
            Proprietary System
          </p>
        </div>
      </div>
    </div>
  );
}
