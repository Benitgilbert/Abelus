import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types';

export type FinancialSummary = {
  totalRevenue: number;
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
  async getSummary(): Promise<FinancialSummary> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfWeekISO = startOfWeek.toISOString();
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // 1. Fetch total revenue (This is the only one that still scans all rows if no RPC is available)
    const { data: totalSales } = await supabase
      .from('transactions')
      .select('total_amount, source')
      .neq('payment_status', 'cancelled');

    // 2. Fetch only recent sales for period calculations (Daily, Weekly, Monthly)
    // We only need from the start of the current month
    const { data: recentSales } = await supabase
      .from('transactions')
      .select('total_amount, created_at')
      .neq('payment_status', 'cancelled')
      .gte('created_at', startOfMonth);

    const totalRevenue = totalSales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;
    
    const { data: clients } = await supabase
      .from('clients_market')
      .select('debt_balance');

    const totalDebt = clients?.reduce((acc, c) => acc + Number(c.debt_balance), 0) || 0;

    const dailyRevenue = recentSales?.filter(s => new Date(s.created_at) >= new Date(startOfDay))
      .reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;

    const weeklyRevenue = recentSales?.filter(s => new Date(s.created_at) >= new Date(startOfWeekISO))
      .reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;

    const monthlyRevenue = recentSales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;

    const breakdown = {
      pos: totalSales?.filter(s => (s as any).source === 'pos').reduce((acc, s) => acc + Number(s.total_amount), 0) || 0,
      print: totalSales?.filter(s => (s as any).source === 'print').reduce((acc, s) => acc + Number(s.total_amount), 0) || 0,
      other: totalSales?.filter(s => !['pos', 'print'].includes((s as any).source)).reduce((acc, s) => acc + Number(s.total_amount), 0) || 0,
    };

    return {
      totalRevenue,
      totalDebt,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      breakdown,
    };
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
    if (endDate) query = query.lte('created_at', endDate);

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
