"use client";

import React from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X, Bell } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-inter">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 overflow-y-auto bg-card/10 flex flex-col">
        <header className="sticky top-0 z-[50] flex h-16 shrink-0 items-center justify-between border-b bg-white/80 px-4 md:px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors text-slate-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:flex items-center gap-4">
              <h2 className="text-xl font-black font-outfit text-slate-900 tracking-tight">Dashboard Oversight</h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100 shadow-sm">Live Monitor</span>
            </div>
            <div className="sm:hidden font-black text-brand-secondary text-sm tracking-tighter uppercase font-outfit">
              Pastor Bonus
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden md:block text-right">
              {mounted && (
                <>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                    {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </>
              )}
            </div>
            <button className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors border border-slate-100 shadow-sm active:scale-95">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>
        
        <div className="p-4 md:p-6 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
