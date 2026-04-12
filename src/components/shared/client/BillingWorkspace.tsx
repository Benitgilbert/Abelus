"use client";

import React, { useMemo } from 'react';
import { 
  Printer, 
  FileText,
  Calendar,
  Package,
  TrendingUp,
  Hash,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillingWorkspaceProps {
  unbilledTx: any[];
  isSubmitting: boolean;
  onGenerateInvoice: () => Promise<void>;
  onPrintDraft: (tx: any) => void;
  invoiceHistory: any[];
  onViewInvoice: (id: string) => Promise<void>;
}

export function BillingWorkspace({ unbilledTx, isSubmitting, onGenerateInvoice, onPrintDraft, invoiceHistory, onViewInvoice }: BillingWorkspaceProps) {
  const [view, setView] = React.useState<'unbilled' | 'history'>('unbilled');
  
  const flattenedItems = useMemo(() => {
    const items: any[] = [];
    const sortedTx = [...unbilledTx].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    let runningTotal = 0;
    sortedTx.forEach(tx => {
      tx.items?.forEach((item: any) => {
        const lineTotal = Number(item.price_at_sale) * Number(item.quantity);
        runningTotal += lineTotal;
        items.push({
          ...item,
          date: tx.created_at,
          txId: tx.id,
          lineTotal,
          runningTotal,
          originalTx: tx 
        });
      });
    });
    return items;
  }, [unbilledTx]);

  const totalOutstanding = flattenedItems.length > 0 
    ? flattenedItems[flattenedItems.length - 1].runningTotal 
    : 0;

  return (
    <div className="space-y-6">
      {/* High-End Ledger Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-950 text-white rounded-2xl p-5 shadow-xl relative border border-slate-800">
        <Activity className="absolute -left-2 -bottom-2 h-16 w-16 text-white/5 -rotate-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
           <div className="space-y-0.5">
             <h3 className="text-xl font-black font-outfit tracking-tighter flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-emerald-400" /> Accounting Ledger
             </h3>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Transparent Chronological Credit Sync</p>
           </div>
           
           <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
              <button 
                onClick={() => setView('unbilled')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'unbilled' ? "bg-white text-slate-950 shadow-lg" : "text-white/40 hover:text-white"
                )}
              >
                Live Items ({unbilledTx.length})
              </button>
              <button 
                onClick={() => setView('history')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'history' ? "bg-indigo-600 text-white shadow-lg" : "text-white/40 hover:text-white"
                )}
              >
                Invoicing History ({invoiceHistory.length})
              </button>
           </div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
           {view === 'unbilled' ? (
             <>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Payload</p>
                  <p className="text-2xl font-black">
                     {totalOutstanding.toLocaleString()} <span className="text-[10px] text-slate-400">RWF</span>
                  </p>
                </div>
                <button 
                  onClick={onGenerateInvoice} 
                  disabled={isSubmitting || unbilledTx.length === 0}
                  className="bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-950 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Zap className="h-4 w-4 animate-pulse text-indigo-600" />
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 text-indigo-600" />
                      Commence Invoicing
                    </>
                  )}
                </button>
             </>
           ) : (
             <div className="text-right">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Archived Requests</p>
               <p className="text-2xl font-black text-indigo-400">{invoiceHistory.length}</p>
             </div>
           )}
        </div>
      </div>

      {view === 'unbilled' ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
          <div className="overflow-x-hidden">
             <table className="w-full text-left border-collapse table-fixed">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[15%]">Date</th>
                     <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-[35%]">Product Name</th>
                     <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-[10%]">Qty</th>
                     <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-[15%]">P/U</th>
                     <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right w-[15%]">Total</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {flattenedItems.map((item, idx) => (
                    <tr key={`${item.txId}-${idx}`} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                         <p className="text-[9px] font-black text-slate-900 uppercase">{new Date(item.date).toLocaleDateString()}</p>
                      </td>
                      <td className="py-3 px-4">
                         <p className="text-xs font-black text-slate-900 font-outfit uppercase truncate leading-tight">
                           {item.product?.name || 'Unknown Product'}
                         </p>
                         {item.variant?.attributes && (
                           <div className="flex gap-1 mt-0.5">
                             {Object.values(item.variant.attributes).map((v: any, i) => (
                               <span key={i} className="text-[7px] font-black uppercase px-1 py-0.25 rounded bg-slate-100 text-slate-400">
                                 {v}
                               </span>
                             ))}
                           </div>
                         )}
                      </td>
                      <td className="py-3 px-4 text-center text-[11px] font-black">
                         <span className="px-1.5 py-0.5 rounded bg-slate-100">{item.quantity}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-[10px] font-bold text-slate-500">
                         {Number(item.price_at_sale).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-[10px] font-black text-slate-900 font-outfit">
                         {item.lineTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {flattenedItems.length === 0 && (
                    <tr>
                       <td colSpan={5} className="py-16 text-center">
                          <Package className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No unbilled sessions detected</p>
                       </td>
                    </tr>
                  )}
               </tbody>
             </table>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Accumulated Aggregate Balance</p>
             <p className="text-2xl font-black text-slate-950">
                <span className="text-[10px] text-slate-400 mr-2">RWF</span>
                {totalOutstanding.toLocaleString()}
             </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {invoiceHistory.map((invoice) => (
             <div key={invoice.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Request #REQ-{invoice.id.slice(0, 8).toUpperCase()}</p>
                      <h4 className="text-lg font-black text-slate-950 mt-1">{Number(invoice.total_amount).toLocaleString()} RWF</h4>
                   </div>
                   <div className={cn(
                     "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                     invoice.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                   )}>
                     {invoice.status}
                   </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-4">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(invoice.created_at).toLocaleDateString()}
                   </div>
                   <button 
                     onClick={() => onViewInvoice(invoice.id)}
                     className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-950 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                   >
                     <Printer className="h-3 w-3" />
                     View & Print
                   </button>
                </div>
             </div>
           ))}
           {invoiceHistory.length === 0 && (
             <div className="col-span-2 py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <FileText className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No archived requests found</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
}

