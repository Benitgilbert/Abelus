import { supabase } from '@/lib/supabase/client';
import { Category } from '@/types';

export const categoryService = {
  async getAll(): Promise<Category[] | null> {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return null;
    }
    return data;
  },

  async create(name: string, description?: string, icon_name?: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('product_categories')
      .insert([{ name, description, icon_name }])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }
    return true;
  }
};
