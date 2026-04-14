"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { sendNewsletterAction } from '@/lib/actions/marketing';
import { AppShell } from '@/components/shared/AppShell';
import { 
  Mail, Users, Send, History, Search, Filter, 
  MoreVertical, Trash2, Eye, ChevronRight, Plus, 
  Rocket, ArrowRight, Loader2, Layout, Smartphone, 
  Monitor, Printer, Smartphone as SmartphoneIcon, Layout as LayoutIcon, 
  Printer as PrinterIcon, Rocket as RocketIcon, Users as UsersIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

interface Campaign {
  id: string;
  subject: string;
  content: string;
  status: 'draft' | 'sent';
  sent_to_count: number;
  created_at: string;
  sent_at?: string;
}

const MARKETING_TEMPLATES = [
  {
    id: 'welcome',
    title: 'Elite Welcome',
    subject: 'Welcome to the Pastor Bonus Community',
    content: `Welcome to the circle of excellence. We've successfully registered your interest.\n\nAs a valued member, you'll be the first to hear about our newest tech arrivals, high-volume printing services, and exclusive school season specials.`,
    icon: Rocket
  },
  {
    id: 'printing',
    title: 'Bulk Printing',
    subject: 'High-Volume Printing for High-Impact Projects',
    content: `Precision printing for your most important work.\n\nFrom academic thesis binding to high-volume corporate reports, Pastor Bonus delivers clarity and quality. Contact us today for a custom quote on your next large-scale printing project.`,
    icon: Printer
  },
  {
    id: 'gadgets',
    title: 'New Tech Arrivals',
    subject: 'Curated Tech Excellence has Arrived',
    content: `Elevate your digital life with our newest curation of gadgets and laptops.\n\nWe've just expanded our inventory with high-performance hardware designed for durability and speed. Visit us at abelus.vercel.app to explore the collection.`,
    icon: Smartphone
  },
  {
    id: 'seasonal',
    title: 'Seasonal Special',
    subject: 'Preparing for the Season: Exclusive Savings Inside',
    content: `Get ahead of the curve with our Seasonal Specials.\n\nWhether you're prepping for exams or localizing your business operations, enjoy exclusive discounts on our entire service range for a limited time. Don't wait until the rush—get started today.`,
    icon: Layout
  },
  {
    id: 'loyalty',
    title: 'Loyalty Reward',
    subject: 'An Exclusive Gesture of Appreciation',
    content: `excellence is its own reward, but we'd like to offer a little more.\n\nThank you for choosing Pastor Bonus for your printing and tech needs. We invite you to visit our store this week for a loyalty-exclusive discount on all in-stock gadgets.`,
    icon: Users
  }
];

export default function SubscribersPage() {
  const [activeTab, setActiveTab] = useState<'audience' | 'campaigns' | 'editor'>('audience');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  // Editor State
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [subsRes, campRes] = await Promise.all([
      supabase.from('newsletter_subscriptions').select('*').order('created_at', { ascending: false }),
      supabase.from('newsletter_campaigns').select('*').order('created_at', { ascending: false })
    ]);

    if (subsRes.data) setSubscribers(subsRes.data);
    if (campRes.data) setCampaigns(campRes.data);
    setLoading(false);
  };

  const handleDispatch = async () => {
    if (!subject || !content) {
      alert('Please provide a subject and content for your campaign.');
      return;
    }

    if (subscribers.length === 0) {
      alert('No subscribers found in your audience.');
      return;
    }

    if (!confirm(`Are you sure you want to dispatch this campaign to ${subscribers.length} leads?`)) return;

    setLoading(true);
    try {
      const targetList = selectedEmails.size > 0 
        ? Array.from(selectedEmails) 
        : subscribers.map(s => s.email);

      const res = await sendNewsletterAction({
        subject,
        content,
        recipientEmails: targetList
      });
      
      if (!res.success) {
        throw new Error(res.error || 'Failed to dispatch');
      }

      setSubject('');
      setContent('');
      setSelectedEmails(new Set());
      setActiveTab('campaigns');
      fetchData();
      alert(`Campaign dispatched successfully to ${targetList.length} leads! 🚀`);
    } catch (err: any) {
      console.error('Dispatch error:', err);
      alert(`Failed to dispatch campaign: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Permanently remove this lead from the audience?')) return;
    const { error } = await supabase.from('newsletter_subscriptions').delete().eq('id', id);
    if (!error) fetchData();
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAll = () => {
    if (selectedEmails.size === filteredSubscribers.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(filteredSubscribers.map(s => s.email)));
    }
  };

  const toggleOne = (email: string) => {
    const next = new Set(selectedEmails);
    if (next.has(email)) next.delete(email);
    else next.add(email);
    setSelectedEmails(next);
  };

  const handleReuseCampaign = (camp: Campaign) => {
    setSubject(camp.subject);
    setContent(camp.content);
    setActiveTab('editor');
    // Scroll to top to see transition
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectRandom = (count: number) => {
    const shuffled = [...subscribers].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count).map(s => s.email);
    setSelectedEmails(new Set(selected));
  };

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-50">
          <div>
            <h1 className="font-outfit text-3xl font-black text-slate-900 tracking-tight">Marketing Reach</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Lead Capture & Campaign Hub</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('editor')}
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-primary transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              New Campaign
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Audience', val: subscribers.length, icon: Users, color: 'text-primary' },
            { label: 'New Today', val: subscribers.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length, icon: Rocket, color: 'text-emerald-500' },
            { label: 'Campaigns Sent', val: campaigns.filter(c => c.status === 'sent').length, icon: Send, color: 'text-indigo-500' },
            { label: 'In Draft', val: campaigns.filter(c => c.status === 'draft').length, icon: Layout, color: 'text-amber-500' }
          ].map((s, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={cn("h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50", s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1.5">{s.label}</p>
                <p className="text-lg sm:text-xl font-black font-outfit truncate leading-none">{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-slate-100/50 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'audience', label: 'Audience', icon: Users },
          { id: 'campaigns', label: 'History', icon: History },
          { id: 'editor', label: 'Composer', icon: Send },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id 
                ? "bg-white text-primary shadow-sm" 
                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "text-slate-400")} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="wait">
          {activeTab === 'audience' && (
            <motion.div
              key="audience"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Audience Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search subscribers..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-primary transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => selectRandom(5)}
                     className="px-6 py-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-all flex items-center gap-2"
                   >
                     <Rocket className="h-4 w-4" /> Pick 5 Random
                   </button>
                   <button className="px-6 py-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-all">
                     Export CSV
                   </button>
                </div>
              </div>

              {/* Selection Summary Bar */}
              <AnimatePresence>
                {selectedEmails.size > 0 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">
                          {selectedEmails.size} Recipients Selected
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedEmails(new Set())}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[9px] font-black text-white uppercase tracking-widest transition-all"
                        >
                          Clear Selection
                        </button>
                        <button 
                          onClick={() => setActiveTab('editor')}
                          className="px-4 py-2 rounded-xl bg-primary shadow-lg shadow-primary/20 text-[9px] font-black text-white uppercase tracking-widest transition-all"
                        >
                          Target with Campaign
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-slate-300">
                  <Loader2 className="h-10 w-10 animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Synchronizing Registry...</p>
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-100/50">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="w-12 px-8 py-6">
                          <input 
                            type="checkbox" 
                            checked={selectedEmails.size > 0 && selectedEmails.size === filteredSubscribers.length}
                            onChange={toggleAll}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                          />
                        </th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Identity</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Date</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSubscribers.map((sub) => (
                        <tr key={sub.id} className={cn(
                          "hover:bg-slate-50/30 transition-colors group",
                          selectedEmails.has(sub.email) && "bg-primary/[0.02]"
                        )}>
                          <td className="px-8 py-6">
                            <input 
                              type="checkbox" 
                              checked={selectedEmails.has(sub.email)}
                              onChange={() => toggleOne(sub.email)}
                              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                            />
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-bold text-slate-900">{sub.email}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-tight">
                              {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleDeleteSubscriber(sub.id)}
                                className="h-9 w-9 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredSubscribers.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-8 py-20 text-center">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                              <Users className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No subscribers detected in this range</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'campaigns' && (
             <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {campaigns.map((camp) => (
                <div key={camp.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group cursor-pointer relative overflow-hidden">
                  <div className="flex items-start justify-between mb-6">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center",
                      camp.status === 'sent' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                    )}>
                      {camp.status === 'sent' ? <Rocket className="h-5 w-5" /> : <Layout className="h-5 w-5" />}
                    </div>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                      camp.status === 'sent' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                    )}>
                      {camp.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-black text-slate-900 font-outfit truncate pr-8 tracking-tight">{camp.subject}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                    {camp.status === 'sent' ? `Sent to ${camp.sent_to_count} leads` : 'Draft Workspace'}
                  </p>
                  
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      {new Date(camp.created_at).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => handleReuseCampaign(camp)}
                      className="group/btn relative px-6 py-3 rounded-xl bg-slate-50 flex items-center gap-2 overflow-hidden transition-all hover:bg-primary hover:text-white"
                    >
                       <span className="text-[9px] font-black uppercase tracking-widest relative z-10 transition-colors group-hover/btn:text-white">Reuse & Refine</span>
                       <ArrowRight className="h-3 w-3 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
              {campaigns.length === 0 && (
                <div className="col-span-full py-24 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <History className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Campaign Archive Empty</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'editor' && (
            <motion.div
              key="editor"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-8"
            >
              {/* Composition Workspace */}
              <div className="space-y-6">
                {/* Elite Template Hub */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-6 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Elite Template Hub</span>
                    <div className="h-1 w-12 bg-primary/20 rounded-full" />
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {MARKETING_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => { setSubject(tmpl.subject); setContent(tmpl.content); }}
                        className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-100 rounded-3xl min-w-[140px] hover:shadow-xl hover:shadow-indigo-100/50 hover:border-primary transition-all group active:scale-95"
                      >
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                          <tmpl.icon className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-900">{tmpl.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/50 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Subject Header</label>
                    <input 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Special Season Update: 5% Off Printing" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-lg font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Narrative Content (Markdown)</label>
                    <textarea 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={12}
                      placeholder="Draft your message here. Use **bold** for emphasis."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-50 border-dashed">
                     <button 
                       onClick={() => { setSubject(''); setContent(''); }}
                       className="flex-1 px-8 py-5 rounded-2xl bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                     >
                       Clear Workspace
                     </button>
                     <button 
                       onClick={handleDispatch}
                       disabled={loading}
                       className={cn(
                        "flex-1 px-8 py-5 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3",
                        loading ? "bg-slate-400" : "bg-primary"
                       )}
                     >
                       {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                       Dispatch Campaign
                     </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Pane */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Branded Digital Preview</span>
                  <div className="flex bg-slate-100/50 p-1 rounded-xl">
                    <button 
                      onClick={() => setPreviewMode('desktop')}
                      className={cn("p-2 rounded-lg transition-all", previewMode === 'desktop' ? "bg-white shadow-sm text-primary" : "text-slate-400")}
                    >
                      <Monitor className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setPreviewMode('mobile')}
                      className={cn("p-2 rounded-lg transition-all", previewMode === 'mobile' ? "bg-white shadow-sm text-primary" : "text-slate-400")}
                    >
                      <Smartphone className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className={cn(
                  "bg-slate-100 rounded-[2.5rem] p-8 flex items-start justify-center overflow-hidden transition-all h-[600px]",
                  previewMode === 'mobile' ? "w-[360px] mx-auto" : "w-full"
                )}>
                   <div className="bg-white rounded-3xl w-full h-full shadow-2xl overflow-y-auto border border-white">
                      {/* Email Template Header */}
                      <div className="bg-slate-900 p-8 text-center">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                           <span className="text-white font-black text-sm">PB</span>
                        </div>
                        <h2 className="text-white font-black uppercase tracking-widest text-[8px]">Pastor Bonus Co. Ltd</h2>
                      </div>
                      
                      {/* Email Content */}
                      <div className="p-8 space-y-4">
                        <h1 className="font-outfit text-2xl font-black text-slate-900 leading-tight">
                          {subject || 'Campaign Subject Placeholder'}
                        </h1>
                        <div className="h-1 w-12 bg-primary/20 rounded-full" />
                        <div className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                          {content || 'Enter narrative content to visualize the digital transformation and outreach potential of your message...'}
                        </div>
                        
                        <div className="py-8">
                           <button className="w-full rounded-xl bg-primary py-4 text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                             Visit Our Store
                           </button>
                        </div>
                      </div>
                      
                      {/* Email Footer */}
                      <div className="bg-slate-50 p-8 text-center border-t border-slate-100">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-2">Exclusive Updates</p>
                        <p className="text-[8px] font-medium text-slate-300 leading-relaxed">
                          You are receiving this because you subscribed via our digital portal. 
                          Sent with excellence from Pastor Bonus Oversight Platform.
                        </p>
                      </div>
                  </div>
                   
                   {/* Target Audience Summary */}
                   <div className="px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center">
                         <Mail className="h-4 w-4" />
                       </div>
                       <div>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Target Audience</p>
                         <p className="text-xs font-black text-slate-900 uppercase">
                           {selectedEmails.size > 0 ? `${selectedEmails.size} Selected Recipients` : `All Subscribers (${subscribers.length})`}
                         </p>
                       </div>
                     </div>
                     {selectedEmails.size > 0 && (
                       <button 
                         onClick={() => { setSelectedEmails(new Set()); setActiveTab('audience'); }}
                         className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                       >
                         Reset to All
                       </button>
                     )}
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </AppShell>
  );
}
