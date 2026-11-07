-- Gulf Coast Greetings: owner admin panel, pre-checkout branding (logo uploads) and paid orders.
-- Run once in the Supabase dashboard after supabase/schema.sql: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS / ON CONFLICT).
-- If schema.sql is ever re-run, run this file again too (schema.sql revokes grants this file adds).
--
-- Access model (Row Level Security):
--   * Website visitors (anon) can only INSERT branding rows and upload logo files. They can never read them.
--   * Paid orders are written only by the square-webhook function (service role, bypasses RLS).
--   * Admins (rows in gcg_admins) can read orders, branding, logos, inquiries and reviews, mark orders
--     fulfilled, and approve or delete reviews. Everyone else, signed in or not, sees nothing.

-- ---------- Admins ----------
create table if not exists public.gcg_admins (
  user_id  uuid primary key references auth.users (id) on delete cascade,
  email    text
);
alter table public.gcg_admins enable row level security;
revoke all on public.gcg_admins from anon, authenticated;
grant select on public.gcg_admins to authenticated;
drop policy if exists "admins read their own row" on public.gcg_admins;
create policy "admins read their own row" on public.gcg_admins
  for select to authenticated using (user_id = auth.uid());

-- True when the signed-in user is an admin. SECURITY DEFINER so policies can call it without
-- needing read access to gcg_admins themselves.
create or replace function public.gcg_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.gcg_admins where user_id = auth.uid());
$$;
revoke all on function public.gcg_is_admin() from public;
grant execute on function public.gcg_is_admin() to anon, authenticated;

-- ---------- Branding collected in the cart before checkout ----------
create table if not exists public.gcg_branding (
  id             uuid primary key default gen_random_uuid(),
  ref            text unique not null check (ref ~ '^GCG-[A-Z0-9]{6}$'),
  created_at     timestamptz not null default now(),
  business_name  text not null check (char_length(business_name) between 1 and 200),
  card_info      text check (char_length(card_info) <= 1000),
  logo_path      text check (char_length(logo_path) <= 300),
  email_later    boolean not null default false
);
alter table public.gcg_branding enable row level security;
revoke all on public.gcg_branding from anon, authenticated;
grant insert (ref, business_name, card_info, logo_path, email_later) on public.gcg_branding to anon, authenticated;
grant select on public.gcg_branding to authenticated;
drop policy if exists "visitors can submit branding" on public.gcg_branding;
create policy "visitors can submit branding" on public.gcg_branding
  for insert to anon, authenticated with check (true);
drop policy if exists "admins read branding" on public.gcg_branding;
create policy "admins read branding" on public.gcg_branding
  for select to authenticated using (public.gcg_is_admin());

-- ---------- Paid orders (written by the square-webhook function) ----------
create table if not exists public.gcg_orders (
  id                 bigint generated always as identity primary key,
  created_at         timestamptz not null default now(),
  square_order_id    text unique not null,
  square_payment_id  text,
  ref                text,
  status             text not null default 'pending' check (status in ('pending', 'fulfilled')),
  customer_name      text,
  customer_email     text,
  customer_phone     text,
  items              jsonb,
  total_cents        integer,
  fulfilled_at       timestamptz
);
create index if not exists gcg_orders_status_idx on public.gcg_orders (status, created_at desc);
alter table public.gcg_orders enable row level security;
revoke all on public.gcg_orders from anon, authenticated;
grant select, update (status, fulfilled_at) on public.gcg_orders to authenticated;
drop policy if exists "admins read orders" on public.gcg_orders;
create policy "admins read orders" on public.gcg_orders
  for select to authenticated using (public.gcg_is_admin());
drop policy if exists "admins update orders" on public.gcg_orders;
create policy "admins update orders" on public.gcg_orders
  for update to authenticated using (public.gcg_is_admin()) with check (public.gcg_is_admin());

-- ---------- Admin access to the existing form tables (visitor policies from schema.sql stay as they are) ----------
grant select on public.gcg_inquiries to authenticated;
drop policy if exists "admins read inquiries" on public.gcg_inquiries;
create policy "admins read inquiries" on public.gcg_inquiries
  for select to authenticated using (public.gcg_is_admin());

grant update (approved), delete on public.gcg_reviews to authenticated;
drop policy if exists "admins read all reviews" on public.gcg_reviews;
create policy "admins read all reviews" on public.gcg_reviews
  for select to authenticated using (public.gcg_is_admin());
drop policy if exists "admins approve reviews" on public.gcg_reviews;
create policy "admins approve reviews" on public.gcg_reviews
  for update to authenticated using (public.gcg_is_admin()) with check (public.gcg_is_admin());
drop policy if exists "admins delete reviews" on public.gcg_reviews;
create policy "admins delete reviews" on public.gcg_reviews
  for delete to authenticated using (public.gcg_is_admin());

-- ---------- Logo files: private bucket, upload-only for visitors ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos', 'logos', false, 10485760,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "visitors upload logos" on storage.objects;
create policy "visitors upload logos" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'logos' and name ~ '^GCG-[A-Z0-9]{6}/[^/]{1,120}$');
drop policy if exists "admins read logos" on storage.objects;
create policy "admins read logos" on storage.objects
  for select to authenticated using (bucket_id = 'logos' and public.gcg_is_admin());

-- ---------- One-time owner setup (after creating the user in Authentication -> Users) ----------
-- insert into public.gcg_admins (user_id, email)
-- select id, email from auth.users where lower(email) = lower('Welcome@gulfcoastgreetingstx.com')
-- on conflict (user_id) do nothing;
