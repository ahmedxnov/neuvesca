alter table public.profiles
add column if not exists role text not null default 'customer';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_valid'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
    add constraint profiles_role_valid check (role in ('customer', 'admin'));
  end if;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
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

revoke all privileges on table
  public.products,
  public.scents,
  public.ingredients,
  public.product_scents,
  public.product_ingredients,
  public.profiles,
  public.cart_items,
  public.orders,
  public.order_items
from anon, authenticated;

grant select on table
  public.products,
  public.scents,
  public.ingredients,
  public.product_scents,
  public.product_ingredients
to anon, authenticated;

grant insert, update, delete on table
  public.products,
  public.scents,
  public.ingredients,
  public.product_scents,
  public.product_ingredients
to authenticated;

grant select on table public.profiles to authenticated;
grant insert (id, email, full_name, phone) on table public.profiles to authenticated;
grant update (email, full_name, phone) on table public.profiles to authenticated;

grant select, insert, update, delete on table public.cart_items to authenticated;
grant select, insert, update on table public.orders to authenticated;
grant select, insert on table public.order_items to authenticated;

create policy "products_admin_select_all"
on public.products
for select
to authenticated
using (public.is_admin());

create policy "products_admin_insert"
on public.products
for insert
to authenticated
with check (public.is_admin());

create policy "products_admin_update"
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "products_admin_delete"
on public.products
for delete
to authenticated
using (public.is_admin());

create policy "scents_admin_select_all"
on public.scents
for select
to authenticated
using (public.is_admin());

create policy "scents_admin_insert"
on public.scents
for insert
to authenticated
with check (public.is_admin());

create policy "scents_admin_update"
on public.scents
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "scents_admin_delete"
on public.scents
for delete
to authenticated
using (public.is_admin());

create policy "ingredients_admin_select_all"
on public.ingredients
for select
to authenticated
using (public.is_admin());

create policy "ingredients_admin_insert"
on public.ingredients
for insert
to authenticated
with check (public.is_admin());

create policy "ingredients_admin_update"
on public.ingredients
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "ingredients_admin_delete"
on public.ingredients
for delete
to authenticated
using (public.is_admin());

create policy "product_scents_admin_select_all"
on public.product_scents
for select
to authenticated
using (public.is_admin());

create policy "product_scents_admin_insert"
on public.product_scents
for insert
to authenticated
with check (public.is_admin());

create policy "product_scents_admin_update"
on public.product_scents
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_scents_admin_delete"
on public.product_scents
for delete
to authenticated
using (public.is_admin());

create policy "product_ingredients_admin_select_all"
on public.product_ingredients
for select
to authenticated
using (public.is_admin());

create policy "product_ingredients_admin_insert"
on public.product_ingredients
for insert
to authenticated
with check (public.is_admin());

create policy "product_ingredients_admin_update"
on public.product_ingredients
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "product_ingredients_admin_delete"
on public.product_ingredients
for delete
to authenticated
using (public.is_admin());

create policy "orders_admin_select_all"
on public.orders
for select
to authenticated
using (public.is_admin());

create policy "orders_admin_update_all"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "order_items_admin_select_all"
on public.order_items
for select
to authenticated
using (public.is_admin());
