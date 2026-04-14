"use client";

import React from 'react';
import { PublicShell } from '@/components/layout/PublicShell';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, ChevronRight } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <PublicShell>
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          
          {/* Header */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border border-indigo-100 mb-6"
            >
              <Shield className="h-4 w-4" /> Secure Registry
            </motion.div>
            <h1 className="font-outfit text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-8">
              Privacy <span className="text-indigo-600 italic">Protocols.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
              We operate with absolute transparency. This document outlines how PASTOR BONUS CO. LTD 
              protects your data as we process your digital services.
            </p>
          </div>

          {/* Core Principles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            <PolicyHighlight 
                icon={Eye} 
                title="Zero Leaks" 
                desc="Your documents are deleted from our local print servers immediately after physical output is verified."
            />
            <PolicyHighlight 
                icon={Lock} 
                title="Encrypted Vault" 
                desc="Customer registry data is stored using Supabase high-level encryption protocols."
            />
          </div>

          {/* Policy Body */}
          <div className="prose prose-slate max-w-none space-y-12">
            <section className="space-y-4">
              <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-900">1. Data Acquisition</h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                We collect information necessary to process your orders: Name, WhatsApp number, and document files. 
                We do not sell this data to third parties. Your proximity to the Bank of Kigali branch in Gicumbi 
                is reflected in our localized service delivery.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-900">2. Printing Confidentiality</h2>
              <p className="text-slate-600 font-medium leading-relaxed">
                Documents uploaded via the **Print Portal** are handled for the sole purpose of fulfillment. 
                Staff are strictly prohibited from retaining digital or physical copies of sensitive customer work.
              </p>
            </section>

            <section className="space-y-4 py-12 border-y border-slate-100">
               <div className="flex items-center gap-4 text-emerald-600 mb-4">
                  <Database className="h-6 w-6" />
                  <span className="font-black uppercase tracking-widest text-xs">Infrastructure Audit</span>
               </div>
               <p className="text-sm font-bold text-slate-400">
                 Last Updated: April 14, 2026. All systems compliant with modern data protection standards.
               </p>
            </section>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function PolicyHighlight({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-start gap-6">
      <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
