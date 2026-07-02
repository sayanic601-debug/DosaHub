'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { User, Mail, Lock, Sparkles, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import KolamBackground from '@/components/KolamBackground';

function LoginContent() {
  const { user, login } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (redirectTarget === 'checkout') {
        router.push('/checkout');
      } else {
        router.push('/');
      }
    }
  }, [user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: loginEmail,
          password: loginPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid credentials');
        setIsLoading(false);
        return;
      }

      // Context login
      login(data.token, data.user);
      setSuccessMsg('Login successful!');
    } catch (err) {
      setErrorMsg('Connection error. Failed to login.');
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: regName,
          email: regEmail,
          password: regPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to register');
        setIsLoading(false);
        return;
      }

      // Context login
      login(data.token, data.user);
      setSuccessMsg('Registration successful!');
    } catch (err) {
      setErrorMsg('Connection error. Failed to sign up.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] bg-cream-50 flex items-center justify-center py-16 px-4 dark:bg-coffee-950 transition-colors duration-300">
      
      <KolamBackground className="opacity-[0.03] dark:opacity-[0.02]" />

      <div className="w-full max-w-md rounded-2xl border border-cream-200 bg-cream-50 shadow-premium overflow-hidden dark:border-coffee-900 dark:bg-coffee-900 flex flex-col z-10">
        
        {/* Tab Selection */}
        <div className="flex bg-cream-100 dark:bg-coffee-950 border-b border-cream-200 dark:border-coffee-900">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
            className={`flex-1 py-4 text-center text-sm font-bold transition-all border-b-2 ${
              activeTab === 'login'
                ? 'border-saffron-500 text-saffron-500 bg-cream-50 dark:bg-coffee-900'
                : 'border-transparent text-temple-900/50 dark:text-cream-300/50'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
            className={`flex-1 py-4 text-center text-sm font-bold transition-all border-b-2 ${
              activeTab === 'register'
                ? 'border-saffron-500 text-saffron-500 bg-cream-50 dark:bg-coffee-900'
                : 'border-transparent text-temple-900/50 dark:text-cream-300/50'
            }`}
          >
            Register
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-8 text-left space-y-6">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-widest text-saffron-500 font-bold flex items-center justify-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Authentic Taste
            </span>
            <h2 className="font-serif text-2xl font-bold mt-1.5">Welcome to DosaHub</h2>
            <p className="text-xs text-temple-900/50 dark:text-cream-300/50 mt-1">Unlock live orders, saved addresses, and active coupons.</p>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-temple-900/40 dark:text-cream-300/40" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-cream-200 bg-cream-100 py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-saffron-500 dark:bg-coffee-950 dark:border-coffee-800 dark:text-cream-50"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block">Password</label>
                  <button type="button" className="text-[9px] font-bold text-saffron-500 hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-temple-900/40 dark:text-cream-300/40" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-cream-200 bg-cream-100 py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-saffron-500 dark:bg-coffee-950 dark:border-coffee-800 dark:text-cream-50"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-50 p-3 text-[10px] font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400 animate-fade-in">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-1.5 rounded-lg bg-green-50 p-3 text-[10px] font-semibold text-green-600 dark:bg-green-950/20 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1 rounded-full bg-saffron-500 py-3.5 px-6 font-bold text-cream-50 hover:bg-saffron-600 shadow-premium transition-all disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'} <ChevronRight className="h-4.5 w-4.5" />
              </button>


            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4.5 w-4.5 text-temple-900/40 dark:text-cream-300/40" />
                  <input
                    type="text"
                    placeholder="Sayani Sen"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full rounded-xl border border-cream-200 bg-cream-100 py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-saffron-500 dark:bg-coffee-950 dark:border-coffee-800 dark:text-cream-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-temple-900/40 dark:text-cream-300/40" />
                  <input
                    type="email"
                    placeholder="sayani@example.com"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full rounded-xl border border-cream-200 bg-cream-100 py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-saffron-500 dark:bg-coffee-950 dark:border-coffee-800 dark:text-cream-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-temple-900/50 dark:text-cream-300/50 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-temple-900/40 dark:text-cream-300/40" />
                  <input
                    type="password"
                    placeholder="Choose a password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full rounded-xl border border-cream-200 bg-cream-100 py-3 pl-11 pr-4 text-xs focus:outline-none focus:border-saffron-500 dark:bg-coffee-950 dark:border-coffee-800 dark:text-cream-50"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 rounded-lg bg-red-50 p-3 text-[10px] font-semibold text-red-600 dark:bg-red-950/20 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-1.5 rounded-lg bg-green-50 p-3 text-[10px] font-semibold text-green-600 dark:bg-green-950/20 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-1 rounded-full bg-saffron-500 py-3.5 px-6 font-bold text-cream-50 hover:bg-saffron-600 shadow-premium transition-all disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Register'} <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-50 flex items-center justify-center dark:bg-coffee-950"><div className="h-20 w-20 rounded-full skeleton animate-pulse" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
