"use client";

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { supabase } from '@/lib/supabase/client';
import { 
  Printer, 
  MessageSquare, 
  FileDown, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  MoreVertical,
  Calendar,
  User,
  Phone,
  Search,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PrintOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  file_url: string;
  original_filename: string;
  page_count: number;
  total_price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: string;
  settings_json: any;
  created_at: string;
}

export default function PrintOrdersAdmin() {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('print_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('print_orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating status');
    } else {
      fetchOrders();
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    const { error } = await supabase
      .from('print_orders')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting order');
    } else {
      fetchOrders();
    }
  };

  const openWhatsApp = (phone: string, name: string, orderId: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hello ${name}, this is Pastor Bonus Co. Ltd regarding your print order #${orderId.slice(0, 8).toUpperCase()}. We have received your file and...`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getDownloadUrl = (path: string) => {
     const { data } = supabase.storage.from('print-files').getPublicUrl(path);
     return data.publicUrl;
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.includes(searchTerm) ||
    o.customer_phone?.includes(searchTerm)
  );

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Printer className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Print Queue Management</span>
            </div>
            <h1 className="text-4xl font-black font-outfit tracking-tight text-[#1A1C1E]">Printing Portal</h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">Manage incoming client documents and modifications.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-6 py-3 bg-muted/30 border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
               />
            </div>
            <button 
              onClick={fetchOrders}
              className="p-3 bg-white border rounded-2xl hover:bg-muted/50 transition-all text-muted-foreground hover:text-primary"
            >
              <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="grid grid-cols-1 gap-6">
           {loading ? (
             <div className="py-20 text-center text-muted-foreground font-bold italic">Loading print queue...</div>
           ) : filteredOrders.length === 0 ? (
             <div className="py-20 text-center border-2 border-dashed rounded-[3rem] text-muted-foreground">
                <Printer className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">No print orders found.</p>
             </div>
           ) : (
             filteredOrders.map((order) => (
               <div key={order.id} className="bg-white border rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
                     {/* Client Info */}
                     <div className="flex items-start gap-6">
                        <div className={cn(
                          "h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg",
                          order.status === 'pending' ? "bg-amber-500" :
                          order.status === 'processing' ? "bg-primary" :
                          order.status === 'completed' ? "bg-emerald-500" : "bg-muted text-muted-foreground"
                        )}>
                          <User className="h-8 w-8" />
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-black font-outfit uppercase tracking-tight">{order.customer_name}</h3>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                order.status === 'pending' ? "bg-amber-50 text-amber-600" :
                                order.status === 'processing' ? "bg-primary/5 text-primary" :
                                order.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"
                              )}>
                                {order.status}
                              </span>
                           </div>
                           <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                              <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {order.customer_phone}</span>
                              <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {format(new Date(order.created_at), 'MMM d, HH:mm')}</span>
                              <span className="text-primary/60">ID: #{order.id.slice(0, 8).toUpperCase()}</span>
                           </div>
                        </div>
                     </div>

                     {/* Document Info */}
                     <div className="flex-1 flex gap-4 p-4 bg-muted/20 rounded-2xl border border-dashed">
                        <div className="h-12 w-12 rounded-xl bg-white border flex items-center justify-center text-primary">
                           <Printer className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-black truncate">{order.original_filename}</p>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                              {order.settings_json?.printType === 'color' ? 'Full Color' : 'Standard B&W'} 
                              • {order.page_count} Pages 
                              • {order.settings_json?.copies} Copies
                              {order.settings_json?.editing && <span className="text-emerald-500 ml-2 italic">+ Editing</span>}
                           </p>
                        </div>
                        <div className="text-right">
                           <p className="text-lg font-black text-primary">{order.total_price.toLocaleString()} RWF</p>
                           <p className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Total</p>
                        </div>
                     </div>

                     {/* Actions */}
                     <div className="flex items-center gap-3">
                        <a 
                          href={getDownloadUrl(order.file_url)} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 bg-[#1A1C1E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                        >
                           <FileDown className="h-4 w-4" /> Download
                        </a>
                        <button 
                          onClick={() => openWhatsApp(order.customer_phone, order.customer_name, order.id)}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                        >
                           <MessageSquare className="h-4 w-4" /> WhatsApp
                        </button>
                        
                        <div className="relative group">
                           <button className="p-3 bg-white border rounded-xl hover:bg-muted/50 transition-all font-bold">
                              <MoreVertical className="h-5 w-5" />
                           </button>
                           <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                              <button onClick={() => updateStatus(order.id, 'processing')} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-muted flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" /> Start Printing
                              </button>
                              <button onClick={() => updateStatus(order.id, 'completed')} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-muted flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Mark Completed
                              </button>
                              <div className="h-px bg-muted" />
                              <button onClick={() => deleteOrder(order.id)} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-rose-50 text-rose-500 flex items-center gap-2">
                                <Trash2 className="h-4 w-4" /> Delete Order
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </AppShell>
  );
}
