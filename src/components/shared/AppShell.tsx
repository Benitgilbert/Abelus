"use client";

import React from 'react';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-card/10">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold font-outfit">Dashboard Oversight</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-tighter">Live Monitor</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">10 Apr, 2026</p>
              <p className="text-[10px] text-muted-foreground uppercase">Friday, 11:59 AM</p>
            </div>
          </div>
        </header>
        
        <div className="h-[calc(100vh-64px)] p-4 lg:p-6 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
