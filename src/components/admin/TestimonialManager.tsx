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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-outfit text-xl font-black text-[#1A1C1E]">Client Voices</h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage public reviews</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 rounded-xl bg-[#1A1C1E] px-5 py-2.5 text-xs font-black text-white hover:bg-primary transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Review
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Add Form Card */}
        {isAdding && (
          <div className="rounded-[2rem] border-2 border-dashed border-primary/30 p-8 bg-primary/5 space-y-4">
             <div className="flex items-center gap-3 mb-4">
               <User className="h-5 w-5 text-primary" />
               <h4 className="font-black text-sm">New Testimonial</h4>
             </div>
             <input placeholder="Client Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border bg-white p-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
             <input placeholder="Position/Company" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full rounded-xl border bg-white p-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
             <textarea placeholder="The review text..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={3} className="w-full rounded-xl border bg-white p-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
             <div className="flex justify-end gap-3 pt-4">
               <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-muted-foreground">Cancel</button>
               <button onClick={handleCreate} className="px-5 py-2 rounded-xl bg-primary text-xs font-black text-white">Save Review</button>
             </div>
          </div>
        )}

        {testimonials.map((t) => (
          <div key={t.id} className="group relative rounded-[2rem] border bg-white p-8 shadow-sm transition-all hover:bg-[#FBFBFE] hover:shadow-xl">
            <Quote className="absolute top-6 right-6 h-8 w-8 text-muted-foreground/10" />
            
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
              ))}
            </div>

            <p className="text-sm font-medium italic text-muted-foreground leading-relaxed mb-6">"{t.content}"</p>
            
            <div className="flex items-end justify-between">
              <div>
                <h4 className="font-black text-[#1A1C1E]">{t.name}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">{t.role}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isAdding && testimonials.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground/20 mx-auto" />
            <p className="mt-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Initialising testimonials...</p>
          </div>
        )}
      </div>
    </div>
  );
}
