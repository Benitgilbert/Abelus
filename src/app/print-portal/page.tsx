"use client";

import React, { useState, useEffect } from 'react';
import { PublicShell } from '@/components/layout/PublicShell';
import { productService } from '@/lib/services/product-service';
import { Product } from '@/types';
import { 
  FileUp, 
  Settings, 
  CreditCard, 
  ArrowRight,
  FileText,
  Clock,
  Printer,
  Sparkles,
  Layers,
  Palette,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// pdfjs setup (loaded dynamically to avoid SSR issues)
let pdfjsLib: any = null;

export default function PrintPortal() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Dynamic Pricing Data
  const [services, setServices] = useState<{
    black: Product | null,
    color: Product | null,
    editing: Product | null
  }>({ black: null, color: null, editing: null });

  // Order State
  const [pageCount, setPageCount] = useState(1);
  const [copies, setCopies] = useState(1);
  const [selectedPrintType, setSelectedPrintType] = useState<'black' | 'color'>('black');
  const [addEditing, setAddEditing] = useState(false);
  const [momoPhone, setMomoPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // 1. Fetch Pricing on Mount
  useEffect(() => {
    async function loadPrices() {
      const allProducts = await productService.getAll();
      if (allProducts) {
        setServices({
          black: allProducts.find(p => 
            p.name.toLowerCase().includes('black') || 
            p.name.toLowerCase().includes('b&w') ||
            p.name.toLowerCase().includes('b/w')
          ) || null,
          color: allProducts.find(p => 
            p.name.toLowerCase().includes('color') && !p.name.toLowerCase().includes('black')
          ) || null,
          editing: allProducts.find(p => 
            p.name.toLowerCase().includes('edit') || 
            p.name.toLowerCase().includes('format')
          ) || null
        });
      }
    }
    loadPrices();

    // Init PDF.js
    import('pdfjs-dist').then(pdfjs => {
      pdfjsLib = pdfjs;
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    });
  }, []);

  // 2. Handle Order Submission
  const submitOrder = async () => {
    if (!file || !customerName || !customerPhone) {
      alert("Please provide your name and contact number.");
      return;
    }

    setLoading(true);
    try {
      // A. Upload File
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await (await import('@/lib/supabase/client')).supabase
        .storage
        .from('print-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // B. Create Order in DB
      const { data: orderData, error: orderError } = await (await import('@/lib/supabase/client')).supabase
        .from('print_orders')
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,
          file_url: uploadData.path,
          original_filename: file.name,
          page_count: pageCount,
          total_price: totalPrice,
          status: 'pending',
          settings_json: {
            printType: selectedPrintType,
            copies,
            editing: addEditing,
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      setOrderId(orderData.id.slice(0, 8).toUpperCase());
      setOrderComplete(true);
    } catch (err: any) {
      console.error('Submission Error:', err);
      alert('Failed to submit order: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (selectedFile: File) => {
    setLoading(true);
    setFile(selectedFile);
    
    // Default to 1
    let detectedPages = 1;

    try {
      if (selectedFile.type === 'application/pdf') {
        const text = await selectedFile.slice(0, 100000).text(); 
        const matches = text.match(/\/Count\s+(\d+)/g);
        
        if (matches && matches.length > 0) {
          const lastMatch = matches[matches.length - 1];
          const count = parseInt(lastMatch.match(/\d+/)![0]);
          if (count > 0) detectedPages = count;
        }

        if (detectedPages === 1 && pdfjsLib) {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          detectedPages = pdf.numPages;
        }
      } else if (selectedFile.type.startsWith('image/')) {
        detectedPages = 1;
      }
    } catch (err) {
      console.error('Page detection failed:', err);
    }

    setPageCount(detectedPages);
    setLoading(false);
    setStep(2);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  // 3. Calculate Total
  const getUnitPrice = () => {
    const printProduct = selectedPrintType === 'black' ? services.black : services.color;
    return Number(printProduct?.retail_price || 0);
  };

  const getEditingFee = () => {
    if (!addEditing) return 0;
    return Number(services.editing?.retail_price || 0);
  };

  const totalPrice = (getUnitPrice() * pageCount * copies) + getEditingFee();

  return (
    <PublicShell>
      <div className="min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          
          {/* Progress and Summary Bar */}
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-outfit text-5xl font-black tracking-tight text-[#1A1C1E]">Print Portal</h1>
              <p className="mt-2 text-muted-foreground font-medium">Professional printing dispatched from Gicumbi.</p>
            </div>
            {!orderComplete && (
              <div className="flex items-center gap-4 bg-white p-3 rounded-3xl border shadow-sm">
                {[
                  { id: 1, label: 'Upload' },
                  { id: 2, label: 'Configure' },
                  { id: 3, label: 'Checkout' }
                ].map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-2">
                      <div className={cn(
                        "h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                        step === s.id ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : 
                        step > s.id ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {step > s.id ? "✓" : s.id}
                      </div>
                      <span className={cn("text-sm font-bold", step === s.id ? "text-primary" : "text-muted-foreground")}>{s.label}</span>
                      {s.id < 3 && <div className="h-0.5 w-6 bg-muted rounded-full mx-2 hidden lg:block" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {orderComplete ? (
               <motion.div 
                 key="success"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="mx-auto max-w-2xl text-center py-20 bg-white border border-emerald-100 rounded-[4rem] shadow-2xl relative overflow-hidden"
               >
                 <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
                 <div className="mx-auto h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-8">
                    <CheckCircle2 className="h-12 w-12" />
                 </div>
                 <h2 className="text-4xl font-black font-outfit mb-4">Order Submitted!</h2>
                 <p className="text-muted-foreground font-medium mb-12 px-10">
                   Your print request has been received. Our staff will contact you shortly on WhatsApp if needed.
                 </p>
                 <div className="bg-muted/30 p-8 rounded-3xl mx-12 mb-12">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2">Order Tracking ID</p>
                    <p className="text-3xl font-black text-primary font-mono tracking-widest">#{orderId}</p>
                 </div>
                 <button 
                  onClick={() => window.location.reload()}
                  className="bg-[#1A1C1E] text-white px-10 py-5 rounded-2xl font-black hover:scale-105 transition-all"
                 >
                   Print Another Document
                 </button>
               </motion.div>
            ) : step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "relative rounded-[4rem] border-4 border-dashed p-16 text-center transition-all duration-500 overflow-hidden",
                  isDragging 
                    ? "border-primary bg-primary/5 scale-[1.02] shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]" 
                    : "border-muted bg-white/50 backdrop-blur-sm"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                
                <motion.div 
                  animate={isDragging ? { y: -20, rotate: 5 } : { y: 0, rotate: 0 }}
                  className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-white shadow-2xl mb-10 text-primary"
                >
                  <FileUp className="h-12 w-12" />
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </motion.div>

                <h2 className="text-3xl font-black text-[#1A1C1E] font-outfit">
                  {isDragging ? "Drop your work here" : "Ready to Print?"}
                </h2>
                <p className="mt-4 text-lg text-muted-foreground font-medium max-w-sm mx-auto">
                  Drag and drop your PDF, Word, or Photo. We'll automatically detect pages.
                </p>
                
                <label className="mt-12 inline-flex cursor-pointer items-center gap-4 rounded-[2rem] bg-[#1A1C1E] px-12 py-6 font-black text-white hover:bg-primary hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20">
                  <FileText className="h-6 w-6" />
                  Choose from computer
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </label>

                {loading && (
                    <div className="mt-8 flex items-center justify-center gap-3 text-primary font-bold">
                        <Clock className="h-5 w-5 animate-spin" /> Analyzing Document...
                    </div>
                )}
              </motion.div>
            ) : step === 2 ? (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-12"
              >
                {/* Configuration Area */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="rounded-[3rem] bg-white border p-10 shadow-xl relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                        <Palette className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black font-outfit">Select Appearance</h2>
                        <p className="text-muted-foreground font-medium text-sm italic">Pricing fetched from current catalog rates.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <button 
                        onClick={() => setSelectedPrintType('black')}
                        className={cn(
                          "relative rounded-3xl p-8 border-2 transition-all text-left group",
                          selectedPrintType === 'black' ? "border-primary bg-primary/[0.02] shadow-lg" : "border-muted hover:border-primary/30"
                        )}
                      >
                         <div className={cn(
                           "h-14 w-14 rounded-2xl mb-6 flex items-center justify-center transition-all",
                           selectedPrintType === 'black' ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                         )}>
                           <Layers className="h-7 w-7" />
                         </div>
                         <h4 className="font-bold text-lg">Standard B&W</h4>
                         <p className="text-sm text-muted-foreground mt-2 font-medium">Economy printing for reports and forms.</p>
                         <div className="mt-6 font-black text-primary uppercase tracking-widest text-xs">
                           {(services.black?.retail_price ?? 0).toLocaleString()} RWF / Page
                         </div>
                         {selectedPrintType === 'black' && <div className="absolute top-6 right-6 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white scale-110 shadow-lg"><ArrowRight className="h-3 w-3" /></div>}
                      </button>

                      <button 
                        onClick={() => setSelectedPrintType('color')}
                        className={cn(
                          "relative rounded-3xl p-8 border-2 transition-all text-left group",
                          selectedPrintType === 'color' ? "border-primary bg-primary/[0.02] shadow-lg" : "border-muted hover:border-primary/30"
                        )}
                      >
                         <div className={cn(
                           "h-14 w-14 rounded-2xl mb-6 flex items-center justify-center transition-all",
                           selectedPrintType === 'color' ? "bg-primary text-white bg-gradient-to-tr from-purple-500 to-rose-500" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                         )}>
                           <Palette className="h-7 w-7" />
                         </div>
                         <h4 className="font-bold text-lg">High-End Color</h4>
                         <p className="text-sm text-muted-foreground mt-2 font-medium">Vibrant pigmentation for photos and posters.</p>
                         <div className="mt-6 font-black text-primary uppercase tracking-widest text-xs">
                           {(services.color?.retail_price ?? 0).toLocaleString()} RWF / Page
                         </div>
                         {selectedPrintType === 'color' && <div className="absolute top-6 right-6 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white scale-110 shadow-lg"><ArrowRight className="h-3 w-3" /></div>}
                      </button>
                    </div>

                    {/* Extra Services */}
                    <div className="mt-12 pt-10 border-t flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                                <Edit2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h4 className="font-bold">Professional Editing</h4>
                                <p className="text-xs text-muted-foreground font-medium">Page layout, formatting, and typo fix.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-black text-primary">+{(services.editing?.retail_price ?? 0).toLocaleString()} RWF</span>
                            <button 
                                onClick={() => setAddEditing(!addEditing)}
                                className={cn(
                                    "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all h-12",
                                    addEditing ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-muted text-muted-foreground"
                                )}
                            >
                                {addEditing ? 'Added' : 'Add Service'}
                            </button>
                        </div>
                    </div>
                  </div>

                  <div className="rounded-[3rem] bg-white/50 backdrop-blur-md border p-8 flex flex-wrap items-center gap-12">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                             <Layers className="h-3 w-3" /> Volume (Pages)
                        </label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="number" 
                                value={pageCount} 
                                onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-24 rounded-2xl border-2 border-muted bg-white px-4 py-3 font-black text-xl focus:border-primary focus:outline-none transition-all" 
                            />
                            <div className="bg-emerald-100 text-emerald-700 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Auto-Detected
                            </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                             <Printer className="h-3 w-3" /> Total Copies
                        </label>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCopies(Math.max(1, copies-1))} className="h-12 w-12 rounded-xl bg-white border-2 font-black border-muted hover:border-primary transition-all text-xl">-</button>
                            <span className="w-12 text-center font-black text-2xl">{copies}</span>
                            <button onClick={() => setCopies(copies+1)} className="h-12 w-12 rounded-xl bg-white border-2 font-black border-muted hover:border-primary transition-all text-xl">+</button>
                        </div>
                      </div>
                  </div>
                </div>

                {/* Checkout Summary */}
                <aside className="space-y-6">
                  <div className="rounded-[3rem] bg-[#1A1C1E] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-primary/40 transition-all duration-700" />
                    <h3 className="text-2xl font-black font-outfit mb-8 italic">Order Summary</h3>
                    
                    <div className="space-y-6 font-medium">
                        <div className="flex justify-between items-start">
                            <span className="text-white/60 text-sm">{selectedPrintType === 'black' ? 'B&W' : 'Color'} Print ({pageCount} Pages)</span>
                            <span className="font-bold text-sm">{(getUnitPrice()*pageCount).toLocaleString()} RWF</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/60 text-sm">Quantity</span>
                            <span className="font-bold text-sm">x {copies}</span>
                        </div>
                        {addEditing && (
                             <div className="flex justify-between items-center text-emerald-400">
                                <span className="text-sm">Editing Service</span>
                                <span className="font-bold text-sm">+{getEditingFee().toLocaleString()} RWF</span>
                             </div>
                        )}
                        
                        <div className="pt-8 mt-8 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Grand Total</p>
                                <p className="text-4xl font-black text-primary">{totalPrice.toLocaleString()} <span className="text-sm">RWF</span></p>
                            </div>
                        </div>
                    </div>

                    <button 
                      onClick={() => setStep(3)}
                      className="w-full mt-10 rounded-[2rem] bg-primary py-6 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Checkout
                    </button>
                  </div>

                  <button 
                    onClick={() => setStep(1)}
                    className="w-full rounded-[2.5rem] border border-muted py-5 text-sm font-bold text-muted-foreground hover:bg-muted/30 transition-all flex items-center justify-center gap-2"
                  >
                        <Trash2 className="h-4 w-4" /> Discard and Restart
                  </button>
                </aside>
              </motion.div>
            ) : (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                <div className="rounded-[4rem] bg-white border p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-rose-500 to-purple-600" />
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-emerald-50 text-emerald-500 mb-8 border border-emerald-100">
                    <FileText className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-black font-outfit text-center mb-10">Client Identification</h2>
                    
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Full Name</p>
                            <input 
                                type="text" 
                                placeholder="Your Name" 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full rounded-[1.5rem] border-2 border-muted p-5 font-black text-xl focus:border-primary focus:outline-none transition-all" 
                            />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-3 tracking-widest">WhatsApp Number</p>
                            <input 
                                type="text" 
                                placeholder="078 XXX XXXX" 
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full rounded-[1.5rem] border-2 border-muted p-5 font-black text-xl focus:border-primary focus:outline-none transition-all placeholder:text-muted/40" 
                            />
                             <p className="mt-2 text-[10px] text-muted-foreground font-bold italic">Our staff will use this to contact you about your modification.</p>
                        </div>
                        
                        <button 
                            disabled={loading}
                            className={cn(
                                "w-full rounded-[2rem] py-6 font-black text-white shadow-xl transition-all grow text-lg mt-8 flex items-center justify-center gap-3",
                                loading ? "bg-muted cursor-not-allowed" : "bg-primary hover:scale-[1.03] active:scale-95"
                            )}
                            onClick={submitOrder}
                        >
                            {loading ? <Clock className="h-6 w-6 animate-spin" /> : <Settings className="h-6 w-6" />}
                            {loading ? "Submitting Order..." : "Submit for Modification"}
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                     <div className="rounded-[3rem] bg-[#1A1C1E] p-10 text-white shadow-2xl">
                        <h3 className="text-2xl font-black font-outfit mb-6">Payment Preview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-white/60">
                                <span>Pages Total</span>
                                <span className="text-white font-bold">{pageCount * copies}</span>
                            </div>
                            <div className="flex justify-between text-white/60">
                                <span>Total Price</span>
                                <span className="text-primary text-3xl font-black">{totalPrice.toLocaleString()} RWF</span>
                            </div>
                        </div>
                        <div className="mt-10 p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                            <CreditCard className="h-6 w-6 text-primary" />
                            <p className="text-xs font-medium text-white/60">Payment via MoMo will be requested by staff after reviewing your document.</p>
                        </div>
                     </div>

                     <div className="p-8 rounded-[3rem] border border-dashed text-center">
                        <button 
                            onClick={() => setStep(2)}
                            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Configuration
                        </button>
                     </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PublicShell>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
