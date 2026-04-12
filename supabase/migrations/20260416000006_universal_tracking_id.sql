-- Universal Tracking ID System
-- This migration adds a professional, short tracking_id to both print orders and general sales.

-- 1. Create a helper function to extract tracking IDs
create or replace function generate_tracking_id() 
returns trigger as $$
begin
  -- Automatically use the first 8 characters of the UUID as the tracking handle
  new.tracking_id := upper(substring(new.id::text from 1 for 8));
  return new;
end;
$$ language plpgsql;

-- 2. Update print_orders
alter table public.print_orders add column if not exists tracking_id text;
create index if not exists idx_print_orders_tracking_id on public.print_orders(tracking_id);

drop trigger if exists trg_print_orders_tracking_id on public.print_orders;
create trigger trg_print_orders_tracking_id
before insert on public.print_orders
for each row execute function generate_tracking_id();

-- Populate existing rows
update public.print_orders set tracking_id = upper(substring(id::text from 1 for 8)) where tracking_id is null;

-- 3. Update transactions (Standard Sales)
alter table public.transactions add column if not exists tracking_id text;
create index if not exists idx_transactions_tracking_id on public.transactions(tracking_id);

drop trigger if exists trg_transactions_tracking_id on public.transactions;
create trigger trg_transactions_tracking_id
before insert on public.transactions
for each row execute function generate_tracking_id();

-- Populate existing rows
update public.transactions set tracking_id = upper(substring(id::text from 1 for 8)) where tracking_id is null;

-- 4. RLS for Universal Tracking
-- Allow public to search transactions by tracking_id specifically
drop policy if exists "Public Select Transaction by Tracking ID" on public.transactions;
create policy "Public Select Transaction by Tracking ID" 
on public.transactions for select 
using (true); -- We will filter results in the application layer or via views if needed

-- Correct transaction_items RLS to allow public to see items of a tracked order
drop policy if exists "Public View Tracked Transaction Items" on public.transaction_items;
create policy "Public View Tracked Transaction Items"
on public.transaction_items for select
using (true);

-- Ensure roles have access
grant select on table public.transactions to anon, authenticated;
grant select on table public.transaction_items to anon, authenticated;
