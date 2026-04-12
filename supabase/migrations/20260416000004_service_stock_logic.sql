-- 20260416000004_service_stock_logic.sql
-- Update POS atomic function to skip stock deduction for service products

create or replace function handle_pos_sale_v2(
  p_user_id uuid,
  p_client_id uuid,
  p_total_amount decimal,
  p_payment_method text,
  p_payment_status text,
  p_amount_paid decimal,
  p_items jsonb
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
  v_is_service boolean;
begin
  -- 1. Create Transaction
  insert into transactions (
    user_id, client_id, total_amount, payment_method, payment_status, amount_paid, source
  ) values (
    p_user_id, p_client_id, p_total_amount, p_payment_method, p_payment_status, p_amount_paid, 'pos'
  ) returning id into v_transaction_id;

  -- 2. Process Items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    -- Check if product is a service
    select is_service into v_is_service 
    from products 
    where id = (select product_id from product_variants where id = (v_item->>'variant_id')::uuid);

    -- Calculate deduction factors
    v_conversion_factor := 1;
    if (v_item->>'packaging_id') is not null then
      select conversion_factor into v_conversion_factor from product_packaging where id = (v_item->>'packaging_id')::uuid;
    end if;

    v_total_stock_deduction := (v_item->>'quantity')::integer * v_conversion_factor;

    -- Record item
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

    -- 3. Deduction Logic: Only update stock if NOT a service
    if v_is_service is not true then
      update product_variants 
      set stock_quantity = stock_quantity - v_total_stock_deduction 
      where id = (v_item->>'variant_id')::uuid;
    end if;
  end loop;

  -- 4. Debt Calculation
  v_debt_to_add := p_total_amount - p_amount_paid;
  if p_client_id is not null then
    update clients_market set debt_balance = debt_balance + v_debt_to_add where id = p_client_id;
  end if;

  return v_transaction_id;
end;
$$;
