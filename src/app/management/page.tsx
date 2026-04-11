"use client";

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { financialService, FinancialSummary } from '@/lib/services/financial-service';
import { supabase } from '@/lib/supabase/client';

export default function Dashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const [sum, txs] = await Promise.all([
        financialService.getSummary(),
        supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);
      
      setSummary(sum);
      if (txs.data) setRecentTransactions(txs.data);
      setLoading(false);
    }
    loadDashboardData();
  }, []);

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold font-outfit">Management Overview</h1>
            <p className="text-muted-foreground mt-1 text-lg">Real-time performance from PASTOR BONUS CO. LTD ecosystem.</p>
          </div>
          <button className="hidden sm:flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
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
                title="Daily Revenue" 
                value={summary?.dailyRevenue.toLocaleString() || "0"} 
                sub="RWF Today"
                icon={Wallet}
                trend="Today"
                positive
              />
              <StatCard 
                title="Active Debt" 
                value={summary?.totalDebt.toLocaleString() || "0"} 
                sub="Market Portfolio"
                icon={AlertCircle}
                trend="Receivables"
                positive={false}
              />
              <StatCard 
                title="Weekly Growth" 
                value={summary?.weeklyRevenue.toLocaleString() || "0"} 
                sub="RWF Performance"
                icon={TrendingUp}
                trend="7 Days"
                positive
              />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Recent Sales */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-outfit">Recent Store Activity</h3>
                  <button className="text-sm font-medium text-primary hover:underline">View Ledger</button>
                </div>
                <div className="rounded-2xl border bg-card/30 backdrop-blur-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground">
                        <th className="px-6 py-4 font-bold">Transaction ID</th>
                        <th className="px-6 py-4 font-bold">Type</th>
                        <th className="px-6 py-4 font-bold">Payment</th>
                        <th className="px-6 py-4 font-bold text-center">Status</th>
                        <th className="px-6 py-4 font-bold">Total</th>
                        <th className="px-6 py-4 font-bold text-center">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {recentTransactions.map((tx) => (
                        <TransactionRow 
                          key={tx.id}
                          id={`#${tx.id.slice(0, 8).toUpperCase()}`}
                          customer={tx.customer_name || (tx.client_id ? 'Market' : 'Retail')}
                          paymentMethod={tx.payment_method}
                          paymentStatus={tx.payment_status}
                          amount={tx.total_amount.toLocaleString()} 
                          source={tx.source}
                        />
                      ))}
                      {recentTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground italic">No transactions recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Health */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-outfit">Store Alerts</h3>
                
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-primary/10 p-2">
                       <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">Inventory Sync Active</h4>
                      <p className="text-sm text-muted-foreground mt-1">Unified stock management between POS and Online Shop is functioning normally.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border p-6 bg-card/30 backdrop-blur-sm">
                  <h4 className="font-bold">Staff Oversight</h4>
                  <p className="mt-2 text-sm text-muted-foreground">Detailed performance metrics are available in the Financials section.</p>
                  <button className="mt-4 w-full rounded-xl bg-[#1A1C1E] py-3 text-xs font-bold text-white hover:bg-primary transition-colors">
                    View Staff Performance
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return <AlertCircle className={className} />;
}

function StatCard({ title, value, sub, icon: Icon, trend, positive }: any) {
  return (
    <div className="group relative rounded-2xl border bg-card/50 p-6 backdrop-blur-md transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-muted p-2.5 group-hover:bg-primary/10 transition-colors">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
          positive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
        )}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend}
        </div>
      </div>
      <div className="mt-5">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{sub}</span>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ id, customer, paymentMethod, paymentStatus, amount, source }: any) {
  return (
    <tr className="group hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4 font-mono text-xs font-semibold">{id}</td>
      <td className="px-6 py-4 font-medium">{customer}</td>
      <td className="px-6 py-4">
        <span className={cn(
          "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
          paymentMethod === 'cash' ? "bg-emerald-100 text-emerald-700" : (paymentMethod === 'credit' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")
        )}>
          {paymentMethod}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={cn(
          "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
          paymentStatus === 'paid' ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700 border border-amber-200"
        )}>
          {paymentStatus}
        </span>
      </td>
      <td className="px-6 py-4 font-bold">{amount} RWF</td>
      <td className="px-6 py-4 text-xs text-muted-foreground text-center uppercase font-bold tracking-widest">{source}</td>
    </tr>
  );
}
