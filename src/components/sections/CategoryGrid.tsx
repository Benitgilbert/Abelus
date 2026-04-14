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
    <section className="py-16 bg-black overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center mb-12">
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
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-[320px] cursor-pointer"
              >
                <div className="absolute inset-0 bg-[#09090b] border border-white/5 rounded-[3rem] transition-all group-hover:border-primary/30 group-hover:shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]" />
                
                <div className="relative h-full p-10 flex flex-col justify-between items-start">
                  <div 
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 transition-all group-hover:bg-primary group-hover:text-white"
                    style={{ color: cat.color_code || '#10b981' }}
                  >
                    <IconComponent className="h-8 w-8 stroke-[1.5] group-hover:text-white" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-outfit text-2xl font-black text-white uppercase leading-none">{cat.title}</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[200px]">
                      {cat.description || "Elite solutions tailored for your digital requirements."}
                    </p>
                  </div>

                  <div className="absolute bottom-10 right-10 h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-primary group-hover:text-white transition-all">
                    <Icons.ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
