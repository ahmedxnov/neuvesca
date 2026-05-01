create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  family text not null,
  burn_time_hours integer not null constraint products_burn_time_hours_positive check (burn_time_hours > 0),
  tone text,
  size_grams integer not null constraint products_size_grams_positive check (size_grams > 0),
  price_cents integer not null constraint products_price_cents_nonnegative check (price_cents >= 0),
  currency text not null default 'EUR' constraint products_currency_format check (currency ~ '^[A-Z]{3}$'),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scents (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  family text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_scents (
  product_id uuid not null references public.products(id) on delete cascade,
  scent_id uuid not null references public.scents(id) on delete cascade,
  note_role text not null constraint product_scents_note_role_valid check (note_role in ('top', 'heart', 'base', 'primary')),
  sort_order integer not null default 0 constraint product_scents_sort_order_nonnegative check (sort_order >= 0),
  primary key (product_id, scent_id, note_role)
);

create table public.product_ingredients (
  product_id uuid not null references public.products(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  sort_order integer not null default 0 constraint product_ingredients_sort_order_nonnegative check (sort_order >= 0),
  primary key (product_id, ingredient_id)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1 constraint cart_items_quantity_positive check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_user_product_unique unique (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending' constraint orders_status_valid check (
    status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
  ),
  subtotal_cents integer not null default 0 constraint orders_subtotal_cents_nonnegative check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 constraint orders_shipping_cents_nonnegative check (shipping_cents >= 0),
  tax_cents integer not null default 0 constraint orders_tax_cents_nonnegative check (tax_cents >= 0),
  total_cents integer not null default 0 constraint orders_total_cents_nonnegative check (total_cents >= 0),
  currency text not null default 'EUR' constraint orders_currency_format check (currency ~ '^[A-Z]{3}$'),
  customer_email text,
  customer_name text,
  shipping_name text,
  shipping_address_line1 text,
  shipping_address_line2 text,
  shipping_city text,
  shipping_region text,
  shipping_postal_code text,
  shipping_country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_slug text not null,
  product_name text not null,
  product_family text,
  quantity integer not null constraint order_items_quantity_positive check (quantity > 0),
  unit_price_cents integer not null constraint order_items_unit_price_cents_nonnegative check (unit_price_cents >= 0),
  total_price_cents integer not null constraint order_items_total_price_cents_nonnegative check (total_price_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger scents_set_updated_at
before update on public.scents
for each row execute function public.set_updated_at();

create trigger ingredients_set_updated_at
before update on public.ingredients
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger order_items_set_updated_at
before update on public.order_items
for each row execute function public.set_updated_at();

create index products_active_idx on public.products (is_active) where is_active;
create index products_family_idx on public.products (family);
create index scents_active_idx on public.scents (is_active) where is_active;
create index scents_family_idx on public.scents (family);
create index ingredients_active_idx on public.ingredients (is_active) where is_active;
create index product_scents_scent_id_idx on public.product_scents (scent_id);
create index product_scents_note_role_idx on public.product_scents (note_role);
create index product_ingredients_ingredient_id_idx on public.product_ingredients (ingredient_id);
create index cart_items_user_id_idx on public.cart_items (user_id);
create index cart_items_product_id_idx on public.cart_items (product_id);
create index orders_user_id_idx on public.orders (user_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);

alter table public.products enable row level security;
alter table public.scents enable row level security;
alter table public.ingredients enable row level security;
alter table public.product_scents enable row level security;
alter table public.product_ingredients enable row level security;
alter table public.profiles enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

grant select on public.products, public.scents, public.ingredients, public.product_scents, public.product_ingredients to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert on public.orders, public.order_items to authenticated;

create policy "products_select_active"
on public.products
for select
to anon, authenticated
using (is_active);

create policy "scents_select_active"
on public.scents
for select
to anon, authenticated
using (is_active);

create policy "ingredients_select_active"
on public.ingredients
for select
to anon, authenticated
using (is_active);

create policy "product_scents_select_active_product"
on public.product_scents
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_scents.product_id
      and products.is_active
  )
  and exists (
    select 1
    from public.scents
    where scents.id = product_scents.scent_id
      and scents.is_active
  )
);

create policy "product_ingredients_select_active_product"
on public.product_ingredients
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_ingredients.product_id
      and products.is_active
  )
  and exists (
    select 1
    from public.ingredients
    where ingredients.id = product_ingredients.ingredient_id
      and ingredients.is_active
  )
);

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "cart_items_select_own"
on public.cart_items
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "cart_items_insert_own"
on public.cart_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "cart_items_update_own"
on public.cart_items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "cart_items_delete_own"
on public.cart_items
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "orders_select_own"
on public.orders
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "orders_insert_own"
on public.orders
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "order_items_select_own_order"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
  )
);

create policy "order_items_insert_own_order"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
  )
);
