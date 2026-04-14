"use client";

import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { settingsService } from '@/lib/services/settings-service';

interface Specialty {
  id: string;
  title: string;
  description: string | null;
  icon_name: string | null;
  color_code: string | null;
  link_url: string | null;
}

export function CategoryGrid() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpecialties() {
      const data = await settingsService.getSpecialties();
      if (data) setSpecialties(data);
      setLoading(false);
    }
    fetchSpecialties();
  }, []);

  if (loading) return null;

  return (
    <section className="py-12 bg-black overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="font-outfit text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic">
              Core <span className="text-primary not-italic">Competencies.</span>
            </h2>
            <div className="mx-auto h-1 w-20 bg-primary/40 rounded-full" />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((cat, i) => {
            const IconComponent = (Icons as any)[cat.icon_name || 'Box'] || Icons.Box;
            return (
              <Link key={cat.id} href={cat.link_url || '/shop'} className="block group">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative h-[220px] cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[#09090b] border border-white/5 rounded-[2.5rem] transition-all group-hover:border-primary/30 group-hover:shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]" />
                  
                  <div className="relative h-full p-6 flex flex-col justify-between items-start">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 transition-all group-hover:bg-primary group-hover:text-white"
                      style={{ color: cat.color_code || '#10b981' }}
                    >
                      <IconComponent className="h-6 w-6 stroke-[1.5] group-hover:text-white" />
                    </div>
                    
                    <div className="space-y-1.5 flex-1 mt-4">
                      <h3 className="font-outfit text-lg font-black text-white uppercase leading-none">{cat.title}</h3>
                      <p className="text-[10px] font-medium text-slate-500 leading-tight max-w-[180px] line-clamp-2">
                        {cat.description || "Elite solutions tailored for your requirements."}
                      </p>
                    </div>

                    <div className="absolute bottom-6 right-6 h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-white transition-all">
                      <Icons.ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
