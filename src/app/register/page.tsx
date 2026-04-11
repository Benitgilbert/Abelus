"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Loader2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { publicRegister } from '@/lib/actions/admin-actions';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await publicRegister({
      email,
      password,
      fullName
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-2xl shadow-primary/20">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-8 text-3xl font-extrabold font-outfit tracking-tight text-foreground">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            Join the PASTOR BONUS digital shop and print center.
          </p>
        </div>

        <div className="rounded-[2.5rem] border bg-white/60 p-10 shadow-2xl shadow-black/5 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.form 
                key="register-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleRegister} 
                className="space-y-6"
              >
                {error && (
                  <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-xs font-bold text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-2xl border bg-white/50 py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border bg-white/50 py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border bg-white/50 py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-[#1A1C1E] py-5 text-sm font-black text-white shadow-xl shadow-black/10 hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Register Account
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs font-semibold text-muted-foreground">
                  Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
                </p>
              </motion.form>
            ) : (
              <motion.div 
                key="success-message"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 mb-6">
                    <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-[#1A1C1E] font-outfit">Welcome Aboard!</h3>
                <p className="mt-4 text-muted-foreground font-medium leading-relaxed">
                  Your account has been created successfully. You can now access all client services.
                </p>
                <Link 
                  href="/login" 
                  className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-sm font-black text-white"
                >
                    Sign In Now <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-center pt-4">
           <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center justify-center gap-2">
             <ShieldCheck className="h-4 w-4" />
             Data Protected & Secure
           </p>
        </div>
      </motion.div>
    </div>
  );
}
