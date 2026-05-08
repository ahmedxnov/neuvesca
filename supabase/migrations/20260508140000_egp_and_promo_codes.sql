-- Switch the storefront to Egyptian Pounds (EGP) and add promo-code support.

-- 1. Switch defaults + existing rows to EGP -------------------------------------

alter table public.products
  alter column currency set default 'EGP';

alter table public.orders
  alter column currency set default 'EGP';

update public.products  set currency = 'EGP' where currency = 'EUR';
update public.orders    set currency = 'EGP' where currency = 'EUR';

-- 2. Promo codes ---------------------------------------------------------------

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent integer not null check (discount_percent between 1 and 100),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  max_uses integer,
  used_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists promo_codes_code_idx on public.promo_codes (lower(code));

-- Track which promo (if any) was used on an order, plus the discount applied
alter table public.orders
  add column if not exists promo_code_id uuid references public.promo_codes(id) on delete set null;

alter table public.orders
  add column if not exists discount_cents integer not null default 0;

-- 3. RLS for promo_codes -------------------------------------------------------

alter table public.promo_codes enable row level security;

revoke all privileges on table public.promo_codes from anon, authenticated;

-- Anyone authenticated can read active codes (so cart can validate at checkout)
grant select on table public.promo_codes to authenticated;

-- Admins manage everything
grant insert, update, delete on table public.promo_codes to authenticated;

drop policy if exists "promo_codes select active" on public.promo_codes;
create policy "promo_codes select active"
  on public.promo_codes
  for select
  to authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "promo_codes admin write" on public.promo_codes;
create policy "promo_codes admin write"
  on public.promo_codes
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. Helper to safely increment used_count -------------------------------------

create or replace function public.increment_promo_use(promo_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.promo_codes
  set used_count = used_count + 1
  where id = promo_id;
$$;

revoke all on function public.increment_promo_use(uuid) from public, anon;
grant execute on function public.increment_promo_use(uuid) to authenticated;
