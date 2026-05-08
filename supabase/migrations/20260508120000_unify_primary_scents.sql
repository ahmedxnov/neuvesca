-- Unify the buyable scent set: every product is now offered in the same
-- four primary scents (pomegranate, coconut, vanilla, honey).
-- Composition (top/heart/base notes) is left untouched.

insert into public.scents (id, slug, name, description, family, is_active)
values
  ('a1f8e2c4-1111-4001-b001-000000000001', 'pomegranate', 'Pomegranate', 'Bright, jammy ruby fruit with a tart edge.', 'Fruit', true),
  ('a1f8e2c4-1111-4001-b001-000000000002', 'coconut',     'Coconut',     'Soft, sun-warmed coconut flesh.',           'Warm',  true),
  ('a1f8e2c4-1111-4001-b001-000000000003', 'vanilla',     'Vanilla',     'Cured vanilla pod with a creamy depth.',    'Warm',  true),
  ('a1f8e2c4-1111-4001-b001-000000000004', 'honey',       'Honey',       'Slow, golden honey warmth.',                'Warm',  true)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  family = excluded.family,
  is_active = excluded.is_active;

-- Replace the existing primary scent set on every product.
delete from public.product_scents
where note_role = 'primary';

insert into public.product_scents (product_id, scent_id, note_role, sort_order)
select
  p.id,
  s.id,
  'primary',
  case s.slug
    when 'pomegranate' then 0
    when 'coconut'     then 1
    when 'vanilla'     then 2
    when 'honey'       then 3
  end
from public.products p
cross join public.scents s
where s.slug in ('pomegranate', 'coconut', 'vanilla', 'honey')
on conflict (product_id, scent_id, note_role) do update
set sort_order = excluded.sort_order;
