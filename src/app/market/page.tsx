"use client";

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { 
  Users, 
  MapPin, 
  Phone, 
  Plus, 
  Search, 
  FileText, 
  ArrowUpRight,
  TrendingDown,
  History,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MarketClient } from '@/types';
import { clientService } from '@/lib/services/client-service';
import { useAuth } from '@/components/providers/AuthProvider';

export default function MarketClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<MarketClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    org_name: '',
    phone: '',
    location: '',
    credit_limit: 1000000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const data = await clientService.getAll();
    if (data) {
      setClients(data);
    }
    setLoading(false);
  };

  const filteredClients = clients.filter(c => 
    c.org_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = clients.reduce((acc, c) => acc + Number(c.debt_balance), 0);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = await clientService.create(newClient);
    if (data) {
      setClients([data, ...clients]);
      setIsModalOpen(false);
      setNewClient({
        org_name: '',
        phone: '',
        location: '',
        credit_limit: 1000000,
      });
    } else {
      alert('Failed to onboard client. Please check logs.');
    }
    setIsSubmitting(false);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-outfit text-brand-secondary">Market Clients (B2B)</h1>
            <p className="text-muted-foreground mt-1 text-lg">Manage organizational contracts, credit limits, and debt collection.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-white shadow-xl hover:bg-secondary/90 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Onboard New Client
          </button>
        </div>

        {/* B2B Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Total B2B Clients</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{loading ? "..." : clients.length}</p>
          </div>
          <div className="rounded-2xl border bg-brand-primary/10 p-6 text-brand-primary border-brand-primary/20">
            <div className="flex items-center gap-3 opacity-80">
              <TrendingDown className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Total Outstanding Debt</span>
            </div>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : totalOutstanding.toLocaleString()} 
              <span className="text-xs font-medium uppercase ml-1">RWF</span>
            </p>
          </div>
          <div className="rounded-2xl border bg-card/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <ArrowUpRight className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">Active Credits</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{clients.filter(c => c.debt_balance > 0).length}</p>
          </div>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search market clients by name or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border bg-card/30 py-3 pl-12 pr-4 font-medium outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <button onClick={fetchClients} className="rounded-xl border bg-card/50 px-4 py-3 font-bold text-sm">Refresh</button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 relative min-h-[400px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              </div>
            )}
            
            {filteredClients.map(market => (
              <div key={market.id} className="group relative rounded-3xl border bg-card/40 p-6 backdrop-blur-md transition-all hover:shadow-xl hover:shadow-secondary/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-white font-bold text-xl shadow-lg">
                      {market.org_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-foreground group-hover:text-secondary transition-colors line-clamp-1">{market.org_name}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {market.location || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {market.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <button className="rounded-lg bg-muted p-2 hover:bg-secondary/10 hover:text-secondary transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Outstanding Balance</p>
                    <p className={cn(
                      "mt-1 text-2xl font-black",
                      market.debt_balance > 0 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {Number(market.debt_balance).toLocaleString()} <span className="text-[10px] font-medium">RWF</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Credit Limit Used</p>
                    <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          market.credit_limit > 0 && (market.debt_balance / market.credit_limit) > 0.8 ? "bg-red-500" : "bg-secondary"
                        )} 
                        style={{ width: `${market.credit_limit > 0 ? Math.min((market.debt_balance / market.credit_limit) * 100, 100) : 0}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] font-bold">
                      {market.credit_limit > 0 ? (market.debt_balance / market.credit_limit * 100).toFixed(1) : 0}% of {Number(market.credit_limit).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground italic truncate max-w-[150px]">
                    Contract status: Active
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-xl bg-secondary/5 px-4 py-2 text-xs font-bold text-secondary hover:bg-secondary hover:text-white transition-all">
                      <FileText className="h-3.5 w-3.5" />
                      Generate Statement
                    </button>
                    <button className="rounded-xl border p-2 hover:bg-muted transition-colors">
                      <History className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {!loading && filteredClients.length === 0 && (
              <div className="col-span-full py-20 text-center text-muted-foreground italic">
                No market clients found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-3xl border bg-card p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-outfit">Onboard Market Client</h2>
                  <p className="text-sm text-muted-foreground mt-1 text-medium">Create a new B2B contract with custom credit limits.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleOnboard} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Company / Organization Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Kigali Heights Corp"
                    value={newClient.org_name}
                    onChange={e => setNewClient({...newClient, org_name: e.target.value})}
                    className="w-full rounded-2xl border bg-muted/30 px-5 py-3 font-medium outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+250..."
                      value={newClient.phone}
                      onChange={e => setNewClient({...newClient, phone: e.target.value})}
                      className="w-full rounded-2xl border bg-muted/30 px-5 py-3 font-medium outline-none focus:ring-2 focus:ring-secondary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Credit Limit (RWF)</label>
                    <input 
                      type="number" 
                      required 
                      value={newClient.credit_limit}
                      onChange={e => setNewClient({...newClient, credit_limit: Number(e.target.value)})}
                      className="w-full rounded-2xl border bg-muted/30 px-5 py-3 font-bold text-secondary outline-none focus:ring-2 focus:ring-secondary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Operational Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Gasabo, Kigali"
                    value={newClient.location}
                    onChange={e => setNewClient({...newClient, location: e.target.value})}
                    className="w-full rounded-2xl border bg-muted/30 px-5 py-3 font-medium outline-none focus:ring-2 focus:ring-secondary/20"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-secondary py-4 text-sm font-extrabold text-white shadow-xl shadow-secondary/20 hover:bg-secondary/90 transition-all disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Complete Onboarding"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
