-- SHIFT & DRAWER RECONCILIATION
-- Tracks staff sessions and physical cash handover

create table if not exists shifts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  starting_cash decimal(12,2) not null default 0,
  actual_cash decimal(12,2), -- Physical count by staff at end of shift
  expected_cash decimal(12,2), -- System calculation: starting_cash + (paid_cash_sales)
  status text check (status in ('open', 'closed')) default 'open',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Security
alter table shifts enable row level security;

-- Clean and Re-create Policies for Idempotency
drop policy if exists "Staff can manage their own shifts" on shifts;
create policy "Staff can manage their own shifts" 
  on shifts for all 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins can view all shifts" on shifts;
create policy "Admins can view all shifts" 
  on shifts for select 
  using (get_my_role() = 'admin');

-- Link Transactions to Shifts for absolute auditing
alter table transactions add column if not exists shift_id uuid references shifts(id);

-- Upgrade Transaction Logic to V2 (Shift Aware)
create or replace function handle_pos_sale_v2(
  p_user_id uuid,
  p_client_id uuid,
  p_total_amount decimal,
  p_payment_method text,
  p_payment_status text,
  p_amount_paid decimal,
  p_items jsonb,
  p_shift_id uuid default null -- Added shift tracking
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_transaction_id uuid;
  v_item jsonb;
  v_debt_to_add decimal;
  v_conversion_factor integer;
  v_total_stock_deduction integer;
begin
  -- 1. Create Transaction
  insert into transactions (
    user_id, client_id, total_amount, payment_method, payment_status, amount_paid, source, shift_id
  ) values (
    p_user_id, p_client_id, p_total_amount, p_payment_method, p_payment_status, p_amount_paid, 'pos', p_shift_id
  ) returning id into v_transaction_id;

  -- 2. Process Items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_conversion_factor := 1;
    if (v_item->>'packaging_id') is not null then
      select conversion_factor into v_conversion_factor from product_packaging where id = (v_item->>'packaging_id')::uuid;
    end if;

    v_total_stock_deduction := (v_item->>'quantity')::integer * v_conversion_factor;

    insert into transaction_items (
      transaction_id, product_id, variant_id, quantity, price_at_sale, unit_name, wishes
    ) values (
      v_transaction_id,
      (select product_id from product_variants where id = (v_item->>'variant_id')::uuid),
      (v_item->>'variant_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'price_at_sale')::decimal,
      (v_item->>'unit_name'),
      (v_item->'wishes')
    );

    update product_variants set stock_quantity = stock_quantity - v_total_stock_deduction where id = (v_item->>'variant_id')::uuid;
  end loop;

  -- 3. Debt Calculation
  v_debt_to_add := p_total_amount - p_amount_paid;
  if p_client_id is not null then
    update clients_market set debt_balance = debt_balance + v_debt_to_add where id = p_client_id;
  end if;

  return v_transaction_id;
end;
$$;

-- Create index for faster audit lookups
create index if not exists idx_transactions_shift_id on transactions(shift_id);
create index if not exists idx_shifts_user_id_status on shifts(user_id, status);
