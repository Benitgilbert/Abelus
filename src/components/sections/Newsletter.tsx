import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export function Newsletter() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative rounded-[3rem] bg-primary p-12 md:p-20 text-white overflow-hidden shadow-2xl shadow-primary/20">
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-8">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight leading-tight">Stay ahead of the curve.</h2>
            <p className="mt-6 text-lg font-medium text-white/80 leading-relaxed">
              Get 5% off your first bulk printing order and stay updated with our newest gadget arrivals and school season specials.
            </p>

            <form className="mt-12 w-full max-w-lg flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 rounded-2xl bg-white/20 border border-white/30 px-6 py-5 text-lg font-medium placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white transition-all"
              />
              <button 
                type="submit"
                className="group flex items-center justify-center gap-3 rounded-2xl bg-[#1A1C1E] px-8 py-5 text-lg font-black transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                Join Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            
            <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-white/40">No spam. Just quality updates.</p>
          </div>
          
          {/* Decorative Blur */}
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-[100px]" />
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-[100px]" />
        </div>
      </div>
    </section>
  );
}
