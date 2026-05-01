create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "products_select_active" on public.products;
drop policy if exists "products_admin_select_all" on public.products;

create policy "products_select_active_anon"
on public.products
for select
to anon
using (is_active);

create policy "products_select_active_or_admin_authenticated"
on public.products
for select
to authenticated
using (is_active or public.is_admin());

drop policy if exists "scents_select_active" on public.scents;
drop policy if exists "scents_admin_select_all" on public.scents;

create policy "scents_select_active_anon"
on public.scents
for select
to anon
using (is_active);

create policy "scents_select_active_or_admin_authenticated"
on public.scents
for select
to authenticated
using (is_active or public.is_admin());

drop policy if exists "ingredients_select_active" on public.ingredients;
drop policy if exists "ingredients_admin_select_all" on public.ingredients;

create policy "ingredients_select_active_anon"
on public.ingredients
for select
to anon
using (is_active);

create policy "ingredients_select_active_or_admin_authenticated"
on public.ingredients
for select
to authenticated
using (is_active or public.is_admin());

drop policy if exists "product_scents_select_active_product" on public.product_scents;
drop policy if exists "product_scents_admin_select_all" on public.product_scents;

create policy "product_scents_select_active_anon"
on public.product_scents
for select
to anon
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

create policy "product_scents_select_active_or_admin_authenticated"
on public.product_scents
for select
to authenticated
using (
  public.is_admin()
  or (
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
  )
);

drop policy if exists "product_ingredients_select_active_product" on public.product_ingredients;
drop policy if exists "product_ingredients_admin_select_all" on public.product_ingredients;

create policy "product_ingredients_select_active_anon"
on public.product_ingredients
for select
to anon
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

create policy "product_ingredients_select_active_or_admin_authenticated"
on public.product_ingredients
for select
to authenticated
using (
  public.is_admin()
  or (
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
  )
);

drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_admin_select_all" on public.orders;

create policy "orders_select_own_or_admin"
on public.orders
for select
to authenticated
using ((select auth.uid()) = user_id or public.is_admin());

drop policy if exists "order_items_select_own_order" on public.order_items;
drop policy if exists "order_items_admin_select_all" on public.order_items;

create policy "order_items_select_own_order_or_admin"
on public.order_items
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
  )
);
