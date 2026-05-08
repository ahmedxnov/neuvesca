-- Track on-hand inventory per product.

alter table public.products
  add column if not exists stock_units integer not null default 0;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_stock_units_nonneg'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_stock_units_nonneg check (stock_units >= 0);
  end if;
end $$;

-- Seed existing rows so they aren't all reported as out-of-stock right away.
-- Future rows insert at 0 by default; admin sets the real number on creation.
update public.products
  set stock_units = 100
  where stock_units = 0
    and created_at < now() - interval '1 minute';
