"use client";

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Users, 
  CreditCard, 
  Banknote,
  Upload,
  ChevronRight,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Loader2,
  Layers,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductVariant, ProductPackaging, MarketClient, ContractPrice } from '@/types';
import { productService } from '@/lib/services/product-service';
import { clientService } from '@/lib/services/client-service';
import { posService, CartItem } from '@/lib/services/pos-service';
import { useAuth } from '@/components/providers/AuthProvider';

export default function POSPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [clientType, setClientType] = useState<'individual' | 'market'>('individual');
  const [selectedMarket, setSelectedMarket] = useState<MarketClient | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [markets, setMarkets] = useState<MarketClient[]>([]);
  const [contractPrices, setContractPrices] = useState<ContractPrice[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'momo' | 'credit'>('cash');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Local selection state for adding to cart
  const [selectedQty, setSelectedQty] = useState<Record<string, number>>({});
  const [selectedUnit, setSelectedUnit] = useState<Record<string, string>>({}); // unit_id
  const [selectedVariantId, setSelectedVariantId] = useState<Record<string, string>>({});

  useEffect(() => {
    initPOS();
  }, []);

  useEffect(() => {
    if (selectedMarket) {
      fetchContractPrices(selectedMarket.id);
    }
  }, [selectedMarket]);

  const initPOS = async () => {
    setLoading(true);
    const [pData, mData] = await Promise.all([
      productService.getAll(),
      clientService.getAll()
    ]);
    if (pData) setProducts(pData);
    if (mData) setMarkets(mData);
    setLoading(false);
  };

  const fetchContractPrices = async (clientId: string) => {
    const data = await productService.getContractPrices(clientId);
    if (data) setContractPrices(data);
  };

  const getPriceForSelection = (product: Product, variant: ProductVariant, unit?: ProductPackaging) => {
    // 1. Check for contract price first (if applicable to this variant)
    if (clientType === 'market' && selectedMarket) {
      const contract = contractPrices.find(cp => cp.product_id === product.id);
      if (contract) return Number(contract.negotiated_price);
    }

    // 2. If a specific unit (like Packet) is selected, use its price
    if (unit) {
      return Number(unit.selling_price);
    }

    // 3. Fallback to base selling price
    return Number(variant.selling_price);
  };

  const addToCart = (product: Product) => {
    // Find selected variant or default
    const vId = selectedVariantId[product.id];
    const variant = product.variants?.find(v => v.id === vId) || 
                   product.variants?.find(v => v.is_default) || 
                   product.variants?.[0];
                   
    if (!variant) return;

    const unitId = selectedUnit[product.id];
    const unit = variant.packaging?.find(u => u.id === unitId);
    const qty = selectedQty[product.id] || 1;
    const price = getPriceForSelection(product, variant, unit);

    setCart(prev => {
      const cartId = `${variant.id}-${unitId || 'base'}`;
      const existing = prev.find(item => `${item.variant.id}-${item.unit?.id || 'base'}` === cartId);
      
      if (existing) {
        return prev.map(item => `${item.variant.id}-${item.unit?.id || 'base'}` === cartId 
          ? { ...item, quantity: item.quantity + qty } 
          : item
        );
      }
      return [...prev, { product, variant, unit, quantity: qty, price, wishes: {} }];
    });

    // Reset local selection for this product
    setSelectedQty(prev => ({ ...prev, [product.id]: 1 }));
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart(prev => prev.map((item, i) => {
      if (i === idx) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  const handleComplete = async () => {
    if (!user) return;
    setSubmitting(true);
    
    const result = await posService.submitTransaction({
      userId: user.id,
      clientId: selectedMarket?.id,
      customerName: clientType === 'individual' ? customerName : selectedMarket?.org_name,
      items: cart,
      totalAmount: total,
      paymentMethod,
      amountPaid: paymentMethod === 'credit' ? 0 : total,
      source: 'pos'
    });

    if (result.success) {
      alert('Transaction completed successfully!');
      setCart([]);
      setStep(1);
      setSelectedMarket(null);
      setCustomerName('');
      initPOS();
    } else {
      alert('Error: ' + result.error);
    }
    setSubmitting(false);
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-140px)] gap-8 animate-fade-in relative bg-slate-50/50 p-6 rounded-[2.5rem]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md z-50 rounded-[2.5rem]">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        )}

        {/* Left Column: Product Selection Expansion */}
        <div className="flex flex-1 flex-col gap-6">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Start typing or scan barcode..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-[1.5rem] border-0 bg-white shadow-xl shadow-slate-200/50 py-5 pl-14 pr-6 text-lg font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto pr-2 pb-10 scrollbar-hide">
            {filteredProducts.map(product => {
              const currentVId = selectedVariantId[product.id] || product.variants?.find(v => v.is_default)?.id || product.variants?.[0].id;
              const variant = product.variants?.find(v => v.id === currentVId) || product.variants?.[0]; 
              
              const displayStock = variant?.stock_quantity ?? product.stock_quantity ?? 0;
              const displayPrice = variant?.selling_price ?? product.selling_price ?? 0;
              return (
                <div 
                  key={product.id}
                  className="group relative flex flex-col rounded-[2rem] border-0 bg-white p-5 text-left transition-all hover:shadow-2xl hover:shadow-indigo-200/50 active:scale-[0.99] shadow-lg shadow-slate-200/40"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-all overflow-hidden border border-slate-100 shadow-sm">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <ShoppingCart className="h-8 w-8" />
                      )}
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Pieces</span>
                       <p className={cn("text-lg font-black", displayStock <= 10 ? "text-red-500" : "text-emerald-500")}>{displayStock}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">{product.name}</h3>
                  <p className="mt-1 text-xs font-bold text-indigo-600/70 uppercase tracking-tighter italic">Piece Price: {variant?.selling_price.toLocaleString()} RWF</p>

                  {/* Variant Selection Chips */}
                  {product.has_variants && product.variants && product.variants.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {product.variants.map(v => {
                        const attrLabel = Object.values(v.attributes).join(' ');
                        const isSelected = (selectedVariantId[product.id] || product.variants?.find(v => v.is_default)?.id || product.variants?.[0].id) === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariantId(prev => ({ ...prev, [product.id]: v.id }))}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border transition-all",
                              isSelected 
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" 
                                : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600"
                            )}
                          >
                            {attrLabel}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Volume Selection UI */}
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="grid grid-cols-10 gap-2">
                       <div className="col-span-7">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1 ml-1">Volume unit</label>
                          <select 
                            value={selectedUnit[product.id] || ''} 
                            onChange={e => setSelectedUnit({...selectedUnit, [product.id]: e.target.value})}
                            className="w-full rounded-xl bg-slate-50 border-0 py-2.5 px-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 truncate"
                          >
                            <option value="">Piece</option>
                            {variant?.packaging?.map(unit => (
                              <option key={unit.id} value={unit.id}>{unit.unit_name} ({unit.conversion_factor})</option>
                            ))}
                          </select>
                       </div>
                       <div className="col-span-3">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1 ml-1">Qty</label>
                          <input 
                            type="number" 
                            min="1"
                            value={selectedQty[product.id] || 1}
                            onChange={e => setSelectedQty({...selectedQty, [product.id]: Number(e.target.value)})}
                            className="w-full rounded-xl bg-slate-50 border-0 py-2.5 px-3 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20"
                          />
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={displayStock <= 0}
                      className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-lg hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                      Add to Transaction
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: High-End Checkout Cart */}
        <div className="flex w-[420px] flex-col rounded-[2.5rem] border-0 bg-white shadow-2xl shadow-indigo-200/50 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/20 flex justify-between items-center">
            <h3 className="text-xl font-black font-outfit text-slate-900 tracking-tight">Active Ledger</h3>
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
               <Hash className="h-3 w-3 text-indigo-500"/>
               <span className="text-xs font-bold text-slate-600">{cart.length}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            {step === 1 ? (
              cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                   <ShoppingCart className="h-16 w-16 mb-4 text-slate-300" />
                   <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Empty Ledger</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                   {cart.map((item, idx) => (
                    <div key={idx} className="group relative flex items-center gap-4 rounded-3xl bg-slate-50/50 hover:bg-white p-4 border border-transparent hover:border-indigo-100 transition-all shadow-sm">
                      <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 border border-slate-100 shadow-sm">
                         <Package className="h-6 w-6"/>
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2">
                           <p className="text-sm font-bold text-slate-900 truncate">{item.product.name}</p>
                           {Object.keys(item.variant.attributes).length > 0 && (
                             <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase">
                               {Object.values(item.variant.attributes).join(' ')}
                             </span>
                           )}
                         </div>
                         <p className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest mt-0.5">{item.unit?.unit_name || 'Piece'}</p>
                         <p className="text-[10px] font-bold text-slate-400 mt-1">{item.price.toLocaleString()} RWF / unit</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <button onClick={() => updateCartQty(idx, -1)} className="p-1.5 rounded-lg border bg-white text-slate-400 hover:text-indigo-600 transition-all"><Minus className="h-3 w-3"/></button>
                         <span className="text-sm font-black text-slate-900 w-6 text-center">{item.quantity}</span>
                         <button onClick={() => updateCartQty(idx, 1)} className="p-1.5 rounded-lg border bg-white text-slate-400 hover:text-indigo-600 transition-all"><Plus className="h-3 w-3"/></button>
                      </div>
                      <button onClick={() => removeFromCart(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><X className="h-4 w-4"/></button>
                    </div>
                  ))}
                </div>
              )
            ) : step === 2 ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Channel Selection</label>
                  <div className="grid grid-cols-1 gap-3">
                    <PaymentButton active={paymentMethod === 'cash'} onClick={() => setPaymentMethod('cash')} icon={Banknote} label="Settled in Cash" sub="Immediate physical currency" />
                    <PaymentButton active={paymentMethod === 'momo'} onClick={() => setPaymentMethod('momo')} icon={Upload} label="Mobile Money" sub="MTN/Airtel digital transfer" />
                    <PaymentButton active={paymentMethod === 'credit'} onClick={() => setPaymentMethod('credit')} icon={CreditCard} label="Credit Ledger" sub="Mark as outstanding debt" />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-slate-50">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Customer Context</label>
                   <input 
                     type="text" 
                     placeholder="Customer full name..." 
                     value={customerName}
                     onChange={(e) => setCustomerName(e.target.value)}
                     className="w-full rounded-2xl bg-slate-50 border-0 py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                   />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <CheckCircle2 className="h-24 w-24" />
                   </div>
                   <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Total Amount Due</p>
                   <h2 className="text-4xl font-black tracking-tighter mb-6">{total.toLocaleString()} RWF</h2>
                   <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-2xl w-fit">
                      <Banknote className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{paymentMethod} Payment</span>
                   </div>
                </div>
                
                <div className="px-4 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient</span>
                    <span className="text-sm font-bold text-slate-600">{customerName || "Walk-in Customer"}</span>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Itemized Review</label>
                    <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                              {Object.keys(item.variant.attributes).length > 0 && (
                                <span className="text-[8px] font-black px-1 py-0.5 rounded bg-white text-indigo-600 border border-indigo-100 uppercase">
                                  {Object.values(item.variant.attributes).join(' ')}
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5">{item.quantity} × {item.unit?.unit_name || 'Piece'}</p>
                          </div>
                          <p className="text-xs font-black text-slate-900">{(item.price * item.quantity).toLocaleString()} RWF</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Steps Control */}
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-6">
             <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Grand Total</span>
                <div className="text-right">
                   <p className="text-3xl font-black text-slate-900 tracking-tighter">{total.toLocaleString()} RWF</p>
                   <p className="text-[10px] font-bold text-indigo-600 uppercase">Inc. dynamic packaging</p>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <button 
                  onClick={() => step === 3 ? handleComplete() : setStep(prev => prev + 1)}
                  disabled={cart.length === 0 || submitting}
                  className="w-full py-4 rounded-3xl bg-indigo-600 text-sm font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                       {step === 3 ? "Process Transaction" : step === 2 ? "Next: Review Order" : "Next: Payment Method"}
                       <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                {step > 1 && (
                  <button onClick={() => setStep(prev => prev - 1)} className="text-xs font-bold text-slate-400 uppercase tracking-widest italic hover:text-indigo-600 transition-colors">Go Back</button>
                )}
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PaymentButton({ active, onClick, icon: Icon, label, sub }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
        active ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 bg-white hover:border-slate-200"
      )}
    >
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400")}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
      </div>
    </button>
  );
}

function Package({ className }: { className?: string }) {
  return <ShoppingCart className={className} />;
}
