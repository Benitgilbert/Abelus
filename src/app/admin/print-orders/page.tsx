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

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* Modern Compact Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: 'Active Queue', val: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length, icon: Clock, color: 'text-primary' },
             { label: 'Pending Audit', val: orders.filter(o => o.status === 'pending').length, icon: ShieldCheck, color: 'text-amber-500' },
             { label: 'Today Orders', val: orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length, icon: Package, color: 'text-indigo-500' },
             { label: 'Projected Revenue', val: orders.reduce((acc, o) => acc + Number(o.negotiated_price || o.total_price || 0), 0), icon: CreditCard, color: 'text-emerald-500', isPrice: true }
           ].map((s, idx) => (
             <div key={idx} className="bg-background border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className={cn("h-10 w-10 flex items-center justify-center rounded-xl bg-muted/50", s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{s.label}</p>
                  <p className="text-xl font-black font-outfit">
                    {s.isPrice ? (s.val.toLocaleString() + '') : s.val}
                    {s.isPrice && <span className="text-[10px] ml-1 text-muted-foreground">RWF</span>}
                  </p>
                </div>
             </div>
           ))}
        </div>

        {/* Action Header */}
        <div className="bg-background border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search Client or Tracking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              />
           </div>
           
           <div className="flex items-center gap-2">
              <button className="h-10 px-4 rounded-xl border bg-background text-xs font-bold flex items-center gap-2 hover:bg-muted transition-all">
                 <Filter className="h-4 w-4" /> Filter Status
              </button>
              <button className="h-10 px-4 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all">
                 <Download className="h-4 w-4" /> Export Ledger
              </button>
           </div>
        </div>

        {/* Data Grid Table */}
        <div className="bg-background border rounded-2xl overflow-hidden shadow-sm">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-muted/30 border-b">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Tracking</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Customer Entity</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Document Meta</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Financials</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Current Stage</th>
                    <th className="px-6 py-4 text-right"></th>
                 </tr>
              </thead>
              <tbody className="divide-y">
                 {orders.filter(o => 
                    o.tracking_id?.includes(searchQuery.toUpperCase()) || 
                    o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
                 ).map((order) => (
                    <tr key={order.id} className="hover:bg-muted/10 transition-colors group">
                       <td className="px-6 py-4">
                          <span className="font-mono text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded-md">#{order.tracking_id}</span>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-black uppercase">
                                {order.customer_name?.slice(0, 2)}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-foreground">{order.customer_name}</p>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase">{order.customer_phone}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <div className="flex items-center gap-1.5 text-xs font-bold text-foreground overflow-hidden max-w-[150px]">
                                <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="truncate">{order.original_filename}</span>
                             </div>
                             <span className="text-[10px] font-medium text-muted-foreground">{order.page_count} Pages • {order.paper_size || 'A4'}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-foreground">{(order.negotiated_price || order.total_price || 0).toLocaleString()} RWF</span>
                             {order.negotiated_price && <span className="text-[9px] font-bold text-emerald-600 uppercase">Negotiated</span>}
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={cn(
                             "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                             getStatusStyles(order.status)
                          )}>
                             {order.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsModalOpen(true);
                            }}
                            className="p-2 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                          >
                             <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                       </td>
                    </tr>
                 ))}
                 {orders.length === 0 && (
                   <tr>
                     <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                           <Printer className="h-10 w-10 text-muted-foreground opacity-20" />
                           <p className="text-sm font-medium text-muted-foreground">No print orders found in our registry.</p>
                        </div>
                     </td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* --- Executive Command Center (High-Density Wide Modal) --- */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]"
             />
             <motion.div 
               initial={{ scale: 0.98, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.98, opacity: 0 }}
               className="relative z-10 w-full max-w-7xl bg-background border rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden"
             >
                {/* Slim Header */}
                <div className="flex h-16 items-center justify-between border-b px-8 bg-muted/10">
                   <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center">
                         <Printer className="h-4 w-4" />
                      </div>
                      <div>
                         <h3 className="text-sm font-black font-outfit uppercase tracking-wider">Audit Node: #{selectedOrder.tracking_id}</h3>
                      </div>
                   </div>
                   <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-lg hover:bg-muted transition-all flex items-center justify-center">
                      <X className="h-4 w-4" />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                   <div className="grid grid-cols-12 gap-6">
                      
                      {/* Column 1: Client & Asset (3 cols) */}
                      <div className="col-span-12 lg:col-span-3 space-y-6 border-r pr-6">
                         <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Client Manifest</h4>
                            <div className="p-4 bg-muted/20 border rounded-2xl space-y-3">
                               <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                                     {selectedOrder.customer_name?.slice(0,2)}
                                  </div>
                                  <div>
                                     <p className="text-sm font-black">{selectedOrder.customer_name}</p>
                                     <a 
                                       href={getWhatsAppLink(selectedOrder)}
                                       target="_blank"
                                       className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                                     >
                                        <Zap className="h-3 w-3 fill-emerald-600" /> WhatsApp Client
                                     </a>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Digital Asset</h4>
                            <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-4">
                               <div className="flex gap-3">
                                  <FileText className="h-5 w-5 opacity-40 shrink-0" />
                                  <p className="text-[11px] font-medium truncate leading-tight">{selectedOrder.original_filename}</p>
                               </div>
                               <a 
                                  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/print-files/${selectedOrder.file_url}`}
                                  target="_blank"
                                  className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                               >
                                  <Download className="h-3.5 w-3.5" /> Download
                               </a>
                            </div>
                         </div>
                      </div>

                      {/* Column 2: Audit Grid (6 cols) */}
                      <div className="col-span-12 lg:col-span-6 space-y-6">
                         <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center lg:text-left">Variable Auditing Matrix</h4>
                         
                         <div className="grid grid-cols-2 gap-4">
                            {/* B&W Section */}
                            <div className="p-4 border rounded-2xl bg-indigo-50/20 border-indigo-100 flex flex-col gap-3">
                               <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">B&W Output</p>
                               <div className="flex gap-4">
                                  <div className="flex-1 space-y-1">
                                     <label className="text-[8px] font-bold opacity-40 uppercase">Pages</label>
                                     <input 
                                       type="number" 
                                       className="w-full h-9 bg-white border rounded-lg px-3 text-xs font-black font-outfit"
                                       value={selectedOrder.bw_pages || 0}
                                       onChange={(e) => {
                                         const count = parseInt(e.target.value) || 0;
                                         const extras = (selectedOrder.settings_json?.binding ? bindingCost : 0) + (selectedOrder.settings_json?.editing ? editingCost : 0);
                                         const newTotal = (count * bwCost) + ((selectedOrder.color_pages || 0) * colorCost) + extras;
                                         setSelectedOrder({...selectedOrder, bw_pages: count, negotiated_price: newTotal});
                                       }}
                                     />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                     <label className="text-[8px] font-bold opacity-40 uppercase">Rate</label>
                                     <input 
                                       type="number" 
                                       className="w-full h-9 bg-white border rounded-lg px-3 text-xs font-black text-indigo-600 font-outfit"
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
                            <div className="p-4 border rounded-2xl bg-rose-50/20 border-rose-100 flex flex-col gap-3">
                               <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Color Output</p>
                               <div className="flex gap-4">
                                  <div className="flex-1 space-y-1">
                                     <label className="text-[8px] font-bold opacity-40 uppercase">Pages</label>
                                     <input 
                                       type="number" 
                                       className="w-full h-9 bg-white border rounded-lg px-3 text-xs font-black font-outfit"
                                       value={selectedOrder.color_pages || 0}
                                       onChange={(e) => {
                                         const count = parseInt(e.target.value) || 0;
                                         const extras = (selectedOrder.settings_json?.binding ? bindingCost : 0) + (selectedOrder.settings_json?.editing ? editingCost : 0);
                                         const newTotal = ((selectedOrder.bw_pages || 0) * bwCost) + (count * colorCost) + extras;
                                         setSelectedOrder({...selectedOrder, color_pages: count, negotiated_price: newTotal});
                                       }}
                                     />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                     <label className="text-[8px] font-bold opacity-40 uppercase">Rate</label>
                                     <input 
                                       type="number" 
                                       className="w-full h-9 bg-white border rounded-lg px-3 text-xs font-black text-rose-600 font-outfit"
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

                            {/* Binding Section */}
                            <div className={cn(
                               "p-4 border rounded-2xl flex flex-col gap-3 transition-all",
                               selectedOrder.settings_json?.binding ? "bg-emerald-50/30 border-emerald-100" : "opacity-30 pointer-events-none grayscale"
                            )}>
                               <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                  <Layers className="h-3 w-3" /> Binding Fee
                               </p>
                               <div className="space-y-1">
                                  <label className="text-[8px] font-bold opacity-40 uppercase">Service Cost (RWF)</label>
                                  <input 
                                    type="number" 
                                    className="w-full h-9 bg-white border rounded-lg px-3 text-xs font-black text-emerald-600 font-outfit"
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

                            {/* Editing Section */}
                            <div className={cn(
                               "p-4 border rounded-2xl flex flex-col gap-3 transition-all",
                               selectedOrder.settings_json?.editing ? "bg-amber-50/30 border-amber-100" : "opacity-30 pointer-events-none grayscale"
                            )}>
                               <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                  <Tag className="h-3 w-3" /> Editing Fee
                               </p>
                               <div className="space-y-1">
                                  <label className="text-[8px] font-bold opacity-40 uppercase">Service Cost (RWF)</label>
                                  <input 
                                    type="number" 
                                    className="w-full h-9 bg-white border rounded-lg px-3 text-xs font-black text-amber-600 font-outfit"
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

                      {/* Column 3: Totals & Status (3 cols) */}
                      <div className="col-span-12 lg:col-span-3 space-y-6 border-l pl-6 text-right">
                         <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Financial Yield</h4>
                            <div className="p-6 bg-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-600/20 text-center">
                               <p className="text-[9px] font-bold opacity-60 uppercase mb-1">Agreed Total</p>
                               <input 
                                  type="number"
                                  className="bg-transparent border-none text-3xl font-black font-outfit text-center w-full focus:ring-0 p-0"
                                  value={selectedOrder.negotiated_price || 0}
                                  onChange={(e) => setSelectedOrder({...selectedOrder, negotiated_price: parseFloat(e.target.value) || 0})}
                               />
                               <span className="text-[10px] font-black opacity-60 block">RWF</span>
                            </div>
                         </div>

                         <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Operation Status</h4>
                            <div className="grid grid-cols-1 gap-2">
                               {['pending', 'processing', 'completed'].map((st) => (
                                 <button 
                                   key={st}
                                   onClick={() => setSelectedOrder({...selectedOrder, status: st})}
                                   className={cn(
                                     "h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                                     selectedOrder.status === st ? "bg-foreground text-background border-foreground" : "bg-muted text-muted-foreground border-transparent hover:bg-slate-200"
                                   )}
                                 >
                                   {st}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Compact Footer */}
                <div className="h-16 bg-muted/10 border-t px-8 flex items-center justify-between">
                   <div className="flex items-center gap-2 opacity-50">
                      <ShieldCheck className="h-4 w-4" />
                      <p className="text-[9px] font-bold uppercase tracking-wider">Certified Audit Session</p>
                   </div>
                   <button 
                     onClick={() => handleUpdateOrder(selectedOrder.id, {
                       bw_pages: selectedOrder.bw_pages,
                       color_pages: selectedOrder.color_pages,
                       negotiated_price: selectedOrder.negotiated_price,
                       status: selectedOrder.status
                     })}
                     className="h-10 px-8 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:shadow-lg transition-all"
                   >
                     Commit & Notify Client
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
