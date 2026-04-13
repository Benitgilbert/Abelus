import { supabase } from '@/lib/supabase/client';
import { Product, ProductVariant, ProductPackaging } from '@/types';

export type CartItem = {
  product: Product;
  variant: ProductVariant;
  unit?: ProductPackaging; // null means base unit (Piece)
  quantity: number;
  price: number;
  wishes: Record<string, any>; // Selection choices (Color, Paper type)
};

export type TransactionData = {
  userId?: string;
  clientId?: string;
  customerName?: string;
  items: CartItem[];
  totalAmount: number;
  amountPaid: number;
  paymentMethod: 'cash' | 'momo' | 'credit';
  source: 'pos' | 'online';
  shiftId: string | null;
};

export const posService = {
  async submitTransaction(data: TransactionData): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Use the Version 2 atomic RPC function (Variable Product & Unit Aware)
      const { data: transactionId, error: rpcError } = await supabase.rpc('handle_pos_sale_v2', {
        p_user_id: data.userId || null,
        p_client_id: data.clientId || null,
        p_total_amount: data.totalAmount,
        p_payment_method: data.paymentMethod,
        p_payment_status: data.amountPaid >= data.totalAmount ? 'paid' : (data.amountPaid > 0 ? 'partial' : 'pending'),
        p_amount_paid: data.amountPaid,
        p_shift_id: data.shiftId || null,
        p_items: data.items.map(item => ({
          variant_id: item.variant.id,
          packaging_id: item.unit?.id || null,
          unit_name: item.unit?.unit_name || 'Piece',
          quantity: item.quantity,
          price_at_sale: item.price,
          wishes: item.wishes
        }))
      });

      if (rpcError) throw rpcError;

      return { success: true, data: { id: transactionId } };
    } catch (err) {
      const error = err as Error;
      console.error('POS RPC v2 Submission Error:', error);
      return { success: false, error: error.message };
    }
  }
};
