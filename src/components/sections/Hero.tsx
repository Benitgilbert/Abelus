"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Printer, ShoppingBag, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-black py-12">
      {/* High-Fidelity Background Interaction */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_65%)] opacity-20 blur-[120px]" />
        <img 
          src="/hero_stationery_premium.png" 
          alt="Premium Tech" 
          className="h-full w-full object-cover grayscale brightness-[0.3]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 border border-emerald-500/20 mb-10">
            <Sparkles className="h-3 w-3" />
            Elite Digital Presence
          </div>
          
          <h1 className="font-outfit text-5xl md:text-8xl font-black tracking-tightest leading-[0.85] text-white uppercase italic">
            Precision<br />
            <span className="text-primary not-italic">Outreach.</span>
          </h1>
          
          <p className="mt-8 text-lg md:text-xl font-medium text-slate-400 leading-relaxed max-w-2xl mx-auto">
            The soulful intersection of high-volume printing and advanced tech gear. 
            Designed for those who demand excellence in every digital touchpoint.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link 
                href="/print-portal" 
                className="group flex items-center justify-center gap-4 rounded-pill bg-primary px-10 py-6 text-sm font-black text-white uppercase tracking-widest shadow-2xl shadow-primary/40 transition-all hover:bg-emerald-400"
              >
                <Printer className="h-5 w-5" />
                Start Printing
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link 
                href="/shop" 
                className="flex items-center justify-center gap-4 rounded-pill border border-white/10 bg-white/5 backdrop-blur-xl px-10 py-6 text-sm font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                <ShoppingBag className="h-5 w-5" />
                Explore Shop
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Satisfying Micro-Interaction Elements */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-slate-500 animate-bounce">
        <div className="h-10 w-6 rounded-full border-2 border-slate-500/30 flex justify-center p-1">
          <motion.div 
            animate={{ y: [0, 16, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }} 
            className="h-2 w-1.5 bg-slate-500 rounded-full" 
          />
        </div>
      </div>
    </section>
  );
}
