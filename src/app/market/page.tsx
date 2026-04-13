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
  Loader2,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MarketClient, Product, ContractPrice } from '@/types';
import { clientService } from '@/lib/services/client-service';
import { productService } from '@/lib/services/product-service';
import { billingService } from '@/lib/services/billing-service';
import { adminCreateUser } from '@/lib/actions/admin-actions';
import { useAuth } from '@/components/providers/AuthProvider';
import { PaymentRequestPrint } from '@/components/shared/PaymentRequestPrint';
import { ClientDetailModal } from '@/components/shared/client/ClientDetailModal';

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
    email: '',
    password: '',
    shouldCreateAccount: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail Modal states
  const [selectedClient, setSelectedClient] = useState<MarketClient | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [contractPrices, setContractPrices] = useState<ContractPrice[]>([]);
  const [unbilledTx, setUnbilledTx] = useState<any[]>([]);
  const [invoiceHistory, setInvoiceHistory] = useState<any[]>([]);
  const [reconciling, setReconciling] = useState<string | null>(null);
  const [printingRequest, setPrintingRequest] = useState<{ request: any, transactions: any[] } | null>(null);

  useEffect(() => {
    fetchClients();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const data = await productService.getAll();
    if (data) setProducts(data);
  };

  const fetchClients = async () => {
    setLoading(true);
    const data = await clientService.getAll();
    if (data) setClients(data);
    setLoading(false);
  };

  const fetchClientDetails = async (client: MarketClient) => {
    setSelectedClient(client);
    setLoading(true);
    const [cData, bData, hData] = await Promise.all([
      productService.getContractPrices(client.id),
      billingService.getUnbilledTransactions(client.id),
      billingService.getClientInvoices(client.id)
    ]);
    if (cData) setContractPrices(cData);
    if (bData) setUnbilledTx(bData);
    if (hData) setInvoiceHistory(hData);
    setLoading(false);
  };

  const filteredClients = clients.filter(c => 
    c.org_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = clients.reduce((acc, c) => acc + Number(c.debt_balance), 0);

  const handlePriceUpdate = async (productId: string, variantId: string | undefined, unitId: string | undefined, newPrice: number, sync: boolean) => {
    if (!selectedClient) return;
    const reconciliationId = `${productId}-${variantId || 'base'}-${unitId || 'base'}`;
    setReconciling(reconciliationId);
    
    const success = await billingService.upsertContractPrice(selectedClient.id, productId, variantId, unitId, newPrice);
    
    if (success && sync) {
      await billingService.reconcilePrices(selectedClient.id, productId, variantId, unitId, newPrice);
      const updatedClient = await clientService.getById(selectedClient.id);
      if (updatedClient) {
        setSelectedClient(updatedClient);
        fetchClients();
      }
    }
    
    const updatedPrices = await productService.getContractPrices(selectedClient.id);
    if (updatedPrices) setContractPrices(updatedPrices);
    setReconciling(null);
  };

  const handlePriceDelete = async (contractId: string) => {
    if (!selectedClient) return;
    const success = await billingService.deleteContractPrice(contractId);
    if (success) {
      const updatedPrices = await productService.getContractPrices(selectedClient.id);
      if (updatedPrices) setContractPrices(updatedPrices);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedClient || unbilledTx.length === 0) return;
    setIsSubmitting(true);
    const txIds = unbilledTx.map(tx => tx.id);
    const requestId = await billingService.generatePaymentRequest(selectedClient.id, txIds, "Standard monthly reconciliation");
    if (requestId) {
      // Auto-preview logic
      const invoiceData = await billingService.getPaymentRequest(requestId);
      if (invoiceData) {
        setPrintingRequest(invoiceData);
      }
      fetchClientDetails(selectedClient);
    } else {
      alert("Billing Error: Failed to generate payment request. Please check the system logs or permissions.");
    }
    setIsSubmitting(false);
  };

  const handleViewInvoice = async (requestId: string) => {
    if (!selectedClient) return;
    setLoading(true);
    const invoiceData = await billingService.getPaymentRequest(requestId);
    if (invoiceData) {
      setPrintingRequest(invoiceData);
    }
    setLoading(false);
  };

  const handleUpdateClient = async (clientId: string, updates: any) => {
    setIsSubmitting(true);
    const success = await billingService.updateClient(clientId, updates);
    if (success) {
      await fetchClients();
      // Update selected client state to reflect changes in modal
      const updated = clients.find(c => c.id === clientId);
      if (updated) setSelectedClient({ ...updated, ...updates });
    }
    setIsSubmitting(false);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you absolutely sure? This will remove the client from all dashboards.')) return;
    
    setIsSubmitting(true);
    const success = await billingService.deleteClient(clientId);
    if (success) {
      setSelectedClient(null);
      await fetchClients();
    }
    setIsSubmitting(false);
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let createdClientId = '';
    
    if (newClient.shouldCreateAccount) {
      if (!newClient.email || !newClient.password) {
        alert("Email and Password are required for account creation.");
        setIsSubmitting(false);
        return;
      }

      const result = await adminCreateUser({
        email: newClient.email,
        password: newClient.password,
        fullName: newClient.org_name,
        role: 'client',
        creditLimit: newClient.credit_limit,
        phone: newClient.phone,
        location: newClient.location
      });

      if (result.error) {
        alert("Error: " + result.error);
        setIsSubmitting(false);
        return;
      }
      createdClientId = result.userId!;
    } else {
      const data = await clientService.create({
        org_name: newClient.org_name,
        phone: newClient.phone,
        location: newClient.location,
        credit_limit: newClient.credit_limit
      });
      if (data) createdClientId = data.id;
    }

    if (createdClientId) {
       // Refresh list to see the new client
       await fetchClients();
       setIsModalOpen(false);
       setNewClient({ 
         org_name: '', phone: '', location: '', 
         credit_limit: 1000000, email: '', password: '', 
         shouldCreateAccount: false 
       });
    }
    setIsSubmitting(false);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold font-outfit text-brand-secondary">Client Abonné</h1>
            <p className="text-muted-foreground mt-1 text-lg uppercase tracking-tight font-medium opacity-70">Subscriber contracts & debt balance</p>
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
          <StatSummary label="Total Client Abonné" value={loading ? "..." : clients.length} icon={Users} />
          <StatSummary label="Total Outstanding Debt" value={loading ? "..." : Number(totalOutstanding).toLocaleString()} sub="RWF" icon={TrendingDown} highlight />
          <StatSummary label="Active Credits" value={clients.filter(c => c.debt_balance > 0).length} icon={ArrowUpRight} />
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search Client Abonné by name or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border bg-card/30 py-3 pl-12 pr-4 font-medium outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <button onClick={fetchClients} className="rounded-xl border bg-card/50 px-4 py-3 font-bold text-sm">Refresh</button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 relative items-start">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                <Loader2 className="h-8 w-8 animate-spin text-secondary" />
              </div>
            )}
            
            {filteredClients.map(market => (
              <ClientCard key={market.id} client={market} onClick={() => fetchClientDetails(market)} />
            ))}
          </div>
        </div>
      </div>

      {/* Details & Management Modal */}
      <AnimatePresence>
        {selectedClient && (
          <ClientDetailModal 
            client={selectedClient}
            products={products}
            contractPrices={contractPrices}
            unbilledTx={unbilledTx}
            isSubmitting={isSubmitting}
            onClose={() => setSelectedClient(null)}
            onPriceUpdate={handlePriceUpdate}
            onPriceDelete={handlePriceDelete}
            onGenerateInvoice={handleGenerateInvoice}
            onPrintDraft={(tx) => setPrintingRequest({ request: { id: 'DRAFT', total_amount: tx.total_amount }, transactions: [tx] })}
            reconciling={reconciling}
            onUpdateProfile={handleUpdateClient}
            onDeleteClient={handleDeleteClient}
            invoiceHistory={invoiceHistory}
            onViewInvoice={handleViewInvoice}
          />
        )}
      </AnimatePresence>

      {/* Printing Overlay */}
      <AnimatePresence>
        {printingRequest && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-y-auto">
             <div className="sticky top-0 z-10 bg-slate-900 text-white p-4 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-4">
                   <button onClick={() => setPrintingRequest(null)} className="p-2 hover:bg-white/10 rounded-lg"><X className="h-6 w-6" /></button>
                   <span className="font-bold uppercase tracking-widest text-sm text-slate-400">Preview Payment Request</span>
                </div>
                <button onClick={() => window.print()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-2 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg">
                  <Printer className="h-4 w-4" />
                  Print Now
                </button>
             </div>
             <div className="flex-1">
                <PaymentRequestPrint client={selectedClient} request={printingRequest.request} transactions={printingRequest.transactions} />
             </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 p-0 sm:p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%", opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: "100%", opacity: 0 }} 
              className="w-full h-[90vh] sm:h-auto sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] border bg-white p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="mb-6 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-bold font-outfit text-slate-900">Onboard Subscriber</h2>
                  <p className="text-[10px] text-muted-foreground mt-1 font-black uppercase tracking-widest opacity-60">Create a new Master Contract</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleOnboard} className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar-hide">
                <InputGroup label="Organization / Corporate Name" placeholder="e.g. Kigali Heights Corp" value={newClient.org_name} onChange={(v: string) => setNewClient({...newClient, org_name: v})} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputGroup label="Priority Contact Line" placeholder="+250..." value={newClient.phone} onChange={(v: string) => setNewClient({...newClient, phone: v})} />
                  <InputGroup label="Subscriber Credit Limit" type="number" value={newClient.credit_limit} onChange={(v: string) => setNewClient({...newClient, credit_limit: Number(v)})} />
                </div>
                
                <InputGroup label="HQ Operations Location" placeholder="e.g. Gasabo, Kigali" value={newClient.location} onChange={(v: string) => setNewClient({...newClient, location: v})} />
                
                {/* Security Section */}
                <div className="pt-6 border-t border-slate-100">
                   <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-black text-slate-800">Subscriber Portal Access</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight opacity-60">Allow client to audit their debt</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setNewClient({...newClient, shouldCreateAccount: !newClient.shouldCreateAccount})}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                          newClient.shouldCreateAccount ? "bg-indigo-600" : "bg-slate-200"
                        )}
                      >
                         <div className={cn(
                           "h-4 w-4 rounded-full bg-white shadow-sm transition-all",
                           newClient.shouldCreateAccount ? "translate-x-6" : "translate-x-0"
                         )} />
                      </button>
                   </div>

                   {newClient.shouldCreateAccount && (
                     <div className="space-y-4 pt-6 animate-in slide-in-from-top-2 duration-300">
                        <InputGroup label="Access Email" placeholder="client@email.com" value={newClient.email} onChange={(v: string) => setNewClient({...newClient, email: v})} />
                        <InputGroup label="Initial Secure Password" type="password" placeholder="••••••••" value={newClient.password} onChange={(v: string) => setNewClient({...newClient, password: v})} />
                     </div>
                   )}
                </div>
              </form>

              <div className="pt-6 mt-2 border-t border-slate-100 shrink-0">
                <button 
                  type="submit" 
                  onClick={(e) => { e.preventDefault(); handleOnboard(e as any); }}
                  disabled={isSubmitting} 
                  className="w-full rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-indigo-600 transition-all disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? "Syncing..." : "Activate Subscription"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

