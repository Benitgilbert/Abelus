import { supabase } from '@/lib/supabase/client';
import { MarketClient } from '@/types';

export const clientService = {
  async getAll(): Promise<MarketClient[] | null> {
    const { data, error } = await supabase
      .from('clients_market')
      .select('*')
      .order('org_name', { ascending: true });

    if (error) {
      console.error('Error fetching market clients:', error);
      return null;
    }
    return data;
  },

  async getById(id: string): Promise<MarketClient | null> {
    const { data, error } = await supabase
      .from('clients_market')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching market client:', error);
      return null;
    }
    return data;
  },

  async create(client: Omit<MarketClient, 'id' | 'created_at' | 'debt_balance'>): Promise<MarketClient | null> {
    const { data, error } = await supabase
      .from('clients_market')
      .insert({ ...client, debt_balance: 0 })
      .select()
      .single();

    if (error) {
      console.error('Error creating market client:', error);
      return null;
    }
    return data;
  },

  async updateDebt(id: string, amount: number): Promise<boolean> {
    // Note: In a real app, use an RPC or transaction for atomic debt updates
    const client = await this.getById(id);
    if (!client) return false;

    const { error } = await supabase
      .from('clients_market')
      .update({ debt_balance: client.debt_balance + amount })
      .eq('id', id);

    if (error) {
      console.error('Error updating debt:', error);
      return false;
    }
    return true;
  }
};
