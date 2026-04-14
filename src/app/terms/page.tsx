"use client";

import React from 'react';
import { PublicShell } from '@/components/layout/PublicShell';
import { motion } from 'framer-motion';
import { FileText, Gavel, Scale, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <PublicShell>
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          
          {/* Header */}
          <div className="mb-20">
             <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white mb-6"
            >
              <Gavel className="h-4 w-4 text-primary" /> Master Agreement
            </motion.div>
            <h1 className="font-outfit text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-8">
              Terms of <span className="text-slate-400 italic">Service.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
              By engaging with our digital systems or physical vault in Gicumbi, 
              you agree to the operational protocols defined below.
            </p>
          </div>

          {/* Key Standards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <StandardCard icon={Scale} title="Fair Use" desc="All digital services are subject to fair use limits based on current resource capacity." />
            <StandardCard icon={AlertCircle} title="Responsibility" desc="Customers are responsible for the legal compliance of any content they request to print." />
            <StandardCard icon={FileText} title="Payment" desc="Service fees are due upon fulfillment or as defined by corporate subscription contracts." />
          </div>

          {/* Terms Content */}
          <div className="prose prose-slate max-w-none space-y-12 pb-20">
            <section className="space-y-4">
               <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-900">1. Digital Engagement</h2>
               <p className="text-slate-600 font-medium leading-relaxed">
                 Use of the **Pastor Bonus Shop** or **Print Portal** implies acceptance of our real-time pricing engine. 
                 While we strive for absolute accuracy, we reserve the right to adjust formatting fees for complex specialized work.
               </p>
            </section>

            <section className="space-y-4">
               <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-900">2. Corporate Subscriptions</h2>
               <p className="text-slate-600 font-medium leading-relaxed">
                 B2B / Subscriber contracts are governed by individual master service agreements. Credit utilization 
                 and outstanding balances are monitored via our automated auditing vault.
               </p>
            </section>

            <section className="space-y-4">
               <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-900">3. Liability Disclaimer</h2>
               <p className="text-slate-600 font-medium leading-relaxed">
                 PASTOR BONUS CO. LTD is not liable for data loss from external storage media provided for printing. 
                 We recommend maintaining backups for all sensitive assets.
               </p>
            </section>
          </div>

          <div className="p-10 rounded-[3rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Need Clarification?</p>
              <h3 className="text-xl font-bold italic font-outfit">Consult the Board.</h3>
            </div>
            <a href="mailto:pastorbonus@gmail.com" className="bg-white text-slate-900 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                Send Legal Inquiry
            </a>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function StandardCard({ icon: Icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
      <div className="h-10 w-10 text-primary mb-6"><Icon className="h-10 w-10" /></div>
      <h3 className="font-outfit font-black text-slate-900 mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
