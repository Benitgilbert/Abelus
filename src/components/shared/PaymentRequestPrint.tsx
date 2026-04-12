"use client";

import React from 'react';
import { FileText, MapPin, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentRequestPrintProps {
  client: any;
  request: any;
  transactions: any[];
}

export function PaymentRequestPrint({ client, request, transactions }: PaymentRequestPrintProps) {
  const allItems = React.useMemo(() => {
    const items: any[] = [];
    transactions.forEach(tx => {
      tx.items?.forEach((item: any) => {
        items.push({
          ...item,
          txDate: tx.created_at,
          txId: tx.id
        });
      });
    });
    return items;
  }, [transactions]);

  return (
    <div className="bg-white min-h-screen p-16 print:p-0 font-sans text-slate-900" id="payment-request-doc">
      {/* 1. Formal Letterhead */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10">
        <div className="flex items-center gap-4">
          <div className="bg-slate-950 text-white p-3 rounded-2xl">
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-950 uppercase">Pastor Bonus Co. Ltd</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Commercial Print & Tech Division</p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs font-black text-slate-950 uppercase">Kigali, Rwanda</p>
          <p className="text-[10px] font-bold text-slate-400">KN 204 ST, Gicumbi District</p>
          <p className="text-[10px] font-bold text-slate-400">+250 788 819 878 | info@pastorbonus.rw</p>
        </div>
      </div>

      {/* 2. Formal Business Letter Section */}
      <div className="mt-12 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Whom It May Concern:</p>
            <h3 className="text-xl font-black text-slate-950">{client.org_name}</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{client.location || 'Rwanda'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-950 underline decoration-slate-300 underline-offset-4">Ref: REQ-{request.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="pt-8 space-y-4 max-w-2xl">
          <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight">Subject: Formal Payment Request for Delivered Merchandise</h4>
          
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Dear Management of <span className="font-bold text-slate-900">{client.org_name}</span>,
          </p>
          
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            We are writing to professionally submit this formal request for payment concerning the goods and services delivered on credit during the current billing cycle. 
            Attached below is the detailed, indexed ledger of all merchandise items fulfilled by <span className="font-bold text-slate-900">Pastor Bonus Co. Ltd</span>.
          </p>
          
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Please review the itemized list and arrange for the settlement of the total outstanding balance of <span className="font-bold text-slate-900 underline decoration-slate-200 decoration-2">{Number(request.total_amount).toLocaleString()} RWF</span> at your earliest convenience.
          </p>
        </div>
      </div>

      {/* 3. Indexed Goods Table */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] font-black text-slate-950 uppercase tracking-widest">Consolidated Goods Delivery Index</p>
        </div>

        <table className="w-full text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-950 text-white">
              <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest border border-slate-800 w-[5%]">Idx</th>
              <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest border border-slate-800 w-[15%]">Deliv. Date</th>
              <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest border border-slate-800 w-[40%]">Item Description & Variant</th>
              <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest border border-slate-800 text-center w-[10%]">Qty</th>
              <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest border border-slate-800 text-right w-[15%]">Rate (RWF)</th>
              <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest border border-slate-800 text-right w-[15%]">Sum Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {allItems.map((item, idx) => (
              <tr key={`${item.id}-${idx}`} className="group hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4 text-[10px] font-black text-slate-400 border border-slate-100 italic">
                  {(idx + 1).toString().padStart(2, '0')}
                </td>
                <td className="py-4 px-4 text-[10px] font-bold text-slate-500 border border-slate-100">
                  {new Date(item.txDate).toLocaleDateString()}
                </td>
                <td className="py-4 px-4 border border-slate-100">
                  <p className="text-xs font-black text-slate-950 uppercase leading-none">{item.product?.name || 'Standard Fulfillment Item'}</p>
                  {item.variant?.attributes && (
                    <div className="flex gap-1 mt-1">
                      {Object.values(item.variant.attributes).map((v: any, i) => (
                        <span key={i} className="text-[7px] font-black uppercase text-slate-400 border border-slate-100 px-1 rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 text-[11px] font-black text-slate-950 text-center border border-slate-100">
                  {item.quantity}
                </td>
                <td className="py-4 px-4 text-[10px] font-bold text-slate-500 text-right border border-slate-100">
                  {Number(item.price_at_sale).toLocaleString()}
                </td>
                <td className="py-4 px-4 text-[11px] font-black text-slate-950 text-right border border-slate-100 bg-slate-50/30">
                  {(Number(item.price_at_sale) * Number(item.quantity)).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
             <tr className="bg-slate-950 text-white">
                <td colSpan={5} className="py-6 px-10 text-right">
                   <p className="text-xs font-black uppercase tracking-[0.4em]">Aggregated Balance Payable</p>
                </td>
                <td className="py-6 px-10 text-right">
                   <p className="text-2xl font-black">{Number(request.total_amount).toLocaleString()} <span className="text-xs font-bold text-slate-400">RWF</span></p>
                </td>
             </tr>
          </tfoot>
        </table>
      </div>

      {/* 4. Formal Certification & Closing */}
      <div className="mt-20 space-y-12">
        <p className="text-sm text-slate-500 font-medium italic">
          "The above goods were delivered in satisfactory condition as per the subscriber agreement. We thank you for your continued business."
        </p>
        
        <div className="grid grid-cols-2 gap-32">
          <div className="border-t-2 border-slate-900 pt-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized By (Administrative Officer)</p>
            <div className="mt-8 flex flex-col items-start">
               <div className="h-16 w-32 border-b-2 border-dashed border-slate-200 flex items-center justify-center">
                  {/* Digital Signature Path or Space */}
               </div>
               <p className="mt-4 text-sm font-black text-slate-950">Director of Operations</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Pastor Bonus Co. Ltd</p>
            </div>
          </div>
          <div className="border-t-2 border-slate-900 pt-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Received & Acknowledged By</p>
            <div className="mt-8 flex flex-col items-start">
               <div className="h-16 w-full border-b-2 border-dashed border-slate-200" />
               <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient Name / Official Stamp</p>
               <p className="text-[10px] font-bold text-slate-400 mt-2 italic">Date: ____ / ____ / 2026</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #payment-request-doc, #payment-request-doc * {
            visibility: visible;
          }
          #payment-request-doc {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
          @page {
            margin: 0;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
