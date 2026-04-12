"use client";

import React, { useState } from 'react';
import { PublicShell } from '@/components/layout/PublicShell';
import { supabase } from '@/lib/supabase/client';
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Loader2,
  Calendar,
  Layers,
  Edit2,
  ShoppingBag,
  CreditCard,
  User,
  Zap,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function UniversalTrackingPage() {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [orderType, setOrderType] = useState<'print' | 'sale' | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = trackingId.replace('#', '').trim().toUpperCase();
    if (!cleanId) return;

    setLoading(true);
    setError('');
    setOrder(null);
    setOrderType(null);

    try {
      // 1. Try Print Orders first
      const { data: printData, error: printError } = await supabase
        .from('print_orders')
        .select('*')
        .eq('tracking_id', cleanId)
        .maybeSingle();

      if (printData) {
        setOrder(printData);
        setOrderType('print');
        return;
      }

      // 2. Try Standard Transactions
      const { data: saleData, error: saleError } = await supabase
        .from('transactions')
        .select('*, transaction_items(*, product_variants(product:products(name)))')
        .eq('tracking_id', cleanId)
        .maybeSingle();

      if (saleData) {
        setOrder(saleData);
        setOrderType('sale');
        return;
      }

      setError('Order not found. Please check your Tracking ID (#XXXXXXXX).');
    } catch (err) {
      console.error('Tracking error:', err);
      setError('An error occurred while retrieving order data.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string, type: 'print' | 'sale') => {
    if (type === 'print') {
      switch (status) {
        case 'pending': return 1;
        case 'processing': return 2;
        case 'completed': return 3;
        default: return 1;
      }
    } else {
      // Sale mapping (Paid = Completed, Pending = Processing/Pending)
      switch (status) {
        case 'pending': return 1;
        case 'partial': return 2;
        case 'paid': return 3;
        default: return 1;
      }
    }
  };

  return (
    <PublicShell>
      <div className="min-h-screen pt-32 pb-20 bg-[#FBFBFE]">
        <div className="mx-auto max-w-4xl px-6">
          
          <div className="text-center mb-16 space-y-4">
            <h1 className="font-outfit text-6xl font-black tracking-tight text-[#1A1C1E]">Track Your Order</h1>
            <p className="text-muted-foreground font-medium max-w-lg mx-auto">
              Universal tracking for all Pastor Bonus purchases—from express printing to premium retail goods.
            </p>
          </div>

          <div className="relative z-10 bg-white/70 backdrop-blur-3xl border border-slate-100 rounded-[3.5rem] p-10 shadow-2xl shadow-indigo-100/30 mb-12">
            <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className={cn(
                    "absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300",
                    trackingId ? "text-indigo-600" : "text-slate-300"
                )} />
                <input 
                  type="text" 
                  placeholder="Enter Tracking ID (#7157DA4C)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  className="w-full h-16 bg-white rounded-[1.8rem] border border-slate-100 pl-14 pr-6 text-sm font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all font-outfit"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="h-16 px-10 rounded-[1.8rem] bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 whitespace-nowrap"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><MapPin className="h-5 w-5" /> Locate Shipment</>}
              </button>
            </form>
            {error && <p className="mt-6 text-center text-xs font-bold text-rose-500 uppercase tracking-widest">{error}</p>}
          </div>

          <AnimatePresence mode="wait">
            {order && (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-8"
              >
                {/* 1. Universal Status Progress */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-sm">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">
                              {orderType === 'print' ? 'Printing Process Tracking' : 'Standard Sale Monitoring'}
                            </span>
                            <h2 className="text-2xl font-black font-outfit text-indigo-950">
                                {orderType === 'print' ? 'Order Lifecycle' : 'Payment & Processing'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-indigo-100">
                           <Zap className="h-3 w-3 fill-indigo-600" /> Live Stream
                        </div>
                    </div>

                    <div className="flex items-center justify-between relative px-8">
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-slate-100 rounded-full z-0 px-8" />
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-indigo-600 rounded-full z-0 transition-all duration-1000 origin-left" 
                          style={{ width: `${(getStatusStep(orderType === 'print' ? order.status : (order.payment_status || 'pending'), orderType!) - 1) * 50}%` }}
                        />

                        {[
                            { id: 1, label: orderType === 'print' ? 'Pending' : 'Order Placed', icon: Clock },
                            { id: 2, label: orderType === 'print' ? 'Processing' : 'Partial/Valid', icon: Package },
                            { id: 3, label: orderType === 'print' ? 'Ready' : 'Completed', icon: CheckCircle2 }
                        ].map((s) => {
                            const currentStep = getStatusStep(orderType === 'print' ? order.status : (order.payment_status || 'pending'), orderType!);
                            const isActive = currentStep === s.id;
                            const isPast = currentStep > s.id;
                            return (
                                <div key={s.id} className="relative z-10 flex flex-col items-center">
                                    <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-700",
                                        isPast ? "bg-indigo-600 text-white shadow-lg" :
                                        isActive ? "bg-white border-4 border-indigo-600 text-indigo-600 scale-125 shadow-xl" :
                                        "bg-white border border-slate-100 text-slate-300"
                                    )}>
                                        {isPast ? <CheckCircle2 className="h-7 w-7" /> : <s.icon className="h-7 w-7" />}
                                    </div>
                                    <span className={cn(
                                        "mt-6 text-[10px] font-black uppercase tracking-widest text-center",
                                        isActive ? "text-indigo-600" : "text-slate-400"
                                    )}>
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Content Details (Render Conditionally) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* Left: Summary Manifest */}
                    <div className="md:col-span-12 lg:col-span-7 bg-white rounded-[3rem] p-10 border border-slate-50 shadow-sm">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600">
                                {orderType === 'print' ? <FileText className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black font-outfit text-indigo-950">Manifest Details</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified System Entry</p>
                            </div>
                        </div>

                        {orderType === 'print' ? (
                          <div className="space-y-8">
                             <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Original Asset</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{order.original_filename}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Volumetric Count</p>
                                    <p className="text-sm font-bold text-slate-900">{order.page_count} Professional Pages</p>
                                </div>
                             </div>
                             <div className="pt-8 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {order.settings_json?.editing && (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                        <Edit2 className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Layout Corrected</span>
                                    </div>
                                )}
                                {order.settings_json?.binding && (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                        <Layers className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Binding Applied</span>
                                    </div>
                                )}
                             </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                             {order.transaction_items?.map((item: any, idx: number) => (
                               <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                                  <div className="flex items-center gap-4">
                                     <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-black">
                                       {item.quantity}
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-indigo-950">{item.product_variants?.product?.name || "Product Item"}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.unit_name || "Piece"}</p>
                                     </div>
                                  </div>
                                  <p className="text-sm font-black text-indigo-600">{(item.price_at_sale * item.quantity).toLocaleString()} RWF</p>
                               </div>
                             ))}
                          </div>
                        )}
                    </div>

                    {/* Right: Payment & Security */}
                    <div className="md:col-span-12 lg:col-span-5 bg-indigo-950 rounded-[3rem] p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-900 rounded-full translate-x-1/4 -translate-y-1/4 blur-3xl opacity-50" />
                        
                        <div className="flex items-center gap-3 mb-10">
                            <CreditCard className="h-5 w-5 text-indigo-300" />
                            <h3 className="font-bold tracking-tight">Financial Ledger</h3>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Total Valuation</p>
                                <p className="text-4xl font-black font-outfit">{(order.total_price || order.total_amount).toLocaleString()} <span className="text-sm font-bold text-indigo-400">RWF</span></p>
                            </div>

                            <div className="space-y-4 pt-8 border-t border-indigo-900">
                                <div className="flex justify-between items-center bg-indigo-900/40 p-4 rounded-2xl border border-indigo-900">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                          "h-8 w-8 rounded-lg flex items-center justify-center",
                                          (order.payment_status === 'paid' || order.status === 'completed') ? "bg-emerald-500" : "bg-amber-500"
                                        )}>
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Entry Veracity</span>
                                    </div>
                                    <span className={cn(
                                      "text-[10px] font-black uppercase tracking-widest",
                                      (order.payment_status === 'paid' || order.status === 'completed') ? "text-emerald-400" : "text-amber-400"
                                    )}>
                                       Valid
                                    </span>
                                </div>
                                
                                <button className="w-full flex items-center justify-center gap-3 py-4 bg-white text-indigo-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors shadow-xl">
                                   Download Receipt <FileText className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-8 border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl border border-slate-100 flex items-center justify-center bg-slate-50">
                           <User className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered Entity</p>
                           <p className="text-sm font-bold text-slate-950">{order.customer_name || "Premium Store Client"}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                           {new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                     </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Static Trust Block */}
          {!order && (
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { id: 1, label: 'Standard Sales', icon: ShoppingBag, desc: 'Instantly tracking any POS or online store purchase using your receipt handle.' },
                 { id: 2, label: 'Print Solutions', icon: Printer, desc: 'Detailed status updates for high-end formatting and book-binding services.' },
                 { id: 3, label: 'Direct Access', icon: ArrowRight, iconColor: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Securely monitoring your assets transit through the Pastor Bonus registry.' }
               ].map((v) => (
                 <div key={v.id} className="text-center group">
                    <div className={cn("h-20 w-20 rounded-3xl mx-auto flex items-center justify-center mb-8 transition-transform group-hover:rotate-6", v.bg || "bg-white border border-slate-100 shadow-sm")}>
                      {(v.icon as any) === Printer ? <Printer className="h-8 w-8 text-indigo-600" /> : <v.icon className={cn("h-8 w-8", v.iconColor || "text-slate-900")} />}
                    </div>
                    <h4 className="font-outfit text-sm font-black uppercase tracking-widest text-[#1A1C1E] mb-4">{v.label}</h4>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{v.desc}</p>
                 </div>
               ))}
            </div>
          )}

        </div>
      </div>
    </PublicShell>
  );
}

function Printer(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" />
    </svg>
  )
}
