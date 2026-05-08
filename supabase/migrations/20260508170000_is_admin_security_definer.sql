-- Restore is_admin() to SECURITY DEFINER so it's reliably callable from inside
-- other RLS policy checks (e.g. WITH CHECK on inserts). Under SECURITY INVOKER
-- the inner SELECT against public.profiles has to pass profiles' own RLS,
-- which fail-closes from within a nested policy evaluation and blocks inserts
-- on tables that gate writes on is_admin().

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

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
