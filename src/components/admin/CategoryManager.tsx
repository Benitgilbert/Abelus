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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-outfit text-xl font-black text-[#1A1C1E]">Product Categories</h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manage shop filtering</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2.5rem] border-2 border-dashed border-primary/30 p-8 bg-primary/5"
          >
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <Tag className="h-5 w-5" />
                <h4 className="font-black text-sm">Create Category</h4>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest ml-1">Category Name</label>
                <input
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full rounded-2xl border bg-white p-3.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="e.g. Luxury Papeterie"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-4 py-3 text-xs font-bold text-muted-foreground">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-primary px-4 py-3 text-xs font-black text-white shadow-lg shadow-primary/20">Create</button>
              </div>
            </form>
          </motion.div>
        )}

        {categories.map((cat) => (
          <div key={cat.id} className="group relative flex items-center gap-4 rounded-[2rem] border bg-white p-6 transition-all hover:bg-[#FBFBFE] hover:shadow-xl hover:-translate-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8F9FB] text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Tag className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-outfit font-black text-[#1A1C1E]">{cat.name}</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Shop Category</p>
            </div>
            <button
              onClick={() => handleDelete(cat.id)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {loading && (
          <div className="flex justify-center py-20 col-span-full">
            <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
          </div>
        )}
      </div>
    </div>
  );
}
