"use client";

import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { financialService, FinancialSummary, StaffPerformance, DebtAging } from '@/lib/services/financial-service';

export default function FinancialsPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [staffPerf, setStaffPerf] = useState<StaffPerformance[]>([]);
  const [debtAging, setDebtAging] = useState<DebtAging[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [sum, perf, aging] = await Promise.all([
        financialService.getSummary(),
        financialService.getStaffPerformance(),
        financialService.getDebtAging()
      ]);
      setSummary(sum);
      setStaffPerf(perf);
      setDebtAging(aging);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
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
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-outfit text-brand-secondary">Financial Oversight</h1>
            <p className="text-muted-foreground mt-1 text-lg">Detailed revenue breakdown, debt collection, and profit analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-all">
              <Download className="h-4 w-4" />
              Monthly Report
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-white shadow-xl active:scale-95 transition-all">
              <FileText className="h-4 w-4" />
              Generate Demand Letters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FinCard 
            title="Total Revenue" 
            value={summary?.totalRevenue.toLocaleString() || '0'} 
            sub="Life-to-date income" 
            icon={DollarSign} 
            trend="Live" 
            isPositive={true}
          />
          <FinCard 
            title="Daily Revenue" 
            value={summary?.dailyRevenue.toLocaleString() || '0'} 
            sub="Today's performance" 
            icon={Wallet} 
            trend="Today" 
            isPositive={true}
          />
          <FinCard 
            title="Active Debt" 
            value={summary?.totalDebt.toLocaleString() || '0'} 
            sub="Market receivables" 
            icon={AlertCircle} 
            trend="Collectable" 
            isPositive={false}
          />
          <FinCard 
            title="Net Position" 
            value={((summary?.totalRevenue || 0) - (summary?.totalDebt || 0)).toLocaleString()} 
            sub="Cash liquidity estimate" 
            icon={BarChart3} 
            trend="Current" 
            isPositive={true}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Debt Collection Table */}
          <div className="lg:col-span-2 space-y-4">
             <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold font-outfit">Priority Collections (Debt Aging)</h3>
               <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded">Active Debt</span>
             </div>
             <div className="rounded-3xl border bg-card/30 backdrop-blur-md overflow-hidden min-h-[300px]">
               <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="px-6 py-5 font-bold">Client / Debtor</th>
                      <th className="px-6 py-5 font-bold">Risk Level</th>
                      <th className="px-6 py-5 font-bold text-right">Amount</th>
                      <th className="px-6 py-5 text-center font-bold">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y text-sm font-medium">
                   {debtAging.map(debt => (
                     <DebtRow key={debt.client_id} name={debt.org_name} amount={debt.balance.toLocaleString()} risk={debt.balance > 1000000 ? 'high' : 'med'} />
                   ))}
                   {debtAging.length === 0 && (
                     <tr>
                       <td colSpan={4} className="py-20 text-center text-muted-foreground italic">No outstanding debt found.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-outfit">Revenue Breakdown</h3>
            <div className="rounded-3xl border bg-card/30 backdrop-blur-md p-6 space-y-6">
                <BreakdownItem 
                  label="Direct POS Sales" 
                  value={(summary?.breakdown.pos || 0).toLocaleString()} 
                  percentage={summary?.totalRevenue ? Math.round((summary.breakdown.pos / summary.totalRevenue) * 100) : 0} 
                  color="bg-primary" 
                />
                <BreakdownItem 
                  label="Printing Services" 
                  value={(summary?.breakdown.print || 0).toLocaleString()} 
                  percentage={summary?.totalRevenue ? Math.round((summary.breakdown.print / summary.totalRevenue) * 100) : 0} 
                  color="bg-orange-500" 
                />
                <BreakdownItem 
                  label="Other Services" 
                  value={(summary?.breakdown.other || 0).toLocaleString()} 
                  percentage={summary?.totalRevenue ? Math.round((summary.breakdown.other / summary.totalRevenue) * 100) : 0} 
                  color="bg-emerald-500" 
                />
               
               <div className="pt-6 border-t mt-4">
                 <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
                   <span>Expected Revenue</span>
                   <span>{summary?.totalRevenue.toLocaleString()} RWF</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Staff Performance & Accountability Section */}
        <div className="space-y-6 pb-20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-outfit">Staff Accountability report</h3>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 rounded-xl border bg-card/50 px-3 py-2 text-sm font-medium">
                 <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                 <span>Lifetime Data</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
             <div className="lg:col-span-2 rounded-3xl border bg-card/30 backdrop-blur-md overflow-hidden">
               <table className="w-full text-left">
                 <thead>
                    <tr className="border-b bg-muted/30 text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="px-6 py-5 font-bold">Staff Member</th>
                      <th className="px-6 py-5 font-bold text-right">Transactions</th>
                      <th className="px-6 py-5 font-bold text-right">Cash Produced</th>
                      <th className="px-6 py-5 text-center font-bold">Last Reconciliation</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y text-sm font-medium">
                   {staffPerf.map(staff => (
                     <StaffReportRow 
                       key={staff.staff_id}
                       name={staff.full_name} 
                       count={staff.transaction_count}
                       total={staff.total_sales.toLocaleString()} 
                       status="Confirmed" 
                     />
                   ))}
                   {staffPerf.length === 0 && (
                     <tr>
                       <td colSpan={4} className="py-20 text-center text-muted-foreground italic">No staff activity recorded.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>

             <div className="rounded-3xl border bg-card/30 backdrop-blur-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold">Drawer Summary</h4>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Cash Collected</p>
                    <p className="text-2xl font-black mt-1">{summary?.totalRevenue.toLocaleString()} <span className="text-[10px] font-medium opacity-50 uppercase">RWF</span></p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-widest">Open Credit (Risk)</p>
                    <p className="text-2xl font-black mt-1 text-amber-900">{summary?.totalDebt.toLocaleString()} <span className="text-[10px] font-medium opacity-50 uppercase">RWF</span></p>
                  </div>
                </div>
                <button className="w-full mt-6 rounded-2xl bg-secondary py-4 text-sm font-bold text-white shadow-xl hover:bg-secondary/90 transition-all active:scale-95">
                  Start Staff Audit
                </button>
             </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StaffReportRow({ name, count, total, status }: any) {
  return (
    <tr className="group hover:bg-muted/40 transition-colors">
       <td className="px-6 py-5">
         <div className="flex items-center gap-3">
           <div className="h-10 w-10 shrink-0 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
             {name.split(' ').map((n: string) => n[0]).join('')}
           </div>
           <div>
             <p className="font-bold">{name}</p>
             <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Store Operator</p>
           </div>
         </div>
       </td>
       <td className="px-6 py-5 text-right font-bold">{count}</td>
       <td className="px-6 py-5 text-right font-black text-brand-secondary">{total}</td>
       <td className="px-6 py-5">
         <div className="flex items-center justify-center">
            <span className={cn(
              "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
              status === 'Confirmed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
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
    <div className="rounded-2xl border bg-card/50 p-6 shadow-sm flex flex-col justify-between h-40 group hover:border-brand-primary/20 transition-all hover:translate-y-[-2px]">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-muted p-2.5 group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
          isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        )}>
           {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
           {trend}
        </div>
      </div>
      <div className="mt-4">
         <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
         <p className="text-2xl font-black mt-1">{value} <span className="text-[10px] font-medium opacity-50 uppercase">RWF</span></p>
         <p className="text-[10px] font-medium text-muted-foreground italic mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function DebtRow({ name, amount, risk }: any) {
  return (
    <tr className="group hover:bg-muted/40 transition-colors">
       <td className="px-6 py-5 font-bold">{name}</td>
       <td className="px-6 py-5 capitalize flex items-center gap-2">
         <Ping risk={risk} />
         {risk} Risk
       </td>
       <td className="px-6 py-5 font-black text-brand-secondary text-right">{amount} RWF</td>
       <td className="px-6 py-5">
         <div className="flex items-center justify-center">
            <button className="flex items-center gap-2 rounded-xl bg-secondary/5 px-4 py-2 text-xs font-bold text-secondary hover:bg-secondary hover:text-white transition-all">
              Request Payment
            </button>
         </div>
       </td>
    </tr>
  );
}

function Ping({ risk }: { risk: string }) {
  const color = risk === 'high' ? 'bg-red-500' : 'bg-amber-500';
  return (
    <span className="relative flex h-2 w-2">
      <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)}></span>
      <span className={cn("relative inline-flex rounded-full h-2 w-2", color)}></span>
    </span>
  );
}

function BreakdownItem({ label, value, percentage, color }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm font-bold">
        <span className="text-muted-foreground">{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full">
         <div className={cn("h-full rounded-full", color)} style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-[10px] text-right text-muted-foreground font-bold">{value} RWF</p>
    </div>
  );
}
