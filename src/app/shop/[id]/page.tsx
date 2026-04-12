"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicShell } from '@/components/layout/PublicShell';
import { productService } from '@/lib/services/product-service';
import { Product, ProductVariant, ProductPackaging } from '@/types';
import { useCart } from '@/components/providers/CartProvider';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  Package, 
  ShieldCheck, 
  Zap,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<ProductPackaging | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setLoading(true);
      const data = await productService.getById(id as string);
      if (data) {
        // Redirection Logic: If this is a printing service, send to portal
        if (data.is_service && data.name.toLowerCase().includes('printing')) {
          router.replace('/print-portal');
          return;
        }

        setProduct(data);
        const defaultV = data.variants?.find(v => v.is_default) || data.variants?.[0];
        if (defaultV) setSelectedVariant(defaultV);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id, router]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    setIsAdding(true);
    addItem(product, selectedVariant, selectedUnit || undefined, quantity);
    
    // Visual feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  if (loading) return (
    <PublicShell>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50/50">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-300" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Sourcing Asset Details...</p>
      </div>
    </PublicShell>
  );

  if (!product) return (
    <PublicShell>
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-slate-50/50">
        <div className="h-20 w-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mb-6">
          <Info className="h-10 w-10 text-slate-300" />
        </div>
        <h2 className="text-3xl font-black font-outfit text-slate-900">Asset Not Found</h2>
        <p className="text-slate-400 mt-2">The product you are looking for does not exist in our registry.</p>
        <button 
          onClick={() => router.push('/shop')}
          className="mt-8 rounded-2xl bg-indigo-600 px-8 py-3.5 text-xs font-black text-white hover:bg-slate-900 transition-all"
        >
          Return to Shop
        </button>
      </div>
    </PublicShell>
  );

  // Determine current display info
  const displayPrice = selectedUnit ? Number(selectedUnit.selling_price) : Number(selectedVariant?.selling_price || 0);
  const displayStock = selectedVariant?.stock_quantity ?? 0;
  const displayImage = selectedVariant?.image_url || product.image_url;

  return (
    <PublicShell>
      <div className="min-h-screen pt-24 pb-12 bg-[#FBFBFE]">
        <div className="mx-auto max-w-7xl px-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-3 mb-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <button onClick={() => router.push('/shop')} className="hover:text-indigo-600 transition-colors">Catalog</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left: Premium Image Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[3/2] lg:aspect-square lg:max-h-[500px] rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden group shadow-2xl shadow-indigo-100/30 flex items-center justify-center p-8">
                 {displayImage ? (
                   <img src={displayImage} alt={product.name} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />
                 ) : (
                   <Package className="h-32 w-32 text-slate-100" />
                 )}
                 
                 {/* Floating Badges */}
                 <div className="absolute top-8 left-8 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full text-[10px] font-black text-indigo-600 shadow-sm border border-slate-100 uppercase tracking-widest">Premium Registry</span>
                 </div>
              </div>
              
              {/* Variant Thumbnails if applicable */}
              {product.has_variants && product.variants && product.variants.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {product.variants.map((v) => (
                    <button 
                      key={v.id}
                      onClick={() => { setSelectedVariant(v); setSelectedUnit(null); }}
                      className={cn(
                        "h-24 w-24 rounded-2xl border bg-white overflow-hidden shrink-0 transition-all",
                        selectedVariant?.id === v.id ? "ring-4 ring-indigo-50 border-indigo-500" : "border-slate-100 grayscale hover:grayscale-0 opacity-60 hover:opacity-100"
                      )}
                    >
                      {v.image_url || product.image_url ? (
                        <img src={v.image_url || product.image_url} alt={v.sku} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-slate-50"><Package className="h-6 w-6 text-slate-300"/></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Interaction & Info */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Curated Stock</span>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{selectedVariant?.sku || product.sku}</span>
                  </div>
                  <h1 className="font-outfit text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">{product.name}</h1>
                </div>

                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                  {product.description || "High-end assets engineered for performance and professional reliability. Certified by the Pastor Bonus registry for vertical quality control."}
                </p>

                {/* Variation Selection System */}
                {product.has_variants && product.variants && (
                  <div className="space-y-4 pt-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block">Choose Variation</label>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((v) => {
                        const attrDesc = Object.values(v.attributes).join(' ');
                        const isSelected = selectedVariant?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => { setSelectedVariant(v); setSelectedUnit(null); }}
                            className={cn(
                              "px-6 py-3 rounded-2xl text-sm font-bold transition-all border",
                              isSelected 
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100" 
                                : "bg-white text-slate-600 border-slate-100 hover:border-indigo-200"
                            )}
                          >
                            {attrDesc || "Standard"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Packaging System */}
                {selectedVariant?.packaging && selectedVariant.packaging.length > 0 && (
                   <div className="space-y-4 pt-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block">Packaging Unit</label>
                    <div className="grid grid-cols-2 gap-3">
                           <button 
                          onClick={() => setSelectedUnit(null)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                            !selectedUnit ? "bg-emerald-50 border-emerald-500 shadow-md" : "bg-white border-slate-100 hover:bg-slate-50"
                          )}
                        >
                           <Zap className={cn("h-4 w-4 mb-2", !selectedUnit ? "text-emerald-600" : "text-slate-300")} />
                           <span className={cn("text-[10px] font-black uppercase", !selectedUnit ? "text-emerald-900" : "text-slate-600")}>Base Item</span>
                           <span className="text-[8px] text-slate-400 font-bold mt-0.5">Single Asset</span>
                        </button>
                        {selectedVariant.packaging.map((unit) => (
                           <button 
                             key={unit.id}
                             onClick={() => setSelectedUnit(unit)}
                             className={cn(
                               "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                               selectedUnit?.id === unit.id ? "bg-emerald-50 border-emerald-500 shadow-md" : "bg-white border-slate-100 hover:bg-slate-50"
                             )}
                           >
                              <Layers className={cn("h-4 w-4 mb-2", selectedUnit?.id === unit.id ? "text-emerald-600" : "text-slate-300")} />
                              <span className={cn("text-[10px] font-black uppercase", selectedUnit?.id === unit.id ? "text-emerald-900" : "text-slate-600")}>{unit.unit_name}</span>
                              <span className="text-[8px] text-slate-400 font-bold mt-0.5">x{unit.conversion_factor} Group</span>
                           </button>
                        ))}
                      </div>
                   </div>
                )}

                {/* Price & Action Block */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Registry Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">{displayPrice.toLocaleString()}</span>
                        <span className="text-sm font-bold text-slate-400">RWF</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-slate-100 rounded-2xl p-1 gap-1">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white text-slate-400 transition-all font-black">-</button>
                      <span className="w-12 text-center text-sm font-black text-slate-900">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white text-slate-400 transition-all font-black">+</button>
                    </div>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    disabled={displayStock <= 0}
                    className={cn(
                      "w-full h-14 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale",
                      isAdding 
                        ? "bg-emerald-500 text-white shadow-emerald-200" 
                        : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-slate-900"
                    )}
                  >
                    {isAdding ? (
                      <>
                        <CheckCircle2 className="h-6 w-6 animate-bounce" />
                        Added to Ledger
                      </>
                    ) : (displayStock <= 0 && !product.is_service) ? (
                      "Registry Depleted (Out of Stock)"
                    ) : product.is_service && product.name.toLowerCase().includes('printing') ? (
                      <>
                        <Zap className="h-6 w-6" />
                        Open Print Portal
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-6 w-6" />
                        Initiate Purchase
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-8 py-4 px-6 rounded-3xl bg-slate-50/50 border border-slate-50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Verified Source
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Tax Compliant
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicShell>
  );
}
