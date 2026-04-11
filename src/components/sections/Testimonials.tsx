"use client";

import React, { useEffect, useState } from 'react';
import { Star, Quote, Loader2 } from 'lucide-react';
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
    <section className="py-24 bg-[#FBFBFE]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="font-outfit text-4xl font-black tracking-tight text-[#1A1C1E]">Client Voices</h2>
          <p className="mt-4 text-muted-foreground font-medium">Trusted by individuals and organizations alike.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {reviews.map((r, i) => (
              <div key={i} className="relative rounded-[2.5rem] bg-white p-10 border shadow-sm hover:shadow-xl transition-all group">
                <Quote className="absolute top-10 right-10 h-12 w-12 text-primary/5 group-hover:text-primary/10 transition-colors" />
                <div className="flex gap-1 mb-6">
                  {[...Array(r.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg font-medium leading-relaxed text-[#1A1C1E] mb-8 italic">"{r.content}"</p>
                <div>
                  <h4 className="font-outfit font-black text-[#1A1C1E]">{r.name}</h4>
                  <p className="text-sm font-bold text-primary uppercase tracking-tighter">{r.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
