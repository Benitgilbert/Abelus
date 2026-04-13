-- Migration: Create Expenses Table
-- Description: Enables tracking of external business costs for accurate financial reporting.

create table if not exists expenses (
  id uuid default uuid_generate_v4() primary key,
  amount decimal(12,2) not null check (amount >= 0),
  description text not null,
  category text not null check (category in ('Stock Purchase', 'Utilities', 'Staff', 'Rent', 'Other')),
  user_id uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table expenses enable row level security;

-- Policies
create policy "Admins and Staff can view expenses" 
  on expenses for select 
  using (get_my_role() in ('admin', 'staff'));

create policy "Admins and Staff can record expenses" 
  on expenses for insert 
  with check (get_my_role() in ('admin', 'staff'));

create policy "Admins can delete expenses" 
  on expenses for delete 
  using (get_my_role() = 'admin');

-- Realtime Support
alter publication supabase_realtime add table expenses;
