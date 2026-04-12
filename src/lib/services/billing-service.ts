import { supabase } from '@/lib/supabase/client';
import { ContractPrice } from '@/types';

export const billingService = {
  /**
   * Sets or updates a contract price for a specific client and product.
   */
  async upsertContractPrice(clientId: string, productId: string, variantId: string | undefined, unitId: string | undefined, negotiatedPrice: number): Promise<boolean> {
    const { error } = await supabase
      .from('contract_prices')
      .upsert({
        client_id: clientId,
        product_id: productId,
        variant_id: variantId || null,
        unit_id: unitId || null,
        negotiated_price: negotiatedPrice
      }, { 
        onConflict: 'client_id,product_id,variant_id,unit_id' 
      });

    if (error) {
      console.error('Error upserting contract price:', error);
      return false;
    }
    return true;
  },

  /**
   * Runs the retroactive reconciliation RPC to update past UNLOCKED transactions.
   */
  async reconcilePrices(clientId: string, productId: string, variantId: string | undefined, unitId: string | undefined, newPrice: number): Promise<boolean> {
    const { error } = await supabase.rpc('reconcile_contract_prices', {
      p_client_id: clientId,
      p_product_id: productId,
      p_variant_id: variantId || null,
      p_unit_id: unitId || null,
      p_new_price: newPrice
    });

    if (error) {
      console.error('Error reconciling prices:', error);
      return false;
    }
    return true;
  },

  /**
   * Fetches all unbilled transactions for a client (where payment_request_id is null and payment_method is credit).
   */
  async getUnbilledTransactions(clientId: string): Promise<any[] | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        items:transaction_items (
          *,
          product:products (name),
          variant:product_variants (attributes)
        )
      `)
      .eq('client_id', clientId)
      .is('payment_request_id', null)
      .eq('payment_method', 'credit');

    if (error) return null;
    return data;
  },

  /**
   * Finalizes a payment request, linking selected transactions to it and locking them.
   */
  async generatePaymentRequest(clientId: string, transactionIds: string[], notes: string = ''): Promise<string | null> {
    // 1. Calculate total amount from transactions
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('total_amount, amount_paid')
      .in('id', transactionIds);

    if (txError) {
      console.error('Error fetching transactions for invoicing:', txError);
      return null;
    }
    const total = txData.reduce((acc, tx) => acc + (Number(tx.total_amount) - Number(tx.amount_paid)), 0);

    // 2. Create the request record
    const { data: request, error: rError } = await supabase
      .from('payment_requests')
      .insert({
        client_id: clientId,
        total_amount: total,
        summary_notes: notes,
        status: 'draft'
      })
      .select()
      .single();

    if (rError) {
      const errorDetail = `Message: ${rError.message} | Code: ${rError.code} | Details: ${rError.details} | Hint: ${rError.hint}`;
      console.error('CRITICAL BILLING ERROR:', errorDetail);
      console.error('Error Object Stringified:', JSON.stringify(rError, null, 2));
      console.error('PAYLOAD ATTEMPTED:', JSON.stringify({ client_id: clientId, total_amount: total, tx_count: transactionIds.length }, null, 2));
      return null;
    }

    // 3. Link transactions to this request
    const { error: luError } = await supabase
      .from('transactions')
      .update({ payment_request_id: request.id })
      .in('id', transactionIds);

    if (luError) {
      console.error('Error linking transactions to request:', luError);
      return null;
    }

    return request.id;
  },

  /**
   * Unlocks a payment request, making the transactions editable again.
   */
  async unlockPaymentRequest(requestId: string): Promise<boolean> {
    // 1. Clear the link on transactions
    const { error: uError } = await supabase
      .from('transactions')
      .update({ payment_request_id: null })
      .eq('payment_request_id', requestId);

    if (uError) return false;

    // 2. Mark the request as cancelled
    const { error: cError } = await supabase
      .from('payment_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId);

    return !cError;
  },

  /**
   * Deletes a specific contract price.
   */
  async deleteContractPrice(contractId: string): Promise<boolean> {
    const { error } = await supabase
      .from('contract_prices')
      .delete()
      .eq('id', contractId);

    if (error) {
      console.error('Error deleting contract price:', error);
      return false;
    }
    return true;
  },

  /**
   * Updates basic client profile information.
   */
  async updateClient(id: string, updates: any): Promise<boolean> {
    const { error } = await supabase
      .from('clients_market')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating market client profile:', error);
      return false;
    }
    return true;
  },

  /**
   * Deletes a client record.
   */
  async deleteClient(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('clients_market')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting market client:', error);
      return false;
    }
    return true;
  },

  /**
   * Fetches a single payment request with its linked transactions and their items.
   */
  async getPaymentRequest(requestId: string): Promise<{request: any, transactions: any[]} | null> {
    const { data: request, error: rError } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (rError) {
      console.error('Error fetching payment request:', rError);
      return null;
    }

    const { data: transactions, error: tError } = await supabase
      .from('transactions')
      .select(`
        *,
        items:transaction_items (
          *,
          product:products (name),
          variant:product_variants (attributes)
        )
      `)
      .eq('payment_request_id', requestId)
      .order('created_at', { ascending: true });

    if (tError) {
      console.error('Error fetching transactions for request:', tError);
      return null;
    }

    return { request, transactions };
  },

  /**
   * Fetches all payment requests for a specific client.
   */
  async getClientInvoices(clientId: string): Promise<any[] | null> {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client invoice history:', error);
      return null;
    }
    return data;
  }
};
