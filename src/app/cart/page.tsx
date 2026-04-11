"use client";

import React from 'react';
import { PublicShell } from '@/components/layout/PublicShell';
import { useCart } from '@/components/providers/CartProvider';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ChevronLeft,
  Tag,
  CreditCard,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, totalPrice, itemCount } = useCart();

  const tax = totalPrice * 0.18; // 18% VAT example
  const totalWithTax = totalPrice + tax;

  return (
    <PublicShell>
      <div className="min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <Link href="/shop" className="group mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Digital Shop
              </Link>
              <h1 className="font-outfit text-5xl font-black tracking-tight text-[#1A1C1E]">Your Cart</h1>
              <p className="mt-4 text-muted-foreground font-medium flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" /> You have {itemCount} premium items reserved.
              </p>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-12">
            {/* Items List */}
            <div className="flex-1 space-y-6">
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[3.5rem] border bg-white p-24 text-center"
                  >
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-[2rem] bg-muted mb-8">
                       <ShoppingBag className="h-10 w-10 text-muted-foreground opacity-20" />
                    </div>
                    <h3 className="text-3xl font-black font-outfit text-[#1A1C1E]">Your cart is empty</h3>
                    <p className="text-muted-foreground mt-4 text-lg font-medium max-w-xs mx-auto leading-relaxed">
                      Looks like you haven't added anything yet. Explore our premium papeterie and gadget collection.
                    </p>
                    <Link 
                      href="/shop" 
                      className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 font-black text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Start Shopping <ArrowRight className="h-5 w-5" />
                    </Link>
                  </motion.div>
                ) : (
                  cart.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="group relative flex flex-col sm:flex-row items-center gap-8 rounded-[3rem] border bg-white p-8 transition-all hover:shadow-2xl hover:shadow-black/5"
                    >
                        {/* Product Image Placeholder */}
                        <div className="h-40 w-40 flex-shrink-0 rounded-3xl bg-muted/30 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                            <Tag className="h-10 w-10 text-muted-foreground/10" />
                            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md rounded-lg px-2 py-1 text-[8px] font-black uppercase text-primary tracking-tighter shadow-sm">
                                Premium
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-2xl font-black font-outfit text-[#1A1C1E] tracking-tight">{item.name}</h3>
                            <p className="mt-2 text-sm text-muted-foreground font-medium line-clamp-1">{item.description || "High-quality retail product."}</p>
                            
                            <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unit Price</p>
                                    <p className="text-lg font-black text-primary">{Number(item.retail_price).toLocaleString()} RWF</p>
                                </div>
                                <div className="h-8 w-px bg-muted" />
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center sm:text-left">Quantity</p>
                                    <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-xl border border-black/5">
                                        <button 
                                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border text-muted-foreground hover:text-primary transition-colors shadow-sm"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-10 text-center font-black text-lg">{item.quantity}</span>
                                        <button 
                                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                          className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border text-muted-foreground hover:text-primary transition-colors shadow-sm"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-center sm:items-end gap-6 sm:pl-8 sm:border-l">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Subtotal</p>
                                <p className="text-2xl font-black text-[#1A1C1E]">{(item.retail_price * item.quantity).toLocaleString()} <span className="text-xs">RWF</span></p>
                            </div>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground hover:text-rose-500 transition-colors p-2"
                              title="Remove item"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <aside className="w-full xl:w-[400px] space-y-6">
                <div className="sticky top-32 space-y-6">
                    <div className="rounded-[3rem] bg-[#1A1C1E] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-primary/30 transition-all duration-700" />
                        
                        <h2 className="text-2xl font-black font-outfit mb-8 italic">Order Summary</h2>
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-white/60 font-medium">
                                <span className="text-sm">Items Subtotal</span>
                                <span className="font-bold">{totalPrice.toLocaleString()} RWF</span>
                            </div>
                            <div className="flex justify-between items-center text-white/60 font-medium">
                                <span className="text-sm">VAT (18%)</span>
                                <span className="font-bold">{tax.toLocaleString()} RWF</span>
                            </div>
                            <div className="h-px bg-white/10" />
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Grand Total</p>
                                    <p className="text-4xl font-black text-primary">{totalWithTax.toLocaleString()} <span className="text-sm">RWF</span></p>
                                </div>
                            </div>
                        </div>

                        <button 
                           disabled={cart.length === 0}
                           className={cn(
                             "w-full mt-12 rounded-[2rem] py-6 text-sm font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3",
                             cart.length === 0 
                               ? "bg-white/5 text-white/20 cursor-not-allowed" 
                               : "bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95"
                           )}
                        >
                            Proceed to Review <ArrowRight className="h-5 w-5" />
                        </button>

                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4 text-white/40">
                            <ShieldCheck className="h-5 w-5" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Pricing based on latest catalog rates.</p>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-[2rem] bg-white border p-6 flex flex-col items-center text-center gap-3">
                            <CreditCard className="h-6 w-6 text-primary" />
                            <p className="text-[10px] font-black uppercase text-muted-foreground">MoMo Pay</p>
                        </div>
                        <div className="rounded-[2rem] bg-white border p-6 flex flex-col items-center text-center gap-3">
                            <AlertCircle className="h-6 w-6 text-emerald-500" />
                            <p className="text-[10px] font-black uppercase text-muted-foreground">Check Stock</p>
                        </div>
                    </div>
                </div>
            </aside>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
