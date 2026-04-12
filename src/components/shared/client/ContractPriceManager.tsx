"use client";

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  RotateCcw, 
  Check, 
  Loader2,
  Search,
  Plus,
  Info,
  PackageSearch,
  ChevronRight,
  Trash2,
  Layers,
  Box,
  Hash,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product, ContractPrice, ProductVariant, ProductPackaging } from '@/types';

interface PriceRowProps {
  productName: string;
  variantAttrs: Record<string, any>;
  unitName: string;
  basePrice: number;
  contractPrice?: number;
  onUpdate: (price: number, sync: boolean) => Promise<void>;
  onRemove: () => Promise<void>;
  loading: boolean;
}

export function PriceRow({ productName, variantAttrs, unitName, basePrice, contractPrice, onUpdate, onRemove, loading }: PriceRowProps) {
  const [val, setVal] = useState<number>(contractPrice || basePrice || 0);
  const [sync, setSync] = useState(true);
  const changed = val !== (contractPrice || basePrice);

  const attrString = Object.values(variantAttrs).join(' ');

  return (
    <tr className="hover:bg-slate-50/50 transition-all group border-b border-slate-50 last:border-0 relative">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-slate-950 flex items-center justify-center text-white shadow-lg shrink-0 border border-slate-800">
            <Box className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 font-outfit truncate uppercase leading-tight">{productName}</p>
            {attrString && (
              <div className="flex gap-1 mt-1">
                 {Object.entries(variantAttrs).map(([k, v]) => (
                   <span key={k} className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-slate-100 bg-white text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100">{v}</span>
                 ))}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-[10px] font-black px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 uppercase tracking-widest border border-indigo-100 text-nowrap">{unitName}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col items-end gap-1">
          <div className="relative group/input">
            <input 
              type="number" 
              value={val}
              onChange={e => setVal(Number(e.target.value))}
              className={cn(
                "w-28 bg-slate-50 border rounded-lg px-2 py-1.5 text-right font-black text-xs outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-100",
                changed ? "border-indigo-600 text-indigo-600" : "border-slate-100 text-slate-700"
              )}
            />
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex flex-col items-end">
           <p className="text-[10px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{basePrice.toLocaleString()}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
          {changed ? (
             <button 
              disabled={loading}
              onClick={() => onUpdate(val, sync)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Check className="h-3 w-3" /> Commit</>}
            </button>
          ) : (
            <button 
              onClick={onRemove}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-100 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

interface ContractPriceManagerProps {
  clientId: string;
  products: Product[];
  contractPrices: ContractPrice[];
  onPriceUpdate: (productId: string, variantId: string | undefined, unitId: string | undefined, price: number, sync: boolean) => Promise<void>;
  onPriceDelete: (contractId: string) => Promise<void>;
  reconciling: string | null;
}

export function ContractPriceManager({ products, contractPrices, onPriceUpdate, onPriceDelete, reconciling }: ContractPriceManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchableRegistry = useMemo(() => {
    const list: any[] = [];
    products.forEach(p => {
      p.variants?.forEach(v => {
        list.push({
          p, v, u: null,
          id: `${v.id}-base`,
          displayName: `${p.name} ${Object.values(v.attributes).join(' ')}`,
          unitName: 'Piece',
          price: v.selling_price
        });
        v.packaging?.forEach(u => {
          list.push({
            p, v, u,
            id: u.id,
            displayName: `${p.name} ${Object.values(v.attributes).join(' ')}`,
            unitName: u.unit_name,
            price: u.selling_price
          });
        });
      });
    });
    return list;
  }, [products]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return searchableRegistry
      .filter(item => item.displayName.toLowerCase().includes(term))
      .filter(item => !contractPrices.some(cp => 
        cp.product_id === item.p.id && 
        cp.variant_id === item.v.id && 
        (cp.unit_id === (item.u?.id || null))
      ))
      .slice(0, 5);
  }, [searchableRegistry, searchTerm, contractPrices]);

  const activeContracts = useMemo(() => {
    return contractPrices.map(cp => {
      const p = products.find(p => p.id === cp.product_id);
      const v = p?.variants?.find(v => v.id === cp.variant_id);
      const u = v?.packaging?.find(u => u.id === cp.unit_id);
      
      return {
        cp, p, v, u,
        basePrice: u ? u.selling_price : (v ? v.selling_price : 0),
        unitName: u ? u.unit_name : 'Piece'
      };
    }).filter(item => item.p);
  }, [contractPrices, products]);

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
      {/* Search & Discovery High-End Header */}
      <div className="relative group">
         <div className="bg-slate-950 rounded-2xl p-5 text-white shadow-xl relative border border-slate-800">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-transform group-hover:scale-125 duration-1000" />
            <Zap className="absolute -left-1 -bottom-1 h-12 w-12 text-white/5 -rotate-12 pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
               <div className="flex-1 space-y-0.5">
                  <h3 className="text-lg font-black font-outfit tracking-tighter leading-tight">Master Contract Ledger</h3>
                  <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <Layers className="h-3 w-3" /> Negotiated Configuration
                  </p>
               </div>
               
               <div className="relative flex-[1.2]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                  <input 
                    type="text" 
                    placeholder="Search SKU or Attributes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs font-black text-white focus:bg-white focus:text-slate-950 focus:ring-4 focus:ring-indigo-600/10 outline-none transition-all placeholder:text-slate-700"
                  />
                  
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-[0_32px_96px_-16px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300">
                       <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase">Registry Matches</span>
                          <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">Discovery Engine</span>
                       </div>
                       <div className="divide-y divide-slate-50">
                        {searchResults.map(item => (
                            <button 
                              key={item.id}
                              onClick={() => {
                                 onPriceUpdate(item.p.id, item.v.id, item.u?.id, item.price, false);
                                 setSearchTerm('');
                              }}
                              className="w-full p-5 flex items-center justify-between text-left hover:bg-indigo-50/30 transition-all group/res"
                            >
                               <div className="flex items-center gap-5">
                                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover/res:bg-indigo-600 group-hover/res:text-white transition-all">
                                    <Plus className="h-5 w-5" />
                                  </div>
                                  <div>
                                     <p className="text-xs font-black text-slate-900 group-hover/res:text-indigo-600 transition-colors uppercase tracking-tight">{item.displayName}</p>
                                     <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100">{item.unitName}</span> 
                                        <span className="flex items-center gap-1.5 text-indigo-500 font-black tracking-normal">Retail: {Number(item.price).toLocaleString()} RWF</span>
                                     </p>
                                  </div>
                               </div>
                               <ChevronRight className="h-4 w-4 text-slate-200 group-hover/res:text-indigo-400 group-hover/res:translate-x-1 transition-all" />
                            </button>
                        ))}
                       </div>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end px-2 border-l-2 border-indigo-600">
           <div className="space-y-0.5">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-tight">Active Negotiated Terms</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{activeContracts.length} Registry Entries Active</p>
           </div>
           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Enforced</span>
           </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
           <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                       <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Variation</th>
                       <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Unit</th>
                       <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Contract</th>
                       <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Base</th>
                       <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Control</th>
                    </tr>
                 </thead>
              <tbody className="divide-y divide-slate-50">
                 {activeContracts.map((item, idx) => {
                    const uniqueId = `${item.cp.product_id}-${item.cp.variant_id}-${item.cp.unit_id || 'base'}`;
                    const isUpdating = reconciling === uniqueId;
                    return (
                       <PriceRow 
                         key={item.cp.id}
                         productName={item.p?.name || ''}
                         variantAttrs={item.v?.attributes || {}}
                         unitName={item.unitName}
                         basePrice={item.basePrice}
                         contractPrice={item.cp.negotiated_price}
                         onUpdate={(p, sync) => onPriceUpdate(item.p!.id, item.v?.id, item.u?.id, p, sync)}
                         onRemove={() => onPriceDelete(item.cp.id)}
                         loading={isUpdating}
                       />
                    );
                 })}
                 {activeContracts.length === 0 && (
                    <tr>
                       <td colSpan={5} className="py-24 text-center">
                          <PackageSearch className="h-16 w-16 mx-auto mb-4 text-slate-100" />
                          <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] italic">No active pricing contracts detected</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest italic">Use investigation discovery above to add terms</p>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
          </div>
        </div>
      </div>
    </div>
  );
}
