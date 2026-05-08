-- Force-rebuild is_admin() and every admin-write policy.
-- Cures cases where the previous SECURITY INVOKER definition is still cached
-- by PostgREST, or where policies got out of sync.

-- 1. Drop the function (CASCADE drops every policy that references it)
drop function if exists public.is_admin() cascade;

-- 2. Recreate as plpgsql + SECURITY DEFINER — bypasses inner RLS reliably
create function public.is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select role into v_role from public.profiles where id = auth.uid();
  return v_role = 'admin';
end;
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 3. Re-create the admin select / write policies that the CASCADE dropped

-- products
drop policy if exists "products_select_active_or_admin_authenticated" on public.products;
create policy "products_select_active_or_admin_authenticated"
  on public.products for select to authenticated
  using (is_active or public.is_admin());

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
  on public.products for insert to authenticated
  with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
  on public.products for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
  on public.products for delete to authenticated
  using (public.is_admin());

-- scents
drop policy if exists "scents_select_active_or_admin_authenticated" on public.scents;
create policy "scents_select_active_or_admin_authenticated"
  on public.scents for select to authenticated
  using (is_active or public.is_admin());

drop policy if exists "scents_admin_insert" on public.scents;
create policy "scents_admin_insert"
  on public.scents for insert to authenticated
  with check (public.is_admin());

drop policy if exists "scents_admin_update" on public.scents;
create policy "scents_admin_update"
  on public.scents for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "scents_admin_delete" on public.scents;
create policy "scents_admin_delete"
  on public.scents for delete to authenticated
  using (public.is_admin());

-- ingredients
drop policy if exists "ingredients_select_active_or_admin_authenticated" on public.ingredients;
create policy "ingredients_select_active_or_admin_authenticated"
  on public.ingredients for select to authenticated
  using (is_active or public.is_admin());

drop policy if exists "ingredients_admin_insert" on public.ingredients;
create policy "ingredients_admin_insert"
  on public.ingredients for insert to authenticated
  with check (public.is_admin());

drop policy if exists "ingredients_admin_update" on public.ingredients;
create policy "ingredients_admin_update"
  on public.ingredients for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ingredients_admin_delete" on public.ingredients;
create policy "ingredients_admin_delete"
  on public.ingredients for delete to authenticated
  using (public.is_admin());

-- product_scents
drop policy if exists "product_scents_select_active_or_admin_authenticated" on public.product_scents;
create policy "product_scents_select_active_or_admin_authenticated"
  on public.product_scents for select to authenticated
  using (
    public.is_admin()
    or (
      exists (select 1 from public.products where products.id = product_scents.product_id and products.is_active)
      and exists (select 1 from public.scents where scents.id = product_scents.scent_id and scents.is_active)
    )
  );

drop policy if exists "product_scents_admin_insert" on public.product_scents;
create policy "product_scents_admin_insert"
  on public.product_scents for insert to authenticated
  with check (public.is_admin());

drop policy if exists "product_scents_admin_update" on public.product_scents;
create policy "product_scents_admin_update"
  on public.product_scents for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_scents_admin_delete" on public.product_scents;
create policy "product_scents_admin_delete"
  on public.product_scents for delete to authenticated
  using (public.is_admin());

-- product_ingredients
drop policy if exists "product_ingredients_select_active_or_admin_authenticated" on public.product_ingredients;
create policy "product_ingredients_select_active_or_admin_authenticated"
  on public.product_ingredients for select to authenticated
  using (
    public.is_admin()
    or (
      exists (select 1 from public.products where products.id = product_ingredients.product_id and products.is_active)
      and exists (select 1 from public.ingredients where ingredients.id = product_ingredients.ingredient_id and ingredients.is_active)
    )
  );

drop policy if exists "product_ingredients_admin_insert" on public.product_ingredients;
create policy "product_ingredients_admin_insert"
  on public.product_ingredients for insert to authenticated
  with check (public.is_admin());

drop policy if exists "product_ingredients_admin_update" on public.product_ingredients;
create policy "product_ingredients_admin_update"
  on public.product_ingredients for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_ingredients_admin_delete" on public.product_ingredients;
create policy "product_ingredients_admin_delete"
  on public.product_ingredients for delete to authenticated
  using (public.is_admin());

-- orders
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
  on public.orders for select to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

drop policy if exists "orders_admin_update_all" on public.orders;
create policy "orders_admin_update_all"
  on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- order_items
drop policy if exists "order_items_select_own_order_or_admin" on public.order_items;
create policy "order_items_select_own_order_or_admin"
  on public.order_items for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = (select auth.uid())
    )
  );

-- promo_codes (if the table exists yet)
do $$ begin
  if to_regclass('public.promo_codes') is not null then
    execute 'drop policy if exists "promo_codes select active" on public.promo_codes';
    execute 'create policy "promo_codes select active" on public.promo_codes for select to authenticated using (is_active = true or public.is_admin())';
    execute 'drop policy if exists "promo_codes admin write" on public.promo_codes';
    execute 'create policy "promo_codes admin write" on public.promo_codes for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;
end $$;

-- 4. Force PostgREST to refresh its cached view of policies and functions
notify pgrst, 'reload schema';
