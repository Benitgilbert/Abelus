"use client";

import React, { useEffect, useState } from 'react';
import { PublicShell } from '@/components/layout/PublicShell';
import { productService } from '@/lib/services/product-service';
import { categoryService } from '@/lib/services/category-service';
import { Product, Category, ProductVariant, ProductPackaging } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingBag, ChevronDown, Loader2, Sparkles, X, Package, Layers, Zap, Filter, ShoppingCart, Grid, List, Tag, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/components/providers/CartProvider';
import Link from 'next/link';
import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type SortOption = 'newest' | 'price_asc' | 'price_desc';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const { addItem } = useCart();

  // Local selection state for units and quantities in the catalog
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({}); // productId -> unitId

  const loadData = async () => {
    setLoading(true);
    const [prodData, catData] = await Promise.all([
      productService.getAll({ 
        categoryId: activeCategoryId === "all" ? undefined : activeCategoryId,
        sortBy,
        search: q,
        hideBelowShortage: true 
      }),
      categoryService.getAll()
    ]);

    if (prodData) setProducts(prodData);
    if (catData) setCategories(catData);
    setLoading(false);
  };

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam && activeCategoryId === "all") {
      setActiveCategoryId(catParam);
    }
    loadData();
  }, [activeCategoryId, sortBy, q, searchParams]);

  const handleAddToCart = (product: Product) => {
    const variant = product.variants?.[0]; // Default variant
    if (!variant) return;

    const unitId = selectedUnits[product.id];
    const unit = variant.packaging?.find(u => u.id === unitId);
    const qty = quantities[product.id] || 1;

    addItem(product, variant, unit, qty);
    
    // reset for visual feedback
    setQuantities({...quantities, [product.id]: 1});
  };

  const sortLabels: Record<SortOption, string> = {
    'newest': 'Newest First',
    'price_asc': 'Price: Low to High',
    'price_desc': 'Price: High to Low'
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#FDFDFD]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Elite Shop Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
               <div className="h-1 w-8 bg-indigo-600 rounded-full" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Exclusive Collection</h3>
            </div>
            <h1 className="font-outfit text-5xl md:text-7xl font-black tracking-tight text-[#1A1C1E] leading-none">
              {q ? `Query: ${q}` : 'Digital Shop'}
            </h1>
            <p className="pt-2 text-slate-500 font-medium flex items-center gap-2">
              {q ? (
                <button 
                  onClick={() => router.push('/shop')}
                  className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
                >
                  Clear Results <X className="h-3 w-3" />
                </button>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" /> 
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-600/60">
                    {loading ? "Counting Inventory..." : `${products.length} Premium Variations Available`}
                  </span>
                </span>
              )}
            </p>
          </motion.div>
          
          <div className="flex items-center gap-4">
             <div className="relative">
               <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-4 rounded-2xl border-2 border-slate-50 bg-white px-6 h-16 text-sm font-bold hover:bg-slate-50 hover:border-slate-100 transition-all whitespace-nowrap shadow-sm active:scale-95"
               >
                  Sort: {sortLabels[sortBy]}
                  <ChevronDown className={cn("h-4 w-4 transition-transform text-slate-400", isSortOpen && "rotate-180")} />
               </button>

               <AnimatePresence>
                 {isSortOpen && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute right-0 mt-3 w-72 rounded-[2.5rem] border-2 border-slate-50 bg-white/95 backdrop-blur-2xl p-4 shadow-[0_32px_64px_rgba(0,0,0,0.1)] z-30"
                   >
                     {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                       <button
                         key={option}
                         onClick={() => { setSortBy(option); setIsSortOpen(false); }}
                         className={cn(
                           "flex w-full items-center px-6 py-4 text-sm font-bold rounded-2xl transition-all mb-1 last:mb-0",
                           sortBy === option ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "hover:bg-slate-50 text-slate-500"
                         )}
                       >
                         {sortLabels[option]}
                       </button>
                     ))}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </div>

        {/* Mobile Elite Category Ribbon */}
        <div className="mb-12 lg:hidden">
           <div className="flex items-center gap-2 mb-4">
              <Filter className="h-3 w-3 text-slate-400" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-outfit">Select Department</h4>
           </div>
           <div className="flex overflow-x-auto no-scrollbar gap-3 -mx-6 px-6 pb-2">
              <CategoryRibbonButton active={activeCategoryId === "all"} onClick={() => setActiveCategoryId("all")} label="Everything" />
              {categories.map((cat) => (
                <CategoryRibbonButton key={cat.id} active={activeCategoryId === cat.id} onClick={() => setActiveCategoryId(cat.id)} label={cat.name} />
              ))}
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Desktop Sidebar (Hidden on Mobile) */}
          <aside className="hidden lg:block w-72 space-y-12">
            <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm">
              <h4 className="font-outfit text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                <Filter className="h-4 w-4" /> Dept.
              </h4>
              <div className="flex flex-col gap-3">
                <CategoryButton active={activeCategoryId === "all"} onClick={() => setActiveCategoryId("all")} label="Everything" />
                {categories.map((cat) => (
                  <CategoryButton key={cat.id} active={activeCategoryId === cat.id} onClick={() => setActiveCategoryId(cat.id)} label={cat.name} />
                ))}
              </div>
            </div>

            <div className="rounded-[3rem] bg-indigo-950 p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
               <h4 className="font-outfit text-2xl font-black mb-4 italic leading-tight">Corporate <br/>Solutions</h4>
               <p className="text-sm text-indigo-200/60 mb-8 font-medium leading-relaxed uppercase tracking-tighter">Large volume orders? <br/>Get exclusive negotiated <br/>pricing today.</p>
               <button className="w-full rounded-2xl bg-white py-4 text-xs font-black text-indigo-950 uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-105 active:scale-95">Open Credit Account</button>
            </div>
          </aside>

          {/* Premium Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex h-96 flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-200" />
                <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Refreshing Inventory...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-[4rem] border border-slate-100 bg-white p-32 text-center shadow-sm">
                 <div className="inline-flex h-24 w-24 items-center justify-center rounded-[2rem] bg-slate-50 mb-8">
                    <ShoppingCart className="h-10 w-10 text-slate-200" />
                 </div>
                 <h3 className="text-3xl font-black font-outfit text-slate-900">End of Aisle</h3>
                 <p className="text-slate-400 mt-3 font-medium text-lg italic">We couldn't find what you're looking for in this section.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-10 pb-32">
                {products.map((product, idx) => {
                  const variant = product.variants?.[0]; // Current view assumes default variant
                  return (
                      <div 
                        key={product.id}
                        className="group flex flex-col rounded-[2rem] sm:rounded-[3.5rem] border-2 border-slate-50 bg-white p-4 sm:p-7 transition-all hover:shadow-[0_48px_100px_rgba(0,0,0,0.06)] hover:-translate-y-2 relative"
                      >
                        {/* Image Placeholder / Tag UI */}
                        <Link href={`/shop/${product.id}`} className="relative aspect-square mb-4 sm:mb-8 overflow-hidden rounded-[1.5rem] sm:rounded-[2.8rem] bg-[#F9FBFF] group-hover:bg-indigo-50 transition-all duration-700 flex items-center justify-center border border-slate-50">
                           {product.image_url ? (
                             <img src={product.image_url} alt={product.name} className="object-cover w-full h-full scale-100 group-hover:scale-110 transition-transform duration-700" />
                           ) : (
                             <div className="text-slate-200 group-hover:scale-110 transition-transform duration-500">
                               <Package className="h-10 w-10 sm:h-20 sm:w-20" />
                             </div>
                           )}
                           <span className="absolute top-2 left-2 sm:top-6 sm:left-6 rounded-lg sm:rounded-2xl bg-white/95 backdrop-blur-xl px-2 py-1 sm:px-5 sm:py-2.5 text-[7px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-sm border border-slate-100 text-slate-500">
                             {categories.find(c => c.id === product.category_id)?.name || "Store"}
                           </span>
                           
                           {variant?.packaging && variant.packaging.length > 0 && (
                             <span className="absolute top-2 right-2 h-6 w-6 sm:h-10 sm:w-10 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200 flex items-center justify-center">
                               <Layers className="h-2.5 w-2.5 sm:h-4 w-4" />
                             </span>
                           )}
                        </Link>
                        
                        <Link 
                          href={product.is_service && product.name.toLowerCase().includes('printing') ? '/print-portal' : `/shop/${product.id}`} 
                          className="block flex-1 px-1 group-hover:text-indigo-600 transition-colors"
                        >
                          <h3 className="font-outfit text-sm sm:text-3xl font-black text-slate-900 line-clamp-2 leading-tight tracking-tight">{product.name}</h3>
                        </Link>
                        
                        <div className="mt-4 sm:mt-8 space-y-3 sm:space-y-4 bg-slate-50/50 p-3 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-white">
                          <div className="flex flex-col sm:flex-row gap-2">
                             <div className="flex-1">
                                <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2 ml-1 sm:ml-2">Unit</p>
                                <select 
                                 value={selectedUnits[product.id] || ''} 
                                 onChange={e => setSelectedUnits({...selectedUnits, [product.id]: e.target.value})}
                                 className="w-full bg-white border-2 border-slate-50 rounded-xl sm:rounded-2xl px-2 sm:px-4 h-8 sm:h-12 text-[10px] sm:text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-100 transition-all appearance-none cursor-pointer"
                                >
                                  <option value="">Piece</option>
                                  {variant?.packaging?.map(u => (
                                    <option key={u.id} value={u.id}>{u.unit_name}</option>
                                  ))}
                                </select>
                             </div>
                             <div className="w-full sm:w-24">
                                <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2 ml-1 sm:ml-2">Qty</p>
                                <input 
                                  type="number" 
                                  min="1"
                                  value={quantities[product.id] || 1}
                                  onChange={e => setQuantities({...quantities, [product.id]: Number(e.target.value)})}
                                  className="w-full bg-white border-2 border-slate-50 rounded-xl sm:rounded-2xl px-2 sm:px-4 h-8 sm:h-12 text-[10px] sm:text-xs font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-100 transition-all text-center"
                                />
                             </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 sm:mt-8 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[7px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] sm:tracking-[0.3em]">Price</span>
                            <span className="text-lg sm:text-4xl font-black text-indigo-600 tracking-tighter italic">
                              {(selectedUnits[product.id] ? 
                                variant?.packaging?.find(u => u.id === selectedUnits[product.id])?.selling_price : 
                                variant?.selling_price || 0
                              )?.toLocaleString()} 
                              <span className="text-[8px] sm:text-xs ml-0.5 sm:ml-1 tracking-normal font-bold">RWF</span>
                            </span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (product.is_service && product.name.toLowerCase().includes('printing')) {
                                window.location.href = '/print-portal';
                              } else {
                                handleAddToCart(product);
                              }
                            }}
                            className="group h-10 w-10 sm:h-20 sm:w-20 relative flex items-center justify-center rounded-xl sm:rounded-[2.2rem] bg-indigo-600 text-white shadow-lg sm:shadow-2xl shadow-indigo-100 hover:bg-emerald-500 hover:shadow-emerald-100 hover:scale-105 active:scale-95 transition-all overflow-hidden"
                          >
                            {product.is_service && product.name.toLowerCase().includes('printing') ? (
                              <Zap className="h-4 w-4 sm:h-7 sm:w-7 relative z-10 transition-all group-hover:scale-125" />
                            ) : (
                              <ShoppingCart className="h-4 w-4 sm:h-7 sm:w-7 relative z-10 transition-all group-hover:scale-125" />
                            )}
                            <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-all duration-500" />
                          </button>
                        </div>
                      </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex h-96 flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-200" />
          <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Initializing Market...</p>
        </div>
      }>
        <ShopContent />
      </Suspense>
    </AppShell>
  );
}

function CategoryButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-[1.5rem] px-8 py-5 text-left text-sm font-bold transition-all border-2 outline-none",
        active 
        ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 border-indigo-600' 
        : 'bg-white text-slate-500 border-slate-50 hover:border-indigo-100 hover:bg-indigo-50/10'
      )}
    >
      {label}
    </button>
  );
}

function CategoryRibbonButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-[1.2rem] px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-all border-2 outline-none",
        active 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 border-indigo-600' 
        : 'bg-white text-slate-500 border-slate-100 active:bg-slate-50'
      )}
    >
      {label}
    </button>
  );
}

// Wrapper for Public Shell
function AppShell({ children }: { children: React.ReactNode }) {
    return <PublicShell>{children}</PublicShell>;
}
