alter table public.ingredients
add column if not exists safety_notes text;

alter table public.cart_items
add column if not exists scent_id uuid;

alter table public.orders
add column if not exists payment_method text not null default 'cash_on_delivery';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cart_items_scent_id_fkey'
      and conrelid = 'public.cart_items'::regclass
  ) then
    alter table public.cart_items
    add constraint cart_items_scent_id_fkey
    foreign key (scent_id) references public.scents(id) on delete restrict;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'cart_items_user_product_unique'
      and conrelid = 'public.cart_items'::regclass
  ) then
    alter table public.cart_items
    drop constraint cart_items_user_product_unique;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'cart_items_user_product_scent_unique'
      and conrelid = 'public.cart_items'::regclass
  ) then
    alter table public.cart_items
    add constraint cart_items_user_product_scent_unique
    unique (user_id, product_id, scent_id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_method_valid'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
    add constraint orders_payment_method_valid
    check (payment_method in ('cash_on_delivery', 'stripe'));
  end if;
end;
$$;

create index if not exists cart_items_scent_id_idx
on public.cart_items (scent_id);

update public.cart_items
set scent_id = (
  select product_scents.scent_id
  from public.product_scents
  where product_scents.product_id = cart_items.product_id
    and product_scents.note_role = 'primary'
  order by product_scents.sort_order
  limit 1
)
where scent_id is null;

do $$
begin
  if not exists (select 1 from public.cart_items where scent_id is null) then
    alter table public.cart_items
    alter column scent_id set not null;
  end if;
end;
$$;

insert into public.scents (id, slug, name, description, family, is_active)
values
  ('7a5bd442-d8c1-447d-80f3-6eaf5d9d8f9b', 'amber-resin', 'Amber Resin', 'Warm, honeyed resinous depth.', 'Warm', true),
  ('914a7b05-4ffc-4f87-9a05-7d8357e86416', 'birch-tar', 'Birch Tar', 'Resinous bark, smoke-forward.', 'Woody', true),
  ('dacb7148-b4c2-40fd-a5fd-a54418aa858a', 'black-fig', 'Black Fig', 'Plush dark fig with jammy depth.', 'Fruit', true),
  ('9fbac836-8c7d-475f-b33f-2d8d21dafff4', 'cardamom', 'Cardamom', 'Bright green pod, gently warming.', 'Woody', true),
  ('299e7677-dd7d-498b-9377-209f45a74898', 'cedar', 'Cedar', 'Pencil shavings and dry timber.', 'Woody', true),
  ('d4930610-514c-4466-84af-24e663d4d752', 'cedar-ember', 'Cedar Ember', 'Dry cedar with a smoke kiss.', 'Woody', true),
  ('c408e714-a019-4d12-a4b8-d2a6a27b1f92', 'clary-sage', 'Clary Sage', 'Herbal, slightly tea-like with a cool finish.', 'Herbal', true),
  ('59fa94b4-9c23-4390-97df-49c9bc9a3e17', 'fig-leaf', 'Fig Leaf', 'Green fig stem, just snapped.', 'Fresh', true),
  ('c10b9a30-d7fe-4472-8418-6e35069e3222', 'linen', 'Sun-warmed Linen', 'Soft cotton dried in afternoon light.', 'Herbal', true),
  ('1e230d8b-3786-487b-aa8b-3f7828ecbbb2', 'neroli', 'Neroli', 'Cool orange flower with a stone-fresh edge.', 'Citrus', true),
  ('dad9677e-c16b-4d78-aa28-c42a9a748588', 'pale-musk', 'Pale Musk', 'Soft, skin-warm, transparent.', 'Citrus', true),
  ('61c00517-f23f-4059-94d7-2055dad467e4', 'rainwater', 'Rainwater', 'Clean, mineral, slightly sweet.', 'Citrus', true),
  ('310f4cd4-385f-488f-b119-9fa1174c6680', 'saffron', 'Saffron', 'Dried thread, leather-edged spice.', 'Warm', true),
  ('cdcfc10a-0760-4def-807d-2c63f4ff455b', 'smoked-vanilla', 'Smoked Vanilla', 'Vanilla pod over low ember.', 'Warm', true),
  ('a55d3896-e0e6-47d5-96f3-68948761d549', 'tonka', 'Tonka Bean', 'Sweet hay and almond warmth.', 'Fruit', true),
  ('3b554381-cce0-4e3a-a8ad-d1733d9e500d', 'vetiver', 'Vetiver', 'Dry, rooty, smoke-touched grass.', 'Herbal', true),
  ('1ffb02a9-4f4a-41e4-80a7-dbd5f097a603', 'violet-leaf', 'Violet Leaf', 'Cool green floral with a powdery undertone.', 'Fruit', true),
  ('0f1d22a0-aa02-4918-be5f-eb0fbd65a5fa', 'white-tea', 'White Tea', 'A pale, dry brew with a clean leafy lift.', 'Fresh', true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  family = excluded.family,
  is_active = excluded.is_active;

insert into public.ingredients (id, slug, name, description, safety_notes, is_active)
values
  ('824b6a0a-282c-4775-a5d7-42db02df77ea', 'beeswax', 'Beeswax', 'Natural beeswax used in select pours for a honeyed warmth.', 'Contains natural bee-derived ingredients; avoid if allergic.', true),
  ('334860d2-becd-4d14-9459-ece918eebca5', 'coconut-oil', 'Coconut Oil', 'Refined coconut oil that helps fragrance bind cleanly to wax.', 'Food-grade source. Stable across normal burn temperatures.', true),
  ('61917389-a28d-4227-92ed-43c99bed6f7f', 'cotton-wick', 'Cotton Wick', 'Lead-free, unbleached cotton wick.', 'No metal core. Always burn on a heat-resistant surface.', true),
  ('04861715-3c1d-4315-86dc-dc1681050bc4', 'essential-oil', 'Essential Oil', 'Steam-distilled botanical essential oils used for accent notes.', 'May cause sensitivity in some individuals. Not for topical use.', true),
  ('2bee381a-4320-46f6-b343-3a882aa43ad4', 'fragrance-oil', 'Fragrance Oil', 'IFRA-compliant fragrance oils, phthalate-free.', 'Discontinue use if irritation occurs. Keep away from children and pets.', true),
  ('be4a26a0-34c6-4e33-9553-49f3f37f3478', 'glass-vessel', 'Glass Vessel', 'Reusable, recyclable glass vessel hand-finished in studio.', 'Vessel may become hot during burn. Allow to fully cool before handling.', true),
  ('13c7f67e-139b-4a9e-b00a-407afb0db86a', 'soy-coconut-wax', 'Soy & Coconut Wax', 'A blend of natural soy and coconut waxes for a slow, even burn.', 'Naturally derived. Trim wick to 5mm before each burn to avoid soot.', true),
  ('98be756b-e030-46c7-8009-15759d72dcff', 'vegan-stearic', 'Vegan Stearic Acid', 'Plant-derived stearic acid that hardens the pour and improves throw.', 'Plant-derived. No animal byproducts.', true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  safety_notes = excluded.safety_notes,
  is_active = excluded.is_active;

insert into public.products (
  id,
  slug,
  name,
  description,
  family,
  burn_time_hours,
  tone,
  size_grams,
  price_cents,
  currency,
  image_url,
  is_active
)
values
  ('b91fc901-bc5a-4741-81dd-61ef6f1bce3b', 'no-01-white-tea', 'No. 01 White Tea', 'A pale, open scent for bedrooms, reading corners, and slow mornings.', 'Fresh', 45, 'mist', 220, 4800, 'EUR', null, true),
  ('9498d3de-5f00-4148-8150-4c3708a679d2', 'no-02-amber-veil', 'No. 02 Amber Veil', 'Soft amber and resin for low lamps, late dinners, and the hour after.', 'Warm', 48, 'amber', 220, 5200, 'EUR', null, true),
  ('c2df3179-cbdf-4052-bbb9-d1a69a1b9aba', 'no-03-sage-linen', 'No. 03 Sage Linen', 'A green, sun-bleached scent for cleared desks and quiet afternoons.', 'Herbal', 45, 'sage', 220, 4800, 'EUR', null, true),
  ('2e13e58a-1700-473e-816a-b43d3815c8e1', 'no-04-neroli-stone', 'No. 04 Neroli Stone', 'Cool citrus and rain-washed musk for kitchens and open windows.', 'Citrus', 42, 'stone', 220, 4800, 'EUR', null, true),
  ('f5cf4eb1-d699-458d-bbb9-9f602ebf358b', 'no-05-velvet-fig', 'No. 05 Velvet Fig', 'Plush fig and violet for soft music, candlelight, and lingering hours.', 'Fruit', 46, 'fig', 220, 5200, 'EUR', null, true),
  ('fbfd529c-68e9-46f9-b6b4-127b4dc8e686', 'no-06-cedar-smoke', 'No. 06 Cedar Smoke', 'Smoked cedar and warm spice for studios, libraries, and cold nights.', 'Woody', 50, 'cedar', 220, 5400, 'EUR', null, true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  family = excluded.family,
  burn_time_hours = excluded.burn_time_hours,
  tone = excluded.tone,
  size_grams = excluded.size_grams,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  image_url = excluded.image_url,
  is_active = excluded.is_active;

with links(product_slug, scent_slug, note_role, sort_order) as (
  values
    ('no-01-white-tea', 'cedar', 'base', 2),
    ('no-01-white-tea', 'fig-leaf', 'heart', 1),
    ('no-01-white-tea', 'white-tea', 'primary', 0),
    ('no-01-white-tea', 'white-tea', 'top', 0),
    ('no-02-amber-veil', 'smoked-vanilla', 'base', 2),
    ('no-02-amber-veil', 'amber-resin', 'heart', 1),
    ('no-02-amber-veil', 'amber-resin', 'primary', 0),
    ('no-02-amber-veil', 'saffron', 'top', 0),
    ('no-03-sage-linen', 'vetiver', 'base', 2),
    ('no-03-sage-linen', 'linen', 'heart', 1),
    ('no-03-sage-linen', 'clary-sage', 'primary', 0),
    ('no-03-sage-linen', 'clary-sage', 'top', 0),
    ('no-04-neroli-stone', 'pale-musk', 'base', 2),
    ('no-04-neroli-stone', 'rainwater', 'heart', 1),
    ('no-04-neroli-stone', 'neroli', 'primary', 0),
    ('no-04-neroli-stone', 'neroli', 'top', 0),
    ('no-05-velvet-fig', 'tonka', 'base', 2),
    ('no-05-velvet-fig', 'violet-leaf', 'heart', 1),
    ('no-05-velvet-fig', 'black-fig', 'primary', 0),
    ('no-05-velvet-fig', 'black-fig', 'top', 0),
    ('no-06-cedar-smoke', 'birch-tar', 'base', 2),
    ('no-06-cedar-smoke', 'cedar-ember', 'heart', 1),
    ('no-06-cedar-smoke', 'cedar-ember', 'primary', 0),
    ('no-06-cedar-smoke', 'cardamom', 'top', 0)
)
insert into public.product_scents (product_id, scent_id, note_role, sort_order)
select products.id, scents.id, links.note_role, links.sort_order
from links
join public.products on products.slug = links.product_slug
join public.scents on scents.slug = links.scent_slug
on conflict (product_id, scent_id, note_role) do update
set sort_order = excluded.sort_order;

with links(product_slug, ingredient_slug, sort_order) as (
  values
    ('no-01-white-tea', 'soy-coconut-wax', 0),
    ('no-01-white-tea', 'cotton-wick', 1),
    ('no-01-white-tea', 'fragrance-oil', 2),
    ('no-01-white-tea', 'glass-vessel', 3),
    ('no-02-amber-veil', 'soy-coconut-wax', 0),
    ('no-02-amber-veil', 'cotton-wick', 1),
    ('no-02-amber-veil', 'fragrance-oil', 2),
    ('no-02-amber-veil', 'beeswax', 3),
    ('no-02-amber-veil', 'glass-vessel', 4),
    ('no-03-sage-linen', 'soy-coconut-wax', 0),
    ('no-03-sage-linen', 'cotton-wick', 1),
    ('no-03-sage-linen', 'essential-oil', 2),
    ('no-03-sage-linen', 'glass-vessel', 3),
    ('no-04-neroli-stone', 'soy-coconut-wax', 0),
    ('no-04-neroli-stone', 'cotton-wick', 1),
    ('no-04-neroli-stone', 'essential-oil', 2),
    ('no-04-neroli-stone', 'coconut-oil', 3),
    ('no-04-neroli-stone', 'glass-vessel', 4),
    ('no-05-velvet-fig', 'soy-coconut-wax', 0),
    ('no-05-velvet-fig', 'cotton-wick', 1),
    ('no-05-velvet-fig', 'fragrance-oil', 2),
    ('no-05-velvet-fig', 'vegan-stearic', 3),
    ('no-05-velvet-fig', 'glass-vessel', 4),
    ('no-06-cedar-smoke', 'soy-coconut-wax', 0),
    ('no-06-cedar-smoke', 'cotton-wick', 1),
    ('no-06-cedar-smoke', 'fragrance-oil', 2),
    ('no-06-cedar-smoke', 'beeswax', 3),
    ('no-06-cedar-smoke', 'glass-vessel', 4)
)
insert into public.product_ingredients (product_id, ingredient_id, sort_order)
select products.id, ingredients.id, links.sort_order
from links
join public.products on products.slug = links.product_slug
join public.ingredients on ingredients.slug = links.ingredient_slug
on conflict (product_id, ingredient_id) do update
set sort_order = excluded.sort_order;
