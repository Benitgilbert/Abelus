"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Printer, ShoppingBag } from 'lucide-react';
import { useSettings } from '@/components/providers/SettingsProvider';

export function Hero() {
  const { getSetting } = useSettings();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={getSetting('hero_image_url', '/hero_stationery_premium.png')} 
          alt="Premium Stationery" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary border border-primary/20 mb-8">
              Digital Papeterie & Service Center
            </span>
            <h1 className="font-outfit text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-[#1A1C1E]">
              {getSetting('hero_title', 'Precision Printing. Premium Gear.').split('.').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}{i < arr.length - 1 && '.'}
                  {i === 0 && <br/>}
                  {i === 1 && <span className="text-primary italic">.</span>}
                </React.Fragment>
              ))}
            </h1>
            <p className="mt-8 text-xl font-medium text-muted-foreground leading-relaxed max-w-lg">
              {getSetting('hero_subtitle', 'The only digital hub where premium printing meets high-end office technology. Safe, fast, and completely humanised.')}
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link 
                href="/print-portal" 
                className="group flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
              >
                <Printer className="h-5 w-5" />
                Go to Print Portal
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/shop" 
                className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-white/50 backdrop-blur-md px-8 py-5 text-lg font-bold text-[#1A1C1E] hover:bg-white transition-all"
              >
                <ShoppingBag className="h-5 w-5" />
                Browse Shop
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
