"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { useSettings } from '@/components/providers/SettingsProvider';

export function Footer() {
  const { getSetting } = useSettings();

  return (
    <footer className="border-t bg-white pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-black italic shadow-lg shadow-primary/10">P</div>
              <span className="font-outfit text-2xl font-bold tracking-tight text-[#1A1C1E]">PASTOR BONUS CO. LTD</span>
            </Link>
            <p className="max-w-xs text-sm font-medium leading-relaxed text-muted-foreground">
              Your community hub for digital services, premium stationery, and state-of-the-art office technology. Providing quality you can trust.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href={getSetting('social_link', 'https://facebook.com/pastorbonus.gicumbi')} 
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border p-2.5 text-muted-foreground hover:bg-primary hover:text-white transition-all"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-outfit text-sm font-black uppercase tracking-widest text-[#1A1C1E] mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><Link href="/shop" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Digital Shop</Link></li>
              <li><Link href="/print-portal" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Print Portal</Link></li>
              <li><Link href="/?inquiry=true" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">B2B Market</Link></li>
              <li><Link href="/warranty" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Warranty Info</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-outfit text-sm font-black uppercase tracking-widest text-[#1A1C1E] mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <a 
                  href={getSetting('contact_maps_url', 'https://maps.app.goo.gl/vY6bAvu87nDe6cmd8')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-muted-foreground leading-snug hover:text-primary transition-colors"
                >
                  {getSetting('contact_address', 'near bank of kigali gicumbi branch')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href={`tel:+250788819878`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {getSetting('contact_phone', '+250 788 819 878')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href={`mailto:${getSetting('contact_email', 'pastorbonus@gmail.com')}`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {getSetting('contact_email', 'pastorbonus@gmail.com')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            © 2026 PASTOR BONUS CO. LTD. Handcrafted for our community.
          </p>
          <div className="flex items-center gap-6">
             <Link href="/privacy" className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
             <Link href="/terms" className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
