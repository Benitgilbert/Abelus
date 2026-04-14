"use client";

import React, { useState } from 'react';
import { X, Send, User, MessageCircle, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BusinessInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopPhone: string;
}

export function BusinessInquiryModal({ isOpen, onClose, shopPhone }: BusinessInquiryModalProps) {
  const [name, setName] = useState('');
  const [inquiry, setInquiry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleStartChat = () => {
    if (!name || !inquiry) return;
    
    setIsSubmitting(true);
    
    // Construct the professional message
    const message = `*Abelus Business Inquiry*\n\n*Name*: ${name}\n*Inquiry*: ${inquiry}\n\n_Sent via Abelus Business Portal_`;
    
    // Clean the phone number (remove any non-numeric characters)
    const cleanPhone = shopPhone.replace(/[^0-9]/g, '');
    
    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // Success sequence
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  const whatsappUrl = (() => {
    const message = `*Abelus Business Inquiry*\n\n*Name*: ${name || 'N/A'}\n*Inquiry*: ${inquiry || 'N/A'}\n\n_Sent via Abelus Business Portal_`;
    const cleanPhone = shopPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Elite Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className={cn(
              "relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.1)] border border-white p-8 sm:p-10 overflow-hidden max-h-[90vh] flex flex-col transition-all duration-500",
              isSuccess ? "bg-emerald-50 border-emerald-100" : ""
            )}
          >
            {/* Design Elements */}
            <div className="absolute top-0 right-0 h-48 w-48 bg-indigo-50 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none opacity-50" />
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      isSuccess ? "bg-emerald-500" : "bg-primary animate-pulse"
                    )} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                      {isSuccess ? "Connection Encrypted" : "Concierge Desk"}
                    </h3>
                  </div>
                  <h2 className="text-3xl font-black font-outfit text-slate-900 tracking-tight leading-none italic">
                    {isSuccess ? "Ready." : "Talk to us."}
                  </h2>
                </div>
                <button 
                  onClick={() => {
                    onClose();
                    setIsSuccess(false);
                  }}
                  className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-6 text-center space-y-8"
                    >
                      <div className="relative">
                        <motion.div 
                           initial={{ scale: 0 }}
                           animate={{ scale: 1.5, opacity: 0 }}
                           transition={{ duration: 1, repeat: Infinity }}
                           className="absolute inset-0 bg-emerald-500 rounded-full"
                        />
                        <div className="h-24 w-24 bg-emerald-500 rounded-full flex items-center justify-center text-white relative z-10 shadow-2xl shadow-emerald-200">
                           <CheckCircle2 className="h-12 w-12" />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-2xl font-black font-outfit text-emerald-950">Inquiry Prepared</p>
                        <p className="text-sm font-medium text-emerald-700/60 max-w-xs uppercase tracking-widest leading-loose">
                           Your secure link is ready. <br /> Tap below to open WhatsApp.
                        </p>
                      </div>

                      <a 
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          setTimeout(onClose, 500);
                        }}
                        className="w-full flex items-center justify-center gap-4 rounded-[2rem] bg-emerald-600 p-6 text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-2xl shadow-emerald-200 hover:bg-emerald-500 transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
                      >
                         Open WhatsApp Chat
                         <ArrowRight className="h-4 w-4" />
                      </a>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      {/* Form Inputs */}
                      <div className="space-y-6">
                        <div className="group space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                            <User className="h-3 w-3" /> Identity
                          </label>
                          <input 
                            type="text" 
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl p-5 text-base font-bold text-slate-900 focus:bg-white focus:border-primary/20 transition-all outline-none placeholder:text-slate-300"
                          />
                        </div>

                        <div className="group space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                            <MessageCircle className="h-3 w-3" /> Matter of Inquiry
                          </label>
                          <textarea 
                            placeholder="How can we help your business today? (e.g. Bulk orders, Partnerships)"
                            rows={4}
                            value={inquiry}
                            onChange={(e) => setInquiry(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl p-5 text-base font-bold text-slate-900 focus:bg-white focus:border-primary/20 transition-all outline-none resize-none placeholder:text-slate-300"
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        onClick={handleStartChat}
                        disabled={!name || !inquiry || isSubmitting}
                        className={cn(
                          "w-full group relative flex items-center justify-center gap-4 rounded-[2rem] p-6 text-[11px] font-black uppercase tracking-[0.4em] text-white transition-all active:scale-95 disabled:opacity-20 disabled:pointer-events-none overflow-hidden mt-4",
                          isSubmitting ? "bg-slate-800" : "bg-slate-950 hover:bg-primary hover:shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)]"
                        )}
                      >
                         {isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                            <span>Opening Channel...</span>
                          </div>
                        ) : (
                          <>
                            <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            Initialize Direct Connect
                            <Sparkles className="absolute right-6 h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {!isSuccess && (
                <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" /> Speed: ~15 Min Response
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
