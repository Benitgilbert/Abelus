"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileUp, QrCode, CreditCard, ChevronRight } from 'lucide-react';

export function ServiceSpotlight() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative rounded-[3rem] bg-[#1A1C1E] p-8 md:p-16 text-white overflow-hidden shadow-2xl">
          {/* Background Highlight */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
          
          <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="inline-block rounded-full bg-primary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary border border-primary/20 mb-8">
                The Print Portal
              </span>
              <h2 className="font-outfit text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
                Your Documents, <br/>
                <span className="text-primary italic">Processed</span> in Seconds.
              </h2>
              <p className="mt-8 text-lg font-medium text-white/60 leading-relaxed max-w-md">
                No more waiting in line. Upload your PDFs or photos, choose your settings, and get a notification when they are ready for pickup.
              </p>
              
              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white">
                    <FileUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Fast Cloud Upload</h4>
                    <p className="text-sm text-white/40">Any format, any file size.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold">Dynamic QR Pickup</h4>
                    <p className="text-sm text-white/40">Secure verification at the shop.</p>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <Link 
                  href="/print-portal" 
                  className="group inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-lg font-black text-[#1A1C1E] transition-all hover:bg-primary hover:text-white"
                >
                  Start Uploading
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <motion.div 
                initial={{ rotate: 10, y: 100, opacity: 0 }}
                whileInView={{ rotate: -5, y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 rounded-[2.5rem] border border-white/10 bg-white shadow-2xl p-8"
              >
                 <div className="flex items-center justify-between mb-8">
                    <div className="h-4 w-20 rounded-full bg-muted" />
                    <div className="h-8 w-8 rounded-full bg-primary" />
                 </div>
                 <div className="space-y-4">
                    <div className="h-32 w-full rounded-2xl bg-muted/50 border-2 border-dashed border-muted flex flex-col items-center justify-center text-muted-foreground">
                       <FileUp className="h-8 w-8 mb-2" />
                       <span className="text-xs font-bold">financial_report.pdf</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4">
                       <span className="text-sm font-bold text-[#1A1C1E]">2 Copies • B/W • A4</span>
                       <span className="text-sm font-black text-primary">50 RWF</span>
                    </div>
                    <div className="w-full rounded-xl bg-emerald-500 py-3 text-center text-xs font-black uppercase text-white tracking-widest">
                       Paid via MoMo
                    </div>
                 </div>
              </motion.div>
              {/* Decorative elements */}
              <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
