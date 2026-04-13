"use client";

import React, { useState } from 'react';
import { useSettings } from '@/components/providers/SettingsProvider';
import { settingsService } from '@/lib/services/settings-service';
import { storageService } from '@/lib/services/storage-service';
import { Save, Upload, Loader2, CheckCircle2, AlertCircle, MapPin, Phone, Mail, Type, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export function GeneralSettings() {
  const { settings, refreshSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    contact_email: settings.contact_email || '',
    contact_phone: settings.contact_phone || '',
    contact_address: settings.contact_address || '',
    contact_maps_url: settings.contact_maps_url || '',
    hero_title: settings.hero_title || '',
    hero_subtitle: settings.hero_subtitle || '',
    promo_banner_text: settings.promo_banner_text || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const updates = Object.entries(formData).map(([key, value]) => 
      settingsService.updateSetting(key, value)
    );

    const results = await Promise.all(updates);
    
    if (results.every(r => r)) {
      await refreshSettings();
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } else {
      setMessage({ type: 'error', text: 'Some settings failed to update.' });
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await storageService.uploadAsset(file, 'hero');
    if (url) {
      const success = await settingsService.updateSetting('hero_image_url', url);
      if (success) {
        await refreshSettings();
        setMessage({ type: 'success', text: 'Hero image updated!' });
      }
    } else {
      setMessage({ type: 'error', text: 'Image upload failed.' });
    }
    setUploading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {message && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-bold ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Contact Info Card */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 lg:p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <Phone className="h-24 w-24" />
          </div>
          <div className="mb-8 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-outfit text-xl font-black text-slate-900 tracking-tight">Contact Details</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Business Reach</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 flex items-center justify-center border-r border-slate-100 pr-3">
                  <Phone className="h-3.5 w-3.5 text-slate-300" />
                </div>
                <input name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="w-full rounded-2xl border border-slate-100 bg-white py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all placeholder:text-slate-200" placeholder="+250 ..." />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Official Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 flex items-center justify-center border-r border-slate-100 pr-3">
                  <Mail className="h-3.5 w-3.5 text-slate-300" />
                </div>
                <input name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full rounded-2xl border border-slate-100 bg-white py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Main Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 flex items-center justify-center border-r border-slate-100 pr-3">
                    <MapPin className="h-3.5 w-3.5 text-slate-300" />
                  </div>
                  <input name="contact_address" value={formData.contact_address} onChange={handleChange} className="w-full rounded-2xl border border-slate-100 bg-white py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Maps URL</label>
                <input name="contact_maps_url" value={formData.contact_maps_url} onChange={handleChange} className="w-full rounded-2xl border border-slate-100 bg-white py-4 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all" placeholder="https://maps.app.goo.gl/..." />
              </div>
            </div>
          </div>
        </div>

        {/* Hero & Branding Card */}
        <div className="rounded-[2.5rem] border border-slate-100 bg-white p-6 lg:p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
            <Type className="h-24 w-24" />
          </div>
          <div className="mb-8 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-outfit text-xl font-black text-slate-900 tracking-tight">Hero & Branding</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Digital Storefront Presence</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Hero Headline</label>
              <textarea name="hero_title" value={formData.hero_title} onChange={handleChange} rows={2} className="w-full rounded-2xl border border-slate-100 bg-white py-4 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Hero Subtitle</label>
              <textarea name="hero_subtitle" value={formData.hero_subtitle} onChange={handleChange} rows={3} className="w-full rounded-2xl border border-slate-100 bg-white py-4 px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all resize-none" />
            </div>

            <div className="pt-4 border-t border-dashed border-slate-100">
               <div className="flex items-center justify-between mb-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Hero Background Image</label>
                 {uploading && <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />}
               </div>
               <div className="group relative flex h-40 w-full items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 transition-all hover:bg-white hover:border-indigo-600/50 overflow-hidden">
                 <img src={settings.hero_image_url} alt="Current Hero" className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-10 transition-opacity" />
                 <div className="relative z-10 flex flex-col items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                     <ImageIcon className="h-5 w-5" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">Replace Digital Asset</span>
                 </div>
                 <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 cursor-pointer opacity-0" />
               </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="lg:col-span-2 flex justify-center lg:justify-end pt-8">
          <button 
            type="submit" 
            disabled={saving}
            className="group w-full lg:w-auto flex items-center justify-center gap-4 rounded-2xl bg-slate-900 px-12 py-5 text-sm font-black text-white shadow-2xl shadow-indigo-200 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-70 uppercase tracking-widest"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Commit Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
