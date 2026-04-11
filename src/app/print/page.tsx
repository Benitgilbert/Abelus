"use client";

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Download,
  Eye,
  CreditCard,
  User,
  MoreVertical,
  Play,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { printService, PrintOrder } from '@/lib/services/print-service';
import { formatDistanceToNow } from 'date-fns';

export default function PrintCenterPage() {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const subscription = printService.subscribeToOrders(() => {
      fetchOrders();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    const data = await printService.getAll();
    if (data) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: PrintOrder['status']) => {
    const success = await printService.updateStatus(id, status);
    if (success) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;
  const completedToday = orders.filter(o => o.status === 'completed').length; // Should filter by date in real app

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50 rounded-3xl min-h-[400px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-outfit">Print Center Queue</h1>
            <p className="text-muted-foreground mt-1 text-lg">Manage digital print requests, student uploads, and B2B documents.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 rounded-xl bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700">
               <span className="relative flex h-2 w-2">
                 <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75", pendingCount > 0 ? "block" : "hidden")}></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
               </span>
               {pendingCount} Pending Jobs
             </div>
             <button onClick={fetchOrders} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all">
               <Download className="h-4 w-4" />
               Refresh Queue
             </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <StatMini title="Pending" value={pendingCount} icon={Clock} color="text-amber-500" />
          <StatMini title="Processing" value={processingCount} icon={Play} color="text-primary" />
          <StatMini title="Completed Today" value={completedToday} icon={CheckCircle2} color="text-emerald-500" />
          <StatMini title="Total Pages" value={orders.reduce((acc, o) => acc + (o.page_count || 0), 0)} icon={FileText} color="text-secondary" />
        </div>

        {/* Queue Table */}
        <div className="rounded-3xl border bg-card/30 backdrop-blur-md overflow-hidden min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-5 font-bold">Job ID</th>
                <th className="px-6 py-5 font-bold">Customer</th>
                <th className="px-6 py-5 font-bold">Config</th>
                <th className="px-6 py-5 font-bold">Payment</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {orders.map(job => (
                <tr key={job.id} className="group hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/5">
                        <FileText className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[8px] font-black text-white shadow-md border-2 border-background">
                          {job.page_count || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-foreground truncate max-w-[80px]">#{job.id.slice(0, 8)}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <User className="h-4 w-4 text-muted-foreground" />
                       <div>
                         <p className="font-semibold">{job.customer_name || 'Guest'}</p>
                         <p className="text-[10px] text-muted-foreground italic font-medium">
                           {job.customer_id ? 'Account User' : 'Guest Upload'}
                         </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <span className={cn(
                        "rounded-md px-2 py-0.5 text-[10px] font-black uppercase",
                        job.access_mode === 'read_write' ? "bg-purple-100 text-purple-700" : "bg-zinc-100 text-zinc-700"
                      )}>{job.access_mode.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                      job.payment_status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {job.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 font-bold capitalize">
                       <Ping status={job.status} />
                       {job.status}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      {job.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(job.id, 'processing')}
                          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Process
                        </button>
                      )}
                      {job.status === 'processing' && (
                        <button 
                          onClick={() => updateStatus(job.id, 'completed')}
                          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-200 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Done
                        </button>
                      )}
                      <a 
                        href={job.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="rounded-xl border p-2 hover:bg-muted transition-colors"
                        title="View Document"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                      {job.status !== 'completed' && job.status !== 'cancelled' && (
                        <button 
                          onClick={() => updateStatus(job.id, 'cancelled')}
                          className="rounded-xl border p-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Cancel Job"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-muted-foreground italic">
                    No print jobs in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function StatMini({ title, value, icon: Icon, color }: any) {
  return (
    <div className="rounded-2xl border bg-card/50 p-4 shadow-sm flex items-center gap-4">
      <div className={cn("rounded-xl bg-muted p-3", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <p className="text-xl font-black">{value}</p>
      </div>
    </div>
  );
}

function Ping({ status }: { status: string }) {
  const color = 
    status === 'pending' ? 'bg-amber-500' : 
    status === 'processing' ? 'bg-primary' : 
    status === 'completed' ? 'bg-emerald-500' : 'bg-red-500';
    
  return (
    <span className="relative flex h-2 w-2">
      {(status === 'pending' || status === 'processing') && (
        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)}></span>
      )}
      <span className={cn("relative inline-flex rounded-full h-2 w-2", color)}></span>
    </span>
  );
}
