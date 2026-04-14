-- Create the newsletter_subscriptions table
create table if not exists public.newsletter_subscriptions (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on newsletter_subscriptions
alter table public.newsletter_subscriptions enable row level security;

-- Allow anyone to subscribe (Insert)
create policy "Allow public to subscribe"
  on public.newsletter_subscriptions for insert
  with check (true);

-- Allow internal roles to manage subscriptions (View/Delete)
create policy "Allow internal roles to manage subscriptions"
  on public.newsletter_subscriptions for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
    )
  );

-- Create the newsletter_campaigns table
create table if not exists public.newsletter_campaigns (
  id uuid default gen_random_uuid() primary key,
  subject text not null,
  content text not null,
  status text default 'draft' check (status in ('draft', 'sent')),
  sent_to_count integer default 0,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id)
);

-- Enable RLS on newsletter_campaigns
alter table public.newsletter_campaigns enable row level security;

-- Allow internal roles to manage campaigns
create policy "Allow internal roles to manage campaigns"
  on public.newsletter_campaigns for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'staff')
    )
  );
