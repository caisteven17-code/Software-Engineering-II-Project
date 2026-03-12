-- Hotfix for duplicate patient_code inserts caused by out-of-sync sequence/function.
-- Safe to run multiple times.

create sequence if not exists public.patient_code_seq
as bigint
increment by 1
minvalue 1
start with 1;

do $$
declare
  v_max_code bigint;
begin
  select coalesce(max((regexp_match(patient_code, '^PT-([0-9]{6})$'))[1]::bigint), 0)
  into v_max_code
  from public.patients;

  if v_max_code < 1 then
    perform setval('public.patient_code_seq', 1, false);
  else
    perform setval('public.patient_code_seq', v_max_code, true);
  end if;
end
$$;

create or replace function public.next_patient_code()
returns text
language plpgsql
volatile
as $$
declare
  v_code text;
begin
  loop
    v_code := 'PT-' || lpad(nextval('public.patient_code_seq')::text, 6, '0');
    exit when not exists (
      select 1
      from public.patients p
      where p.patient_code = v_code
    );
  end loop;
  return v_code;
end;
$$;

alter table public.patients
  alter column patient_code set default public.next_patient_code();

