-- Hotfix:
-- 1) Merge duplicate active service rows for same patient/service/day.
-- 2) Prevent future duplicates for same patient/service/day.
-- 3) Restrict patient_documents MIME types to approved file formats.
--
-- Safe to re-run.

with ranked as (
  select
    sr.id,
    sr.patient_id,
    sr.service_id,
    (sr.visit_at at time zone 'UTC')::date as visit_date,
    greatest(1, coalesce(sr.quantity, 1)) as quantity_value,
    greatest(0::numeric, coalesce(sr.unit_price, 0::numeric)) as unit_price_value,
    greatest(0::numeric, coalesce(sr.discount_amount, 0::numeric)) as discount_value,
    row_number() over (
      partition by sr.patient_id, sr.service_id, (sr.visit_at at time zone 'UTC')::date
      order by coalesce(sr.created_at, sr.visit_at) asc, sr.id asc
    ) as rn,
    first_value(sr.id) over (
      partition by sr.patient_id, sr.service_id, (sr.visit_at at time zone 'UTC')::date
      order by coalesce(sr.created_at, sr.visit_at) asc, sr.id asc
    ) as keeper_id
  from public.service_records sr
  where sr.archived_at is null
),
aggregated as (
  select
    keeper_id,
    sum(quantity_value) as total_quantity,
    max(unit_price_value) as resolved_unit_price,
    sum(discount_value) as total_discount
  from ranked
  group by keeper_id
)
update public.service_records sr
set
  quantity = a.total_quantity,
  unit_price = a.resolved_unit_price,
  discount_amount = least(
    a.total_discount,
    round((a.total_quantity * a.resolved_unit_price)::numeric, 2)
  ),
  amount = greatest(
    0::numeric,
    round((a.total_quantity * a.resolved_unit_price)::numeric, 2)
    - least(
      a.total_discount,
      round((a.total_quantity * a.resolved_unit_price)::numeric, 2)
    )
  ),
  updated_at = now()
from aggregated a
where sr.id = a.keeper_id;

with ranked as (
  select
    sr.id,
    row_number() over (
      partition by sr.patient_id, sr.service_id, (sr.visit_at at time zone 'UTC')::date
      order by coalesce(sr.created_at, sr.visit_at) asc, sr.id asc
    ) as rn
  from public.service_records sr
  where sr.archived_at is null
)
update public.service_records sr
set
  archived_at = coalesce(sr.archived_at, now()),
  archived_by = coalesce(sr.archived_by, sr.updated_by, sr.created_by),
  updated_at = now()
from ranked r
where sr.id = r.id
  and r.rn > 1
  and sr.archived_at is null;

create unique index if not exists uq_service_records_patient_service_visit_day_active
on public.service_records (patient_id, service_id, ((visit_at at time zone 'UTC')::date))
where archived_at is null;

alter table public.patient_documents
  drop constraint if exists patient_documents_allowed_mime_type;

alter table public.patient_documents
  add constraint patient_documents_allowed_mime_type
  check (
    mime_type is null
    or lower(mime_type) in (
      'image/png',
      'image/jpeg',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel'
    )
  ) not valid;

