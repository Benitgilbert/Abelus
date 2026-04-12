-- 1. Update contract_prices table to be granular
alter table contract_prices drop constraint if exists contract_prices_client_id_product_id_key;
alter table contract_prices add column if not exists variant_id uuid references product_variants(id) on delete cascade;
alter table contract_prices add column if not exists unit_id uuid references product_packaging(id) on delete cascade;

-- New unique constraint: Client + Product + Variant + Unit
-- unit_id can be null (meaning the base unit of the variant)
alter table contract_prices add constraint contract_prices_granularity_unique 
unique (client_id, product_id, variant_id, unit_id);

-- 2. Update the reconciliation RPC to be granular
create or replace function reconcile_contract_prices(
  p_client_id uuid,
  p_product_id uuid,
  p_variant_id uuid,
  p_unit_id uuid,
  p_new_price decimal
)
returns void
language plpgsql
security definer
as $$
declare
  v_total_difference decimal := 0;
  v_unit_name text;
begin
  -- If unit_id is provided, get the unit name for filtering transaction_items
  if p_unit_id is not null then
    select unit_name into v_unit_name from product_packaging where id = p_unit_id;
  end if;

  -- 1. Calculate the total difference from UNLOCKED transaction items matching THIS specific variation/unit
  select coalesce(sum((p_new_price - items.price_at_sale) * items.quantity), 0)
  into v_total_difference
  from transaction_items items
  join transactions t on items.transaction_id = t.id
  where t.client_id = p_client_id
    and items.product_id = p_product_id
    and (p_variant_id is null or items.variant_id = p_variant_id)
    and (
      (p_unit_id is null and items.unit_name is null) OR 
      (v_unit_name is not null and items.unit_name = v_unit_name)
    )
    and t.payment_request_id is null;

  -- 2. Update the transaction_items prices
  update transaction_items items
  set price_at_sale = p_new_price
  from transactions t
  where items.transaction_id = t.id
    and t.client_id = p_client_id
    and items.product_id = p_product_id
    and (p_variant_id is null or items.variant_id = p_variant_id)
    and (
      (p_unit_id is null and items.unit_name is null) OR 
      (v_unit_name is not null and items.unit_name = v_unit_name)
    )
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

  -- 4. Update the client's debt balance
  update clients_market
  set debt_balance = debt_balance + v_total_difference
  where id = p_client_id;
end;
$$;