// Sub-components
function StatSummary({ label, value, sub, icon: Icon, highlight }: any) {
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", highlight ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20" : "bg-card/50")}>
      <div className={cn("flex items-center gap-2", !highlight && "text-muted-foreground")}>
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-black">{value} <span className="text-[10px] font-medium uppercase ml-0.5">{sub}</span></p>
    </div>
  );
}

function ClientCard({ client, onClick }: any) {
  return (
    <div onClick={onClick} className="group relative rounded-2xl border bg-card/40 p-5 backdrop-blur-md transition-all hover:shadow-xl hover:shadow-secondary/5 cursor-pointer active:scale-[0.98]">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-white font-black text-lg shadow-md">
            {client.org_name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-md font-extrabold text-foreground group-hover:text-secondary transition-colors truncate">{client.org_name}</h3>
            <div className="mt-0.5 flex flex-col text-[10px] text-muted-foreground font-bold uppercase tracking-wide">
              <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {client.location || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-muted p-1.5 hover:bg-secondary/10 hover:text-secondary transition-colors">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 border-t pt-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Outstanding Balance</p>
          <p className={cn("mt-1 text-2xl font-black", client.debt_balance > 0 ? "text-amber-600" : "text-emerald-600")}>
            {Number(client.debt_balance).toLocaleString()} <span className="text-[10px] font-medium">RWF</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Credit Utilization</p>
          <p className="mt-2 text-sm font-black text-slate-800">
            {client.credit_limit > 0 ? (client.debt_balance / client.credit_limit * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, placeholder, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <input 
        type={type} 
        required 
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-2xl border bg-muted/30 px-5 py-3 font-medium outline-none focus:ring-2 focus:ring-secondary/20"
      />
    </div>
  );
}
