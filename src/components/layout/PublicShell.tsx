"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BusinessInquiryModal } from '../shared/BusinessInquiryModal';
import { useSettings } from '@/components/providers/SettingsProvider';

interface PublicShellProps {
  children: React.ReactNode;
}

function InquiryListener({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('inquiry') === 'true') {
      onOpen();
      // Remove the param after opening to prevent re-triggers, 
      // but keep the current URL path
      const params = new URLSearchParams(searchParams.toString());
      params.delete('inquiry');
      const newPath = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newPath, { scroll: false });
    }
  }, [searchParams, onOpen, router]);

  return null;
}

export function PublicShell({ children }: PublicShellProps) {
  const { getSetting } = useSettings();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const shopPhone = getSetting('contact_phone', '250788819878');

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBFE]">
      <Suspense fallback={null}>
        <InquiryListener onOpen={() => setIsInquiryOpen(true)} />
      </Suspense>

      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />

      <BusinessInquiryModal 
        isOpen={isInquiryOpen} 
        onClose={() => setIsInquiryOpen(false)} 
        shopPhone={shopPhone} 
      />
    </div>
  );
}
