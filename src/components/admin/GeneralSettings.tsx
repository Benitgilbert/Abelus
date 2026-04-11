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
        <div className="rounded-[2.5rem] border bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="font-outfit text-xl font-black text-[#1A1C1E]">Contact Details</h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="w-full rounded-2xl border bg-[#F8F9FB] py-3.5 pl-11 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input name="contact_email" value={formData.contact_email} onChange={handleChange} className="w-full rounded-2xl border bg-[#F8F9FB] py-3.5 pl-11 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Main Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input name="contact_address" value={formData.contact_address} onChange={handleChange} className="w-full rounded-2xl border bg-[#F8F9FB] py-3.5 pl-11 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Maps URL</label>
                <input name="contact_maps_url" value={formData.contact_maps_url} onChange={handleChange} className="w-full rounded-2xl border bg-[#F8F9FB] py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" placeholder="https://maps.app.goo.gl/..." />
              </div>
            </div>
          </div>
        </div>

        {/* Hero & Branding Card */}
        <div className="rounded-[2.5rem] border bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Type className="h-5 w-5" />
            </div>
            <h3 className="font-outfit text-xl font-black text-[#1A1C1E]">Hero & Branding</h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hero Headline</label>
              <textarea name="hero_title" value={formData.hero_title} onChange={handleChange} rows={2} className="w-full rounded-2xl border bg-[#F8F9FB] py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hero Subtitle</label>
              <textarea name="hero_subtitle" value={formData.hero_subtitle} onChange={handleChange} rows={3} className="w-full rounded-2xl border bg-[#F8F9FB] py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
            </div>

            <div className="pt-4 border-t border-dashed">
               <div className="flex items-center justify-between mb-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hero Background Image</label>
                 {uploading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
               </div>
               <div className="group relative flex h-32 w-full items-center justify-center rounded-2xl border-2 border-dashed bg-[#F8F9FB] transition-all hover:bg-white hover:border-primary/50 overflow-hidden">
                 <img src={settings.hero_image_url} alt="Current Hero" className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-10 transition-opacity" />
                 <div className="relative z-10 flex flex-col items-center gap-2">
                   <ImageIcon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                   <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">Replace Image</span>
                 </div>
                 <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 cursor-pointer opacity-0" />
               </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="lg:col-span-2 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-black text-white shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-70"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
