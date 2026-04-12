-- ABELUS MASTER INITIALIZATION SCHEMA
-- Consolidated from 15 sequential migrations into a single baseline.
-- Target: Supabase / PostgreSQL

-- 0. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 1. HELPER FUNCTIONS
-- Securely get current user's role without recursion
create or replace function get_my_role() 
returns text 
language sql 
security definer 
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

-- 2. CORE TABLES
-- Profiles Table (Staff, Admins, Clients)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text check (role in ('admin', 'staff', 'client')) default 'client',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories Table
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  icon_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products (Parent Shell)
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category_id uuid references categories(id),
  image_url text,
  has_variants boolean default false,
  is_service boolean default false,
  -- Hierarchical fields (nullable to support variables)
  buying_price decimal(12,2),
  retail_price decimal(12,2),
  sku text unique,
  stock_quantity integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product Variations (Stocked Items)
create table if not exists product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade not null,
  sku text unique,
  attributes jsonb default '{}'::jsonb, -- e.g. {"pages": 96, "color": "blue"}
  buying_price decimal(12,2) not null,
  selling_price decimal(12,2) not null,
  retail_price decimal(12,2) default 0,
  stock_quantity integer default 0,
  is_default boolean default true,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product Packaging Units (Conversions)
create table if not exists product_packaging (
  id uuid default uuid_generate_v4() primary key,
  variant_id uuid references product_variants(id) on delete cascade not null,
  unit_name text not null, -- e.g. 'Box', 'Carton'
  conversion_factor integer not null check (conversion_factor > 0),
  selling_price decimal(12,2) not null, -- Bundle-specific pricing
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. MARKET & SALES
-- Market Clients (B2B)
create table if not exists clients_market (
  id uuid default uuid_generate_v4() primary key,
  org_name text not null,
  contact_person text,
  phone text,
  location text,
  debt_balance decimal(12,2) default 0,
  credit_limit decimal(12,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contract Prices
create table if not exists contract_prices (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients_market(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  negotiated_price decimal(12,2) not null,
  unique(client_id, product_id)
);

-- Transactions (Ledger)
create table if not exists transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  client_id uuid references clients_market(id),
  total_amount decimal(12,2) not null,
  payment_status text check (payment_status in ('paid', 'pending', 'partial')) default 'paid',
  payment_method text check (payment_method in ('cash', 'momo', 'credit')),
  amount_paid decimal(12,2) default 0,
  evidence_url text,
  source text default 'pos' check (source in ('pos', 'online')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transaction Items
create table if not exists transaction_items (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid references transactions(id) on delete cascade,
  product_id uuid references products(id),
  variant_id uuid references product_variants(id),
  unit_name text,
  quantity integer not null,
  price_at_sale decimal(12,2) not null,
  wishes jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. SERVICES & TOOLS
-- Print Orders
create table if not exists print_orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text,
  customer_id uuid references profiles(id),
  customer_phone text,
  file_url text not null,
  original_filename text,
  page_count integer,
  total_price decimal(12,2),
  status text check (status in ('pending', 'processing', 'completed', 'cancelled')) default 'pending',
  payment_status text default 'pending',
  access_mode text check (access_mode in ('read_only', 'read_write')) default 'read_only',
  settings_json jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Warranties
create table if not exists warranties (
  id uuid default uuid_generate_v4() primary key,
  transaction_item_id uuid references transaction_items(id),
  serial_number text not null,
  expiry_date date not null,
  status text check (status in ('active', 'expired', 'claimed')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Audit Logs
create table if not exists audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  action text not null,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CMS & CONFIG
-- System Settings
create table if not exists system_settings (
  key text primary key,
  value text not null,
  category text,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Testimonials
create table if not exists testimonials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text,
  content text not null,
  rating integer default 5,
  avatar_url text,
  is_featured boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Specialties / Front-end Hero Grid
create table if not exists specialties (
  id uuid default uuid_generate_v4() primary key,
  title text not null unique,
  description text,
  icon_name text,
  color_code text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. SECURITY (RLS)
alter table profiles enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table product_variants enable row level security;
alter table product_packaging enable row level security;
alter table clients_market enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;
alter table contract_prices enable row level security;
alter table print_orders enable row level security;
alter table warranties enable row level security;
alter table audit_logs enable row level security;
alter table system_settings enable row level security;
alter table testimonials enable row level security;
alter table specialties enable row level security;

-- PROFILES
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Admins and Staff can view all profiles" on profiles for select using (get_my_role() in ('admin', 'staff'));
create policy "Users can update their own profile name" on profiles for update using (auth.uid() = id);
create policy "Admins can update user roles" on profiles for update using (get_my_role() = 'admin');

-- PRODUCTS & CATEGORIES
create policy "Public Select Products" on products for select using (true);
create policy "Admins and Staff can manage products" on products for all using (get_my_role() in ('admin', 'staff')) with check (get_my_role() in ('admin', 'staff'));
create policy "Public Select Categories" on categories for select using (true);
create policy "Admins and Staff can manage categories" on categories for all using (get_my_role() in ('admin', 'staff')) with check (get_my_role() in ('admin', 'staff'));

-- VARIANTS & PACKAGING
create policy "Public Select Variants" on product_variants for select using (true);
create policy "Admins and Staff can manage variants" on product_variants for all using (get_my_role() in ('admin', 'staff')) with check (get_my_role() in ('admin', 'staff'));
create policy "Public Select Packaging" on product_packaging for select using (true);
create policy "Admins and Staff can manage units" on product_packaging for all using (get_my_role() in ('admin', 'staff')) with check (get_my_role() in ('admin', 'staff'));

-- MARKET & SALES
create policy "Admins and Staff can manage market clients" on clients_market for all using (get_my_role() in ('admin', 'staff')) with check (get_my_role() in ('admin', 'staff'));
create policy "Admins and Staff can manage all transactions" on transactions for all using (get_my_role() in ('admin', 'staff')) with check (get_my_role() in ('admin', 'staff'));
create policy "Admins and Staff can manage transaction items" on transaction_items for all using (get_my_role() in ('admin', 'staff')) with check (get_my_role() in ('admin', 'staff'));
create policy "Admins and Staff can see negotiated prices" on contract_prices for select using (get_my_role() in ('admin', 'staff'));
create policy "Admins can manage contract prices" on contract_prices for all using (get_my_role() = 'admin') with check (get_my_role() = 'admin');

-- PRINT ORDERS
create policy "Public Insert Print Order" on print_orders for insert with check (true);
create policy "Public Select Print Order" on print_orders for select using (true); -- Allow tracking for guests
create policy "Admins and Staff can update print orders" on print_orders for update using (get_my_role() in ('admin', 'staff'));

-- SYSTEM CONFIG
create policy "Public Select Settings" on system_settings for select using (true);
create policy "Admins can modify settings" on system_settings for all using (get_my_role() = 'admin');
create policy "Public Select Testimonials" on testimonials for select using (true);
create policy "Admins can modify testimonials" on testimonials for all using (get_my_role() = 'admin');
create policy "Public Select Specialties" on specialties for select using (true);
create policy "Admins can modify specialties" on specialties for all using (get_my_role() = 'admin');

-- 7. ATOMIC FUNCTIONS
-- Atomic POS Transaction Logic v2
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

-- 8. STORAGE INFRASTRUCTURE
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true), ('print-files', 'print-files', true)
on conflict (id) do nothing;

create policy "Public Access to site-assets" on storage.objects for select using ( bucket_id = 'site-assets' );
create policy "Admin/Staff can upload assets" on storage.objects for insert with check ( bucket_id = 'site-assets' AND (select role from profiles where id = auth.uid()) in ('admin', 'staff') );
create policy "Public Access to print-files" on storage.objects for select using ( bucket_id = 'print-files' );
create policy "Anyone can upload print-files" on storage.objects for insert with check ( bucket_id = 'print-files' );

-- 9. SEED DATA
insert into categories (name) values ('Papeterie'), ('Electronics'), ('Gadgets'), ('Services'), ('Office') on conflict (name) do nothing;

insert into system_settings (key, value, category, description) values
('contact_email', 'pastorbonus@gmail.com', 'contact', 'Primary business email'),
('contact_phone', '0788819878', 'contact', 'Primary business phone number'),
('contact_address', 'near bank of kigali gicumbi branch', 'contact', 'Physical address'),
('contact_maps_url', 'https://maps.app.goo.gl/vY6bAvu87nDe6cmd8', 'contact', 'Google Maps link'),
('hero_title', 'Precision Printing. Premium Gear.', 'hero', 'Main headline'),
('hero_subtitle', 'The only digital hub where premium printing meets high-end office technology.', 'hero', 'Hero subtext'),
('hero_image_url', '/hero_stationery_premium.png', 'hero', 'Main hero background image'),
('promo_banner_text', 'Bulk Business Deals: Get up to 15% off on orders over 5,000 pages.', 'promo', 'Top bar promotional text')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- 10. REALTIME
alter publication supabase_realtime add table print_orders;
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table product_variants;
