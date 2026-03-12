-- Hotfix for older patient_documents tables missing new metadata columns.
-- Safe to run multiple times.

alter table public.patient_documents
  add column if not exists file_url text,
  add column if not exists storage_path text,
  add column if not exists mime_type text,
  add column if not exists file_size bigint,
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_patient_documents_patient_id on public.patient_documents(patient_id, created_at desc);
