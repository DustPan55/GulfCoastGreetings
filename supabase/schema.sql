-- Gulf Coast Greetings: database setup for the dedicated Supabase project.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS).
--
-- Access model (Row Level Security):
--   * Website visitors (anon) can only INSERT leads and reviews. They can never read leads.
--   * Visitors can read reviews only after the owner sets approved = true.
--   * The owner reads/approves everything in the dashboard Table Editor (bypasses RLS).

-- ---------- Consultation / contact leads ----------
create table if not exists public.gcg_inquiries (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  name         text not null check (char_length(name) between 1 and 200),
  company      text check (char_length(company) <= 200),
  email        text not null check (char_length(email) between 3 and 320),
  phone        text check (char_length(phone) <= 50),
  inquiry_type text not null default 'general' check (char_length(inquiry_type) <= 50),
  units        text check (char_length(units) <= 200),
  message      text check (char_length(message) <= 5000),
  source       text default 'website' check (char_length(source) <= 50)
);
alter table public.gcg_inquiries enable row level security;
revoke all on public.gcg_inquiries from anon, authenticated;
grant insert on public.gcg_inquiries to anon, authenticated;
drop policy if exists "visitors can submit inquiries" on public.gcg_inquiries;
create policy "visitors can submit inquiries" on public.gcg_inquiries
  for insert to anon, authenticated with check (true);

-- ---------- Customer reviews (owner-approved before they show) ----------
create table if not exists public.gcg_reviews (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  rating      smallint not null check (rating between 1 and 5),
  name        text not null check (char_length(name) between 1 and 80),
  org         text check (char_length(org) <= 120),
  body        text not null check (char_length(body) between 1 and 2000),
  approved    boolean not null default false
);
create index if not exists gcg_reviews_approved_idx on public.gcg_reviews (approved, created_at desc);
alter table public.gcg_reviews enable row level security;
revoke all on public.gcg_reviews from anon, authenticated;
grant insert (rating, name, org, body) on public.gcg_reviews to anon, authenticated;
grant select on public.gcg_reviews to anon, authenticated;
drop policy if exists "visitors can submit reviews" on public.gcg_reviews;
create policy "visitors can submit reviews" on public.gcg_reviews
  for insert to anon, authenticated with check (approved = false);
drop policy if exists "anyone can read approved reviews" on public.gcg_reviews;
create policy "anyone can read approved reviews" on public.gcg_reviews
  for select to anon, authenticated using (approved = true);
