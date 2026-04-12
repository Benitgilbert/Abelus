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
  const [step, setStep] = useState(0); // 0: Select Type, 1: ID Client (if needed), 2: Cart, 3: Checkout, 4: Review
  const [clientType, setClientType] = useState<'individual' | 'market' | 'abonne'>('individual');
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
  const [amountPaidOverride, setAmountPaidOverride] = useState<number | null>(null);
  
  // Printing Audit States (for "Printing Services" card)
  const [posBwPages, setPosBwPages] = useState(0);
  const [posColorPages, setPosColorPages] = useState(0);
  const [posBinding, setPosBinding] = useState(false);
  const [posEditing, setPosEditing] = useState(false);
  const [posBwActive, setPosBwActive] = useState(true);
  const [posColorActive, setPosColorActive] = useState(false);
  const [posBwRate, setPosBwRate] = useState(30);
  const [posColorRate, setPosColorRate] = useState(50);
  const [posBindingRate, setPosBindingRate] = useState(500);
  const [posEditingRate, setPosEditingRate] = useState(1000);
  const [isPrintingModalOpen, setIsPrintingModalOpen] = useState(false);
  const [activePrintingProduct, setActivePrintingProduct] = useState<Product | null>(null);

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
    // 1. Check for granular contract price first (Product + Variant + Unit)
    if ((clientType === 'market' || clientType === 'abonne') && selectedMarket) {
      const contract = contractPrices.find(cp => 
        cp.product_id === product.id && 
        cp.variant_id === variant.id && 
        (cp.unit_id === (unit?.id || null))
      );
      if (contract) return Number(contract.negotiated_price);
    }

    // 2. If a specific unit (like Packet) is selected, use its price
    if (unit) {
      return Number(unit.selling_price);
    }

    // 3. Fallback to base pricing (Retail or selling)
    return Number(variant.selling_price);
  };

  const addToCart = (product: Product) => {
    const isPrinting = product.name.toLowerCase().includes('printing');

    // Find selected variant or default
    const vId = selectedVariantId[product.id];
    const variant = product.variants?.find(v => v.id === vId) || 
                   product.variants?.find(v => v.is_default) || 
                   product.variants?.[0];
                   
    if (!variant) return;

    if (isPrinting) {
      const price = calculatePosPrintPrice();
      const wishes = {
        bw: posBwActive ? posBwPages : 0,
        color: posColorActive ? posColorPages : 0,
        binding: posBinding,
        editing: posEditing
      };

      setCart(prev => [
        ...prev, 
        { product, variant, quantity: 1, price, wishes }
      ]);
      return;
    }

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

  const updateCartPrice = (idx: number, newPrice: number) => {
    setCart(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, price: Math.max(0, newPrice) };
      }
      return item;
    }));
  };

  // --- NEW: Printing Specific Calculation ---
  const calculatePosPrintPrice = () => {
    let total = 0;
    if (posBwActive) total += (posBwPages * posBwRate);
    if (posColorActive) total += (posColorPages * posColorRate);
    if (posBinding) total += posBindingRate;
    if (posEditing) total += posEditingRate;
    return total;
  };

   const handleComplete = async () => {
    if (!user) return;
    setSubmitting(true);
    
    // For Abonne, if amountPaidOverride is set, use it. Otherwise use total (which could be 0 if credit)
    const finalAmountPaid = (clientType === 'abonne' && amountPaidOverride !== null) 
      ? amountPaidOverride 
      : (paymentMethod === 'credit' ? 0 : total);

    const result = await posService.submitTransaction({
      userId: user.id,
      clientId: selectedMarket?.id,
      customerName: clientType === 'individual' ? 'Walk-in Customer' : selectedMarket?.org_name,
      items: cart,
      totalAmount: total,
      paymentMethod,
      amountPaid: finalAmountPaid,
      source: 'pos'
    });

    if (result.success) {
      alert('Transaction completed successfully!');
      setCart([]);
      setStep(0);
      setSelectedMarket(null);
      setCustomerName('');
      setAmountPaidOverride(null);
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
      <div className="flex h-full gap-5 animate-fade-in relative bg-slate-50/50 p-4 rounded-[1.5rem] lg:rounded-[2.5rem]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md z-50 rounded-[2.5rem]">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        )}

        {/* Left Column: Product Selection expansion */}
        <div className="flex flex-1 flex-col gap-6 relative">
          {/* Client-First Overlay Block */}
          {step < 2 && (
            <div className="absolute inset-x-0 bottom-0 top-[88px] z-40 flex items-center justify-center rounded-[2rem] bg-white/40 backdrop-blur-md border-2 border-dashed border-indigo-200">
               <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-4 max-w-sm text-center">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                     <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Client Selection Required</h3>
                    <p className="text-sm font-bold text-slate-400 mt-2">Please select a Client Type on the right to start this transaction.</p>
                  </div>
                  <div className="animate-bounce mt-4">
                     <ChevronRight className="h-8 w-8 text-indigo-600 rotate-90 sm:rotate-0" />
                  </div>
               </div>
            </div>
          )}

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
              const isPrinting = product.name.toLowerCase().includes('printing');
              const currentVId = selectedVariantId[product.id] || product.variants?.find(v => v.is_default)?.id || product.variants?.[0].id;
              const variant = product.variants?.find(v => v.id === currentVId) || product.variants?.[0]; 
              
              const displayStock = variant?.stock_quantity ?? product.stock_quantity ?? 0;
              const displayPrice = isPrinting ? calculatePosPrintPrice() : (variant?.selling_price ?? product.selling_price ?? 0);

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
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isPrinting ? 'Audit Active' : 'Total Pieces'}</span>
                       <p className={cn("text-lg font-black", displayStock <= 10 && !isPrinting ? "text-red-500" : "text-emerald-500")}>
                         {isPrinting ? displayPrice.toLocaleString() : displayStock}
                       </p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-tight truncate">{product.name}</h3>
                  <p className="mt-1 text-xs font-bold text-indigo-600/70 uppercase tracking-tighter italic">
                     {isPrinting ? `Calculated Total: ${displayPrice} RWF` : `Piece Price: ${variant?.selling_price.toLocaleString()} RWF`}
                  </p>

                  {isPrinting ? (
                    <div className="mt-6 flex flex-col gap-3">
                       <button 
                         onClick={() => {
                           setActivePrintingProduct(product);
                           setIsPrintingModalOpen(true);
                         }}
                         className="w-full rounded-2xl bg-indigo-600 py-4 text-xs font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                       >
                          Configure Printing
                       </button>
                    </div>
                  ) : (
                    /* --- Standard Product UI --- */
                    <>
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
                    </>
                  )}
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
            {step === 0 ? (
               <div className="h-full flex flex-col justify-center gap-3 animate-in fade-in duration-500">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center mb-2">Sale Initialization</h4>
                  <TypeButton 
                    active={clientType === 'individual'} 
                    onClick={() => { setClientType('individual'); setStep(2); }}
                    icon={User}
                    label="Individual Walk-in"
                    sub="Quick retail sale (Cash/Momo)"
                  />
                  <TypeButton 
                    active={clientType === 'abonne'} 
                    onClick={() => { setClientType('abonne'); setStep(1); }}
                    icon={CreditCard}
                    label="Client Abonné"
                    sub="Subscriber / Market Contract (Credit allowed)"
                  />
               </div>
            ) : step === 1 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search subscriber list..." 
                    className="w-full rounded-2xl bg-slate-50 border-0 py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {markets.filter(m => m.org_name.toLowerCase().includes(searchTerm.toLowerCase())).map(client => (
                    <button 
                      key={client.id}
                      onClick={() => { setSelectedMarket(client); setStep(2); }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-600 hover:bg-indigo-50/30 transition-all text-left group"
                    >
                      <div>
                        <p className="text-sm font-black text-slate-900">{client.org_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.location || 'Kigali'}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(0)} className="w-full py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600">Back to Types</button>
              </div>
            ) : step === 2 ? (
              cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                   <ShoppingCart className="h-16 w-16 mb-4 text-slate-300" />
                   <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Empty Ledger</p>
                   <button onClick={() => setStep(0)} className="mt-4 text-[10px] font-black underline uppercase tracking-widest">Change Client</button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                   <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-4">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <User className="h-4 w-4"/>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Client</p>
                            <p className="text-xs font-bold text-slate-900">{selectedMarket?.org_name || 'Walk-in'}</p>
                         </div>
                      </div>
                      <button onClick={() => setStep(0)} className="text-[10px] font-black text-indigo-600 uppercase">Change</button>
                   </div>
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
                         <div className="flex items-center gap-1 mt-1">
                           <input 
                              type="number"
                              value={item.price}
                              onChange={(e) => updateCartPrice(idx, Number(e.target.value))}
                              className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-black text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-center"
                           />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RWF / unit</span>
                         </div>
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
            ) : step === 3 ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Channel Selection</label>
                  <div className="grid grid-cols-1 gap-3">
                    <PaymentButton active={paymentMethod === 'cash'} onClick={() => setPaymentMethod('cash')} icon={Banknote} label="Settled in Cash" sub="Immediate physical currency" />
                    <PaymentButton active={paymentMethod === 'momo'} onClick={() => setPaymentMethod('momo')} icon={Upload} label="Mobile Money" sub="MTN/Airtel digital transfer" />
                    {(clientType === 'market' || clientType === 'abonne') && (
                      <PaymentButton active={paymentMethod === 'credit'} onClick={() => setPaymentMethod('credit')} icon={CreditCard} label="Credit Ledger" sub="Mark as outstanding debt" />
                    )}
                  </div>
                </div>
                
                {clientType === 'abonne' && selectedMarket && (
                  <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 space-y-4">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Subscriber Account</label>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-full">ACTIVE</span>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-slate-600 italic mb-1 uppercase tracking-tighter">Existing Debt Balance</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">{Number(selectedMarket.debt_balance).toLocaleString()} RWF</p>
                     </div>
                     
                     <div className="pt-2 border-t border-indigo-100">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Amount Money Received</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder={total.toString()}
                            className="w-full rounded-2xl bg-white border-0 py-4 px-6 text-lg font-black text-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                            onChange={(e) => setAmountPaidOverride(Number(e.target.value))}
                          />
                          <p className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300 pointer-events-none">RWF</p>
                        </div>
                        {amountPaidOverride !== null && amountPaidOverride > total && (
                          <p className="mt-2 text-[10px] font-bold text-emerald-600 uppercase animate-pulse">
                            Extra {(amountPaidOverride - total).toLocaleString()} RWF will reduce past debt
                          </p>
                        )}
                        {amountPaidOverride !== null && amountPaidOverride < total && paymentMethod !== 'credit' && (
                          <p className="mt-2 text-[10px] font-bold text-amber-600 uppercase">
                            Missing {(total - amountPaidOverride).toLocaleString()} RWF will be added to debt
                          </p>
                        )}
                     </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className={cn(
                  "rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative",
                  clientType === 'abonne' ? "bg-slate-900" : "bg-indigo-600"
                )}>
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <CheckCircle2 className="h-24 w-24" />
                   </div>
                   <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Final Settlement Summary</p>
                   <h2 className="text-4xl font-black tracking-tighter mb-6">{total.toLocaleString()} RWF</h2>
                   <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
                        <Banknote className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{paymentMethod}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
                        <User className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{selectedMarket?.org_name || 'Walk-in'}</span>
                      </div>
                   </div>
                </div>
                
                <div className="px-4 space-y-4">
                  <div className="pt-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Itemized Review</label>
                    <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2 scrollbar-hide">
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

                  {clientType === 'abonne' && selectedMarket && (
                    <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400 uppercase tracking-tighter">Previous Debt</span>
                          <span className="text-slate-900">{Number(selectedMarket.debt_balance).toLocaleString()} RWF</span>
                       </div>
                       <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400 uppercase tracking-tighter">Current Payment</span>
                          <span className="text-emerald-600">{(amountPaidOverride ?? (paymentMethod === 'credit' ? 0 : total)).toLocaleString()} RWF</span>
                       </div>
                       <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-50">
                          <span className="text-slate-900 tracking-tight uppercase">New Balance</span>
                          <span className="text-indigo-600">
                             {(Number(selectedMarket.debt_balance) + (total - (amountPaidOverride ?? (paymentMethod === 'credit' ? 0 : total)))).toLocaleString()} RWF
                          </span>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Steps Control */}
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
             <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Grand Total</span>
                <div className="text-right">
                   <p className="text-3xl font-black text-slate-900 tracking-tighter">{total.toLocaleString()} RWF</p>
                   <p className="text-[10px] font-bold text-indigo-600 uppercase">Inc. dynamic packaging</p>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <button 
                  onClick={() => step === 4 ? handleComplete() : setStep(prev => prev + 1)}
                  disabled={(step === 2 && cart.length === 0) || (step === 1 && !selectedMarket) || submitting}
                  className="w-full py-4 rounded-3xl bg-indigo-600 text-sm font-black text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                       {step === 4 ? "Process Transaction" : step === 3 ? "Review Order" : step === 0 ? "Initialize Sale" : "Continue"}
                       <ChevronRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                {step > 0 && (
                  <button onClick={() => setStep(prev => prev === 2 && clientType === 'individual' ? 0 : prev - 1)} className="text-xs font-bold text-slate-400 uppercase tracking-widest italic hover:text-indigo-600 transition-colors">Go Back</button>
                )}
             </div>
          </div>
        </div>
      </div>
      {/* --- Specialized Printing Audit Modal --- */}
      <AnimatePresence>
        {isPrintingModalOpen && activePrintingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsPrintingModalOpen(false)}
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
             />
             <motion.div 
               initial={{ scale: 0.98, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.98, opacity: 0 }}
               className="relative z-10 w-full max-w-lg bg-background border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
             >
                <div className="h-16 border-b px-8 flex items-center justify-between bg-muted/10">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                         <Layers className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-black font-outfit uppercase tracking-wider">Printing Audit Workstation</h3>
                   </div>
                   <button onClick={() => setIsPrintingModalOpen(false)} className="h-8 w-8 rounded-lg hover:bg-muted transition-all flex items-center justify-center">
                      <X className="h-4 w-4" />
                   </button>
                </div>

                <div className="p-8 space-y-6">
                   <div className="flex flex-wrap gap-2">
                      <AuditChip active={posBwActive} onClick={() => setPosBwActive(!posBwActive)} color="bg-indigo-600" label="B&W" />
                      <AuditChip active={posColorActive} onClick={() => setPosColorActive(!posColorActive)} color="bg-rose-600" label="Color" />
                      <AuditChip active={posEditing} onClick={() => setPosEditing(!posEditing)} color="bg-amber-600" label="Editing" />
                      <AuditChip active={posBinding} onClick={() => setPosBinding(!posBinding)} color="bg-emerald-600" label="Binding" />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className={cn("space-y-1.5 transition-all", !posBwActive && "opacity-20 pointer-events-none grayscale")}>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">B&W Pages</label>
                         <input 
                            type="number" 
                            value={posBwPages} 
                            onChange={e => setPosBwPages(parseInt(e.target.value) || 0)}
                            className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 text-sm font-black focus:ring-2 focus:ring-indigo-500/20"
                         />
                      </div>
                      <div className={cn("space-y-1.5 transition-all", !posColorActive && "opacity-20 pointer-events-none grayscale")}>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Color Pages</label>
                         <input 
                            type="number" 
                            value={posColorPages} 
                            onChange={e => setPosColorPages(parseInt(e.target.value) || 0)}
                            className="w-full h-12 bg-slate-50 border-0 rounded-2xl px-4 text-sm font-black focus:ring-2 focus:ring-rose-500/20"
                         />
                      </div>
                   </div>

                   <div className="p-6 bg-indigo-600 rounded-[1.5rem] text-white shadow-xl shadow-indigo-100 flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Calculated Yield</p>
                         <p className="text-2xl font-black font-outfit">{calculatePosPrintPrice().toLocaleString()} <span className="text-xs">RWF</span></p>
                      </div>
                      <Layers className="h-8 w-8 opacity-20" />
                   </div>

                   <button 
                      onClick={() => {
                        addToCart(activePrintingProduct);
                        setIsPrintingModalOpen(false);
                        // Reset local audit state after adding
                        setPosBwPages(0);
                        setPosColorPages(0);
                        setPosBinding(false);
                        setPosEditing(false);
                      }}
                      className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-[0.98]"
                   >
                      Add to Transaction
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* --- Specialized Printing Audit Modal --- */}
      <AnimatePresence>
        {isPrintingModalOpen && activePrintingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsPrintingModalOpen(false)}
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
             />
             <motion.div 
               initial={{ scale: 0.98, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.98, opacity: 0 }}
               className="relative z-10 w-full max-w-lg bg-background border rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
             >
                <div className="h-20 border-b px-10 flex items-center justify-between bg-muted/10">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                         <Layers className="h-5 w-5" />
                      </div>
                      <div>
                         <h3 className="text-lg font-black font-outfit leading-tight">Printing Audit Workstation</h3>
                         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Configure Walk-in Service</p>
                      </div>
                   </div>
                   <button onClick={() => setIsPrintingModalOpen(false)} className="h-10 w-10 rounded-xl bg-white border flex items-center justify-center hover:bg-muted transition-all">
                      <X className="h-5 w-5 text-slate-400" />
                   </button>
                </div>

                <div className="p-10 space-y-6">
                   <div className="flex flex-wrap gap-2">
                      <AuditChip active={posBwActive} onClick={() => setPosBwActive(!posBwActive)} color="bg-indigo-600" label="B&W" />
                      <AuditChip active={posColorActive} onClick={() => setPosColorActive(!posColorActive)} color="bg-rose-600" label="Color" />
                      <AuditChip active={posEditing} onClick={() => setPosEditing(!posEditing)} color="bg-amber-600" label="Editing" />
                      <AuditChip active={posBinding} onClick={() => setPosBinding(!posBinding)} color="bg-emerald-600" label="Binding" />
                   </div>

                   {/* --- B&W Audit Row --- */}
                   <div className={cn("grid grid-cols-2 gap-4 transition-all", !posBwActive && "opacity-20 pointer-events-none grayscale")}>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">B&W Pages</label>
                         <input 
                            type="number" 
                            value={posBwPages === 0 ? '' : posBwPages} 
                            placeholder="0"
                            onChange={e => setPosBwPages(parseInt(e.target.value) || 0)}
                            className="w-full h-12 bg-slate-50 border-0 rounded-xl px-4 text-sm font-black focus:ring-4 focus:ring-indigo-100 transition-all"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Rate (30)</label>
                         <input 
                            type="number" 
                            value={posBwRate} 
                            onChange={e => setPosBwRate(parseInt(e.target.value) || 0)}
                            className="w-full h-12 bg-slate-50 border-0 rounded-xl px-4 text-sm font-black focus:ring-4 focus:ring-indigo-100 transition-all font-outfit"
                         />
                      </div>
                   </div>

                   {/* --- Color Audit Row --- */}
                   <div className={cn("grid grid-cols-2 gap-4 transition-all", !posColorActive && "opacity-20 pointer-events-none grayscale")}>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Color Pages</label>
                         <input 
                            type="number" 
                            value={posColorPages === 0 ? '' : posColorPages} 
                            placeholder="0"
                            onChange={e => setPosColorPages(parseInt(e.target.value) || 0)}
                            className="w-full h-12 bg-slate-50 border-0 rounded-xl px-4 text-sm font-black focus:ring-4 focus:ring-rose-100 transition-all"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Rate (50)</label>
                         <input 
                            type="number" 
                            value={posColorRate} 
                            onChange={e => setPosColorRate(parseInt(e.target.value) || 0)}
                            className="w-full h-12 bg-slate-50 border-0 rounded-xl px-4 text-sm font-black focus:ring-4 focus:ring-rose-100 transition-all font-outfit"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className={cn("space-y-1.5 transition-all", !posEditing && "opacity-20 pointer-events-none grayscale")}>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Editing Fee</label>
                         <input 
                            type="number" 
                            value={posEditingRate === 0 ? '' : posEditingRate} 
                            placeholder="1000"
                            onChange={e => setPosEditingRate(parseInt(e.target.value) || 0)}
                            className="w-full h-12 bg-slate-50 border-0 rounded-xl px-4 text-sm font-black focus:ring-4 focus:ring-amber-100 transition-all font-outfit"
                         />
                      </div>
                      <div className={cn("space-y-1.5 transition-all", !posBinding && "opacity-20 pointer-events-none grayscale")}>
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Binding Fee</label>
                         <input 
                            type="number" 
                            value={posBindingRate} 
                            onChange={e => setPosBindingRate(parseInt(e.target.value) || 0)}
                            className="w-full h-12 bg-slate-50 border-0 rounded-xl px-4 text-sm font-black focus:ring-4 focus:ring-emerald-100 transition-all font-outfit"
                         />
                      </div>
                   </div>

                   <div className="p-8 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-100 flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-1">Total Calculated Yield</p>
                         <p className="text-4xl font-black font-outfit tracking-tighter">{calculatePosPrintPrice().toLocaleString()} <span className="text-xs opacity-60">RWF</span></p>
                      </div>
                      <Layers className="h-10 w-10 opacity-20" />
                   </div>

                   <button 
                      onClick={() => {
                        addToCart(activePrintingProduct);
                        setIsPrintingModalOpen(false);
                        // Reset local audit state after adding
                        setPosBwPages(0);
                        setPosColorPages(0);
                        setPosBinding(false);
                        setPosEditing(false);
                        setPosBwRate(30);
                        setPosColorRate(50);
                        setPosBindingRate(500);
                        setPosEditingRate(1000);
                        setPosBwActive(true);
                        setPosColorActive(false);
                      }}
                      className="w-full h-16 rounded-[1.5rem] bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-2xl active:scale-[0.98]"
                   >
                      Commit to Transaction
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function AuditChip({ active, onClick, color, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex-1 text-center", 
        active ? `${color} border-transparent text-white shadow-lg shadow-indigo-100` : "bg-white border-slate-100 text-slate-400 hover:border-indigo-100"
      )}
    >
      {label}
    </button>
  );
}



function TypeButton({ active, onClick, icon: Icon, label, sub }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all text-left group",
        active ? "border-indigo-600 bg-indigo-50/30" : "border-slate-50 bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/30"
      )}
    >
      <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all group-hover:scale-110", active ? "bg-indigo-600 text-white" : "bg-slate-50 text-indigo-600")}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-black text-slate-900 leading-none">{label}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{sub}</p>
      </div>
    </button>
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
