"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/shared/AppShell';
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  Calendar,
  Loader2,
  ShoppingCart,
  Banknote,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { financialService, FinancialSummary } from '@/lib/services/financial-service';
import { productService } from '@/lib/services/product-service';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { shiftService, Shift } from '@/lib/services/shift-service';
import { ManagementReport } from '@/components/management/ManagementReport';

export default function Dashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [shortages, setShortages] = useState<any[]>([]);
  const [recentShifts, setRecentShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { profile } = useAuth();

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [sum, txs, short, shifts] = await Promise.all([
          financialService.getSummary(),
          supabase
            .from('transactions')
            .select(`
              *,
              client:clients_market (
                org_name
              ),
              transaction_items (
                quantity,
                products (
                  name
                )
              )
            `)
            .order('created_at', { ascending: false })
            .limit(5),
          productService.getShortages(5),
          shiftService.getShiftHistory(10)
        ]);
        
        setSummary(sum);
        if (txs.data) setRecentTransactions(txs.data);
        if (short) setShortages(short);
        if (shifts) setRecentShifts(shifts);
      } catch (err) {
        console.error('Dashboard Load Error:', err);
      } finally {
        setLoading(false);
      }
    }

    // Role Guard: Only admins can access management
    if (!loading && profile && profile.role !== 'admin') {
      router.push('/pos');
      return;
    }

    if (profile) {
      loadDashboardData();
    }
  }, [profile?.id, router]);

  const handleDownload = () => {
    window.print();
  };

  return (
    <AppShell>
      <div className="space-y-5 animate-fade-in relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-outfit text-brand-secondary">Management Overview</h1>
            <p className="text-muted-foreground mt-1 text-lg">Daily performance monitoring and store operational auditing.</p>
          </div>
          <button 
            onClick={handleDownload}
            className="hidden sm:flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            <Calendar className="h-4 w-4" />
            Download Summary
          </button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Total Revenue" 
                value={summary?.totalRevenue.toLocaleString() || "0"} 
                sub="Cumulative RWF"
                icon={TrendingUp}
                trend="Live"
                positive
              />
              <StatCard 
                title="Total Expenses" 
                value={summary?.totalExpenses.toLocaleString() || "0"} 
                sub="External Costs"
                icon={ShoppingCart}
                trend="Operational"
                positive={false}
              />
              <StatCard 
                title="Net Position" 
                value={summary?.netPosition.toLocaleString() || "0"} 
                sub="True Profit"
                icon={Banknote}
                trend={summary && summary.netPosition < 0 ? "Loss" : "Profit"}
                positive={summary ? summary.netPosition >= 0 : true}
              />
              <StatCard 
                title="Active Debt" 
                value={summary?.totalDebt.toLocaleString() || "0"} 
                sub="Market Portfolio"
                icon={AlertCircle}
                trend="Receivables"
                positive={false}
              />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Recent Sales */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-outfit">Recent Store Activity</h3>
                  <Link href="/financials" className="text-sm font-medium text-primary hover:underline">View Ledger</Link>
                </div>
                <div className="rounded-2xl border bg-card/30 backdrop-blur-sm overflow-hidden">
                  <div className="overflow-x-auto scrollbar-hide">
                    {/* Desktop View */}
                    <table className="hidden sm:table w-full text-left min-w-[600px]">
                      <thead>
                        <tr className="border-b bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground">
                          <th className="px-4 py-4 font-bold">Transaction ID</th>
                          <th className="px-4 py-4 font-bold">Client / Items</th>
                          <th className="px-4 py-4 font-bold">Payment</th>
                          <th className="px-4 py-4 font-bold text-center">Status</th>
                          <th className="px-4 py-4 font-bold">Total</th>
                          <th className="px-4 py-4 font-bold text-center">Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {recentTransactions.map((tx) => {
                          const clientType = tx.client_id ? 'Client Abonné' : 'Retail';
                          const subscriberName = tx.client?.org_name || (Array.isArray(tx.client) ? tx.client[0]?.org_name : null);
                          const clientName = tx.customer_name || subscriberName || (tx.client_id ? 'Subscriber' : 'Individual Customer');
                          const items = tx.transaction_items?.map((ti: any) => ti.products?.name).filter(Boolean).join(', ') || 'General Items';
                          
                          return (
                            <TransactionRow 
                              key={tx.id}
                              id={`#${tx.id.slice(0, 8).toUpperCase()}`}
                              clientType={clientType}
                              clientName={clientName}
                              items={items}
                              paymentMethod={tx.payment_method}
                              paymentStatus={tx.payment_status}
                              amount={tx.total_amount.toLocaleString()} 
                              source={tx.source}
                            />
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Mobile View */}
                    <div className="sm:hidden divide-y divide-slate-50">
                      {recentTransactions.map((tx) => {
                        const clientType = tx.client_id ? 'Client Abonné' : 'Retail';
                        const subscriberName = tx.client?.org_name || (Array.isArray(tx.client) ? tx.client[0]?.org_name : null);
                        const clientName = tx.customer_name || subscriberName || (tx.client_id ? 'Subscriber' : 'Individual Customer');
                        const items = tx.transaction_items?.map((ti: any) => ti.products?.name).filter(Boolean).join(', ') || 'General Items';

                        return (
                          <TransactionCard 
                            key={tx.id}
                            id={`#${tx.id.slice(0, 8).toUpperCase()}`}
                            clientType={clientType}
                            clientName={clientName}
                            items={items}
                            paymentMethod={tx.payment_method}
                            paymentStatus={tx.payment_status}
                            amount={tx.total_amount.toLocaleString()} 
                          />
                        );
                      })}
                    </div>

                    {recentTransactions.length === 0 && (
                      <div className="px-6 py-10 text-center text-muted-foreground italic">No transactions recorded yet.</div>
                    )}
                  </div>
                </div>
              </div>

            {/* System Health */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-outfit">Store Alerts</h3>
                
                {shortages.length > 0 ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 animate-pulse shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-rose-500 p-2">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-rose-900">{shortages.length} Inventory Shortages</h4>
                        <p className="text-sm text-rose-700 mt-1">Found {shortages.length} items with less than 5 units in stock. Refill recommended.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-emerald-500 p-2">
                        <ShieldCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-emerald-900">Inventory Status: Healthy</h4>
                        <p className="text-sm text-emerald-700 mt-1">All standard stock levels are currently within safe operating limits.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border p-4 bg-card/30 backdrop-blur-sm shadow-sm">
                  <h4 className="font-bold">Staff Oversight</h4>
                  <p className="mt-2 text-sm text-muted-foreground">Detailed performance metrics are available in the Financials section.</p>
                  <button 
                    onClick={() => router.push('/financials')}
                    className="mt-4 w-full rounded-xl bg-brand-secondary py-3 text-xs font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-md active:scale-95"
                  >
                    View Oversight Records
                  </button>
                </div>
              </div>
             </div>

            {/* Shift Reconciliations - Full Width for better readability */}
            <div className="space-y-6 mt-8">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="text-xl font-black font-outfit text-slate-900 tracking-tight">Shift Accountability Ledger</h3>
                  <p className="text-xs text-muted-foreground font-medium">Monitoring drawer balances and operator handovers.</p>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
                  Drawer Records
                </span>
              </div>

              <div className="rounded-[2.5rem] border border-slate-100 bg-white/40 backdrop-blur-xl shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  {/* Desktop Table View */}
                  <table className="hidden md:table w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/30 text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                        <th className="px-6 py-5">Operator</th>
                        <th className="px-6 py-5 text-center">Status</th>
                        <th className="px-6 py-5 text-center">Opening</th>
                        <th className="px-6 py-5 text-center">Closing</th>
                        <th className="px-6 py-5 text-right">Expected Float</th>
                        <th className="px-6 py-5 text-right">Actual Count</th>
                        <th className="px-6 py-5 text-center">Audit Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/50 text-xs font-medium">
                      {recentShifts.map((shift: any) => {
                        const diff = (shift.actual_cash || 0) - (shift.expected_cash || 0);
                        const isOpen = shift.status === 'open';
                        
                        return (
                          <tr key={shift.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-900/20">
                                  {(shift.operator?.full_name || 'S').slice(0, 1).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{shift.operator?.full_name || 'System Auto'}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(shift.start_time).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border",
                                isOpen 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse" 
                                  : "bg-slate-50 text-slate-400 border-slate-100"
                              )}>
                                <span className={cn("h-1 w-1 rounded-full", isOpen ? "bg-emerald-500" : "bg-slate-300")} />
                                {shift.status}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                               <p className="font-black text-slate-900">{new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Start</p>
                            </td>
                            <td className="px-6 py-5 text-center">
                               <p className="font-black text-slate-900">
                                 {shift.end_time ? new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                               </p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">End</p>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <p className="font-black text-slate-700">
                                {isOpen 
                                  ? Number(shift.starting_cash).toLocaleString() 
                                  : (Number(shift.expected_cash) || 0).toLocaleString()}
                              </p>
                              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-1">RWF</p>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <p className="font-black text-slate-900">
                                {isOpen 
                                  ? "—" 
                                  : (Number(shift.actual_cash) || 0).toLocaleString()}
                              </p>
                              {!isOpen && <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter mt-1">RWF</p>}
                            </td>
                            <td className="px-6 py-5 text-center">
                              {isOpen ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-emerald-500 font-black uppercase tracking-[0.15em] text-[9px]">Active Session</span>
                                  <div className="h-1 w-12 bg-emerald-50 rounded-full overflow-hidden">
                                    <div className="h-full w-1/2 bg-emerald-500 animate-slide-infinite" />
                                  </div>
                                </div>
                              ) : (
                                <div className={cn(
                                  "inline-flex flex-col px-3 py-1.5 rounded-2xl border min-w-[100px]",
                                  diff === 0 
                                    ? "bg-emerald-50 border-emerald-100" 
                                    : diff < 0 
                                      ? "bg-rose-50 border-rose-100" 
                                      : "bg-sky-50 border-sky-100"
                                )}>
                                  <span className={cn(
                                    "font-black text-[10px]",
                                    diff === 0 ? "text-emerald-600" : diff < 0 ? "text-rose-600" : "text-sky-600"
                                  )}>
                                    {diff === 0 ? 'BALANCED' : (diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString())}
                                  </span>
                                  {diff !== 0 && <span className="text-[8px] font-bold opacity-60 uppercase tracking-tighter mt-0.5">{diff < 0 ? 'Shortfall' : 'Surplus'}</span>}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-slate-50">
                    {recentShifts.map((shift: any) => {
                      const diff = (shift.actual_cash || 0) - (shift.expected_cash || 0);
                      const isOpen = shift.status === 'open';
                      
                      return (
                        <div key={shift.id} className="p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-slate-900/20">
                                {(shift.operator?.full_name || 'S').slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm leading-tight">{shift.operator?.full_name || 'Operator'}</p>
                                <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mt-0.5">{new Date(shift.start_time).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <span className={cn(
                              "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border",
                              isOpen ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                            )}>
                              {shift.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50/50">
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Time Range</p>
                              <p className="font-bold text-slate-900 text-[10px]">
                                {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <span className="mx-1 text-slate-300">—</span>
                                {shift.end_time ? new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Active"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Session Date</p>
                              <p className="font-bold text-slate-900 text-[10px]">{new Date(shift.start_time).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-50/50">
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Expected</p>
                              <p className="font-black text-slate-700 text-sm">
                                {isOpen ? Number(shift.starting_cash).toLocaleString() : (Number(shift.expected_cash) || 0).toLocaleString()}
                                <span className="text-[9px] ml-1 opacity-50 font-bold uppercase">RWF</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Actual</p>
                              <p className="font-black text-slate-900 text-sm">
                                {isOpen ? "—" : (Number(shift.actual_cash) || 0).toLocaleString()}
                                {!isOpen && <span className="text-[9px] ml-1 opacity-50 font-bold uppercase">RWF</span>}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Result</span>
                            {isOpen ? (
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full animate-pulse">Running Session</span>
                            ) : (
                              <div className={cn(
                                "px-3 py-1.5 rounded-xl border text-center font-black text-[10px]",
                                diff === 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600" : diff < 0 ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-sky-50 border-sky-100 text-sky-600"
                              )}>
                                {diff === 0 ? 'BALANCED' : (diff > 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString())}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hidden high-fidelity report for PDF generation via print */}
      <ManagementReport 
        summary={summary} 
        transactions={recentTransactions} 
        shifts={recentShifts}
      />
    </AppShell>
  );
}



function StatCard({ title, value, sub, icon: Icon, trend, positive }: any) {
  const getTrendStyles = (trendLabel: string) => {
    const t = trendLabel.toLowerCase();
    if (t.includes('live')) return "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20";
    if (t.includes('today')) return "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20";
    if (t.includes('receivable')) return "bg-rose-500 text-white shadow-lg shadow-rose-500/20";
    if (t.includes('7 days')) return "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20";
    return positive 
      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
      : "bg-rose-500 text-white shadow-lg shadow-rose-500/20";
  };

  return (
    <div className="group relative rounded-2xl border bg-card/50 p-4 backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-muted p-2 group-hover:bg-primary/10 transition-colors">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-tighter",
          getTrendStyles(trend)
        )}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend}
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-[xs] font-medium text-muted-foreground">{title}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold tracking-tight">{value}</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{sub}</span>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ id, clientType, clientName, items, paymentMethod, paymentStatus, amount, source }: any) {
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-400">{id}</td>
      <td className="px-4 py-4">
        <div className="min-w-[150px] space-y-0.5">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{clientType}</p>
          <p className="font-bold text-slate-900 truncate max-w-[180px]">{items}</p>
          <p className="text-[10px] font-medium text-slate-400 italic">{clientName}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={cn(
          "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
          paymentMethod === 'cash' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : (paymentMethod === 'credit' ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-sky-50 text-sky-700 border border-sky-100")
        )}>
          {paymentMethod}
        </span>
      </td>
      <td className="px-4 py-4 text-center">
        <span className={cn(
          "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
          paymentStatus === 'paid' ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-amber-50 text-amber-700 border border-amber-100"
        )}>
          {paymentStatus}
        </span>
      </td>
      <td className="px-4 py-4 font-black whitespace-nowrap text-slate-900">{amount} <span className="text-[10px] opacity-40">RWF</span></td>
      <td className="px-4 py-4 text-xs text-muted-foreground text-center uppercase font-bold tracking-widest">{source}</td>
    </tr>
  );
}

function TransactionCard({ id, clientType, clientName, items, paymentMethod, paymentStatus, amount }: any) {
  return (
    <div className="px-4 py-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 font-mono italic">{id}</span>
        <span className={cn(
          "rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest border",
          paymentStatus === 'paid' ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-amber-50 text-amber-700 border border-amber-100"
        )}>
          {paymentStatus}
        </span>
      </div>
      <div>
        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">{clientType}</p>
        <p className="font-bold text-slate-900 text-sm leading-tight">{items}</p>
        <p className="text-[10px] text-slate-400 font-medium italic mt-1">{clientName}</p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            paymentMethod === 'cash' ? "bg-emerald-500" : (paymentMethod === 'credit' ? "bg-rose-500" : "bg-sky-500")
          )} />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{paymentMethod}</span>
        </div>
        <span className="text-sm font-black text-slate-900">{amount} RWF</span>
      </div>
    </div>
  );
}
