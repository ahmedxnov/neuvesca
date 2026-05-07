alter table public.orders
add column if not exists stripe_payment_intent_id text,
add column if not exists paid_at timestamptz;

create unique index if not exists orders_stripe_payment_intent_id_key
on public.orders (stripe_payment_intent_id)
where stripe_payment_intent_id is not null;
