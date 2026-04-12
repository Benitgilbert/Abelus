"use client";

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  GanttChart, 
  DollarSign, 
  Printer,
  Trash2,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MarketClient, Product, ContractPrice } from '@/types';
import { ContractPriceManager } from './ContractPriceManager';
import { BillingWorkspace } from './BillingWorkspace';

interface ClientDetailModalProps {
  client: MarketClient;
  products: Product[];
  contractPrices: ContractPrice[];
  unbilledTx: any[];
  isSubmitting: boolean;
  onClose: () => void;
  onPriceUpdate: (productId: string, variantId: string | undefined, unitId: string | undefined, price: number, sync: boolean) => Promise<void>;
  onPriceDelete: (contractId: string) => Promise<void>;
  onGenerateInvoice: () => Promise<void>;
  onPrintDraft: (tx: any) => void;
  reconciling: string | null;
  onUpdateProfile: (id: string, updates: any) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
  invoiceHistory: any[];
  onViewInvoice: (id: string) => Promise<void>;
}

export function ClientDetailModal({ 
  client, 
  products, 
  contractPrices, 
  unbilledTx, 
  isSubmitting, 
  onClose, 
  onPriceUpdate, 
  onPriceDelete,
  onGenerateInvoice, 
  onPrintDraft,
  reconciling,
  onUpdateProfile,
  onDeleteClient,
  invoiceHistory,
  onViewInvoice
}: ClientDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'contracts' | 'billing'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    org_name: client.org_name,
    location: client.location || '',
    phone: client.phone || '',
    credit_limit: client.credit_limit || 0
  });

  const handleSaveProfile = async () => {
    await onUpdateProfile(client.id, editForm);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-hidden animate-in fade-in duration-300">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full h-full max-h-[95vh] max-w-6xl rounded-[2.5rem] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] flex flex-col border border-slate-200 overflow-x-hidden relative"
      >
        {/* Detail Header */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex gap-4 items-center flex-1 relative z-10">
            <div className="h-12 w-12 rounded-xl bg-slate-950 flex items-center justify-center text-white text-xl font-black shadow-xl shrink-0 border-2 border-white">
              {editForm.org_name.charAt(0)}
            </div>
            {isEditing ? (
              <div className="flex-1 max-w-2xl space-y-4 bg-white/80 p-6 rounded-2xl border border-dashed border-indigo-200 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Master Org Identity</label>
                      <input 
                        value={editForm.org_name} 
                        onChange={e => setEditForm({...editForm, org_name: e.target.value})}
                        className="w-full text-2xl font-black font-outfit text-slate-900 bg-transparent focus:outline-none border-b border-indigo-100"
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Shared Credit Limit</label>
                      <div className="flex items-center gap-2 border-b border-indigo-100">
                         <span className="text-xs font-bold text-slate-400">RWF</span>
                         <input 
                          type="number"
                          value={editForm.credit_limit} 
                          onChange={e => setEditForm({...editForm, credit_limit: Number(e.target.value)})}
                          className="w-full text-2xl font-black font-outfit text-slate-900 bg-transparent focus:outline-none"
                         />
                      </div>
                   </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HQ Location</label>
                    <input 
                      value={editForm.location} 
                      onChange={e => setEditForm({...editForm, location: e.target.value})}
                      className="w-full text-xs font-bold text-slate-600 focus:outline-none border-b border-slate-100 bg-transparent pt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Priority Line</label>
                    <input 
                      value={editForm.phone} 
                      onChange={e => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full text-xs font-bold text-slate-600 focus:outline-none border-b border-slate-100 bg-transparent pt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                   <button onClick={handleSaveProfile} disabled={isSubmitting} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">Commit Changes</button>
                   <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-400 text-xs font-bold uppercase hover:text-slate-600 transition-colors">Discard Draft</button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-center gap-5">
                  <h2 className="text-4xl font-black tracking-tighter font-outfit text-slate-900 leading-tight">{client.org_name}</h2>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="px-4 py-1.5 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/50 transition-all"
                  >
                    Manage Profile
                  </button>
                </div>
                <div className="flex gap-6 mt-3">
                  <span className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    <MapPin className="h-3 w-3 text-indigo-400" /> {client.location}
                  </span>
                  <span className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    <Phone className="h-3 w-3 text-emerald-400" /> {client.phone}
                  </span>
                </div>
              </div>
            )}
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:shadow-lg transition-all ml-4 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Global Tab Navigation (Floating Pill Style) */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex justify-between items-center overflow-x-hidden">
          <div className="flex p-0.5 bg-slate-50 rounded-lg border border-slate-100">
            <Tab Pill active={activeTab === 'details'} onClick={() => setActiveTab('details')} label="Account Intel" icon={GanttChart} />
            <Tab Pill active={activeTab === 'contracts'} onClick={() => setActiveTab('contracts')} label="Price Matrix" icon={DollarSign} />
            <Tab Pill active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} label="Billing Core" icon={Printer} />
          </div>
          <div className="hidden sm:flex items-center gap-3">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Registry Sync</span>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Mode
                </span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 scrollbar-hide bg-slate-50/10">
          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  label="Master Liquidity Balance" 
                  value={Number(client.debt_balance).toLocaleString()} 
                  sub="Total Outstanding RWF" 
                  color="text-amber-500" 
                  icon={DollarSign}
                />
                <StatCard 
                  label="Available Credit Power" 
                  value={`${(client.debt_balance / (client.credit_limit || 1) * 100).toFixed(1)}%`} 
                  sub={`of ${Number(client.credit_limit).toLocaleString()} Global Limit`} 
                  color="text-indigo-600" 
                  icon={GanttChart}
                />
                <StatCard 
                  label="Partnership Status" 
                  value="VERIFIED" 
                  sub="Active Subscriptions" 
                  color="text-emerald-500" 
                  icon={Check}
                />
              </div>

              {/* Danger Zone / Relationship Management */}
              <div className="pt-12 border-t border-slate-100">
                 <div className="bg-red-50/30 border border-red-100 rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:bg-red-50/50 group">
                    <div className="flex items-center gap-5">
                       <div className="h-14 w-14 rounded-2xl bg-white border border-red-100 flex items-center justify-center text-red-500 shadow-sm transition-transform group-hover:scale-110">
                          <Trash2 className="h-6 w-6" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Client Offboarding</h4>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">Permanently terminate the subscription and remove from registries.</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => onDeleteClient(client.id)}
                      className="px-8 py-3 rounded-xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-slate-900 transition-all"
                    >
                      Process Termination
                    </button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <ContractPriceManager 
                  clientId={client.id}
                  products={products}
                  contractPrices={contractPrices}
                  onPriceUpdate={onPriceUpdate}
                  onPriceDelete={onPriceDelete}
                  reconciling={reconciling}
                />
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <BillingWorkspace 
                  unbilledTx={unbilledTx}
                  isSubmitting={isSubmitting}
                  onGenerateInvoice={onGenerateInvoice}
                  onPrintDraft={onPrintDraft}
                  invoiceHistory={invoiceHistory}
                  onViewInvoice={onViewInvoice}
                />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Helper Components
function Tab({ active, onClick, label, icon: Icon, Pill }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-2 transition-all text-xs font-black uppercase tracking-widest rounded-md",
        active 
          ? "bg-white text-indigo-600 shadow-sm" 
          : "text-slate-400 hover:text-slate-600"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-indigo-600" : "text-slate-300")} />
      {label}
    </button>
  );
}

function StatCard({ label, value, sub, color, icon: Icon }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-100 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
      <div className="absolute -right-1 -top-1 text-slate-50 opacity-10 pointer-events-none">
         {Icon && <Icon className="h-12 w-12" />}
      </div>
      
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10">{label}</p>
      <div className="my-2 relative z-10">
        <p className={cn("text-3xl font-black tracking-tighter font-outfit", color)}>{value}</p>
        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tight">{sub}</p>
      </div>
    </div>
  );
}
