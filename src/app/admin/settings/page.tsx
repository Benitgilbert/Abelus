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
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Administrative Control</span>
            </div>
            <h1 className="text-4xl font-black font-outfit tracking-tight text-[#1A1C1E]">Site Configuration</h1>
            <p className="text-muted-foreground mt-2 text-lg font-medium">Manage your brand presence and public information.</p>
          </div>
          
          <div className="flex p-1 bg-muted/30 rounded-2xl border backdrop-blur-sm self-start">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-primary shadow-sm ring-1 ring-black/5" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white border rounded-[3rem] p-10 shadow-sm transition-all animate-in fade-in zoom-in-95 duration-500">
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
