"use client";

import React from 'react';
import { Zap, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '@/components/providers/SettingsProvider';
import { BusinessInquiryModal } from '../shared/BusinessInquiryModal';

export function PromoBanner() {
  const { getSetting } = useSettings();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const shopPhone = getSetting('contact_phone', '250780000000'); // Default fallback

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] bg-[#09090b] border border-white/5 p-10 md:p-12 text-white shadow-2xl"
        >
          {/* Satisfying Glow Backdrop */}
          <div className="absolute top-0 right-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 bg-primary/10 blur-[140px]" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="flex flex-col items-center gap-10 text-center lg:flex-row lg:text-left">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Zap className="h-8 w-8 fill-primary" />
              </div>
              <div>
                <h3 className="font-outfit text-3xl font-black md:text-4xl uppercase italic tracking-tight leading-none">
                  Institutional <br /><span className="text-primary not-italic">Capacities.</span>
                </h3>
                <p className="mt-4 max-w-md text-base font-medium text-slate-400">
                  Strategic volume discounts for NGOs, academic councils, and enterprise teams. 
                  Get precision and scale.
                </p>
              </div>
            </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={() => setIsModalOpen(true)}
                className="group flex items-center justify-center gap-4 rounded-pill bg-white px-10 py-5 text-xs font-black uppercase tracking-widest text-black shadow-2xl transition-all hover:bg-primary hover:text-white"
              >
                <ShoppingBag className="h-4 w-4" />
                Talk to us
              </motion.button>
          </div>
        </motion.div>
      </section>

      <BusinessInquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        shopPhone={shopPhone} 
      />
    </>
  );
}
