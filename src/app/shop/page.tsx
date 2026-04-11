"use client";

import React, { useEffect, useState } from 'react';
import { PublicShell } from '@/components/layout/PublicShell';
import { productService } from '@/lib/services/product-service';
import { categoryService } from '@/lib/services/category-service';
import { Product, Category, ProductVariant, ProductPackaging } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Filter, 
  ShoppingCart, 
  Grid, 
  List, 
  ChevronDown,
  Loader2,
  Sparkles,
  Tag,
  X,
  Package,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/components/providers/CartProvider';
import Link from 'next/link';

type SortOption = 'newest' | 'price_asc' | 'price_desc';

export default function ShopPage() {
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
    loadData();
  }, [activeCategoryId, sortBy, q]);

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
    <AppShell>
      <div className="min-h-screen pt-32 pb-20 bg-[#FDFDFD]">
        <div className="mx-auto max-w-7xl px-6">
          {/* Shop Header */}
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="font-outfit text-6xl font-black tracking-tight text-[#1A1C1E]">
                {q ? `Results: ${q}` : 'Abelus Shop'}
              </h1>
              <p className="mt-4 text-slate-500 font-medium flex items-center gap-3">
                {q ? (
                  <button 
                    onClick={() => router.push('/shop')}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
                  >
                    Clear Search <X className="h-3 w-3" />
                  </button>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" /> 
                    Found {products.length} premium variations for you
                  </>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="relative">
                 <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-4 rounded-2xl border bg-white px-6 h-14 text-sm font-bold hover:bg-slate-50 transition-all whitespace-nowrap shadow-sm"
                 >
                    Sort: {sortLabels[sortBy]}
                    <ChevronDown className={cn("h-4 w-4 transition-transform text-slate-400", isSortOpen && "rotate-180")} />
                 </button>

                 {isSortOpen && (
                   <div className="absolute right-0 mt-3 w-64 rounded-[2rem] border bg-white/90 backdrop-blur-xl p-3 shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200">
                     {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                       <button
                         key={option}
                         onClick={() => { setSortBy(option); setIsSortOpen(false); }}
                         className={cn(
                           "flex w-full items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all",
                           sortBy === option ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "hover:bg-slate-100 text-slate-500"
                         )}
                       >
                         {sortLabels[option]}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-16">
            {/* Expanded Sidebar */}
            <aside className="w-full lg:w-72 space-y-12">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="font-outfit text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Department
                </h4>
                <div className="flex flex-wrap lg:flex-col gap-3">
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
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 xl:grid-cols-3 pb-32">
                  {products.map((product) => {
                    const variant = product.variants?.[0]; // Current view assumes default variant
                    return (
                      <div 
                        key={product.id}
                        className="group flex flex-col rounded-[3rem] border border-slate-100 bg-white p-7 transition-all hover:shadow-3xl hover:shadow-indigo-200/30 hover:-translate-y-2 relative"
                      >
                        {/* Image Placeholder / Tag UI */}
                        <Link href={`/shop/${product.id}`} className="relative aspect-square mb-8 overflow-hidden rounded-[2.2rem] bg-[#F9FBFF] group-hover:bg-indigo-50 transition-all duration-500 flex items-center justify-center border border-slate-50">
                           {product.image_url ? (
                             <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                           ) : (
                             <div className="text-slate-200 group-hover:scale-110 transition-transform duration-500">
                               <Package className="h-20 w-20" />
                             </div>
                           )}
                           <span className="absolute top-6 left-6 rounded-2xl bg-white/90 backdrop-blur-xl px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] shadow-sm border border-slate-100 text-slate-500">
                             {categories.find(c => c.id === product.category_id)?.name || "Premium Store"}
                           </span>
                           
                           {variant?.packaging && variant.packaging.length > 0 && (
                             <span className="absolute top-6 right-6 p-2 rounded-full bg-emerald-500 text-white shadow-lg animate-in zoom-in-0 flex items-center gap-1.5 px-3">
                               <Layers className="h-3 w-3" />
                               <span className="text-[8px] font-black uppercase">Multi-Unit</span>
                             </span>
                           )}
                        </Link>
                        
                        <Link href={`/shop/${product.id}`} className="block flex-1 px-1 group-hover:text-indigo-600 transition-colors">
                          <h3 className="font-outfit text-2xl font-black text-slate-900 line-clamp-2 leading-tight tracking-tight">{product.name}</h3>
                        </Link>
                          
                        <div className="mt-8 space-y-4 bg-slate-50/50 p-5 rounded-[2rem] border border-slate-50">
                          <div className="flex gap-2">
                             <div className="flex-1">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-2">Choose Unit</p>
                                <select 
                                 value={selectedUnits[product.id] || ''} 
                                 onChange={e => setSelectedUnits({...selectedUnits, [product.id]: e.target.value})}
                                 className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                >
                                  <option value="">Base (Piece)</option>
                                  {variant?.packaging?.map(u => (
                                    <option key={u.id} value={u.id}>{u.unit_name} (×{u.conversion_factor})</option>
                                  ))}
                                </select>
                             </div>
                             <div className="w-24">
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-2">How many?</p>
                                <input 
                                  type="number" 
                                  min="1"
                                  value={quantities[product.id] || 1}
                                  onChange={e => setQuantities({...quantities, [product.id]: Number(e.target.value)})}
                                  className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-center"
                                />
                             </div>
                          </div>
                        </div>
                          
                        <div className="mt-8 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Investment</span>
                            <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                              {(selectedUnits[product.id] ? 
                                variant?.packaging?.find(u => u.id === selectedUnits[product.id])?.selling_price : 
                                variant?.selling_price || 0
                              )?.toLocaleString()} 
                              <span className="text-xs ml-1 tracking-normal font-bold">RWF</span>
                            </span>
                          </div>
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="group h-16 w-16 relative flex items-center justify-center rounded-[1.8rem] bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all overflow-hidden"
                          >
                            <ShoppingCart className="h-6 w-6 relative z-10 transition-transform group-hover:rotate-12" />
                            <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
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
    </AppShell>
  );
}

function CategoryButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-2xl px-6 py-3.5 text-left text-sm font-bold transition-all border outline-none",
        active 
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 border-indigo-600' 
        : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10'
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
