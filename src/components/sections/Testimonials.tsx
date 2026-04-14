"use client";

import React, { useEffect, useState } from 'react';
import { Star, Quote, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { settingsService } from '@/lib/services/settings-service';

interface Review {
  name: string;
  role: string | null;
  content: string;
  rating: number;
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const data = await settingsService.getTestimonials();
      if (data) setReviews(data);
      setLoading(false);
    }
    fetchReviews();
  }, []);

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
            <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">
              <Sparkles className="h-4 w-4" /> Trusted Voices
            </div>
            <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight text-white uppercase italic text-center">
              Client <span className="text-primary not-italic">Validation.</span>
            </h2>
            <div className="mx-auto h-1 w-20 bg-primary/40 rounded-full" />
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {reviews.map((r, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative rounded-[3rem] bg-[#09090b] border border-white/5 p-8 transition-all group hover:border-primary/20"
              >
                <Quote className="absolute top-8 right-8 h-8 w-8 text-primary/10 group-hover:text-primary transition-colors" />
                
                <div className="flex gap-1 mb-8">
                  {[...Array(r.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  ))}
                </div>

                <p className="text-lg font-medium leading-relaxed text-slate-300 mb-8 italic">
                  "{r.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-outfit font-black text-white uppercase tracking-tight">{r.name}</h4>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{r.role || "Elite Client"}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center opacity-30">
          <div className="h-px w-full max-w-lg bg-gradient-to-r from-transparent via-slate-500 to-transparent" />
        </div>
      </div>
    </section>
  );
}
