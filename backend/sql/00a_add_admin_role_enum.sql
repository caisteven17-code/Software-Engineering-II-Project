-- Upgrade helper for existing databases that already have public.staff_role
-- without the "admin" enum value.
--
-- IMPORTANT:
-- Run this script as a separate SQL execution first.
-- Then run 00_schema_and_policies.sql in a second execution.

do $$
begin
  if exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'staff_role'
      and n.nspname = 'public'
  ) then
    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      join pg_namespace n on n.oid = t.typnamespace
      where t.typname = 'staff_role'
        and n.nspname = 'public'
        and e.enumlabel = 'admin'
    ) then
      alter type public.staff_role add value 'admin' before 'receptionist';
    end if;
  end if;
end
$$;
