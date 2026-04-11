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
  const [creditLimit, setCreditLimit] = useState('0');
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
      role,
      creditLimit: role === 'client' ? Number(creditLimit) : undefined
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black font-outfit text-[#1A1C1E]">Account Provisioning</h3>
          <p className="text-sm text-muted-foreground font-medium">Create secure accounts for Staff and Corporate Market Clients.</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
           <ShieldIcon className="h-6 w-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleCreate} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-xs font-bold text-destructive animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-100 p-4 text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4" />
              Account Created Successfully
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Role</label>
            <div className="grid grid-cols-2 gap-4">
               <button
                 type="button"
                 onClick={() => setRole('staff')}
                 className={cn(
                   "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                   role === 'staff' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted bg-white hover:border-muted-foreground/30"
                 )}
               >
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", role === 'staff' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Staff</p>
                    <p className="text-[10px] text-muted-foreground">Internal Access</p>
                  </div>
               </button>

               <button
                 type="button"
                 onClick={() => setRole('client')}
                 className={cn(
                   "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                   role === 'client' ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-muted bg-white hover:border-muted-foreground/30"
                 )}
               >
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", role === 'client' ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black">Market Client</p>
                    <p className="text-[10px] text-muted-foreground">Credit Enabled</p>
                  </div>
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border bg-white py-4 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Employee Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border bg-white py-4 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="name@abelus.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Temporary Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border bg-white py-4 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {role === 'client' && (
             <div className="space-y-2 animate-in zoom-in-95 duration-200">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Credit Limit (RWF)</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full rounded-2xl border bg-white py-4 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="50000"
                  />
                </div>
             </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#1A1C1E] py-5 text-sm font-black text-white shadow-xl shadow-black/10 hover:bg-primary transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Create Account"}
          </button>
        </form>

        <div className="bg-muted/30 rounded-[3rem] p-10 border border-dashed flex flex-col justify-center gap-6">
           <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <ShieldIcon className="h-6 w-6 text-primary" />
           </div>
           <div>
              <h4 className="text-xl font-black font-outfit text-[#1A1C1E]">Admin Security Protocol</h4>
              <p className="mt-2 text-sm text-muted-foreground font-medium leading-relaxed">
                By creating this account, you are granting access to internal business logic. 
                <br /><br />
                <strong>Staff</strong> can manage stock and POS transactions. 
                <strong>Market Clients</strong> can place orders on credit up to their defined limit.
              </p>
           </div>
           <ul className="space-y-3">
              <li className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1A1C1E]">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Instant Authentication
              </li>
              <li className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1A1C1E]">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Permanent Profile Link
              </li>
              <li className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1A1C1E]">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Financial History Ready
              </li>
           </ul>
        </div>
      </div>
    </div>
  );
}
