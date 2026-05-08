-- Allow admins to write under any folder of the product-images bucket,
-- not just `products/`. Lets us also store scent imagery under `scents/`.

drop policy if exists "product_images_admin_insert" on storage.objects;
drop policy if exists "product_images_admin_update" on storage.objects;
drop policy if exists "product_images_admin_delete" on storage.objects;

create policy "product_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.is_admin()
);

create policy "product_images_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
)
with check (
  bucket_id = 'product-images'
  and public.is_admin()
);

create policy "product_images_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
);
