"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ShiftReportProps {
  shift: any;
}

export function ShiftReport({ shift }: ShiftReportProps) {
  const [printDate, setPrintDate] = useState('');
  
  useEffect(() => {
    setPrintDate(new Date().toLocaleString());
  }, []);

  if (!shift) return null;

  const diff = (shift.actual_cash || 0) - (shift.expected_cash || 0);

  // Flatten all items into a single list for the report
  const allItems = shift.transactions?.flatMap((tx: any) => 
    tx.transaction_items?.map((item: any) => ({
      date: tx.created_at,
      clientName: tx.customer_name || tx.client?.org_name || 'Retail/Comptant',
      itemName: item.products?.name || 'Item',
      quantity: item.quantity,
      pricePerUnit: item.price_at_sale,
      total: item.quantity * item.price_at_sale,
      paymentMethod: tx.payment_method
    }))
  ) || [];

  const totalSales = allItems.reduce((acc: number, item: any) => acc + item.total, 0);

  return (
    <div 
      id="shift-report" 
      className="hidden print:block bg-white min-h-screen font-sans text-slate-900"
      style={{ padding: '10mm' }}
    >
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white; }
          .border-slate-900 { border-color: #0f172a !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            {shift.status === 'open' ? 'Interim Audit Handover' : 'Shift Handover Audit'}
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
            Official Operational Record • {shift.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-black text-lg">PASTOR BONUS CO. LTD</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{printDate}</p>
        </div>
      </div>

      {/* Identity Grid */}
      <div className="grid grid-cols-3 gap-6 mt-6 border-b border-slate-100 pb-6">
        <div>
          <p className="text-[8px] font-black uppercase text-slate-400">Shift Operator</p>
          <p className="text-sm font-bold text-slate-900">{shift.operator?.full_name || 'Staff'}</p>
        </div>
        <div>
          <p className="text-[8px] font-black uppercase text-slate-400">Timeline</p>
          <p className="text-sm font-bold text-slate-900">
            {format(new Date(shift.start_time), 'dd MMM, HH:mm')} — {shift.end_time ? format(new Date(shift.end_time), 'HH:mm') : 'Active'}
          </p>
        </div>
        <div>
          <p className="text-[8px] font-black uppercase text-slate-400">Terminal Status</p>
          <p className={cn(
            "text-sm font-bold",
            shift.status === 'open' ? "text-emerald-600" : "text-slate-900"
          )}>
            {shift.status.toUpperCase()}
          </p>
        </div>
      </div>

      {/* Drawer Reconciliation (The "Handover" Part) */}
      <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-4 gap-4">
        <div className="text-center border-r border-slate-200">
          <p className="text-[8px] font-black uppercase text-slate-400">Starting Float</p>
          <p className="text-sm font-bold">{Number(shift.starting_cash).toLocaleString()} RWF</p>
        </div>
        <div className="text-center border-r border-slate-200">
          <p className="text-[8px] font-black uppercase text-slate-400">Expected Total</p>
          <p className="text-sm font-bold uppercase">{Number(shift.expected_cash || 0).toLocaleString()} RWF</p>
        </div>
        <div className="text-center border-r border-slate-200">
          <p className="text-[8px] font-black uppercase text-slate-400">Actual Handed</p>
          <p className="text-sm font-black text-indigo-600">{Number(shift.actual_cash || 0).toLocaleString()} RWF</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] font-black uppercase text-slate-400">Audit Result</p>
          <p className={cn(
            "text-sm font-black",
            diff < 0 ? "text-rose-600" : diff > 0 ? "text-emerald-600" : "text-slate-500"
          )}>
            {diff === 0 ? 'BALANCED' : (diff > 0 ? `+${diff.toLocaleString()}` : `${diff.toLocaleString()}`)}
          </p>
        </div>
      </div>

      {/* Itemized Transaction Ledger */}
      <div className="mt-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Itemized Sales Ledger</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-y border-slate-900 text-[9px] font-black uppercase tracking-widest text-slate-900">
              <th className="py-2 px-2">Time</th>
              <th className="py-2 px-2">Client Name</th>
              <th className="py-2 px-2">Item Name / Service</th>
              <th className="py-2 px-2 text-center">Qty</th>
              <th className="py-2 px-2 text-right">P / U</th>
              <th className="py-2 px-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {allItems.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-50 text-[10px] items-center">
                <td className="py-2.5 px-2 text-slate-400 font-medium">{format(new Date(item.date), 'HH:mm')}</td>
                <td className={cn(
                  "py-2.5 px-2 font-bold",
                  item.clientName !== 'Retail/Comptant' ? "text-indigo-600" : "text-slate-600"
                )}>
                  {item.clientName}
                  {item.paymentMethod === 'momo' && <span className="ml-1 text-[7px] bg-sky-50 text-sky-600 px-1 py-0.5 rounded">MOMO</span>}
                </td>
                <td className="py-2.5 px-2 font-bold text-slate-900 uppercase truncate max-w-[200px]">{item.itemName}</td>
                <td className="py-2.5 px-2 text-center font-bold text-slate-500">{item.quantity}</td>
                <td className="py-2.5 px-2 text-right font-medium text-slate-400">{item.pricePerUnit.toLocaleString()}</td>
                <td className="py-2.5 px-2 text-right font-black text-slate-900">{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900">
              <td colSpan={5} className="py-4 text-right text-[10px] font-black uppercase tracking-widest">Shift Total (Gross Sales)</td>
              <td className="py-4 px-2 text-right text-base font-black text-slate-900 underline decoration-double">{totalSales.toLocaleString()} RWF</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* NEW: Sessional Accountability Breakdown */}
      {shift.allShifts && shift.allShifts.length > 0 && (
        <div className="mt-10 animate-fade-in shadow-sm rounded-xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 px-4 py-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Daily Session Accountability Breakdown</h3>
          </div>
          <table className="w-full text-left border-collapse bg-slate-50/50">
            <thead>
              <tr className="border-b border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-400 bg-white">
                <th className="py-3 px-4">Session Interval</th>
                <th className="py-3 px-4 text-right">Expected</th>
                <th className="py-3 px-4 text-right">Actual Count</th>
                <th className="py-3 px-4 text-center">Audit Result</th>
                <th className="py-3 px-4">Staff Explanation / Notes</th>
              </tr>
            </thead>
            <tbody>
              {shift.allShifts.map((s: any, idx: number) => {
                const sessionDiff = (s.actual_cash || 0) - (s.expected_cash || 0);
                return (
                  <tr key={idx} className="border-b border-white text-[9px] hover:bg-white transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{format(new Date(s.start_time), 'HH:mm')} — {s.end_time ? format(new Date(s.end_time), 'HH:mm') : 'Active'}</p>
                      <p className="text-[7px] font-black uppercase tracking-tighter text-slate-400 mt-0.5">{s.status}</p>
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-600">{(s.expected_cash || s.starting_cash).toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-black text-slate-900">{(s.actual_cash || 0).toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={cn(
                        "inline-block px-2 py-1 rounded font-black text-[8px] tracking-tighter",
                        sessionDiff === 0 ? "bg-emerald-100 text-emerald-700" : sessionDiff < 0 ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"
                      )}>
                        {sessionDiff === 0 ? 'BALANCED' : (sessionDiff > 0 ? `+${sessionDiff.toLocaleString()}` : `${sessionDiff.toLocaleString()}`)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {s.notes ? (
                        <p className="text-slate-600 leading-relaxed font-medium italic border-l-2 border-slate-200 pl-2">{s.notes}</p>
                      ) : (
                        <p className="text-slate-300 italic">No explanation provided</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Validation Signatures */}
      <div className="mt-20 grid grid-cols-2 gap-20">
        <div className="border-t-2 border-slate-900 pt-3">
          <p className="text-[10px] font-black uppercase tracking-widest">Handed Over By (Staff Signature)</p>
          <p className="mt-1 text-[9px] text-slate-300 italic">I confirm the above drawer count is accurate.</p>
        </div>
        <div className="border-t-2 border-slate-900 pt-3">
          <p className="text-[10px] font-black uppercase tracking-widest">Verified By (Manager Signature)</p>
          <p className="mt-1 text-[9px] text-slate-300 italic">Audit verified against server transaction ledger.</p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-10 text-[8px] font-bold text-slate-300 uppercase tracking-widest flex justify-between italic">
        <p>Software Powered by Abelus POS Hub</p>
        <p>Confidential Audit Ledger • Pastor Bonus Co. Ltd</p>
      </div>
    </div>
  );
}
