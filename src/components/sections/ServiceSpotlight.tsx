"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FileUp, QrCode, CreditCard, ChevronRight, Sparkles, Layout, Printer, MessageSquare, ShoppingBag } from 'lucide-react';
import { useSettings } from '@/components/providers/SettingsProvider';

export function ServiceSpotlight() {
  const { getSetting } = useSettings();
  const router = useRouter();

  return (
    <>
      <section className="py-12 bg-black overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                <Sparkles className="h-4 w-4" /> Integrated Systems
              </div>
              <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight text-white uppercase italic">
                Service <span className="text-primary not-italic">Spotlight.</span>
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Print Portal Module */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="relative rounded-[3rem] bg-[#09090b] border border-white/5 p-8 md:p-10 overflow-hidden group"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 mb-8">
                    The Print Portal
                  </span>
                  <h3 className="font-outfit text-3xl md:text-4xl font-black text-white leading-none uppercase italic">
                    Digital <br /><span className="text-primary not-italic">Processing.</span>
                  </h3>
                  <p className="mt-6 text-base font-medium text-slate-400 leading-relaxed max-w-sm">
                    Upload your documents remotely, confirm your specs, and pick up with a QR code. 
                    Zero friction. Absolute precision.
                  </p>
                </div>

                <div className="mt-8">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <Link
                      href="/print-portal"
                      className="group inline-flex items-center gap-4 rounded-pill bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-primary hover:text-white"
                    >
                      Start Upload
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                </div>
              </div>
              
              <Printer className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/5 -rotate-12 transition-all group-hover:scale-110 group-hover:text-primary/10" />
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-[80px]" />
            </motion.div>

            {/* Business Excellence Module */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="relative rounded-[3rem] bg-[#09090b] border border-white/5 p-8 md:p-10 overflow-hidden group"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-full bg-emerald-500/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20 mb-8">
                    Commercial Grade
                  </span>
                  <h3 className="font-outfit text-3xl md:text-4xl font-black text-white leading-none uppercase italic">
                    B2B <br /><span className="text-emerald-400 not-italic">Excellence.</span>
                  </h3>
                  <p className="mt-6 text-base font-medium text-slate-400 leading-relaxed max-w-sm">
                    Strategic procurement for corporate and educational institutions. 
                    High-volume capacity with personalized delivery.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-6">
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => router.push('/?inquiry=true', { scroll: false })}
                    className="group inline-flex items-center gap-4 rounded-pill bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-widest text-white border border-white/10 transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                  >
                    Talk to us
                    <ShoppingBag className="h-4 w-4 transition-transform group-hover:scale-110" />
                  </motion.button>

                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all">
                      <Layout className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>

              <QrCode className="absolute -bottom-10 -right-10 h-64 w-64 text-emerald-500/5 rotate-12 transition-all group-hover:scale-110 group-hover:text-emerald-500/10" />
              <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 blur-[80px]" />
            </motion.div>
          </div>
        </div>
      </section>

    </>
  );
}
