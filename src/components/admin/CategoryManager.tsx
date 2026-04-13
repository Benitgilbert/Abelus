"use client";

import React, { useState, useEffect } from 'react';
import { categoryService } from '@/lib/services/category-service';
import { Category } from '@/types';
import { Plus, Trash2, Loader2, Tag, Book, Smartphone, Zap, Settings, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap: Record<string, any> = {
  Book, Smartphone, Zap, Settings, Briefcase
};

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('Tag');

  const fetchCategories = async () => {
    setLoading(true);
    const data = await categoryService.getAll();
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const cat = await categoryService.create(newName, undefined, newIcon);
    if (cat) {
      setIsAdding(false);
      setNewName('');
      setNewIcon('Tag');
      fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This might affect product filtering.')) return;
    const success = await categoryService.delete(id);
    if (success) fetchCategories();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h3 className="font-outfit text-2xl font-black text-slate-900 tracking-tight">Product Categories</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Manage High-Density Shop Filtering</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 px-8 py-4 text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            Initialize Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2.5rem] border-2 border-dashed border-indigo-200 p-8 bg-indigo-50/30 flex flex-col justify-center"
          >
            <form onSubmit={handleCreate} className="space-y-6">
               <div className="flex items-center gap-3 mb-2 text-indigo-600">
                 <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-indigo-50">
                   <Tag className="h-5 w-5" />
                 </div>
                 <h4 className="font-black text-[10px] uppercase tracking-widest">New Configuration</h4>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category Designation</label>
                 <input 
                   required
                   value={newName} 
                   onChange={e => setNewName(e.target.value)}
                   className="w-full rounded-2xl border border-white bg-white/80 p-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                   placeholder="e.g. Luxury Papeterie"
                 />
               </div>
               <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
                 <button type="submit" className="flex-1 rounded-xl bg-slate-900 px-4 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all">Create Asset</button>
               </div>
            </form>
          </motion.div>
        )}

        {categories.map((cat) => (
          <div key={cat.id} className="group relative flex items-center gap-5 rounded-[2.5rem] border border-slate-100 bg-white p-6 transition-all hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
              <Tag className="h-20 w-20" />
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg shadow-indigo-200 transition-all border border-slate-100 group-hover:border-indigo-600 shrink-0">
              <Tag className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-outfit font-black text-slate-900 tracking-tight text-lg truncate">{cat.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Retail Registry</p>
            </div>
            <button 
              onClick={() => handleDelete(cat.id)}
              className="h-10 w-10 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {loading && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center gap-4">
             <div className="relative h-16 w-16">
               <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
               <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 animate-pulse">Syncing Registry...</p>
          </div>
        )}
      </div>
    </div>
  );
}
