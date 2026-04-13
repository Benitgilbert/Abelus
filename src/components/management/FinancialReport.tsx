"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface FinancialReportProps {
  summary: any;
  transactions: any[];
  shifts?: any[];
  startDate: string;
  endDate: string;
}

export function FinancialReport({ summary, transactions, shifts, startDate, endDate }: FinancialReportProps) {
  const [printDate, setPrintDate] = useState('');
  const [reportId, setReportId] = useState('');

  useEffect(() => {
    setPrintDate(new Date().toLocaleString());
    setReportId(`FIN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  }, []);

  if (!summary) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'All Time';
    return new Date(dateStr).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div 
      id="financial-report" 
      className="hidden print:block bg-white min-h-screen font-sans text-slate-900"
      style={{ padding: '15mm' }}
    >
      <style>{`
        @media print {
          .rounded-2xl { border-radius: 12pt !important; }
          .rounded-xl { border-radius: 8pt !important; }
          .border { border-width: 1pt !important; }
          .divide-x > * + * { border-left-width: 1pt !important; }
          .divide-y > * + * { border-top-width: 1pt !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Financial Ledger</h1>
          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">
            {formatDate(startDate)} — {formatDate(endDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-black text-xl">PASTOR BONUS CO. LTD</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">
            Official Audit Document • {reportId}
          </p>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Total Revenue (Gross)</p>
          <p className="text-xl font-black mt-2 tracking-tight text-slate-900">{summary.totalRevenue.toLocaleString()} <span className="text-[10px] font-bold opacity-30">RWF</span></p>
        </div>
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Total Expenses (Ext)</p>
          <p className="text-xl font-black mt-2 tracking-tight text-slate-900">{summary.totalExpenses.toLocaleString()} <span className="text-[10px] font-bold opacity-30">RWF</span></p>
        </div>
        <div className="border border-slate-900 rounded-2xl p-5 bg-slate-900 text-white shadow-lg">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] opacity-50">Net Position (True Profit)</p>
          <p className="text-xl font-black mt-2 tracking-tight">{summary.netPosition.toLocaleString()} <span className="text-[10px] font-bold opacity-30">RWF</span></p>
        </div>
        <div className="border border-red-100 rounded-2xl p-5 bg-red-50/30">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-red-400">Active Market Debt</p>
          <p className="text-xl font-black mt-2 tracking-tight text-red-900">{summary.totalDebt.toLocaleString()} <span className="text-[10px] font-bold opacity-30">RWF</span></p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="mt-8 border border-slate-200 rounded-2xl bg-white overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Revenue Segmentation</h3>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 p-6">
          <div className="pr-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Direct POS Sales</p>
            <p className="text-lg font-black text-slate-800">{summary.breakdown.pos.toLocaleString()} <span className="text-[8px] font-medium opacity-40">RWF</span></p>
          </div>
          <div className="px-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Printing Services</p>
            <p className="text-lg font-black text-slate-800">{summary.breakdown.print.toLocaleString()} <span className="text-[8px] font-medium opacity-40">RWF</span></p>
          </div>
          <div className="pl-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Other Services</p>
            <p className="text-lg font-black text-slate-800">{summary.breakdown.other.toLocaleString()} <span className="text-[8px] font-medium opacity-40">RWF</span></p>
          </div>
        </div>
      </div>

      {/* Shift Accountability Section */}
      {shifts && shifts.length > 0 && (
        <div className="mt-8">
           <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Shift Accountability & Drawer Reconciliation</h3>
           </div>
           <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 text-[9px] uppercase font-black text-slate-500 border-b border-slate-100 italic">
                   <th className="py-4 px-4">Operator</th>
                   <th className="py-4 px-4">Start Time</th>
                   <th className="py-4 px-4 text-right">Expected</th>
                   <th className="py-4 px-4 text-right">Actual</th>
                   <th className="py-4 px-4 text-center">Discrepancy</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {shifts.map((s: any) => {
                   const diff = (s.actual_cash || 0) - (s.expected_cash || 0);
                   return (
                     <tr key={s.id} className="text-[9px] font-medium">
                       <td className="py-3 px-4 font-bold">{s.operator?.full_name || 'System'}</td>
                       <td className="py-3 px-4 text-slate-400 uppercase tracking-tighter">
                         {new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </td>
                       <td className="py-3 px-4 text-right font-bold text-slate-900">
                         {s.status === 'open' 
                           ? Number(s.starting_cash).toLocaleString() 
                           : (Number(s.expected_cash) || 0).toLocaleString()} RWF
                       </td>
                       <td className="py-3 px-4 text-right font-black text-slate-900">
                         {s.status === 'open' 
                           ? "—" 
                           : (Number(s.actual_cash) || 0).toLocaleString()} RWF
                       </td>
                       <td className={cn(
                         "py-3 px-4 text-center font-black",
                         s.status === 'closed' ? (diff < 0 ? "text-rose-600" : diff > 0 ? "text-emerald-600" : "text-slate-300") : "text-emerald-600"
                       )}>
                         {s.status === 'closed' 
                           ? (diff === 0 ? 'BALANCED' : `${diff > 0 ? '+' : ''}${diff.toLocaleString()} RWF`)
                           : `FLOAT: ${Number(s.starting_cash).toLocaleString()} RWF`}
                       </td>
                     </tr>
                    );
                 })}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* Transaction Table */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 px-2">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Audit Trail (Recent Store Activity)</h3>
           <p className="text-[8px] font-bold text-slate-300 italic uppercase">Showing up to 100 entries</p>
        </div>
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[9px] uppercase font-black text-slate-500 border-b border-slate-100">
                <th className="py-4 px-4 w-20">TXID</th>
                <th className="py-4 px-4">Product / Item Summary</th>
                <th className="py-4 px-4 text-center">Source</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((tx) => {
                const clientType = tx.client_id ? 'Client Abonné' : 'Retail';
                const subscriberName = tx.client?.org_name || (Array.isArray(tx.client) ? tx.client[0]?.org_name : null);
                const clientName = tx.customer_name || subscriberName || (tx.client_id ? 'Subscriber' : 'Individual Customer');
                const items = tx.transaction_items?.map((ti: any) => ti.products?.name).filter(Boolean).join(', ') || 'General Sale';
                const date = new Date(tx.created_at).toLocaleString('en-GB', { 
                  day: '2-digit', month: 'short'
                });
                
                return (
                  <tr key={tx.id} className="text-[9px] font-medium group">
                    <td className="py-3 px-4 font-mono text-slate-300 uppercase">#{tx.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-xs leading-tight">{items}</p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-tighter mt-0.5">{clientType} • {clientName} • {date}</p>
                    </td>
                    <td className="py-3 px-4 text-center uppercase font-bold text-slate-400">{tx.source || 'pos'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter",
                        tx.payment_status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {tx.payment_method} ({tx.payment_status})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs font-black text-slate-900 whitespace-nowrap">{tx.total_amount.toLocaleString()} RWF</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-end italic text-slate-300 text-[8px] font-bold uppercase tracking-[0.1em]">
        <div>
          <p>PASTOR BONUS CO. LTD • FINANCIAL CONTROL UNIT</p>
          <p>Generated {printDate}</p>
        </div>
        <div className="text-right">
          <p>Confidential Management Data</p>
          <p>Verified Administrative Ledger • Page 1 of 1</p>
        </div>
      </div>
    </div>
  );
}
