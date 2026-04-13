"use client";

import React, { useState } from 'react';
import { X, Send, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BusinessInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopPhone: string;
}

export function BusinessInquiryModal({ isOpen, onClose, shopPhone }: BusinessInquiryModalProps) {
  const [name, setName] = useState('');
  const [inquiry, setInquiry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartChat = () => {
    if (!name || !inquiry) return;
    
    setIsSubmitting(true);
    
    // Construct the professional message
    const message = `*Abelus Business Inquiry*\n\n*Name*: ${name}\n*Inquiry*: ${inquiry}\n\n_Sent via Abelus Business Portal_`;
    
    // Clean the phone number (remove any non-numeric characters)
    const cleanPhone = shopPhone.replace(/[^0-9]/g, '');
    
    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    // Redirect
    window.open(whatsappUrl, '_blank');
    
    // Cleanup
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      setName('');
      setInquiry('');
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-slate-100 overflow-hidden"
          >
            {/* Design Element */}
            <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Concierge Desk</h3>
                  </div>
                  <h2 className="text-3xl font-black font-outfit text-slate-900 tracking-tight">Talk to us.</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100 shadow-sm"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Input */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                    <User className="h-3 w-3" /> Your Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                    <MessageCircle className="h-3 w-3" /> Business Inquiry
                  </label>
                  <textarea 
                    placeholder="How can we help your business today? (e.g. Bulk orders, Subscriptions, Partnerships)"
                    rows={4}
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all outline-none resize-none placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Footer Action */}
              <button 
                onClick={handleStartChat}
                disabled={!name || !inquiry || isSubmitting}
                className="w-full group flex items-center justify-center gap-3 rounded-2xl bg-slate-950 p-5 text-[12px] font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">Initializing Chat...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    Connect to Business Desk
                  </>
                )}
              </button>

              <p className="text-center text-[9px] font-bold text-slate-400 leading-relaxed max-w-[240px] mx-auto uppercase tracking-widest">
                Our team usually responds on WhatsApp within 15 minutes during shop hours.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
