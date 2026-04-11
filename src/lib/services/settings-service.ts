import { supabase } from '@/lib/supabase/client';

export interface SystemSetting {
  key: string;
  value: string;
  category: string;
  description?: string;
}

export const settingsService = {
  async getAll(): Promise<SystemSetting[] | null> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*');

    if (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
    return data;
  },

  async updateSetting(key: string, value: string): Promise<boolean> {
    const { error } = await supabase
      .from('system_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) {
      console.error('Error updating setting:', error);
      return false;
    }
    return true;
  },

  async getTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
      return null;
    }
    return data;
  },

  async getSpecialties() {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching specialties:', error);
      return null;
    }
    return data;
  }
};
