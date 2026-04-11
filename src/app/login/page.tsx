"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Loader2,
  AlertCircle,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      try {
        // 1. Fetch Official Profile (Master Source)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user?.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setError(`Success, but could not load permissions: ${profileError.message}`);
          setLoading(false);
          return;
        }

        if (!profile) {
          setError('Authentication successful, but no active profile found. Please contact an administrator.');
          setLoading(false);
          return;
        }

        // 2. Lenient Verification
        const role = profile?.role?.toLowerCase().trim();

        if (role === 'admin' || role === 'staff') {
          router.replace('/management');
        } else {
          router.replace('/');
        }
      } catch (err) {
        console.error('Redirection error:', err);
        setError('An unexpected error occurred during redirection.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors group mb-4"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary shadow-2xl shadow-secondary/20">
            <span className="text-2xl font-bold text-white">PB</span>
          </div>
          <h1 className="mt-8 text-3xl font-extrabold font-outfit tracking-tight text-foreground">
            PASTOR BONUS CO. LTD Login
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Access your service center management dashboard.
          </p>
        </div>

        <div className="rounded-3xl border bg-white/60 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-xs font-bold text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border bg-white/50 py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                  placeholder="admin@pastorbonus.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border bg-white/50 py-4 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-muted text-secondary" />
                <span className="text-xs font-medium text-muted-foreground">Keep me signed in</span>
              </div>
              <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-secondary py-5 text-sm font-black text-white shadow-xl shadow-secondary/20 hover:bg-secondary/90 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Secure Sign In
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="text-center text-xs font-semibold text-muted-foreground mt-6">
              Don't have an account? <Link href="/register" className="text-primary hover:underline">Sign Up</Link>
            </p>
          </form>
        </div>

        <div className="text-center pt-4">
           <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-2">
             <ShieldCheck className="h-4 w-4" />
             SSL Secure Encryption Protected
           </p>
        </div>
      </motion.div>
    </div>
  );
}
