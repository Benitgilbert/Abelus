"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/shared/AppShell';
import { GeneralSettings } from '@/components/admin/GeneralSettings';
import { TestimonialManager } from '@/components/admin/TestimonialManager';
import { SpecialtyManager } from '@/components/admin/SpecialtyManager';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { UserCreator } from '@/components/admin/UserCreator';
import { cn } from '@/lib/utils';
import { Settings, MessageSquare, Grid3X3, ShieldCheck, Tag, Users } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { redirect } from 'next/navigation';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'testimonials' | 'specialties' | 'categories' | 'users'>('general');
  const { profile, loading: authLoading } = useAuth();

  // Simple protection - real protection is via RLS, but this keeps UI clean
  if (!authLoading && profile?.role === 'client') {
    redirect('/management');
  }

  const tabs = [
    { id: 'general', name: 'General Settings', icon: Settings },
    { id: 'users', name: 'Staff & Accounts', icon: Users },
    { id: 'testimonials', name: 'Testimonials', icon: MessageSquare },
    { id: 'specialties', name: 'Site Specialties', icon: Grid3X3 },
    { id: 'categories', name: 'Product Categories', icon: Tag },
  ] as const;

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in p-4 lg:p-0">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Administrative Control</span>
            </div>
            <h1 className="text-4xl font-black font-outfit tracking-tight text-slate-900">Site Configuration</h1>
            <p className="text-slate-400 mt-2 text-lg font-bold uppercase tracking-widest text-[10px]">Manage your brand presence and public information.</p>
          </div>
          
          <div className="flex p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/50 backdrop-blur-sm self-start overflow-x-auto scrollbar-hide max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-white text-indigo-600 shadow-xl shadow-indigo-100 ring-1 ring-slate-100" 
                    : "text-slate-400 hover:text-slate-900 transition-colors"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white border border-slate-100 rounded-[2.5rem] lg:rounded-[3.5rem] p-6 lg:p-12 shadow-2xl shadow-indigo-100/30 transition-all animate-in fade-in zoom-in-95 duration-500">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'users' && <UserCreator />}
          {activeTab === 'testimonials' && <TestimonialManager />}
          {activeTab === 'specialties' && <SpecialtyManager />}
          {activeTab === 'categories' && <CategoryManager />}
        </div>
      </div>
    </AppShell>
  );
}
