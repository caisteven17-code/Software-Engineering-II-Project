-- Hotfix migration for service pricing + service record billing fields.
-- Safe to run multiple times.

alter table public.services
  add column if not exists price numeric not null default 0;

alter table public.services
  drop constraint if exists services_price_non_negative;

alter table public.services
  add constraint services_price_non_negative
  check (price >= 0);

update public.services
set price = case service_name
  when 'Dental Check-Up & Consultation' then 50
  when 'Teeth Cleaning' then 100
  when 'Tooth Extraction' then 500
  when 'Dental Fillings' then 800
  when 'Root Canal Treatment' then 3500
  when 'Dental X-Ray Services' then 1000
  when 'Teeth Whitening' then 4500
  when 'Fluoride Application' then 700
  when 'Oral Prophylaxis' then 1200
  when 'Night Guard Fitting' then 5200
  else coalesce(price, 0)
end
where coalesce(price, 0) = 0;

alter table public.service_records
  add column if not exists quantity integer not null default 1;

alter table public.service_records
  add column if not exists unit_price numeric;

alter table public.service_records
  add column if not exists discount_amount numeric not null default 0;

update public.service_records
set quantity = 1
where quantity is null or quantity < 1;

update public.service_records
set unit_price = coalesce(unit_price, amount, 0)
where unit_price is null;

update public.service_records
set discount_amount = coalesce(discount_amount, 0)
where discount_amount is null;

alter table public.service_records
  drop constraint if exists service_records_quantity_positive;

alter table public.service_records
  add constraint service_records_quantity_positive
  check (quantity >= 1);

alter table public.service_records
  drop constraint if exists service_records_unit_price_non_negative;

alter table public.service_records
  add constraint service_records_unit_price_non_negative
  check (unit_price is null or unit_price >= 0);

alter table public.service_records
  drop constraint if exists service_records_discount_non_negative;

alter table public.service_records
  add constraint service_records_discount_non_negative
  check (discount_amount >= 0);
