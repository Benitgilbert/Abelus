"use client";

import React from 'react';
import { Zap, ShoppingBag } from 'lucide-react';
import { useSettings } from '@/components/providers/SettingsProvider';
import { BusinessInquiryModal } from '../shared/BusinessInquiryModal';

export function PromoBanner() {
  const { getSetting } = useSettings();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const shopPhone = getSetting('contact_phone', '250780000000'); // Default fallback

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-10 md:p-14 text-white shadow-2xl">
          {/* Subtle decorative elements */}
          <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 bg-primary/20 blur-[120px]" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#0F172A] shadow-xl">
                <Zap className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-outfit text-3xl font-black md:text-4xl">
                  {getSetting('promo_banner_title', 'Bulk Business Deals')}
                </h3>
                <p className="mt-2 max-w-md text-lg font-medium text-slate-400">
                  {getSetting('promo_banner_text', 'Get up to 15% off on orders over 5,000 pages. Best for NGOs & Schools.')}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center justify-center gap-3 rounded-2xl bg-white/10 px-8 py-5 text-lg font-bold backdrop-blur-md transition-all hover:bg-white hover:text-[#0F172A]"
            >
              <ShoppingBag className="h-5 w-5" />
              Talk to us
            </button>
          </div>
        </div>
      </section>

      <BusinessInquiryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        shopPhone={shopPhone} 
      />
    </>
  );
}
