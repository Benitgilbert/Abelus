"use client";

import React, { useState } from 'react';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldIcon,
  ShoppingBag,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminCreateUser } from '@/lib/actions/admin-actions';
import { UserRole } from '@/types';

export function UserCreator() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await adminCreateUser({
      email,
      password,
      fullName,
      role
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setFullName('');
      setEmail('');
      setPassword('');
      // Keep it on success for a bit
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-50">
        <div>
          <h3 className="text-2xl font-black font-outfit text-slate-900 tracking-tight">Account Provisioning</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Create secure accounts for Staff and Corporate Market Clients.</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
           <ShieldIcon className="h-6 w-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleCreate} className="space-y-8">
          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-[10px] font-black uppercase tracking-widest text-rose-600 border border-rose-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4" />
              Account Created Successfully
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Administrative Privileges</label>
            <div className="grid grid-cols-1">
               <button
                 type="button"
                 className="flex items-center gap-4 p-5 rounded-3xl border-2 border-indigo-600 bg-indigo-50/30 shadow-xl shadow-indigo-100 transition-all text-left group"
               >
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-indigo-600 text-white shadow-lg transition-transform group-hover:scale-110">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">Staff Operator</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Internal Retail Dashboard Access</p>
                  </div>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Legal Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-white py-4 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                placeholder="Employee Identity"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Official Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center border-r border-slate-100 pr-3">
                  <Mail className="h-3.5 w-3.5 text-slate-300" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-white py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                  placeholder="staff@abelus.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Initial Access Key</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center border-r border-slate-100 pr-3">
                <Lock className="h-3.5 w-3.5 text-slate-300" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-white py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-4 rounded-2xl bg-slate-900 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize & Create Profile"}
          </button>
        </form>

        <div className="bg-slate-50/50 rounded-[3rem] p-8 lg:p-12 border border-slate-100/50 flex flex-col justify-center gap-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
              <ShieldIcon className="h-48 w-48" />
           </div>
           <div className="h-16 w-16 rounded-3xl bg-white shadow-xl shadow-indigo-100/20 flex items-center justify-center text-indigo-600 border border-indigo-50">
              <ShieldIcon className="h-8 w-8" />
           </div>
           <div>
              <h4 className="text-2xl font-black font-outfit text-slate-900 tracking-tight">Access Protocol</h4>
              <p className="mt-3 text-sm text-slate-500 font-bold leading-relaxed uppercase tracking-tighter">
                Provisioning an account grants access to internal operational logic and financial registers.
              </p>
           </div>
           <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-white shadow-sm">
                <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-lg shadow-indigo-200" /> 
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">Instant Authorization</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-white shadow-sm">
                <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-lg shadow-indigo-200" /> 
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">Unified Corporate Identity</span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 border border-white shadow-sm">
                <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-lg shadow-indigo-200" /> 
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">Retail Audit Capability</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
