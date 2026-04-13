import { supabase } from '@/lib/supabase/client';

export type PrintOrder = {
  id: string;
  customer_name?: string;
  customer_id?: string;
  file_url: string;
  page_count?: number;
  access_mode: 'read_only' | 'read_write';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status: string;
  total_price?: number;
  created_at: string;
};

export const printService = {
  async getAll(): Promise<PrintOrder[] | null> {
    const { data, error } = await supabase
      .from('print_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching print orders:', error);
      return null;
    }
    return data;
  },

  async updateStatus(id: string, status: PrintOrder['status']): Promise<boolean> {
    const { error } = await supabase
      .from('print_orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating print order status:', error);
      return false;
    }
    return true;
  },

  async updatePaymentStatus(id: string, payment_status: string): Promise<boolean> {
    const { error } = await supabase
      .from('print_orders')
      .update({ payment_status })
      .eq('id', id);

    if (error) {
      console.error('Error updating print order payment status:', error);
      return false;
    }
    return true;
  },

  async getByTrackingId(trackingId: string): Promise<PrintOrder | null> {
    const { data, error } = await supabase
      .from('print_orders')
      .select('*')
      .eq('tracking_id', trackingId.toUpperCase())
      .single();

    if (error) {
      console.error('Error fetching print order by tracking ID:', error);
      return null;
    }
    return data;
  },

  async createOrder(order: Omit<PrintOrder, 'id' | 'created_at' | 'status' | 'payment_status'>): Promise<PrintOrder | null> {
    const { data, error } = await supabase
      .from('print_orders')
      .insert({
        ...order,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating print order:', error);
      return null;
    }
    return data;
  },

  // Subscribe to real-time updates for the staff queue
  subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel('print_orders_changes')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'print_orders' }, callback)
      .subscribe();
  }
};
