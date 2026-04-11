"use client";

import React from 'react';
import { PublicShell } from '@/components/layout/PublicShell';
import { Hero } from '@/components/sections/Hero';
import { CategoryGrid } from '@/components/sections/CategoryGrid';
import { ProductShowcase } from '@/components/sections/ProductShowcase';
import { TrustBar } from '@/components/sections/TrustBar';
import { ServiceSpotlight } from '@/components/sections/ServiceSpotlight';
import { PromoBanner } from '@/components/sections/PromoBanner';
import { Testimonials } from '@/components/sections/Testimonials';
import { Newsletter } from '@/components/sections/Newsletter';

export default function HomePage() {
  return (
    <PublicShell>
      {/* 1. Navbar is inside PublicShell */}
      
      {/* 2. Hero Section */}
      <Hero />

      {/* 3. Category Navigation */}
      <CategoryGrid />

      {/* 4. Featured / Live Products Showcase */}
      <ProductShowcase />

      {/* 5. Trust Bar / Value Propositions */}
      <TrustBar />

      {/* 6. Service Spotlight (Gateway to Print Portal) */}
      <ServiceSpotlight />

      {/* 7. Promotional Banners */}
      <PromoBanner />

      {/* 8. Testimonials Section */}
      <Testimonials />

      {/* 9. Newsletter Section */}
      <Newsletter />

      {/* 10. Footer is inside PublicShell */}
    </PublicShell>
  );
}
