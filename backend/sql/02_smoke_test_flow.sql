-- Smoke checks for Dent22 auth/role flow.
-- Run this after:
-- 1) 00_schema_and_policies.sql
-- 2) 01_dev_seed_staff_accounts.sql (optional but recommended for this test)

-- 1) Ensure roles exist in enum
select e.enumlabel as role_name
from pg_enum e
join pg_type t on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where t.typname = 'staff_role'
  and n.nspname = 'public'
order by e.enumsortorder;

-- 2) Ensure admin has /admin and other staff do not
select role::text as role_name, item_key
from public.role_navigation_permissions
where item_key = 'admin'
order by role::text;

-- 3) Ensure seeded users are in staff_profiles with expected roles and usernames
select sp.username::text as username, sp.email::text as email, sp.role::text as role_name, sp.is_active
from public.staff_profiles sp
where sp.email in ('admin@dent22.local', 'receptionist@dent22.local', 'associate@dent22.local')
order by sp.email;

-- 3b) Ensure username resolver works
select public.resolve_login_email('admin') as admin_login_email;
select public.resolve_login_email('receptionist') as receptionist_login_email;
select public.resolve_login_email('associate') as associate_login_email;

-- 4) Simulate receptionist auth context and read allowed_navigation()
select set_config(
  'request.jwt.claim.sub',
  (select id::text from auth.users where email = 'receptionist@dent22.local'),
  true
);
select * from public.allowed_navigation();

-- 5) Simulate associate dentist auth context and read allowed_navigation()
select set_config(
  'request.jwt.claim.sub',
  (select id::text from auth.users where email = 'associate@dent22.local'),
  true
);
select * from public.allowed_navigation();

-- 6) Simulate admin auth context and read allowed_navigation()
select set_config(
  'request.jwt.claim.sub',
  (select id::text from auth.users where email = 'admin@dent22.local'),
  true
);
select * from public.allowed_navigation();

-- 7) Clear simulated auth context
select set_config('request.jwt.claim.sub', '', true);
