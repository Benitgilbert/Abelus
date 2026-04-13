"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingCart, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { productService } from '@/lib/services/product-service';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

export function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await productService.getAll();
      if (data) setProducts(data.slice(0, 8)); // Top 8
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
    </div>
  );

  return (
    <section className="py-24 bg-[#FBFBFE]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs mb-4">
              <Sparkles className="h-4 w-4" /> New Arrivals
            </div>
            <h2 className="font-outfit text-4xl font-black tracking-tight text-[#1A1C1E]">Curated Digital Inventory</h2>
          </div>
          <Link href="/shop" className="group flex items-center gap-2 font-bold text-primary hover:text-secondary transition-colors">
            View All Products
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link 
              key={product.id}
              href={`/shop/${product.id}`}
              className="group relative flex flex-col rounded-3xl border bg-white p-4 transition-all hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1"
            >
              <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl bg-muted group-hover:bg-primary/5 transition-colors flex items-center justify-center">
                 {product.image_url ? (
                   <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                 ) : (
                   <ShoppingCart className="h-12 w-12 text-muted-foreground opacity-20 group-hover:opacity-40 transition-opacity" />
                 )}
                 {!product.is_service && (product.stock_quantity ?? 0) <= 5 && (
                   <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">Low Stock</span>
                 )}
              </div>
              
              <div className="flex-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{(product as any).category?.name || 'Retail'}</span>
                <h3 className="mt-1 font-outfit text-lg font-bold text-[#1A1C1E] line-clamp-1">{product.name}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-primary">{Number(product.selling_price).toLocaleString()} <span className="text-[10px]">RWF</span></span>
                  </div>
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1C1E] text-white shadow-xl shadow-black/10 hover:bg-primary hover:scale-110 active:scale-95 transition-all">
                    <ShoppingCart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
