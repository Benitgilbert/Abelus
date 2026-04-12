-- 1. Payment Requests (Billing Table)
create table if not exists payment_requests (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients_market(id) on delete cascade not null,
  total_amount decimal(12,2) not null,
  status text check (status in ('draft', 'sent', 'paid', 'cancelled')) default 'draft',
  summary_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Update Transactions to link to Billing
alter table transactions add column if not exists payment_request_id uuid references payment_requests(id);

-- 3. Atomic Reconciliation RPC
create or replace function reconcile_contract_prices(
  p_client_id uuid,
  p_product_id uuid,
  p_new_price decimal
)
returns void
language plpgsql
security definer
as $$
declare
  v_total_difference decimal := 0;
begin
  -- 1. Calculate the total difference from UNLOCKED transaction items
  select coalesce(sum((p_new_price - items.price_at_sale) * items.quantity), 0)
  into v_total_difference
  from transaction_items items
  join transactions t on items.transaction_id = t.id
  where t.client_id = p_client_id
    and items.product_id = p_product_id
    and t.payment_request_id is null; -- ONLY UNLOCKED ITEMS

  -- 2. Update the transaction_items prices
  update transaction_items items
  set price_at_sale = p_new_price
  from transactions t
  where items.transaction_id = t.id
    and t.client_id = p_client_id
    and items.product_id = p_product_id
    and t.payment_request_id is null;

  -- 3. Update the transaction totals
  update transactions t
  set total_amount = (
    select coalesce(sum(price_at_sale * quantity), 0)
    from transaction_items
    where transaction_id = t.id
  )
  where t.client_id = p_client_id
    and t.payment_request_id is null
    and id in (
      select transaction_id 
      from transaction_items 
      where product_id = p_product_id
    );

  -- 4. Update the client's debt balance based on the difference
  update clients_market
  set debt_balance = debt_balance + v_total_difference
  where id = p_client_id;
end;
$$;
