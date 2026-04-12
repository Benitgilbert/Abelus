-- Security Patch for Print Portal Access
-- This migration ensures that anonymous users can submit print orders and upload files.

-- 1. Table Permissions (print_orders)
alter table public.print_orders enable row level security;

-- Drop existing policies if they exist to start fresh
drop policy if exists "Public Insert Print Order" on public.print_orders;
drop policy if exists "Public Select Print Order" on public.print_orders;
drop policy if exists "Admins and Staff can update print orders" on public.print_orders;

-- Create broad policies that allow the .select() following an .insert()
create policy "Public Insert Print Order" 
on public.print_orders for insert 
with check (true);

create policy "Public Select Print Order" 
on public.print_orders for select 
using (true);

create policy "Admins and Staff can manage print orders" 
on public.print_orders for all 
using (auth.role() in ('authenticated'))
with check (auth.role() in ('authenticated'));

-- Ensure the anon and authenticated roles have permission to the table
grant insert, select on table public.print_orders to anon, authenticated;

-- 2. Storage Permissions (print-files bucket)
-- We check if bucket exists, if not we create it
insert into storage.buckets (id, name, public)
values ('print-files', 'print-files', true)
on conflict (id) do update set public = true;

-- Drop existing storage policies
drop policy if exists "Public Upload Print Files" on storage.objects;
drop policy if exists "Public View Print Files" on storage.objects;

-- Create Storage Policies
create policy "Public Upload Print Files"
on storage.objects for insert
with check (bucket_id = 'print-files');

create policy "Public View Print Files"
on storage.objects for select
using (bucket_id = 'print-files');
