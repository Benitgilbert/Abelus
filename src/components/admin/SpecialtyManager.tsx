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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-outfit text-xl font-black text-[#1A1C1E]">Specialties Grid</h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage homepage service cards</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1A1C1E] px-5 py-2.5 text-xs font-black text-white hover:bg-primary transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Specialty
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dynamic List */}
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = (Icons as any)[item.icon_name || 'Box'] || Box;
            return (
              <div key={item.id} className="group flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm hover:shadow-lg transition-all">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color_code}15`, color: item.color_code || '#10b981' }}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-sm text-[#1A1C1E]">{item.title}</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.icon_name}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {items.length === 0 && !loading && (
             <div className="py-12 text-center border-2 border-dashed rounded-3xl">
                <p className="text-sm font-bold text-muted-foreground italic">No specialties defined.</p>
             </div>
          )}
        </div>

        {/* Form Panel */}
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[2.5rem] border bg-white p-8 shadow-2xl"
          >
            <h4 className="font-outfit text-lg font-black text-[#1A1C1E] mb-6">New Specialty Details</h4>
            <div className="space-y-5">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                 <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full rounded-2xl border bg-[#F8F9FB] py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. Digital Printing" />
               </div>
               
               <div className="grid grid-cols-2 gap-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Icon Name (Lucide)</label>
                    <select value={formData.icon_name} onChange={e => setFormData({...formData, icon_name: e.target.value})} className="w-full rounded-2xl border bg-[#F8F9FB] py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                      {LucideIcons.slice(0, 100).map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Accent Color</label>
                    <input type="color" value={formData.color_code} onChange={e => setFormData({...formData, color_code: e.target.value})} className="h-12 w-full rounded-2xl border bg-[#F8F9FB] p-1 cursor-pointer" />
                 </div>
               </div>

               <div className="flex gap-4 pt-4">
                 <button onClick={() => setIsAdding(false)} className="flex-1 rounded-2xl border py-4 text-sm font-bold text-muted-foreground hover:bg-muted transition-all">Discard</button>
                 <button onClick={handleCreate} className="flex-1 rounded-2xl bg-primary py-4 text-sm font-black text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Save Specialty</button>
               </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
