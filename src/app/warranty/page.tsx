"use client";

import React from 'react';
import { PublicShell } from '@/components/layout/PublicShell';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, RefreshCw, FileCheck, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';

export default function WarrantyPage() {
  return (
    <PublicShell>
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          
          {/* Header */}
          <div className="mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary border border-primary/20 mb-6"
            >
              <ShieldCheck className="h-4 w-4" /> Lifetime Trust
            </motion.div>
            <h1 className="font-outfit text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-6">
              Warranty <span className="text-primary italic">&</span> Support.
            </h1>
            <p className="max-w-xl mx-auto text-lg text-slate-500 font-medium">
              Every asset from our vault is backed by our signature coverage. 
              We don't just sell technology; we maintain it.
            </p>
          </div>

          {/* Coverage Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <CoverageCard 
              icon={Clock} 
              title="90-Day Guarantee" 
              desc="On all digital services and formatting. If it's not perfect, we fix it instantly."
            />
            <CoverageCard 
              icon={RefreshCw} 
              title="Tech Replacement" 
              desc="Full manufacturer warranty support for all office technology and hardware."
            />
          </div>

          {/* Details Section */}
          <div className="rounded-[4rem] bg-slate-950 p-12 md:p-16 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-64 w-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-primary/30" />
            
            <h2 className="text-3xl font-black font-outfit mb-12 italic">The Master Protocol.</h2>
            
            <div className="space-y-12">
              <ProtocolStep number="01" title="Purchase Validation" desc="Every transaction generates a uniquely salted SKU in our registry for instant lookup." />
              <ProtocolStep number="02" title="In-House Diagnostics" desc="Our Gicumbi tech desk provides real-time auditing for any hardware issues." />
              <ProtocolStep number="03" title="Immediate Resolution" desc="Replacement or repair dispatched within 48 hours of ticket validation." />
            </div>

            <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                <p className="text-sm font-medium text-slate-400 max-w-xs text-center md:text-left">
                    Need to file a claim or check your coverage status? Our team is live.
                </p>
                <button className="flex items-center gap-3 rounded-full bg-primary px-10 py-5 text-xs font-black uppercase tracking-widest text-white hover:scale-105 transition-all shadow-xl shadow-primary/20">
                    <MessageSquare className="h-4 w-4" /> Start Claim
                </button>
            </div>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function CoverageCard({ icon: Icon, title, desc }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="rounded-[3rem] border border-slate-100 bg-slate-50/50 p-10 hover:border-primary/30 transition-all group"
    >
      <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-black font-outfit text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function ProtocolStep({ number, title, desc }: any) {
  return (
    <div className="flex gap-8 group">
      <div className="text-4xl font-black font-outfit text-primary/30 group-hover:text-primary transition-colors leading-none">{number}</div>
      <div className="space-y-2">
        <h4 className="text-xl font-bold text-white">{title}</h4>
        <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-md">{desc}</p>
      </div>
    </div>
  );
}
