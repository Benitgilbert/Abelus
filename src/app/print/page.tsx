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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between px-2">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black font-outfit tracking-tighter">Print Center Dispatch</h1>
            <p className="text-slate-500 text-sm sm:text-lg font-medium">Manage b2b uploads, student portals, and digital print queues.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
             <div className="flex items-center justify-between sm:justify-start gap-3 rounded-2xl bg-orange-50 px-4 py-2.5 text-xs font-black text-orange-700 border border-orange-100 shadow-sm">
               <div className="flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                   <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75", pendingCount > 0 ? "block" : "hidden")}></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                 </span>
                 {pendingCount} PENDING
               </div>
               <div className="h-4 w-px bg-orange-200 hidden sm:block" />
               <span className="text-[10px] opacity-40 uppercase tracking-widest hidden sm:block">Real-time Sync</span>
             </div>
             <button 
               onClick={fetchOrders} 
               className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-[11px] font-black text-white shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
             >
               <Download className="h-4 w-4" />
               Refresh Queue
             </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-1">
          <StatCard title="Pending" value={pendingCount} icon={Clock} color="text-amber-500" />
          <StatCard title="Active" value={processingCount} icon={Play} color="text-indigo-600" />
          <StatCard title="Done" value={completedToday} icon={CheckCircle2} color="text-emerald-500" />
          <StatCard title="Total Vol" value={orders.reduce((acc, o) => acc + (o.page_count || 0), 0)} icon={FileText} color="text-slate-900" />
        </div>

        {/* Queue Workspace */}
        <div className="space-y-4">
          {/* Desktop Table: Precision Dispatch */}
          <div className="hidden sm:block rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden min-h-[400px]">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                   <th className="px-6 py-5 font-black">Job Identification</th>
                   <th className="px-6 py-5 font-black">Stakeholder Identity</th>
                   <th className="px-6 py-5 font-black">Config Matrix</th>
                   <th className="px-6 py-5 font-black">Revenue Sync</th>
                   <th className="px-6 py-5 font-black">Lifecycle Status</th>
                   <th className="px-6 py-5 text-center font-black">Control Terminal</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-sm">
                 {orders.map(job => (
                   <tr key={job.id} className="group hover:bg-slate-50/50 transition-colors">
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                         <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 ring-2 ring-transparent group-hover:ring-slate-100 transition-all">
                           <FileText className="h-5 w-5" />
                           <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white shadow-lg border-2 border-white">
                             {job.page_count || '?'}
                           </span>
                         </div>
                         <div>
                           <p className="font-black text-xs text-slate-950 font-outfit uppercase tracking-tighter truncate max-w-[80px]">#{job.id.slice(0, 8)}</p>
                           <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
                             {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                           </p>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-xs uppercase">{job.customer_name || 'Anonymous'}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                              {job.customer_id ? 'Authenticated' : 'One-Time Guest'}
                            </p>
                          </div>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                       <span className={cn(
                         "rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest shadow-sm border",
                         job.access_mode === 'read_write' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-50 text-slate-700 border-slate-100"
                       )}>{job.access_mode.replace('_', ' ')}</span>
                     </td>
                     <td className="px-6 py-5">
                       <span className={cn(
                         "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest",
                         job.payment_status === 'paid' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                       )}>
                         {job.payment_status}
                       </span>
                     </td>
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
                          <Ping status={job.status} />
                          {job.status}
                       </div>
                     </td>
                     <td className="px-6 py-5">
                       <div className="flex items-center justify-center gap-2">
                         {job.status === 'pending' && (
                           <button 
                             onClick={() => updateStatus(job.id, 'processing')}
                             className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-[10px] font-black text-white shadow-lg shadow-slate-200 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                           >
                             <Play className="h-4 w-4 fill-current" />
                             Process
                           </button>
                         )}
                         {job.status === 'processing' && (
                           <button 
                             onClick={() => updateStatus(job.id, 'completed')}
                             className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-[10px] font-black text-white shadow-lg shadow-emerald-100 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                           >
                             <Check className="h-4 w-4" />
                             Complete
                           </button>
                         )}
                         <a 
                           href={job.file_url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all shadow-sm"
                           title="Preview Asset"
                         >
                           <Eye className="h-5 w-5" />
                         </a>
                         {job.status !== 'completed' && job.status !== 'cancelled' && (
                           <button 
                             onClick={() => updateStatus(job.id, 'cancelled')}
                             className="flex items-center justify-center h-10 w-10 rounded-xl border border-slate-100 text-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                             title="Abort Cycle"
                           >
                             <X className="h-5 w-5" />
                           </button>
                         )}
                       </div>
                     </td>
                   </tr>
                 ))}
                 {!loading && orders.length === 0 && (
                   <tr>
                     <td colSpan={6} className="py-32 text-center text-slate-300">
                       <Printer className="h-16 w-16 mx-auto mb-4 opacity-10" />
                       <p className="text-[11px] font-black uppercase tracking-[0.2em] italic">Queue is currently silent.</p>
                     </td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>

          {/* Mobile Dispatch: Touch-First Cards */}
          <div className="sm:hidden space-y-4 px-2">
             {orders.map(job => (
               <div key={job.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-5 relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-xl shadow-slate-200">
                           <FileText className="h-7 w-7" />
                           <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white shadow-lg border-2 border-white">
                             {job.page_count || '?'}
                           </span>
                        </div>
                        <div>
                           <p className="text-sm font-black text-slate-950 font-outfit uppercase tracking-tighter">#{job.id.slice(0, 8)}</p>
                           <div className="flex items-center gap-1.5 mt-0.5">
                             <Ping status={job.status} />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{job.status}</span>
                           </div>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Stakeholder</p>
                        <p className="text-xs font-black text-slate-900 uppercase leading-snug">{job.customer_name || 'Anonymous'}</p>
                     </div>
                     <div className="space-y-1 text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Matrix</p>
                        <p className="text-xs font-black text-indigo-600 uppercase leading-snug">{job.access_mode.replace('_', ' ')}</p>
                     </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                     <div className="flex gap-2">
                        {job.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(job.id, 'processing')}
                            className="flex-1 flex items-center justify-center gap-2 rounded-[1.25rem] bg-slate-950 py-4 text-[11px] font-black text-white shadow-xl shadow-slate-100 uppercase tracking-widest"
                          >
                            <Play className="h-4 w-4 fill-current" />
                            Start Processing
                          </button>
                        )}
                        {job.status === 'processing' && (
                          <button 
                            onClick={() => updateStatus(job.id, 'completed')}
                            className="flex-1 flex items-center justify-center gap-2 rounded-[1.25rem] bg-emerald-600 py-4 text-[11px] font-black text-white shadow-xl shadow-emerald-50 uppercase tracking-widest"
                          >
                            <Check className="h-4 w-4" />
                            Finish Job
                          </button>
                        )}
                        <a 
                           href={job.file_url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="h-14 w-14 rounded-[1.25rem] bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm"
                        >
                           <Eye className="h-6 w-6" />
                        </a>
                     </div>
                     {job.status !== 'completed' && job.status !== 'cancelled' && (
                        <button 
                           onClick={() => updateStatus(job.id, 'cancelled')}
                           className="w-full py-3 text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors"
                        >
                           Abort Session
                        </button>
                     )}
                  </div>
               </div>
             ))}
             {!loading && orders.length === 0 && (
                <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
                  <Printer className="h-16 w-16 mx-auto mb-4 opacity-5 text-slate-950" />
                  <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] px-10 leading-relaxed italic">Queue is silent. No uploads detected.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-5 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
      <div className={cn("rounded-2xl bg-slate-50 p-4 transition-colors group-hover:bg-slate-950 group-hover:text-white", color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-2xl font-black font-outfit leading-none">{value}</p>
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
