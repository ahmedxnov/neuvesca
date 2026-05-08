-- Replace order status workflow with: pending, confirmed, processing,
-- shipped, delivered, cancelled. Migrates existing rows: paid → confirmed,
-- refunded → cancelled.

-- 1. Map existing rows to the new vocabulary.
update public.orders set status = 'confirmed' where status = 'paid';
update public.orders set status = 'cancelled' where status = 'refunded';

-- 2. Swap the CHECK constraint.
alter table public.orders
  drop constraint if exists orders_status_valid;

alter table public.orders
  add constraint orders_status_valid
  check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
