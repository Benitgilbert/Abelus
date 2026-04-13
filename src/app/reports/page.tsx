"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AppShell } from '@/components/shared/AppShell';
import { 
  FileText, 
  Printer, 
  TrendingUp, 
  Users, 
  Banknote, 
  Loader2,
  ChevronRight,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { shiftService } from '@/lib/services/shift-service';
import { useAuth } from '@/components/providers/AuthProvider';
import { ShiftReport } from '@/components/management/ShiftReport';

export default function StaffReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const [showCountModal, setShowCountModal] = useState(false);
  const [actualCashInput, setActualCashInput] = useState('');

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const result = await shiftService.getTodaySummary(user.id);
      setData(result);
    } catch (err) {
      console.error('Failed to load staff reports:', err);
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    init();
  }, [loadData]);

  // Realtime Sync for Staff Analytics
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('staff-reports-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadData]);

  const handlePrint = () => {
    if (data?.currentShift) {
      setShowCountModal(true);
    } else {
      window.print();
    }
  };

  const confirmAndPrint = () => {
    setShowCountModal(false);
    // Timeout to allow modal to close before print
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  const transactions = data?.transactions || [];
  const currentShift = data?.currentShift;
  const totalSales = transactions.reduce((acc: number, tx: any) => acc + tx.total_amount, 0);
  const mtnSales = transactions.filter((tx: any) => tx.payment_method === 'momo').reduce((acc: number, tx: any) => acc + tx.total_amount, 0);
  const cashSales = transactions.filter((tx: any) => tx.payment_method === 'cash').reduce((acc: number, tx: any) => acc + tx.total_amount, 0);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-layer, #print-layer * { visibility: visible !important; }
          #print-layer { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important;
            display: block !important;
          }
        }
      `}</style>

      {/* Print-Only Layer (Isolated) */}
      <div id="print-layer" className="hidden print:block">
        {(() => {
          const allShifts = data?.allShifts || [];
          const firstShift = allShifts[0];
          const lastShift = allShifts[allShifts.length - 1];
          const aggregateStartingCash = firstShift ? Number(firstShift.starting_cash) : 0;
          
          // Final money left in the drawer at the end of the day
          const aggregateActualCash = currentShift 
            ? (actualCashInput ? Number(actualCashInput) : Number(currentShift.actual_cash || 0))
            : (lastShift ? Number(lastShift.actual_cash || 0) : 0);

          // Expected Total for the day = Starting Float + Today's Cash Sales
          const aggregateExpectedCash = aggregateStartingCash + cashSales;

          return (
            <ShiftReport 
              shift={currentShift ? {
                ...currentShift,
                starting_cash: aggregateStartingCash,
                expected_cash: aggregateExpectedCash,
                actual_cash: aggregateActualCash,
                transactions: transactions,
                allShifts: allShifts
              } : {
                id: `DAY-${data?.date}`,
                status: 'closed',
                start_time: data?.date + 'T00:00:00Z',
                end_time: new Date().toISOString(),
                starting_cash: aggregateStartingCash,
                expected_cash: aggregateExpectedCash,
                actual_cash: aggregateActualCash,
                operator: profile,
                transactions: transactions,
                allShifts: allShifts
              }} 
            />
          );
        })()}
      </div>

      <AppShell>
        <div className="space-y-8 animate-fade-in relative pb-10 print:hidden px-1">
          {/* Executive Header */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between pt-2">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black font-outfit tracking-tighter text-slate-900 leading-tight">Daily Operational Report</h1>
              <p className="text-slate-500 text-sm sm:text-lg font-medium">Real-time performance tracking and shift hierarchy.</p>
            </div>
            <button 
              onClick={handlePrint}
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-950 px-8 py-4 text-[11px] font-black text-white shadow-2xl shadow-slate-200 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-[0.2em]"
            >
              <Printer className="h-4 w-4" />
              Generate report
            </button>
          </div>

          {/* Physical Count Modal */}
          {showCountModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-10 animate-fade-in">
                <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                  <Banknote className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-outfit">Interim Cash Audit</h3>
                <p className="text-sm font-bold text-slate-400 mt-2 mb-8 uppercase tracking-widest leading-relaxed">
                  Enter current physical cash <br/> count in drawer for check-out.
                </p>

                <div className="space-y-6">
                  <input 
                    type="number"
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(e.target.value)}
                    placeholder="Enter cash total..."
                    className="w-full h-16 rounded-2xl bg-slate-50 border-0 px-8 text-2xl font-black text-indigo-600 text-center focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                    autoFocus
                  />

                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={confirmAndPrint}
                      className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
                    >
                      Process & Print Report
                    </button>
                    <button 
                      onClick={() => setShowCountModal(false)}
                      className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                    >
                      Cancel Audit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Strategy - High Fidelity KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatisticCard 
              label="Today's Sales" 
              value={totalSales} 
              icon={TrendingUp} 
              color="text-indigo-600" 
              bg="bg-indigo-50/50"
              sub="Aggregate Revenue"
            />
            <StatisticCard 
              label="Cash in Drawer" 
              value={cashSales} 
              icon={Banknote} 
              color="text-emerald-600" 
              bg="bg-emerald-50/50"
              sub="Physical Handover"
            />
            <StatisticCard 
              label="MOMO Settlement" 
              value={mtnSales} 
              icon={ShoppingCart} 
              color="text-sky-600" 
              bg="bg-sky-50/50"
              sub="Digital Float"
            />
          </div>

          {/* Itemized Audit Ledger */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black font-outfit uppercase tracking-tighter text-slate-900 leading-none">Itemized Sales Ledger</h3>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Personal Performance</span>
              </div>
            </div>
            
            <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden min-h-[400px]">
              {/* Desktop Analytical View */}
              <table className="hidden lg:table w-full text-left">
                <thead>
                  <tr className="border-b bg-slate-50/50 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">
                    <th className="px-8 py-6">Chronology</th>
                    <th className="px-8 py-6">Counterparty</th>
                    <th className="px-8 py-6">Allocation / Service</th>
                    <th className="px-8 py-6 text-center">Unit Volume</th>
                    <th className="px-8 py-6 text-right">Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm font-medium">
                  {transactions.map((tx: any) => {
                    const clientName = tx.customer_name || tx.client?.org_name || 'Individual Retail';
                    const items = tx.transaction_items?.map((ti: any) => ti.products?.name).filter(Boolean).join(', ') || 'General Asset';
                    const qty = tx.transaction_items?.reduce((acc: number, ti: any) => acc + ti.quantity, 0) || 1;
                    
                    return (
                      <tr key={tx.id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-black text-slate-400 text-[10px] uppercase tracking-tighter">
                            {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <p className={cn(
                            "font-black font-outfit uppercase text-sm leading-none",
                            tx.client_id ? "text-indigo-600" : "text-slate-900"
                          )}>
                            {clientName}
                          </p>
                          <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest mt-1.5">{tx.payment_method} Settlement</p>
                        </td>
                        <td className="px-8 py-5">
                           <p className="font-black uppercase text-[10px] text-slate-500 tracking-tight truncate max-w-[200px]">{items}</p>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 font-black text-[10px] text-slate-500">{qty}</span>
                        </td>
                        <td className="px-8 py-5 text-right whitespace-nowrap">
                           <p className="font-black text-slate-950 text-base">{tx.total_amount.toLocaleString()} <span className="text-[10px] opacity-20 uppercase">rwf</span></p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile/Tablet Command View */}
              <div className="lg:hidden divide-y divide-slate-50">
                {transactions.map((tx: any) => {
                  const clientName = tx.customer_name || tx.client?.org_name || 'Individual Retail';
                  const items = tx.transaction_items?.map((ti: any) => ti.products?.name).filter(Boolean).join(', ') || 'General Services';
                  const qty = tx.transaction_items?.reduce((acc: number, ti: any) => acc + ti.quantity, 0) || 1;
                  
                  return (
                    <div key={tx.id} className="p-6 sm:p-8 space-y-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-2 w-2 rounded-full bg-slate-200" />
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                          {tx.payment_method}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <p className={cn(
                          "font-black text-lg font-outfit uppercase leading-tight",
                          tx.client_id ? "text-indigo-600" : "text-slate-900"
                        )}>
                          {clientName}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">{items}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Allocation Volume</p>
                           <span className="h-6 px-2 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">{qty}</span>
                        </div>
                        <p className="text-xl font-black text-slate-950">
                          {tx.total_amount.toLocaleString()} <span className="text-[10px] opacity-20 uppercase tracking-tighter">RWF</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {transactions.length === 0 && (
                <div className="px-8 py-32 text-center text-slate-300">
                   <FileText className="h-12 w-12 mx-auto mb-4 opacity-10" />
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Registry Standby</p>
                      <p className="text-xs font-medium">No operational history detect for this temporal cycle.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
}

function StatisticCard({ label, value, icon: Icon, color, bg, sub }: any) {
  return (
    <div className="rounded-[2.2rem] border border-slate-100 bg-white p-7 shadow-sm group hover:border-slate-300 transition-all hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("rounded-2xl p-3.5 shadow-inner transition-colors", bg, color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mt-1 italic">{sub}</p>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-3xl font-black font-outfit text-slate-950 leading-none">
          {value.toLocaleString()} <span className="text-[12px] font-bold opacity-20 uppercase tracking-tighter ml-1">rwf</span>
        </p>
        <div className="h-1.5 w-full bg-slate-50 rounded-full mt-5 overflow-hidden border border-slate-100/50">
           <div className={cn("h-full rounded-full transition-all duration-1000", bg.replace('/50', ''))} style={{ width: '70%', opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}
