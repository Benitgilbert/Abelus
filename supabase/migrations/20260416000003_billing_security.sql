-- 1. Enable RLS
alter table payment_requests enable row level security;

-- 2. Policies
create policy "Admins and Staff can manage payment requests" 
on payment_requests for all 
using (get_my_role() in ('admin', 'staff'))
with check (get_my_role() in ('admin', 'staff'));

create policy "Admins and Staff can view payment requests" 
on payment_requests for select 
using (get_my_role() in ('admin', 'staff'));

-- 3. Additional Security for Client updates
-- We need to make sure profiles can view the B2B clients if they are staff
-- This is already covered by existing policies in initial_schema.sql if any, 
-- but we ensure the new table is accessible.
