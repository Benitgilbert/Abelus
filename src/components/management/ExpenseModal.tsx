"use client";

import React, { useState } from 'react';
import { X, CreditCard, ShoppingCart, Zap, Users, Package } from 'lucide-react';
import { financialService } from '@/lib/services/financial-service';
import { cn } from '@/lib/utils';

interface ExpenseModalProps {
  onClose: () => void;
  onSuccess: () => void;
  availableLiquidity: number;
}

const CATEGORIES = [
  { name: 'Stock Purchase', icon: ShoppingCart },
  { name: 'Utilities', icon: Zap },
  { name: 'Staff', icon: Users },
  { name: 'Rent', icon: Package },
  { name: 'Other', icon: CreditCard },
];

export function ExpenseModal({ onClose, onSuccess, availableLiquidity }: ExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Stock Purchase'
  });

  const isOverBudget = Number(formData.amount) > availableLiquidity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverBudget) return;
    
    setLoading(true);
    try {
      await financialService.recordExpense({
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Failed to record expense. Please check your permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-2xl space-y-6 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black font-outfit">Record Expense</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">External Operations Cost</p>
          </div>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-xl font-light"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-2xl bg-slate-900 p-3 text-white">
          <p className="text-[9px] font-bold uppercase opacity-60 tracking-widest leading-none">Available Liquidity (Paid)</p>
          <p className="text-base font-black mt-1">{availableLiquidity.toLocaleString()} <span className="text-[10px] opacity-40">RWF</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase text-muted-foreground">Amount (RWF)</label>
              {isOverBudget && (
                <span className="text-[10px] font-bold text-rose-500 uppercase animate-pulse">Insufficient Funds</span>
              )}
            </div>
            <input
              required
              type="number"
              placeholder="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`w-full rounded-xl border bg-muted/20 px-4 py-2 text-base font-black outline-none transition-all ${
                isOverBudget ? 'border-rose-500 ring-1 ring-rose-500 text-rose-600' : 'focus:ring-1 focus:ring-primary'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Description</label>
            <textarea
              required
              placeholder="e.g. Bought 50 boxes of A4 paper"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border bg-muted/20 px-4 py-2 text-xs font-bold min-h-[48px] focus:ring-1 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.name })}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px] font-bold">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            disabled={loading || isOverBudget}
            type="submit"
            className={cn(
              "w-full rounded-2xl py-4 text-sm font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2",
              isOverBudget ? "bg-slate-300 cursor-not-allowed" : "bg-primary hover:bg-emerald-600"
            )}
          >
            {loading ? 'Recording...' : isOverBudget ? 'Cannot Record (Over Budget)' : 'Save External Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
