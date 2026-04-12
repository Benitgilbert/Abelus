-- Mixed-Mode and Negotiated Pricing Upgrade
-- This migration adds support for manual page counts and flexible pricing.

-- 1. Add Support Columns for Print Orders
alter table public.print_orders 
add column if not exists bw_pages integer,
add column if not exists color_pages integer,
add column if not exists paper_size text default 'A4',
add column if not exists negotiated_price decimal(12,2);

-- 2. Update existing rows to assume they were all B&W or all Color based on settings
update public.print_orders
set 
  bw_pages = case when (settings_json->>'printType' = 'black') then page_count else 0 end,
  color_pages = case when (settings_json->>'printType' = 'color') then page_count else 0 end;

-- 3. Update RLS to ensure Admin can manage these new fields
drop policy if exists "Admins and Staff can manage print orders" on public.print_orders;
create policy "Admins and Staff can manage print orders" 
on public.print_orders for all 
using (get_my_role() in ('admin', 'staff'))
with check (get_my_role() in ('admin', 'staff'));
