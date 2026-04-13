"use client";

import React, { useState, useEffect } from 'react';
import { settingsService } from '@/lib/services/settings-service';
import { supabase } from '@/lib/supabase/client';
import { Plus, Trash2, Edit2, Save, X, Star, Loader2, Quote, User } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  is_featured: boolean;
}

export function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: '', content: '', rating: 5 });

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    if (data) setTestimonials(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async () => {
    const { error } = await supabase.from('testimonials').insert([formData]);
    if (!error) {
      setIsAdding(false);
      setFormData({ name: '', role: '', content: '', rating: 5 });
      fetchItems();
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    const { error } = await supabase.from('testimonials').update(updates).eq('id', id);
    if (!error) {
      setEditingId(null);
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (!error) fetchItems();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h3 className="font-outfit text-2xl font-black text-slate-900 tracking-tight">Client Voices</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Manage High-Fidelity Public Reviews</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all"
          >
            <Plus className="h-4 w-4" />
            Provision Review
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Add Form Card */}
        {isAdding && (
          <div className="rounded-[2.5rem] border-2 border-dashed border-indigo-200 p-8 bg-indigo-50/30 space-y-5 flex flex-col justify-center">
             <div className="flex items-center gap-4 mb-2 text-indigo-600">
               <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-indigo-50">
                 <User className="h-5 w-5" />
               </div>
               <h4 className="font-black text-[10px] uppercase tracking-widest">Metadata Entry</h4>
             </div>
             <div className="space-y-4">
               <input placeholder="Client Identity" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-2xl border border-white bg-white/80 p-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all shadow-sm" />
               <input placeholder="Professional Designation" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full rounded-2xl border border-white bg-white/80 p-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all shadow-sm" />
               <textarea placeholder="The Review Narrative..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={3} className="w-full rounded-2xl border border-white bg-white/80 p-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all shadow-sm resize-none" />
             </div>
             <div className="flex justify-between items-center pt-4 border-t border-dashed border-indigo-100">
               <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
               <button onClick={handleCreate} className="px-8 py-4 rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all">Commit Review</button>
             </div>
          </div>
        )}

        {testimonials.map((t) => (
          <div key={t.id} className="group relative rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 overflow-hidden">
            <Quote className="absolute top-6 right-6 h-12 w-12 text-slate-900/05 group-hover:scale-110 transition-transform" />
            
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < t.rating ? 'fill-indigo-600 text-indigo-600 shadow-lg' : 'text-slate-100'}`} />
              ))}
            </div>

            <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8 line-clamp-4">"{t.content}"</p>
            
            <div className="flex items-end justify-between pt-6 border-t border-slate-50">
              <div className="min-w-0">
                <h4 className="font-outfit font-black text-slate-900 tracking-tight truncate">{t.name}</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mt-1 truncate">{t.role}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(t.id)} className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isAdding && testimonials.length === 0 && !loading && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
             <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-50">
               <Quote className="h-5 w-5 text-slate-300" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 animate-pulse">Initializing Public Records...</p>
          </div>
        )}
      </div>
    </div>
  );
}
