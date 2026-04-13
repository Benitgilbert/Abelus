import { supabase } from '@/lib/supabase/client';

export interface Shift {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  starting_cash: number;
  actual_cash: number | null;
  expected_cash: number | null;
  status: 'open' | 'closed';
  notes: string | null;
}

export const shiftService = {
  async getCurrentShift(userId: string): Promise<Shift | null> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .single();

    if (error) return null;
    return data;
  },

  async openShift(userId: string, startingCash: number): Promise<Shift | null> {
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        user_id: userId,
        starting_cash: startingCash,
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async closeShift(shiftId: string, actualCash: number, notes?: string): Promise<Shift | null> {
    // 1. Calculate Expected Cash
    // Expected = Starting + (Total Cash Sales in this shift)
    const { data: sales, error: sError } = await supabase
      .from('transactions')
      .select('total_amount')
      .eq('shift_id', shiftId)
      .eq('payment_method', 'cash')
      .eq('payment_status', 'paid');

    if (sError) throw sError;

    const { data: shift, error: fError } = await supabase
      .from('shifts')
      .select('starting_cash')
      .eq('id', shiftId)
      .single();

    if (fError) throw fError;

    const totalSales = sales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
    const expectedCash = Number(shift.starting_cash) + totalSales;

    // 2. Update Shift
    const { data: closedShift, error: cError } = await supabase
      .from('shifts')
      .update({
        end_time: new Date().toISOString(),
        actual_cash: actualCash,
        expected_cash: expectedCash,
        status: 'closed',
        notes: notes || null
      })
      .eq('id', shiftId)
      .select()
      .single();

    if (cError) throw cError;
    return closedShift;
  },

  async getShiftHistory(limit = 20) {
    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        operator:profiles (
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getShiftDetails(shiftId: string) {
    // 1. Fetch Shift Header
    const { data: shift, error: shiftError } = await supabase
      .from('shifts')
      .select(`
        *,
        operator:profiles (
          full_name
        )
      `)
      .eq('id', shiftId)
      .single();

    if (shiftError) throw shiftError;

    // 2. Fetch all Transactions with Items for this shift
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        client:clients_market (
          org_name
        ),
        transaction_items (
          *,
          products (
            name
          )
        )
      `)
      .eq('shift_id', shiftId)
      .order('created_at', { ascending: true });

    if (txError) throw txError;

    return {
      ...shift,
      transactions: transactions || []
    };
  },

  async getTodaySummary(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch current active shift
    const { data: shift } = await supabase
      .from('shifts')
      .select(`
        *,
        operator:profiles (full_name)
      `)
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 2. Fetch all of today's shifts for this user
    const { data: allShifts } = await supabase
      .from('shifts')
      .select(`
        *,
        operator:profiles (full_name)
      `)
      .eq('user_id', userId)
      .gte('created_at', today)
      .order('created_at', { ascending: true });

    // 3. Fetch all of today's transactions for this user
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        client:clients_market (org_name),
        transaction_items (
          *,
          products (name)
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', today)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return {
      currentShift: shift || null,
      allShifts: allShifts || [],
      transactions: transactions || [],
      date: today
    };
  }
};
