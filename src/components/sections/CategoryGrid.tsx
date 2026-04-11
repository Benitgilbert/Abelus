"use client";

import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { settingsService } from '@/lib/services/settings-service';

interface Specialty {
  id: string;
  title: string;
  description: string | null;
  icon_name: string | null;
  color_code: string | null;
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
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="font-outfit text-4xl font-black tracking-tight text-[#1A1C1E]">Explore our Specialties</h2>
          <div className="mt-4 h-1 w-20 bg-primary/20 rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {specialties.map((cat) => {
            const IconComponent = (Icons as any)[cat.icon_name || 'Box'] || Icons.Box;
            return (
              <div key={cat.id} className="group flex flex-col items-center text-center cursor-pointer">
                <div 
                  className={cn(
                    "mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl",
                    "bg-[#F8F9FB]"
                  )}
                  style={{ color: cat.color_code || '#10b981' }}
                >
                  <IconComponent className="h-10 w-10 stroke-[1.5]" />
                </div>
                <h3 className="font-outfit text-lg font-bold text-[#1A1C1E] transition-colors group-hover:text-primary">{cat.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
