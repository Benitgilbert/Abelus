import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types';

export type FinancialSummary = {
  totalRevenue: number;
  totalExpenses: number;
  netPosition: number;
  liquidBalance: number;
  totalDebt: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  breakdown: {
    pos: number;
    print: number;
    other: number;
  };
};

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  created_at: string;
}

export type StaffPerformance = {
  staff_id: string;
  full_name: string;
  total_sales: number;
  transaction_count: number;
};

export type DebtAging = {
  client_id: string;
  org_name: string;
  balance: number;
};

export const financialService = {
  async getSummary(startDate?: string, endDate?: string): Promise<FinancialSummary> {
    const now = new Date();
    
    // Default periods if no range is provided
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString(); // Start of month
    const defaultEnd = now.toISOString();

    const start = startDate || defaultStart;
    const end = endDate || defaultEnd;

    // 1. Fetch sales for the selected period with item-level detail
    const { data: periodSales } = await supabase
      .from('transactions')
      .select(`
        total_amount, 
        source, 
        created_at, 
        payment_status,
        transaction_items (
          price_at_sale,
          quantity,
          products (name)
        )
      `)
      .neq('payment_status', 'cancelled')
      .gte('created_at', start)
      .lte('created_at', end + (end.includes('T') ? '' : 'T23:59:59'));

    // 2. Daily/Weekly comparison context (always relative to now or end of range)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekISO = startOfWeek.toISOString();

    const totalRevenue = periodSales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;
    
    // Debt balance is current status, but we could eventually filter by range if needed
    const { data: clients } = await supabase
      .from('clients_market')
      .select('debt_balance');

    const totalDebt = clients?.reduce((acc, c) => acc + Number(c.debt_balance), 0) || 0;

    const dailyRevenue = periodSales?.filter(s => new Date(s.created_at) >= new Date(startOfDay))
      .reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;

    const weeklyRevenue = periodSales?.filter(s => new Date(s.created_at) >= new Date(startOfWeekISO))
      .reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;

    const monthlyRevenue = totalRevenue; // In this context, the custom range acts as the "period"

    // 3. Granular Revenue Breakdown (Surgical Audit)
    const breakdown = { pos: 0, print: 0, other: 0 };

    periodSales?.forEach(tx => {
      const source = (tx as any).source;
      const amount = Number(tx.total_amount);
      const items = (tx as any).transaction_items || [];

      if (source === 'pos') {
        let txPrintRevenue = 0;
        items.forEach((item: any) => {
          const isPrint = item.products?.name?.toLowerCase().includes('printing');
          if (isPrint) {
            txPrintRevenue += (Number(item.price_at_sale) * Number(item.quantity));
          }
        });

        breakdown.print += txPrintRevenue;
        breakdown.pos += (amount - txPrintRevenue);
      } else if (source === 'print') {
        breakdown.print += amount;
      } else {
        breakdown.other += amount;
      }
    });

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .gte('created_at', start)
      .lte('created_at', end + (end.includes('T') ? '' : 'T23:59:59'));

    const totalExpenses = expenses?.reduce((acc, e) => acc + Number(e.amount), 0) || 0;
    
    // Liquid Balance = Actual Paid Revenue - Total Expenses
    const paidRevenue = periodSales?.filter(s => (s as any).payment_status === 'paid')
      .reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;

    return {
      totalRevenue,
      totalExpenses,
      netPosition: totalRevenue - totalExpenses,
      liquidBalance: paidRevenue - totalExpenses,
      totalDebt,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      breakdown,
    };
  },

  async getExpenses(startDate?: string, endDate?: string): Promise<Expense[]> {
    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate + 'T23:59:59');

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  },

  async recordExpense(expense: { amount: number; description: string; category: string }) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expense,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording expense:', error);
      throw error;
    }
  },

  async getStaffPerformance(startDate?: string, endDate?: string): Promise<StaffPerformance[]> {
    let query = supabase
      .from('transactions')
      .select(`
        total_amount,
        user_id,
        profiles (
          full_name
        )
      `)
      .neq('payment_status', 'cancelled');

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate + (endDate.includes('T') ? '' : 'T23:59:59'));

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching staff performance:', error);
      return [];
    }

    const perf: Record<string, StaffPerformance> = {};

    data.forEach((row) => {
      const id = row.user_id as string;
      if (!id) return;

      const profile = row.profiles as any;
      const fullName = profile?.full_name || 'Staff Member';

      if (!perf[id]) {
        perf[id] = {
          staff_id: id,
          full_name: fullName,
          total_sales: 0,
          transaction_count: 0
        };
      }
      perf[id].total_sales += Number(row.total_amount);
      perf[id].transaction_count += 1;
    });

    return Object.values(perf).sort((a, b) => b.total_sales - a.total_sales);
  },

  async getDebtAging(): Promise<DebtAging[]> {
    const { data, error } = await supabase
      .from('clients_market')
      .select('id, org_name, debt_balance')
      .gt('debt_balance', 0)
      .order('debt_balance', { ascending: false });

    if (error) return [];
    return data.map(d => ({
      client_id: d.id,
      org_name: d.org_name,
      balance: Number(d.debt_balance)
    }));
  }
};
