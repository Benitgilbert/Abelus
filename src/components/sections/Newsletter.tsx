"use client";

import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeAction } from '@/lib/actions/marketing';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      const res = await subscribeAction(email);

      if (!res.success) {
        setMessage(res.error || "Something went wrong.");
        setStatus('error');
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch (err) {
      console.error('Newsletter error:', err);
      setMessage("Something went wrong. Please try again.");
      setStatus('error');
    }
  };

  return (
    <section className="py-16 bg-black overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[3.5rem] bg-[#09090b] border border-white/5 p-12 md:p-24 text-white overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
            <motion.div 
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 mb-10"
            >
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-primary"
                  >
                    <CheckCircle2 className="h-10 w-10" />
                  </motion.div>
                ) : (
                  <motion.div key="idle">
                    <Mail className="h-10 w-10 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            <h2 className="font-outfit text-5xl md:text-7xl font-black tracking-tight leading-none uppercase italic">
              {status === 'success' ? "Welcome to the " : "Join the "} 
              <span className="text-primary not-italic">Circle.</span>
            </h2>
            
            <p className="mt-8 text-xl font-medium text-slate-400 leading-relaxed max-w-lg">
              {status === 'success' 
                ? "You've successfully entered our high-fidelity digital hub. Expect excellence in your inbox."
                : "Experience the selective curation of tech and printing. No noise, just elite updates and boutique savings."}
            </p>

            <AnimatePresence>
              {status !== 'success' && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSubmit} 
                  className="mt-14 w-full flex flex-col sm:flex-row gap-4"
                >
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Identify your email" 
                    required
                    disabled={status === 'loading'}
                    className="flex-1 rounded-pill bg-white/5 border border-white/10 px-8 py-6 text-lg font-medium placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={status === 'loading'}
                    className="group flex items-center justify-center gap-4 rounded-pill bg-primary px-12 py-6 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/20 transition-all disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Enroll
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {status === 'error' && (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="mt-6 text-xs font-black uppercase tracking-widest text-red-400"
              >
                {message}
              </motion.p>
            )}
            
            <div className="mt-10 flex items-center gap-4 text-slate-600">
              <div className="h-1 w-12 bg-white/5 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Proprietary & Protected</span>
              <div className="h-1 w-12 bg-white/5 rounded-full" />
            </div>
          </div>
          
          {/* Satisfying Glow Elements */}
          <div className="absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 blur-[80px]" />
        </motion.div>
      </div>
    </section>
  );
}
