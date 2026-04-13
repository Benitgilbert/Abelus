"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import * as Icons from 'lucide-react';
import { Plus, Trash2, Save, GripVertical, CheckCircle2, Box, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Specialty {
  id: string;
  title: string;
  description: string | null;
  icon_name: string | null;
  color_code: string | null;
  display_order: number;
}

export function SpecialtyManager() {
  const [items, setItems] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ title: '', icon_name: 'Box', color_code: '#10b981' });

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('specialties').select('*').order('display_order', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async () => {
    const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order)) + 1 : 1;
    const { error } = await supabase.from('specialties').insert([{ ...formData, display_order: nextOrder }]);
    if (!error) {
      setIsAdding(false);
      setFormData({ title: '', icon_name: 'Box', color_code: '#10b981' });
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove the service card from the homepage.')) return;
    const { error } = await supabase.from('specialties').delete().eq('id', id);
    if (!error) fetchItems();
  };

  const LucideIcons = Object.keys(Icons).filter(key => key !== 'createLucideIcon' && typeof (Icons as any)[key] === 'function');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h3 className="font-outfit text-2xl font-black text-slate-900 tracking-tight">Specialties Grid</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Manage Homepage Operational Cards</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Specialty Card
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Dynamic List */}
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = (Icons as any)[item.icon_name || 'Box'] || Box;
            return (
              <div key={item.id} className="group flex items-center gap-4 rounded-[1.75rem] border border-slate-100 bg-white p-4 transition-all hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <Icon className="h-16 w-16" />
                </div>
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center border transition-all" style={{ background: `${item.color_code}08`, borderColor: `${item.color_code}20`, color: item.color_code || '#6366f1' }}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight truncate">{item.title}</h4>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{item.icon_name} Asset</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {items.length === 0 && !loading && (
             <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-50">
                  <Box className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Workspace Empty</p>
             </div>
          )}
        </div>

        {/* Form Panel */}
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[2.5rem] border border-slate-100 bg-white p-6 lg:p-10 shadow-2xl shadow-indigo-100/30 h-fit"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-outfit text-xl font-black text-slate-900 tracking-tight">New Asset Configuration</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Initialize homepage metadata</p>
              </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Card Designation</label>
                 <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full rounded-2xl border border-slate-100 bg-white py-4 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all" placeholder="e.g. Digital Printing" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Icon Typography</label>
                    <select value={formData.icon_name} onChange={e => setFormData({...formData, icon_name: e.target.value})} className="w-full rounded-2xl border border-slate-100 bg-white py-4 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all appearance-none">
                      {LucideIcons.slice(0, 100).map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Chromatic Accent</label>
                    <div className="flex gap-3">
                      <input type="color" value={formData.color_code} onChange={e => setFormData({...formData, color_code: e.target.value})} className="h-12 w-20 rounded-xl border border-slate-100 p-1 cursor-pointer bg-white" />
                      <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 flex items-center px-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{formData.color_code}</span>
                      </div>
                    </div>
                 </div>
               </div>

               <div className="flex gap-4 pt-6 border-t border-dashed border-slate-100">
                 <button onClick={() => setIsAdding(false)} className="flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">Discard</button>
                 <button onClick={handleCreate} className="flex-1 rounded-2xl bg-indigo-600 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">Commit Asset</button>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
