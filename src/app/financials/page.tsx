"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { 
  BarChart3, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  ChevronDown,
  Calendar as CalendarIcon,
  UserCheck,
  Loader2,
  ShoppingCart,
  Zap,
  Users,
  Package,
  TrendingUp,
  Banknote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { financialService, FinancialSummary, StaffPerformance, DebtAging } from '@/lib/services/financial-service';
import { shiftService } from '@/lib/services/shift-service';
import { FinancialReport } from '@/components/management/FinancialReport';
import { ExpenseModal } from '@/components/management/ExpenseModal';

export default function FinancialsPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [staffPerf, setStaffPerf] = useState<StaffPerformance[]>([]);
  const [debtAging, setDebtAging] = useState<DebtAging[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [recentShifts, setRecentShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const router = useRouter();
  const { profile } = useAuth();

  // Date Range State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1); // Default to last month
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadData = useCallback(async () => {
    // We don't want to set global loading to true on every background update
    // as it would cause layout flickers. We only do it on initial load.
    try {
      const [sum, perf, aging, txs, expenses, sh] = await Promise.all([
        financialService.getSummary(startDate, endDate),
        financialService.getStaffPerformance(startDate, endDate),
        financialService.getDebtAging(),
        supabase
          .from('transactions')
          .select(`
            *,
            client:clients_market (org_name),
            operator:profiles (full_name),
            transaction_items (
              products (name)
            )
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59')
          .order('created_at', { ascending: false })
          .limit(100),
        financialService.getExpenses(startDate, endDate),
        shiftService.getShiftHistory(20)
      ]);
      setSummary(sum);
      setStaffPerf(perf);
      setDebtAging(aging);
      setRecentTransactions(txs.data || []);
      setRecentExpenses(expenses);
      setRecentShifts(sh || []);
    } catch (err) {
      console.error('Financials Load Error:', err);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };

    // Admin-Only Security Gate
    if (!loading && profile && profile.role !== 'admin') {
      router.push('/pos');
      return;
    }

    if (profile) {
      init();
    }
  }, [profile?.id, router, loadData]);

  // Realtime Sync for Financials
  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;

    const channel = supabase
      .channel('financials-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients_market' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, loadData]);

  useEffect(() => {
    const main = document.querySelector('main');
    const root = document.documentElement;
    
    if (showModal || showExpenseModal) {
      // Lock everything
      document.body.style.overflow = 'hidden';
      root.style.overflow = 'hidden';
      if (main) main.style.overflow = 'hidden';
    } else {
      // Unlock
      document.body.style.overflow = 'unset';
      root.style.overflow = 'unset';
      if (main) main.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      root.style.overflow = 'unset';
      if (main) main.style.overflow = 'auto';
    };
  }, [showModal, showExpenseModal]);

  const handlePrint = () => {
    setShowModal(false);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days === 0) {
      // Today only
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(end.getDate() - days);
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  if (loading && !summary) {
    return (
      <AppShell>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in relative">
        {/* Header */}
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-1">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black font-outfit tracking-tighter text-slate-900 leading-tight">Financial Oversight</h1>
            <p className="text-slate-500 text-sm sm:text-lg font-medium">Revenue yields, debt collection, and staff audit reports.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button 
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-6 py-3.5 text-[11px] font-black text-rose-600 shadow-sm hover:bg-rose-100 transition-all active:scale-95 uppercase tracking-widest"
            >
              <ShoppingCart className="h-4 w-4" />
              Record Expense
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-[11px] font-black text-white shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-widest"
            >
              <Download className="h-4 w-4" />
              Generate Report
            </button>
          </div>
        </div>

        {/* Executive Stats Block */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-1">
          <FinCard 
            title="Total Revenue" 
            value={summary?.totalRevenue.toLocaleString() || '0'} 
            sub="Gross Intake" 
            icon={TrendingUp} 
            trend="+12%" 
            isPositive={true}
          />
          <FinCard 
            title="Total Expenses" 
            value={summary?.totalExpenses.toLocaleString() || '0'} 
            sub="Operational Drain" 
            icon={ShoppingCart} 
            trend="Active" 
            isPositive={false}
          />
          <FinCard 
            title="Net Position" 
            value={summary?.netPosition.toLocaleString() || '0'} 
            sub="Agreed Yield" 
            icon={Banknote} 
            trend={summary && summary.netPosition < 0 ? 'Negative' : 'Growth'} 
            isPositive={summary ? summary.netPosition >= 0 : true}
          />
          <FinCard 
            title="Market Debt" 
            value={summary?.totalDebt.toLocaleString() || '0'} 
            sub="Pending Collection" 
            icon={AlertCircle} 
            trend="High Risk" 
            isPositive={false}
          />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 pt-4">
          {/* Debt Collection: High-Density Audit */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex items-center justify-between px-2">
               <h3 className="text-xl font-black font-outfit uppercase tracking-tighter leading-none">Priority Collections</h3>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">Debt Aging Analysis</span>
             </div>

             {/* Desktop Debt Table */}
             <div className="hidden sm:block rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden min-h-[300px]">
               <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-6 py-5 font-black">Counterparty Identity</th>
                      <th className="px-6 py-5 font-black">Exposure Level</th>
                      <th className="px-6 py-5 font-black text-right">Agreed Balance</th>
                      <th className="px-6 py-5 text-center font-black">Operation</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 text-sm font-medium">
                   {debtAging.map(debt => (
                     <DebtRow key={debt.client_id} name={debt.org_name} amount={debt.balance.toLocaleString()} risk={debt.balance > 1000000 ? 'high' : 'med'} />
                   ))}
                   {!loading && debtAging.length === 0 && (
                     <tr>
                       <td colSpan={4} className="py-24 text-center text-slate-300">
                          <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                          <p className="text-[10px] uppercase font-black tracking-widest italic">Registry healthy. No outstanding exposure.</p>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>

             {/* Mobile Debt Cards */}
             <div className="sm:hidden space-y-4 px-1">
               {debtAging.map(debt => (
                 <div key={debt.client_id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-5 relative group overflow-hidden">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Stakeholder</p>
                          <p className="text-sm font-black text-slate-900 uppercase font-outfit leading-none">{debt.org_name}</p>
                       </div>
                       <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                          <Ping risk={debt.balance > 1000000 ? 'high' : 'med'} />
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{debt.balance > 1000000 ? 'High' : 'Medium'} Risk</span>
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Pending Yield</p>
                          <p className="text-xl font-black text-slate-900 leading-none">{debt.balance.toLocaleString()} <span className="text-[10px] opacity-30">RWF</span></p>
                       </div>
                       <button className="h-11 px-6 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-all">
                          Recover
                       </button>
                    </div>
                 </div>
               ))}
               {!loading && debtAging.length === 0 && (
                 <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No exposure detected.</p>
                 </div>
               )}
             </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-6">
            <h3 className="text-xl font-black font-outfit uppercase tracking-tighter leading-none px-2">Revenue Matrix</h3>
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 space-y-7 shadow-sm">
                <BreakdownItem 
                  label="Direct POS Sales" 
                  value={(summary?.breakdown.pos || 0).toLocaleString()} 
                  percentage={summary?.totalRevenue ? Math.round((summary.breakdown.pos / summary.totalRevenue) * 100) : 0} 
                  color="bg-slate-950" 
                />
                <BreakdownItem 
                  label="Printing Services" 
                  value={(summary?.breakdown.print || 0).toLocaleString()} 
                  percentage={summary?.totalRevenue ? Math.round((summary.breakdown.print / summary.totalRevenue) * 100) : 0} 
                  color="bg-indigo-600" 
                />
                <BreakdownItem 
                  label="Strategic Other" 
                  value={(summary?.breakdown.other || 0).toLocaleString()} 
                  percentage={summary?.totalRevenue ? Math.round((summary.breakdown.other / summary.totalRevenue) * 100) : 0} 
                  color="bg-emerald-600" 
                />
               
               <div className="pt-6 border-t border-slate-100 mt-4 bg-slate-50/50 -mx-8 -mb-8 p-8 rounded-b-[2.5rem]">
                 <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Aggregate</span>
                   <span className="text-sm font-black text-slate-950">{summary?.totalRevenue.toLocaleString()} RWF</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Staff Performance Section */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black font-outfit uppercase tracking-tighter leading-none">Operational Accountability</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Liquidity Production Report</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
                 <CalendarIcon className="h-4 w-4 text-slate-400" />
                 <span>Life-to-Date Flow</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
             {/* Desktop Staff Table */}
             <div className="lg:col-span-2 hidden sm:block rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden min-h-[300px]">
               <table className="w-full text-left">
                 <thead>
                    <tr className="border-b bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      <th className="px-6 py-5 font-black text-center w-20">Identity</th>
                      <th className="px-6 py-5 font-black">Staff Member</th>
                      <th className="px-6 py-5 font-black text-right">Transactions</th>
                      <th className="px-6 py-5 font-black text-right">Cash Produced</th>
                      <th className="px-6 py-5 text-center font-black">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 text-sm font-medium">
                   {staffPerf.map(staff => (
                     <StaffReportRow 
                       key={staff.staff_id}
                       name={staff.full_name} 
                       count={staff.transaction_count}
                       total={staff.total_sales.toLocaleString()} 
                       status="Confirmed" 
                     />
                   ))}
                   {!loading && staffPerf.length === 0 && (
                     <tr>
                       <td colSpan={5} className="py-24 text-center text-slate-300">
                          <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                          <p className="text-[10px] uppercase font-black tracking-widest italic">No operational data detected.</p>
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>

             {/* Mobile Staff Cards */}
             <div className="lg:col-span-2 sm:hidden space-y-4 px-1">
               {staffPerf.map(staff => (
                 <div key={staff.staff_id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-6 relative group overflow-hidden">
                    <div className="flex items-center gap-4">
                       <div className="h-14 w-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-500 shadow-inner">
                          {staff.full_name.split(' ').map((n: string) => n[0]).join('')}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-950 uppercase font-outfit leading-none mb-1">{staff.full_name}</p>
                          <div className="flex items-center gap-1.5">
                             <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">Verified</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Volume</p>
                          <p className="text-sm font-black text-slate-900">{staff.transaction_count} <span className="text-[9px] opacity-40 uppercase">Txs</span></p>
                       </div>
                       <div className="space-y-1 text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Production</p>
                          <p className="text-sm font-black text-indigo-600">{staff.total_sales.toLocaleString()} <span className="text-[9px] opacity-40 uppercase">rwf</span></p>
                       </div>
                    </div>
                 </div>
               ))}
               {!loading && staffPerf.length === 0 && (
                 <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No production data.</p>
                 </div>
               )}
             </div>

             <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm h-fit">
                <div className="flex items-center gap-4 mb-8">
                  <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-xl shadow-slate-200">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <h4 className="font-black font-outfit uppercase tracking-widest text-lg">Drawer Matrix</h4>
                </div>
                <div className="space-y-5">
                  <div className="p-6 rounded-3xl bg-slate-950 border border-white/10 text-white shadow-2xl shadow-slate-200">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Liquid Reserve</p>
                    <p className="text-3xl font-black font-outfit">{summary?.liquidBalance.toLocaleString()} <span className="text-[12px] font-bold opacity-30 uppercase">RWF</span></p>
                    <p className="text-[8px] font-bold text-white/20 mt-3 uppercase tracking-widest leading-relaxed">Paid Inventory - Expenses Sync</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Expected Gross</p>
                    <p className="text-2xl font-black font-outfit text-slate-900">{summary?.totalRevenue.toLocaleString()} <span className="text-[10px] font-bold opacity-30 uppercase">RWF</span></p>
                  </div>
                  <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100">
                    <p className="text-[10px] font-black text-amber-800/40 uppercase tracking-[0.2em] mb-2">Market Debt</p>
                    <p className="text-2xl font-black font-outfit text-amber-900">{summary?.totalDebt.toLocaleString()} <span className="text-[10px] font-bold opacity-30 uppercase">RWF</span></p>
                  </div>
                </div>
                <button className="w-full mt-8 rounded-2xl bg-indigo-600 py-4.5 text-[11px] font-black text-white shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">
                  Initialize Audit
                </button>
             </div>
          </div>
        </div>

        {/* Expense Modal Sync */}
        {showExpenseModal && (
          <ExpenseModal 
            onClose={() => setShowExpenseModal(false)}
            availableLiquidity={summary?.liquidBalance || 0}
            onSuccess={() => {
              const reload = async () => {
                const [sum, perf, aging, expenses] = await Promise.all([
                  financialService.getSummary(startDate, endDate),
                  financialService.getStaffPerformance(startDate, endDate),
                  financialService.getDebtAging(),
                  financialService.getExpenses(startDate, endDate)
                ]);
                setSummary(sum);
                setStaffPerf(perf);
                setDebtAging(aging);
                setRecentExpenses(expenses);
              };
              reload();
            }}
          />
        )}

        {/* Audit Report Nexus (Refactored Modal) */}
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center sm:items-start sm:pt-20 p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="w-full h-full sm:h-auto sm:max-w-md rounded-none sm:rounded-[2.5rem] border-none sm:border border-slate-100 bg-white p-8 sm:p-10 shadow-2xl flex flex-col sm:block animate-in slide-in-from-bottom sm:slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between mb-8 sm:mb-6">
                  <div className="space-y-1">
                    <h3 className="text-3xl sm:text-2xl font-black font-outfit leading-tight tracking-tighter">Report Center</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Generation Period</p>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="h-12 w-12 sm:h-8 sm:w-8 rounded-full bg-slate-50 flex items-center justify-center text-xl font-light hover:bg-slate-100 transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 sm:mb-6">
                  <PresetBtn label="Daily" sub="Today Only" onClick={() => applyPreset(0)} />
                  <PresetBtn label="Weekly" sub="Last 7 Days" onClick={() => applyPreset(7)} />
                  <PresetBtn label="Monthly" sub="Last 30 Days" onClick={() => applyPreset(30)} />
                </div>

                <div className="space-y-6 sm:space-y-4 pt-2">
                   <div className="flex items-center gap-3">
                     <div className="h-[1px] bg-slate-100 flex-1" />
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Temporal Bound</p>
                     <div className="h-[1px] bg-slate-100 flex-1" />
                   </div>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Start Date</label>
                        <input 
                          type="date" 
                          value={startDate} 
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full h-14 sm:h-auto rounded-2xl border border-slate-100 bg-slate-50/50 px-5 sm:px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-950 outline-none transition-all" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">End Date</label>
                        <input 
                          type="date" 
                          value={endDate} 
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full h-14 sm:h-auto rounded-2xl border border-slate-100 bg-slate-50/50 px-5 sm:px-3 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-950 outline-none transition-all" 
                        />
                      </div>
                   </div>
                </div>

                <div className="mt-auto sm:mt-10 sm:pt-4">
                   <button 
                    onClick={handlePrint}
                    className="w-full h-16 sm:h-auto rounded-[1.25rem] sm:rounded-2xl bg-slate-950 py-5 sm:py-4 text-[11px] font-black text-white shadow-2xl shadow-slate-200 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em]"
                   >
                     <FileText className="h-4 w-4" />
                     Commit & Audit
                   </button>
                   <p className="text-center text-[9px] font-black text-slate-300 mt-6 sm:mt-4 italic tracking-tight">Audit integrity will be preserved for the selected range.</p>
                </div>
             </div>
          </div>
        )}

        {/* Operational Flow Ledger */}
        <div className="space-y-6 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
            <h3 className="text-xl sm:text-2xl font-black font-outfit uppercase tracking-tighter text-slate-900">Aggregate Sales Ledger</h3>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Download Archive (CSV)</button>
          </div>
          
          {/* Desktop Transaction Table */}
          <div className="hidden sm:block rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden min-h-[400px]">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                   <th className="px-6 py-5 font-black">Ref ID</th>
                   <th className="px-6 py-5 font-black">Allocation / Payload</th>
                   <th className="px-6 py-5 font-black">Operator</th>
                   <th className="px-6 py-5 font-black text-center">Protocol</th>
                   <th className="px-6 py-5 font-black text-right">Yield</th>
                   <th className="px-6 py-5 text-center font-black">Asset</th>
                   <th className="px-6 py-5 text-center font-black whitespace-nowrap">Chronology</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-sm font-medium">
                 {recentTransactions.map((tx) => {
                   const clientType = tx.client_id ? 'Subscriber' : 'Retail';
                   const subscriberName = tx.client?.org_name || (Array.isArray(tx.client) ? tx.client[0]?.org_name : null);
                   const clientName = tx.customer_name || subscriberName || (tx.client_id ? 'Market Entity' : 'Guest');
                   const items = tx.transaction_items?.map((ti: any) => ti.products?.name).filter(Boolean).join(', ') || 'General Services';
                   const time = new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                   const dateString = new Date(tx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                   
                   return (
                    <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5 font-mono text-[10px] text-slate-300 uppercase">#{tx.id.slice(0, 8)}</td>
                      <td className="px-6 py-5">
                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1.5">{clientType}</p>
                        <p className="font-black text-slate-900 truncate max-w-[200px] leading-tight">{items}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 italic">{clientName}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                           <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 shadow-inner">
                             {tx.operator?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                           </div>
                           <span className="font-black text-[10px] uppercase tracking-widest text-slate-600">{tx.operator?.full_name?.split(' ')[0] || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <span className={cn(
                          "rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border",
                          tx.payment_status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        )}>
                          {tx.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-950">{tx.total_amount.toLocaleString()} <span className="text-[9px] opacity-20">RWF</span></td>
                      <td className="px-6 py-5 text-center uppercase text-[10px] font-black text-slate-400 tracking-tighter">{tx.payment_method}</td>
                      <td className="px-6 py-5 text-center">
                        <p className="text-[10px] font-black text-slate-900">{dateString}</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{time}</p>
                      </td>
                    </tr>
                   );
                 })}
               </tbody>
             </table>
          </div>

          {/* Mobile Transaction Cards */}
          <div className="sm:hidden space-y-4 px-1">
             {recentTransactions.map((tx) => (
                <div key={tx.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{tx.client_id ? 'Subscriber' : 'Retail'}</span>
                           <span className="text-[8px] font-mono text-slate-300">#{tx.id.slice(0, 8)}</span>
                         </div>
                         <p className="text-sm font-black text-slate-950 uppercase font-outfit">{tx.transaction_items?.[0]?.products?.name || 'General Sale'}</p>
                      </div>
                      <span className={cn(
                        "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border",
                        tx.payment_status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {tx.payment_status}
                      </span>
                   </div>
                   
                   <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">
                           {tx.operator?.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-slate-900 uppercase leading-none">{tx.operator?.full_name?.split(' ')[0] || 'System'}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-black text-slate-950 leading-none">{tx.total_amount.toLocaleString()} <span className="text-[10px] opacity-20">RWF</span></p>
                         <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1">{tx.payment_method}</p>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>

        {/* Operational Cost History */}
        <div className="space-y-6 pt-10 pb-20">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl sm:text-2xl font-black font-outfit uppercase tracking-tighter text-slate-900">Expenditure Log</h3>
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50/50 border border-rose-100 px-3 py-1.5 rounded-full">Cost Analysis</span>
          </div>

          {/* Desktop Expense Table */}
          <div className="hidden sm:block rounded-[2.5rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                   <th className="px-6 py-5 font-black">Classification</th>
                   <th className="px-6 py-5 font-black">Description / Remarks</th>
                   <th className="px-6 py-5 text-right font-black">Drain Amount</th>
                   <th className="px-6 py-5 text-center font-black">Registry Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-sm font-medium">
                 {recentExpenses.map((exp) => (
                   <tr key={exp.id} className="group hover:bg-slate-50/50 transition-colors">
                     <td className="px-6 py-5">
                        <span className="flex items-center gap-3">
                           <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                           <span className="font-black uppercase text-[10px] tracking-widest text-slate-600">{exp.category}</span>
                        </span>
                     </td>
                     <td className="px-6 py-5 font-black text-slate-900">{exp.description}</td>
                     <td className="px-6 py-5 text-right font-black text-rose-600 italic">-{Number(exp.amount).toLocaleString()} <span className="text-[9px] opacity-30">RWF</span></td>
                     <td className="px-6 py-5 text-center text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                       {new Date(exp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          {/* Mobile Expense Cards */}
          <div className="sm:hidden space-y-4 px-1">
             {recentExpenses.map((exp) => (
                <div key={exp.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm space-y-5">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                         <div className="h-2 w-2 rounded-full bg-rose-500" />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exp.category}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{new Date(exp.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                   </div>
                   
                   <div className="flex justify-between items-end">
                      <p className="text-sm font-black text-slate-950 uppercase font-outfit max-w-[60%]">{exp.description}</p>
                      <p className="text-lg font-black text-rose-600 leading-none">-{Number(exp.amount).toLocaleString()} <span className="text-[10px] opacity-20">RWF</span></p>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      <FinancialReport 
        summary={summary} 
        transactions={recentTransactions} 
        shifts={recentShifts}
        startDate={startDate} 
        endDate={endDate} 
      />
    </AppShell>
  );
}

function PresetBtn({ label, sub, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 sm:p-4 rounded-[1.5rem] sm:rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-950 hover:border-slate-950 transition-all active:scale-95 group"
    >
      <span className="text-sm sm:text-xs font-black uppercase text-slate-950 group-hover:text-white transition-colors">{label}</span>
      <span className="text-[10px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 sm:mt-1 group-hover:text-white/40 transition-colors">{sub}</span>
    </button>
  );
}

function StaffReportRow({ name, count, total, status }: any) {
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
       <td className="px-6 py-5">
          <div className="flex justify-center">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-500">
              {name.split(' ').map((n: string) => n[0]).join('')}
            </div>
          </div>
       </td>
       <td className="px-6 py-5">
          <p className="font-black text-slate-950 uppercase font-outfit leading-none mb-1">{name}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operator Registry</p>
       </td>
       <td className="px-6 py-5 text-right font-black text-slate-900">{count} <span className="text-[9px] opacity-30">TXS</span></td>
       <td className="px-6 py-5 text-right font-black text-indigo-600">{total} <span className="text-[9px] opacity-20">RWF</span></td>
       <td className="px-6 py-5">
         <div className="flex items-center justify-center">
            <span className={cn(
              "rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border",
              status === 'Confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
            )}>
              {status}
            </span>
         </div>
       </td>
    </tr>
  );
}

function FinCard({ title, value, sub, icon: Icon, trend, isPositive }: any) {
  return (
    <div className="rounded-[1.75rem] border border-slate-100 bg-white p-7 shadow-sm flex flex-col justify-between h-44 group hover:shadow-xl hover:shadow-slate-100 transition-all hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-slate-50 p-3 group-hover:bg-slate-950 group-hover:text-white transition-all">
          <Icon className="h-6 w-6" />
        </div>
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border",
          isPositive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
        )}>
           {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
           {trend}
        </div>
      </div>
      <div>
         <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">{title}</p>
         <p className="text-2xl font-black font-outfit text-slate-950 leading-none">{value} <span className="text-[11px] font-bold opacity-20 uppercase">RWF</span></p>
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-wide mt-2">{sub}</p>
      </div>
    </div>
  );
}

function DebtRow({ name, amount, risk }: any) {
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
       <td className="px-6 py-5 font-black text-slate-900 uppercase font-outfit">{name}</td>
       <td className="px-6 py-5 capitalize">
         <div className="inline-flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
           <Ping risk={risk} />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{risk} Risk</span>
         </div>
       </td>
       <td className="px-6 py-5 font-black text-slate-950 text-right">{amount} <span className="text-[9px] opacity-20">RWF</span></td>
       <td className="px-6 py-5">
         <div className="flex items-center justify-center">
            <button className="h-10 px-5 rounded-xl border border-slate-100 bg-white text-[10px] font-black text-slate-950 uppercase tracking-widest shadow-sm hover:bg-slate-950 hover:text-white transition-all active:scale-95">
              Recover
            </button>
         </div>
       </td>
    </tr>
  );
}

function Ping({ risk }: { risk: string }) {
  const color = risk === 'high' ? 'bg-rose-500' : 'bg-amber-500';
  return (
    <span className="relative flex h-2 w-2">
      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)}></span>
      <span className={cn("relative inline-flex rounded-full h-2 w-2", color)}></span>
    </span>
  );
}

function BreakdownItem({ label, value, percentage, color }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-900">{percentage}%</span>
      </div>
      <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
         <div className={cn("h-full rounded-full shadow-lg transition-all duration-1000", color)} style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-[10px] text-right text-slate-300 font-black tracking-widest uppercase">{value} RWF</p>
    </div>
  );
}
