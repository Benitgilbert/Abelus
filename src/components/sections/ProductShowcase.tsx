"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingCart, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '@/lib/services/product-service';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

export function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await productService.getAll({ isFeatured: true });
      if (data) setProducts(data.slice(0, 8)); // Show up to 8 of the hand-picked elite items
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center bg-black">
      <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
    </div>
  );

  return (
    <section className="py-12 bg-black">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4">
              <Sparkles className="h-4 w-4" /> Selective Curation
            </div>
            <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight text-white uppercase italic">
              Elite <span className="text-primary not-italic">Inventory.</span>
            </h2>
          </div>
          <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
            <Link href="/shop" className="group flex items-center gap-3 font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">
              View Digital Hub
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence>
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link 
                  href={`/shop/${product.id}`}
                  className="group relative flex flex-col rounded-[2.5rem] border border-white/5 bg-[#09090b] p-4 transition-all hover:border-primary/30 hover:shadow-[0_0_40px_-20px_rgba(16,185,129,0.3)]"
                >
                  <div className="relative aspect-square mb-6 overflow-hidden rounded-[2rem] bg-black group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                    {product.image_url ? (
                      <motion.img 
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        src={product.image_url} 
                        alt={product.name} 
                        className="h-full w-full object-cover transition-all duration-700" 
                      />
                    ) : (
                      <ShoppingCart className="h-12 w-12 text-slate-800 opacity-20" />
                    )}
                    {!product.is_service && (product.stock_quantity ?? 0) <= 5 && (
                      <span className="absolute top-4 right-4 bg-primary text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                        Scarcity Alert
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">{(product as any).category?.name || 'Retail'}</span>
                    <h3 className="font-outfit text-xl font-black text-white line-clamp-1 uppercase italic leading-none">{product.name}</h3>
                    
                    <div className="pt-6 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-primary tracking-tighter">
                          {Number(product.selling_price).toLocaleString()} 
                          <span className="text-[10px] ml-1 opacity-50">RWF</span>
                        </span>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white hover:bg-primary hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-colors"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
