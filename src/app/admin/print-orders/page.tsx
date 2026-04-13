"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AppShell } from '@/components/shared/AppShell';
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Download,
  Printer,
  X,
  ArrowRight,
  ShieldCheck,
  Layers,
  Zap,
  Tag,
  CreditCard,
  ChevronRight,
  MoreVertical,
  Filter,
  User,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPrintOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local negotiation state
  const [bwCost, setBwCost] = useState(30);
  const [colorCost, setColorCost] = useState(50);
  const [bindingCost, setBindingCost] = useState(1000);
  const [editingCost, setEditingCost] = useState(500);

  // --- HELPER: WhatsApp Message Generator (Kinyarwanda) ---
  const getWhatsAppLink = (order: any) => {
    if (!order) return "#";
    const phone = order.customer_phone?.replace(/[^0-9]/g, '');
    
    // Status Translation Map
    const statusMap: Record<string, string> = {
      'pending': 'ITEGEREJWE',
      'processing': 'IRI GUKORWA',
      'completed': 'YARANGIYE'
    };

    const rwStatus = statusMap[order.status?.toLowerCase()] || order.status?.toUpperCase();
    const message = `Muraho *${order.customer_name}*, uyu ni Pastor Bonus Printing. Komande yanyu *#${order.tracking_id}* ubu *${rwStatus}*. Amafaranga yose hamwe ni *${order.negotiated_price?.toLocaleString()} RWF*. Murakoze!`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // 1. Reset negotiation state when a new order is selected
  useEffect(() => {
    if (selectedOrder) {
      setBwCost(30);
      setColorCost(50);
      setBindingCost(1000);
      setEditingCost(500);
    }
  }, [selectedOrder?.id]);

  // 2. Fetch Orders on Mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('print_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  const handleUpdateOrder = async (orderId: string, updates: any) => {
    const { error } = await supabase
      .from('print_orders')
      .update(updates)
      .eq('id', orderId);

    if (!error) {
      fetchOrders();
      setIsModalOpen(false);
    }
  };

  // Status Badge Logic
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'processing': return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default: return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    }
  };

  const getPaymentStatusStyles = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-100';
      case 'partial': return 'bg-amber-500 text-white border-amber-500 shadow-amber-100';
      default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Modern Compact Statistics */}
        {/* Modern Compact Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: 'Live Queue', val: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length, icon: Clock, color: 'text-primary' },
             { label: 'Audit Required', val: orders.filter(o => o.status === 'pending').length, icon: ShieldCheck, color: 'text-amber-500' },
             { label: 'Today Vol', val: orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length, icon: Package, color: 'text-indigo-500' },
             { label: 'Revenue Yield', val: orders.reduce((acc, o) => acc + Number(o.negotiated_price || o.total_price || 0), 0), icon: CreditCard, color: 'text-emerald-500', isPrice: true }
           ].map((s, idx) => (
             <div key={idx} className="bg-background border rounded-2xl p-4 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={cn("h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-muted/50", s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1.5">{s.label}</p>
                  <p className="text-lg sm:text-xl font-black font-outfit truncate leading-none">
                    {s.isPrice ? (s.val.toLocaleString()) : s.val}
                    {s.isPrice && <span className="text-[10px] ml-1 text-muted-foreground">RWF</span>}
                  </p>
                </div>
             </div>
           ))}
        </div>

        {/* Action Header: Search & Pulse Actions */}
        <div className="bg-background border rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search Client ID, Phone or Tracking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50 placeholder:font-medium"
              />
           </div>
           
           <div className="flex items-center gap-2">
              <button className="flex-1 lg:flex-none h-12 px-5 rounded-xl border bg-background text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-muted transition-all active:scale-95">
                 <Filter className="h-4 w-4" /> Filter
              </button>
              <button className="flex-1 lg:flex-none h-12 px-5 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-95">
                 <Download className="h-4 w-4" /> Export Ledger
              </button>
           </div>
        </div>

        {/* Unified Data Ledger */}
        <div className="space-y-4">
           {/* Desktop: High-Precision Table */}
           <div className="hidden lg:block bg-background border rounded-[2rem] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-muted/30 border-b">
                       <th className="px-6 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tracking Terminal</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Client Manifest</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Metadata</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Yield Sync</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Settlement</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Lifecycle</th>
                       <th className="px-6 py-5 text-right"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y">
                    {orders.filter(o => 
                       o.tracking_id?.includes(searchQuery.toUpperCase()) || 
                       o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       o.customer_phone?.includes(searchQuery)
                    ).map((order) => (
                       <tr key={order.id} className="hover:bg-muted/10 transition-colors group">
                          <td className="px-6 py-5">
                             <span className="font-mono text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">#{order.tracking_id}</span>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black uppercase border border-slate-200">
                                   {order.customer_name?.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                   <p className="text-sm font-black text-foreground truncate">{order.customer_name}</p>
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{order.customer_phone}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 text-xs font-black text-foreground overflow-hidden max-w-[200px]">
                                   <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                   <span className="truncate">{order.original_filename}</span>
                                </div>
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">{order.page_count} Pages • {order.paper_size || 'A4'}</span>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground">{(order.negotiated_price || order.total_price || 0).toLocaleString()} <span className="text-[10px] opacity-40">RWF</span></span>
                                {order.negotiated_price && <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Negotiated Sync</span>}
                             </div>
                          </td>
                           <td className="px-6 py-5 text-[12px] font-black uppercase text-muted-foreground">
                              <span className={cn(
                                 "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                 getPaymentStatusStyles(order.payment_status)
                              )}>
                                 {order.payment_status || 'Pending'}
                              </span>
                           </td>
                           <td className="px-6 py-5">
                              <span className={cn(
                                 "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                 getStatusStyles(order.status)
                              )}>
                                 {order.status}
                              </span>
                           </td>
                          <td className="px-6 py-5 text-right">
                             <button 
                               onClick={() => {
                                 setSelectedOrder(order);
                                 setIsModalOpen(true);
                               }}
                               className="h-10 px-5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all opacity-0 group-hover:opacity-100"
                             >
                                Audit Order
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Mobile: Dynamic Command Cards */}
           <div className="lg:hidden space-y-4">
              {orders.filter(o => 
                 o.tracking_id?.includes(searchQuery.toUpperCase()) || 
                 o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 o.customer_phone?.includes(searchQuery)
              ).map((order) => (
                 <div key={order.id} onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm active:scale-[0.98] transition-all space-y-5 relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="font-mono text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">#{order.tracking_id}</span>
                             <span className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                getStatusStyles(order.status)
                             )}>{order.status}</span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                       </div>
                       <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          <Printer className="h-5 w-5 text-slate-400" />
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 shrink-0 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black border border-indigo-100">
                          {order.customer_name?.slice(0, 2).toUpperCase()}
                       </div>
                       <div className="min-w-0">
                          <p className="text-sm font-black text-slate-950 truncate uppercase leading-none mb-1">{order.customer_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.customer_phone}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                       <div className="space-y-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Yield Sync</p>
                          <p className="text-sm font-black text-slate-950">{(order.negotiated_price || order.total_price || 0).toLocaleString()} <span className="text-[9px] opacity-40">rwf</span></p>
                       </div>
                       <div className="space-y-1 text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Output Matrix</p>
                          <p className="text-xs font-black text-indigo-600 uppercase truncate">{order.original_filename}</p>
                       </div>
                    </div>
                 </div>
              ))}
           </div>

           {orders.length === 0 && (
              <div className="bg-white border rounded-[2.5rem] border-dashed py-32 flex flex-col items-center justify-center text-center px-10">
                 <Printer className="h-16 w-16 text-slate-100 mb-4" />
                 <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] italic">The print registry is currently silent.</p>
              </div>
           )}
        </div>
      </div>

      {/* --- Executive Command Center (Responsive Multi-Layer Modal) --- */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ y: "100%", opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: "100%", opacity: 0 }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="relative z-10 w-full sm:max-w-7xl bg-white sm:border sm:rounded-[2.5rem] shadow-2xl flex flex-col h-full sm:h-auto sm:max-h-[92vh] overflow-hidden"
             >
                {/* Responsive Audit Header */}
                <div className="flex h-16 sm:h-20 shrink-0 items-center justify-between border-b px-6 sm:px-10 bg-slate-50/50">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-xl shadow-slate-200">
                         <Printer className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div>
                         <h3 className="text-sm sm:text-lg font-black font-outfit uppercase tracking-tighter leading-none mb-1">Audit Node: <span className="text-indigo-600">#{selectedOrder.tracking_id}</span></h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedOrder.customer_name}</p>
                      </div>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center bg-white border border-slate-100 shadow-sm">
                      <X className="h-5 w-5 text-slate-900" />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-hide">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
                      
                      {/* Section 1: Identity & Asset */}
                      <div className="lg:col-span-3 space-y-8 lg:border-r lg:pr-10">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                               <User className="h-3 w-3" /> Stakeholder Manifest
                            </h4>
                            <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-4">
                               <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-full bg-slate-950 text-white flex items-center justify-center text-sm font-black shadow-lg">
                                     {selectedOrder.customer_name?.slice(0,2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-sm font-black text-slate-950 truncate uppercase">{selectedOrder.customer_name}</p>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedOrder.customer_phone}</p>
                                  </div>
                               </div>
                               <a 
                                 href={getWhatsAppLink(selectedOrder)}
                                 target="_blank"
                                 className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-50 transition-all active:scale-95"
                               >
                                  <Zap className="h-4 w-4 fill-white" /> Rapid WhatsApp Sync
                               </a>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                               <FileText className="h-3 w-3" /> Asset Distribution
                            </h4>
                            <div className="p-5 bg-slate-950 rounded-[1.5rem] text-white space-y-5 shadow-xl shadow-slate-200">
                               <div className="flex gap-4">
                                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
                                    <FileText className="h-5 w-5 opacity-60" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[11px] font-black text-white truncate leading-tight uppercase tracking-tight">{selectedOrder.original_filename}</p>
                                     <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Registry Secure Link</p>
                                  </div>
                               </div>
                               <a 
                                  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/print-files/${selectedOrder.file_url}`}
                                  target="_blank"
                                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-100 active:scale-95 shadow-lg shadow-white/5"
                               >
                                  <Download className="h-4 w-4" /> Download Asset
                               </a>
                            </div>
                         </div>
                      </div>

                      {/* Section 2: Command Matrix (Auditing) */}
                      <div className="lg:col-span-6 space-y-8">
                         <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
                            <div className="h-px bg-slate-100 flex-1 hidden lg:block" />
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] whitespace-nowrap">Output Variable Matrix</h4>
                            <div className="h-px bg-slate-100 flex-1 hidden lg:block" />
                         </div>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* B&W Section */}
                            <div className="p-6 rounded-[2rem] bg-indigo-50/30 border border-indigo-100 space-y-5 shadow-sm">
                               <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2"><Printer className="h-3 w-3" /> B&W Ledger</p>
                                  <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-600 text-white rounded-full">Unit Audited</span>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">Volume</label>
                                     <input 
                                       type="number" 
                                       className="w-full h-12 bg-white border border-indigo-100 rounded-2xl px-4 text-sm font-black font-outfit focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                       value={selectedOrder.bw_pages || 0}
                                       onChange={(e) => {
                                         const count = parseInt(e.target.value) || 0;
                                         const extras = (selectedOrder.settings_json?.binding ? bindingCost : 0) + (selectedOrder.settings_json?.editing ? editingCost : 0);
                                         const newTotal = (count * bwCost) + ((selectedOrder.color_pages || 0) * colorCost) + extras;
                                         setSelectedOrder({...selectedOrder, bw_pages: count, negotiated_price: newTotal});
                                       }}
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">Rate</label>
                                     <input 
                                       type="number" 
                                       className="w-full h-12 bg-white border border-indigo-100 rounded-2xl px-4 text-sm font-black text-indigo-700 font-outfit focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                                       value={bwCost}
                                       onChange={(e) => {
                                         const rate = parseInt(e.target.value) || 0;
                                         setBwCost(rate);
                                         const extras = (selectedOrder.settings_json?.binding ? bindingCost : 0) + (selectedOrder.settings_json?.editing ? editingCost : 0);
                                         const newTotal = ((selectedOrder.bw_pages || 0) * rate) + ((selectedOrder.color_pages || 0) * colorCost) + extras;
                                         setSelectedOrder({...selectedOrder, negotiated_price: newTotal});
                                       }}
                                     />
                                  </div>
                               </div>
                            </div>

                            {/* Color Section */}
                            <div className="p-6 rounded-[2rem] bg-rose-50/30 border border-rose-100 space-y-5 shadow-sm">
                               <div className="flex justify-between items-center">
                                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2"><Zap className="h-3 w-3 fill-rose-600" /> Color Matrix</p>
                                  <span className="text-[9px] font-black px-2 py-0.5 bg-rose-600 text-white rounded-full">Premium</span>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest ml-1">Volume</label>
                                     <input 
                                       type="number" 
                                       className="w-full h-12 bg-white border border-rose-100 rounded-2xl px-4 text-sm font-black font-outfit focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                                       value={selectedOrder.color_pages || 0}
                                       onChange={(e) => {
                                         const count = parseInt(e.target.value) || 0;
                                         const extras = (selectedOrder.settings_json?.binding ? bindingCost : 0) + (selectedOrder.settings_json?.editing ? editingCost : 0);
                                         const newTotal = ((selectedOrder.bw_pages || 0) * bwCost) + (count * colorCost) + extras;
                                         setSelectedOrder({...selectedOrder, color_pages: count, negotiated_price: newTotal});
                                       }}
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-[9px] font-black text-rose-400 uppercase tracking-widest ml-1">Rate</label>
                                     <input 
                                       type="number" 
                                       className="w-full h-12 bg-white border border-rose-100 rounded-2xl px-4 text-sm font-black text-rose-700 font-outfit focus:ring-4 focus:ring-rose-100 outline-none transition-all"
                                       value={colorCost}
                                       onChange={(e) => {
                                         const rate = parseInt(e.target.value) || 0;
                                         setColorCost(rate);
                                         const extras = (selectedOrder.settings_json?.binding ? bindingCost : 0) + (selectedOrder.settings_json?.editing ? editingCost : 0);
                                         const newTotal = ((selectedOrder.bw_pages || 0) * bwCost) + ((selectedOrder.color_pages || 0) * rate) + extras;
                                         setSelectedOrder({...selectedOrder, negotiated_price: newTotal});
                                       }}
                                     />
                                  </div>
                               </div>
                            </div>

                            {/* Binding Matrix */}
                            <div className={cn(
                               "p-6 rounded-[2rem] border space-y-5 shadow-sm transition-all relative overflow-hidden",
                               selectedOrder.settings_json?.binding ? "bg-emerald-50/20 border-emerald-100 shadow-emerald-50" : "bg-slate-50 border-slate-100 opacity-20 pointer-events-none grayscale"
                            )}>
                               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                  <Layers className="h-4 w-4" /> Physical Binding
                               </p>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest ml-1">Service Fee (RWF)</label>
                                  <input 
                                    type="number" 
                                    className="w-full h-12 bg-white border border-emerald-100 rounded-2xl px-4 text-sm font-black text-emerald-700 font-outfit focus:ring-4 focus:ring-emerald-100 outline-none"
                                    value={bindingCost}
                                    onChange={(e) => {
                                      const cost = parseInt(e.target.value) || 0;
                                      setBindingCost(cost);
                                      const extras = cost + (selectedOrder.settings_json?.editing ? editingCost : 0);
                                      const newTotal = ((selectedOrder.bw_pages || 0) * bwCost) + ((selectedOrder.color_pages || 0) * colorCost) + extras;
                                      setSelectedOrder({...selectedOrder, negotiated_price: newTotal});
                                    }}
                                  />
                               </div>
                            </div>

                            {/* Editing Matrix */}
                            <div className={cn(
                               "p-6 rounded-[2rem] border space-y-5 shadow-sm transition-all relative overflow-hidden",
                               selectedOrder.settings_json?.editing ? "bg-amber-50/20 border-amber-100 shadow-amber-50" : "bg-slate-50 border-slate-100 opacity-20 pointer-events-none grayscale"
                            )}>
                               <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                  <Tag className="h-4 w-4" /> Expert Editing
                                </p>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-amber-400 uppercase tracking-widest ml-1">Manual Service Fee</label>
                                  <input 
                                    type="number" 
                                    className="w-full h-12 bg-white border border-amber-100 rounded-2xl px-4 text-sm font-black text-amber-700 font-outfit focus:ring-4 focus:ring-amber-100 outline-none"
                                    value={editingCost}
                                    onChange={(e) => {
                                      const cost = parseInt(e.target.value) || 0;
                                      setEditingCost(cost);
                                      const extras = cost + (selectedOrder.settings_json?.binding ? bindingCost : 0);
                                      const newTotal = ((selectedOrder.bw_pages || 0) * bwCost) + ((selectedOrder.color_pages || 0) * colorCost) + extras;
                                      setSelectedOrder({...selectedOrder, negotiated_price: newTotal});
                                    }}
                                  />
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Section 3: Financial Yield & Commitment */}
                      <div className="lg:col-span-3 space-y-8 lg:border-l lg:pl-10 text-center lg:text-right">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Net Financial Yield</h4>
                            <div className="p-8 bg-slate-950 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 text-center space-y-1">
                               <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">Final Agreed Aggregate</p>
                               <div className="flex items-center justify-center gap-2">
                                  <input 
                                     type="number"
                                     className="bg-transparent border-none text-4xl sm:text-5xl font-black font-outfit text-center w-full focus:ring-0 p-0 leading-none"
                                     value={selectedOrder.negotiated_price || 0}
                                     onChange={(e) => setSelectedOrder({...selectedOrder, negotiated_price: parseFloat(e.target.value) || 0})}
                                  />
                               </div>
                               <span className="text-xs font-black opacity-30 tracking-widest uppercase mt-2 block">RWF</span>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Transition Stage</h4>
                            <div className="flex flex-col gap-2">
                               {['pending', 'processing', 'completed'].map((st) => (
                                 <button 
                                   key={st}
                                   onClick={() => setSelectedOrder({...selectedOrder, status: st})}
                                   className={cn(
                                     "h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border transition-all shadow-sm active:scale-95",
                                     selectedOrder.status === st ? "bg-slate-950 text-white border-slate-950 shadow-slate-200" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                                   )}
                                 >
                                   {st === 'processing' ? 'Processing' : st}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Final Commit Footer */}
                <div className="h-20 sm:h-24 bg-slate-50 border-t px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
                   <div className="flex items-center gap-3 opacity-30 hidden sm:flex">
                      <ShieldCheck className="h-5 w-5" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Certified Executive Registry Audit</p>
                   </div>
                   <button 
                     onClick={() => handleUpdateOrder(selectedOrder.id, {
                       bw_pages: selectedOrder.bw_pages,
                       color_pages: selectedOrder.color_pages,
                       negotiated_price: selectedOrder.negotiated_price,
                       status: selectedOrder.status
                     })}
                     className="w-full sm:w-auto px-12 py-5 sm:py-4 rounded-2xl bg-slate-950 text-white font-black text-[12px] uppercase tracking-[0.3em] hover:shadow-2xl hover:shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-4"
                   >
                     Commit & Notify Client <ArrowRight className="h-5 w-5" />
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function Settings(props: any) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
