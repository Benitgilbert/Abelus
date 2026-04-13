"use client";

import React from 'react';
import { format } from 'date-fns';
import { FinancialSummary } from '@/lib/services/financial-service';
import { cn } from '@/lib/utils';

interface ManagementReportProps {
  summary: FinancialSummary | null;
  transactions: any[];
  shifts?: any[];
  startDate?: string;
  endDate?: string;
}

export function ManagementReport({ summary, transactions, shifts, startDate, endDate }: ManagementReportProps) {
  const [reportData, setReportData] = React.useState<{
    today: string;
    now: string;
    refId: string;
  } | null>(null);

  React.useEffect(() => {
    setReportData({
      today: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      now: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      refId: Math.random().toString(36).substring(7).toUpperCase()
    });
  }, []);

  // Return empty or simplified version until mounted to prevent hydration errors
  if (!reportData) return <div id="management-report" className="hidden" />;

  return (
    <div id="management-report" className="hidden print:block p-8 bg-white text-slate-900 min-h-screen font-sans">
      <style>{`
        @media print {
          .rounded-2xl { border-radius: 12pt !important; }
          .rounded-xl { border-radius: 8pt !important; }
          .border { border-width: 1pt !important; }
          .border-2 { border-width: 1pt !important; }
          .divide-x > * + * { border-left-width: 1pt !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      
      {/* Report Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">ABELUS OVERSIGHT</h1>
          <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-[0.2em]">Management Performance Summary</p>
        </div>
        <div className="text-right">
          <p className="font-black text-xl">PASTOR BONUS CO. LTD</p>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{reportData.today} • {reportData.now}</p>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border border-slate-200 p-6 rounded-2xl bg-slate-50/30">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Revenue (Gross)</p>
          <p className="text-3xl font-black tracking-tight">{summary?.totalRevenue.toLocaleString() || "0"} <span className="text-sm opacity-30">RWF</span></p>
        </div>
        <div className="border border-slate-200 p-6 rounded-2xl bg-slate-50/30">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Expenses (Ext)</p>
          <p className="text-3xl font-black tracking-tight text-slate-600">{summary?.totalExpenses.toLocaleString() || "0"} <span className="text-sm opacity-30">RWF</span></p>
        </div>
        <div className="border border-slate-900 p-6 rounded-2xl bg-slate-900 text-white shadow-lg">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 mb-2">Net Position (True Profit)</p>
          <p className="text-3xl font-black tracking-tight">{summary?.netPosition.toLocaleString() || "0"} <span className="text-sm opacity-30">RWF</span></p>
        </div>
        <div className="border border-red-100 p-6 rounded-2xl bg-red-50/20 border-rose-600">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2">Active Market Debt</p>
          <p className="text-3xl font-black tracking-tight text-rose-600">{summary?.totalDebt.toLocaleString() || "0"} <span className="text-sm opacity-30">RWF</span></p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="mb-8 border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <div className="bg-slate-50 px-6 py-2 border-b border-slate-100">
           <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Revenue Segmentation</h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 p-6">
          <div className="pr-4">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">POS Sales</p>
            <p className="text-lg font-black tracking-tight">{summary?.breakdown.pos.toLocaleString()} <span className="text-[8px] opacity-40">RWF</span></p>
          </div>
          <div className="px-6">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Print Services</p>
            <p className="text-lg font-black tracking-tight">{summary?.breakdown.print.toLocaleString()} <span className="text-[8px] opacity-40">RWF</span></p>
          </div>
          <div className="pl-6">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Other Sources</p>
            <p className="text-lg font-black tracking-tight">{summary?.breakdown.other.toLocaleString()} <span className="text-[8px] opacity-40">RWF</span></p>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Audit Trail (Recent Store Activity)</h2>
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-500">
                <th className="py-4 px-4 w-24">TXID</th>
                <th className="py-4 px-4">Products / Service Summary</th>
                <th className="py-4 px-4 text-center">Source</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((tx) => {
                const clientType = tx.client_id ? 'Client Abonné' : 'Retail';
                const subscriberName = tx.client?.org_name || (Array.isArray(tx.client) ? tx.client[0]?.org_name : null);
                const clientName = tx.customer_name || subscriberName || (tx.client_id ? 'Subscriber' : 'Individual Customer');
                const items = tx.transaction_items?.map((ti: any) => ti.products?.name).filter(Boolean).join(', ') || 'General Items';
                
                return (
                  <tr key={tx.id} className="text-[9px] font-medium text-slate-700">
                    <td className="py-3 px-4 font-mono text-slate-300">#{tx.id.slice(0, 8).toUpperCase()}</td>
                    <td className="py-3 px-4">
                      <p className="font-black text-slate-900 text-xs leading-tight">{items}</p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-tighter mt-0.5">{clientType} • {clientName}</p>
                    </td>
                    <td className="py-3 px-4 text-center uppercase tracking-tighter font-bold text-slate-400">{tx.source || 'POS'}</td>
                    <td className="py-3 px-4 uppercase tracking-tighter text-[8px] font-black">
                       <span className={cn(
                         "px-2 py-0.5 rounded-full",
                         tx.payment_status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                       )}>
                         {tx.payment_method} ({tx.payment_status})
                       </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-black text-slate-900">{tx.total_amount.toLocaleString()} RWF</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Reconciliations */}
      {shifts && shifts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-bold border-b-2 border-slate-900 pb-2 mb-4 uppercase tracking-widest">Shift Accountability & Drawer Reconciliation</h3>
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="px-4 py-2 text-left font-bold">Operator</th>
                <th className="px-4 py-2 text-left font-bold">Start Time</th>
                <th className="px-4 py-2 text-right font-bold">Expected Cash</th>
                <th className="px-4 py-2 text-right font-bold">Actual Cash</th>
                <th className="px-4 py-2 text-center font-bold">Discrepancy</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s: any) => {
                const diff = (s.actual_cash || 0) - (s.expected_cash || 0);
                return (
                  <tr key={s.id} className="border-b border-slate-100 italic">
                    <td className="px-4 py-2 font-bold">{s.operator?.full_name || 'System'}</td>
                    <td className="px-4 py-2">{format(new Date(s.start_time), 'HH:mm')}</td>
                    <td className="px-4 py-2 text-right">
                      {s.status === 'open' 
                        ? Number(s.starting_cash).toLocaleString() 
                        : (Number(s.expected_cash) || 0).toLocaleString()} RWF
                    </td>
                    <td className="px-4 py-2 text-right">
                      {s.status === 'open' 
                        ? "—" 
                        : (Number(s.actual_cash) || 0).toLocaleString()} RWF
                    </td>
                    <td className={cn(
                      "px-4 py-2 text-center font-bold",
                      s.status === 'closed' ? (diff < 0 ? "text-rose-600" : diff > 0 ? "text-emerald-600" : "text-slate-500") : "text-emerald-600 italic"
                    )}>
                      {s.status === 'closed' 
                        ? (diff === 0 ? 'Balanced' : `${diff > 0 ? '+' : ''}${diff.toLocaleString()} RWF`)
                        : `Active Float: ${Number(s.starting_cash).toLocaleString()} RWF`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Footer */}
      <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-end italic text-slate-300 text-[8px] font-bold uppercase tracking-widest">
          <div>
            <p>© 2026 ABELUS MANAGEMENT SYSTEM • PASTOR BONUS CO. LTD</p>
            <p>Verified Administrative Ledger • Performance Audit</p>
          </div>
          <div className="text-right">
            <p>Authentic Digital Report • OVR-{reportData.refId}</p>
            <p>Page 1 of 1</p>
          </div>
      </div>
    </div>
  );
}
