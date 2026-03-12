-- Seed baseline app data from prior frontend mock content.
-- Safe to re-run: uses upserts and idempotent inserts.
--
-- Run after:
-- 1) 00a_add_admin_role_enum.sql (if needed)
-- 2) 00_schema_and_policies.sql
-- 3) 01_dev_seed_staff_accounts.sql (recommended so admin actor exists)

do $$
declare
  v_actor uuid;
  v_health_default jsonb := jsonb_build_object(
    'Low Blood Pressure', false,
    'Severe Headaches', false,
    'High Blood Pressure', false,
    'Weight Loss', false,
    'Heart Disease', false,
    'Stroke', false,
    'Asthma', false,
    'Tuberculosis', false,
    'Diabetes', false,
    'Radiation Therapy', false,
    'Respiratory Problems', false,
    'Anemia/Blood Disease', false,
    'Hay Fever/Allergies', false,
    'Arthritis/Rheumatism', false,
    'Epilepsy/Convulsions', false,
    'Bleeding Problems', false,
    'Fainting/Seizures', false,
    'Heart Murmur', false,
    'Rheumatic Fever', false,
    'Kidney Disease', false,
    'Stomach Trouble/Ulcers', false,
    'Heart Surgery/Heart Attack', false,
    'Angina pectoris, chest pain', false,
    'Sexually Transmitted Disease', false,
    'Joint Replacement/Implant', false,
    'Hepatitis/Liver Disease', false,
    'Thyroid Problems', false,
    'Cancer/Tumors', false,
    'Head Injuries', false,
    'AIDS or HIV Infection', false
  );
  v_allergen_default jsonb := jsonb_build_object(
    'values', jsonb_build_object(
      'Local Anesthetic (ex. Lidocaine)', false,
      'Penicillin/Antibiotics', false,
      'Sulfa Drugs', false,
      'Latex/Rubber', false,
      'Aspirin', false
    ),
    'others', ''
  );
  v_medical_default jsonb := jsonb_build_object(
    'physician', 'Dr. Keith San Miguel',
    'specialty', 'General Practice',
    'address', 'Caloocan City',
    'answers', jsonb_build_object(
      '0', 'YES', '1', 'NO', '2', 'NO', '3', 'NO', '4', 'NO',
      '5', 'NO', '6', 'NO', '7', 'NO', '8', 'NO', '9', 'NO'
    ),
    'notes', jsonb_build_object()
  );
  v_dental_default jsonb := jsonb_build_object(
    'previous', 'Dr. Adrian San Nicolas',
    'lastExam', '2025-12-15',
    'reason', 'Routine check-up',
    'answers', jsonb_build_object(
      '0', 'NO', '1', 'NO', '2', 'NO', '3', 'NO', '4', 'NO',
      '5', 'NO', '6', 'NO', '7', 'NO', '8', 'NO', '9', 'NO',
      '10', 'NO', '11', 'NO', '12', 'NO', '13', 'NO', '14', 'YES',
      '15', 'NO', '16', 'NO', '17', 'YES'
    ),
    'notes', jsonb_build_object(
      '14', 'Patient wants cosmetic alignment check.'
    )
  );
begin
  select au.id into v_actor
  from auth.users au
  where au.email = 'admin@dent22.local'
  limit 1;

  if v_actor is null then
    select au.id into v_actor
    from auth.users au
    order by au.created_at asc
    limit 1;
  end if;

  if v_actor is null then
    raise exception 'No auth user found. Create at least one auth account before running seed.';
  end if;

  insert into public.services (service_name, price, description, is_active, created_by, updated_by)
  values
    ('Dental Check-Up & Consultation', 50::numeric, 'General consultation and oral exam', true, v_actor, v_actor),
    ('Teeth Cleaning', 100::numeric, 'Routine prophylaxis and scaling', true, v_actor, v_actor),
    ('Tooth Extraction', 500::numeric, 'Simple extraction service', true, v_actor, v_actor),
    ('Dental Fillings', 800::numeric, 'Restorative filling treatment', true, v_actor, v_actor),
    ('Root Canal Treatment', 3500::numeric, 'Endodontic treatment', true, v_actor, v_actor),
    ('Dental X-Ray Services', 1000::numeric, 'Diagnostic dental imaging', true, v_actor, v_actor),
    ('Teeth Whitening', 4500::numeric, 'Aesthetic whitening service', true, v_actor, v_actor),
    ('Fluoride Application', 700::numeric, 'Preventive fluoride treatment', true, v_actor, v_actor),
    ('Oral Prophylaxis', 1200::numeric, 'Professional oral cleaning', true, v_actor, v_actor),
    ('Night Guard Fitting', 5200::numeric, 'Custom guard for bruxism', true, v_actor, v_actor)
  on conflict (service_name) do update
  set
    price = excluded.price,
    description = excluded.description,
    is_active = true,
    updated_by = v_actor,
    updated_at = now();

  insert into public.tooth_conditions (code, condition_name, description, is_active, created_by, updated_by)
  values
    ('C', 'Caries', 'Tooth decay', true, v_actor, v_actor),
    ('ABR', 'Abrasion', 'Tooth surface wear', true, v_actor, v_actor),
    ('F', 'For Exo', 'For extraction', true, v_actor, v_actor),
    ('Ex', 'Braces', 'Orthodontic braces marker', true, v_actor, v_actor),
    ('X', 'Missing', 'Missing tooth', true, v_actor, v_actor),
    ('I', 'Impacted', 'Impacted tooth', true, v_actor, v_actor),
    ('RF', 'Restoration Failure', 'Failed restoration marker', true, v_actor, v_actor),
    ('?', 'Good Condition', 'Tooth in good condition', true, v_actor, v_actor)
  on conflict (code) do update
  set
    condition_name = excluded.condition_name,
    description = excluded.description,
    is_active = true,
    updated_by = v_actor,
    updated_at = now();

  insert into public.patients (
    patient_code,
    first_name,
    last_name,
    middle_name,
    suffix,
    sex,
    birth_date,
    phone,
    email,
    address,
    nickname,
    civil_status,
    occupation,
    office_address,
    emergency_contact_name,
    emergency_contact_phone,
    guardian_name,
    guardian_mobile_number,
    guardian_occupation,
    guardian_office_address,
    health_conditions,
    allergen_info,
    medical_history,
    dental_history,
    authorization_accepted,
    is_active,
    archived_at,
    archived_by,
    created_by,
    updated_by,
    created_at,
    updated_at
  )
  values
    (
      'PT-000001', 'John', 'Doe', 'M', null, 'Male', '2003-12-01',
      '09213232131', 'john.doe@example.com', 'Blk 27 Lot 23, Forbes Subdivision Caloocan City',
      'Johnny', 'Single', 'Government employee', 'Oracle, Pasay City',
      'Rosa Doe', '09170000001', null, null, null, null,
      v_health_default || jsonb_build_object('Severe Headaches', true),
      v_allergen_default || jsonb_build_object('values', (v_allergen_default -> 'values') || jsonb_build_object('Penicillin/Antibiotics', true)),
      v_medical_default || jsonb_build_object('notes', jsonb_build_object('4', 'Sleeping pills as needed')),
      v_dental_default || jsonb_build_object('reason', 'Toothache on lower right molar'),
      true,
      false,
      '2026-02-04 10:00:00+08'::timestamptz,
      v_actor,
      v_actor,
      v_actor,
      '2025-12-01 09:00:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000002', 'Paul', 'Evans', 'T', null, 'Female', '2001-12-09',
      '09213232132', 'paul.evans@example.com', 'Bagumbong, Caloocan City',
      'Pau', 'Single', 'Call Center Agent', 'MOA Complex, Pasay City',
      'Lina Evans', '09170000002', null, null, null, null,
      v_health_default || jsonb_build_object('Asthma', true),
      v_allergen_default,
      v_medical_default || jsonb_build_object('specialty', 'Pulmonology'),
      v_dental_default,
      true,
      true,
      null,
      null,
      v_actor,
      v_actor,
      '2026-01-06 09:15:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000003', 'Mark', 'John', null, null, 'Male', '1993-02-23',
      '09213232133', 'mark.john@example.com', 'Monumento, Caloocan City',
      'MJ', 'Married', 'Driver', 'Valenzuela Terminal',
      'Ella John', '09170000003', null, null, null, null,
      v_health_default || jsonb_build_object('High Blood Pressure', true),
      v_allergen_default || jsonb_build_object('values', (v_allergen_default -> 'values') || jsonb_build_object('Aspirin', true)),
      v_medical_default || jsonb_build_object('answers', (v_medical_default -> 'answers') || jsonb_build_object('1', 'YES')),
      v_dental_default || jsonb_build_object('reason', 'Broken filling'),
      true,
      false,
      '2026-02-07 12:00:00+08'::timestamptz,
      v_actor,
      v_actor,
      v_actor,
      '2025-11-20 14:25:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000004', 'Steph', 'Curry', null, null, 'Female', '2000-06-27',
      '09213232134', 'steph.curry@example.com', 'Novaliches, Quezon City',
      'Steph', 'Single', 'Athlete', 'Training Center, QC',
      'Martha Curry', '09170000004', null, null, null, null,
      v_health_default,
      v_allergen_default,
      v_medical_default,
      v_dental_default || jsonb_build_object('reason', 'Teeth whitening consult'),
      true,
      true,
      null,
      null,
      v_actor,
      v_actor,
      '2026-02-16 08:30:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000005', 'John', 'Mike', null, null, 'Female', '2004-08-17',
      '09213232135', 'john.mike@example.com', 'Malabon City',
      'JM', 'Single', 'Student', 'University of the East',
      'Anne Mike', '09170000005', null, null, null, null,
      v_health_default || jsonb_build_object('Hay Fever/Allergies', true),
      v_allergen_default || jsonb_build_object('others', 'Seafood'),
      v_medical_default,
      v_dental_default,
      true,
      true,
      null,
      null,
      v_actor,
      v_actor,
      '2026-02-17 10:30:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000006', 'Andrea', 'Santos', 'P', null, 'Female', '1998-11-11',
      '09213232136', 'andrea.santos@example.com', 'North Caloocan',
      'Andi', 'Married', 'Teacher', 'Bagong Silang Elementary School',
      'Leo Santos', '09170000006', null, null, null, null,
      v_health_default || jsonb_build_object('Stomach Trouble/Ulcers', true),
      v_allergen_default,
      v_medical_default || jsonb_build_object('notes', jsonb_build_object('3', 'Hospitalized in 2022 for gastritis')),
      v_dental_default || jsonb_build_object('reason', 'Follow-up cleaning'),
      true,
      true,
      null,
      null,
      v_actor,
      v_actor,
      '2026-02-18 11:45:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000007', 'Kevin', 'Tan', null, null, 'Male', '1989-07-04',
      '09213232137', 'kevin.tan@example.com', 'Makati City',
      'Kev', 'Married', 'Engineer', 'Ayala Avenue, Makati',
      'April Tan', '09170000007', null, null, null, null,
      v_health_default || jsonb_build_object('Diabetes', true),
      v_allergen_default,
      v_medical_default || jsonb_build_object('specialty', 'Endocrinology'),
      v_dental_default || jsonb_build_object('reason', 'Gum bleeding'),
      true,
      true,
      null,
      null,
      v_actor,
      v_actor,
      '2026-02-19 09:05:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000008', 'Mia', 'Reyes', null, null, 'Female', '2012-03-30',
      '09213232138', 'mia.reyes@example.com', 'Fairview, QC',
      'Mimi', 'Single', 'Student', 'Fairview Heights School',
      'Grace Reyes', '09170000008', 'Grace Reyes', '09170000008', 'Nurse', 'Fairview Medical Center',
      v_health_default,
      v_allergen_default,
      v_medical_default || jsonb_build_object('physician', 'Dr. Liza Cruz', 'specialty', 'Pediatrics'),
      v_dental_default || jsonb_build_object('reason', 'Orthodontic assessment'),
      true,
      true,
      null,
      null,
      v_actor,
      v_actor,
      '2026-02-20 08:10:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000009', 'Ralph', 'Dizon', null, null, 'Male', '1995-05-14',
      '09213232139', 'ralph.dizon@example.com', 'San Jose del Monte, Bulacan',
      'Ralfy', 'Single', 'IT Support', 'BGC, Taguig',
      'Cora Dizon', '09170000009', null, null, null, null,
      v_health_default || jsonb_build_object('Respiratory Problems', true),
      v_allergen_default || jsonb_build_object('values', (v_allergen_default -> 'values') || jsonb_build_object('Latex/Rubber', true)),
      v_medical_default,
      v_dental_default || jsonb_build_object('reason', 'Post-extraction check'),
      true,
      true,
      null,
      null,
      v_actor,
      v_actor,
      '2026-02-21 13:05:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000010', 'Irene', 'Lopez', null, null, 'Female', '1987-10-25',
      '09213232140', 'irene.lopez@example.com', 'Marikina City',
      'Iri', 'Married', 'Accountant', 'Ortigas Center, Pasig',
      'Miguel Lopez', '09170000010', null, null, null, null,
      v_health_default || jsonb_build_object('Arthritis/Rheumatism', true),
      v_allergen_default,
      v_medical_default,
      v_dental_default || jsonb_build_object('reason', 'Sensitivity to cold drinks'),
      true,
      true,
      null,
      null,
      v_actor,
      v_actor,
      '2026-02-22 09:20:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000011', 'Noel', 'Garcia', null, null, 'Male', '1979-01-18',
      '09213232141', 'noel.garcia@example.com', 'Mandaluyong City',
      'Noe', 'Married', 'Business Owner', 'Shaw Boulevard, Mandaluyong',
      'Liza Garcia', '09170000011', null, null, null, null,
      v_health_default || jsonb_build_object('Heart Disease', true, 'High Blood Pressure', true),
      v_allergen_default,
      v_medical_default || jsonb_build_object('answers', (v_medical_default -> 'answers') || jsonb_build_object('0', 'NO', '1', 'YES')),
      v_dental_default || jsonb_build_object('reason', 'Bridge replacement consult'),
      true,
      true,
      null,
      null,
      v_actor,
      v_actor,
      '2026-02-10 15:00:00+08'::timestamptz,
      now()
    ),
    (
      'PT-000012', 'Lara', 'Mendoza', null, null, 'Female', '1992-09-03',
      '09213232142', 'lara.mendoza@example.com', 'Taguig City',
      'Lars', 'Single', 'Freelancer', 'Bonifacio Global City',
      'Jose Mendoza', '09170000012', null, null, null, null,
      v_health_default,
      v_allergen_default || jsonb_build_object('values', (v_allergen_default -> 'values') || jsonb_build_object('Sulfa Drugs', true)),
      v_medical_default || jsonb_build_object('notes', jsonb_build_object('4', 'Daily antihistamine')),
      v_dental_default || jsonb_build_object('reason', 'Regular six-month recall'),
      true,
      true,
      null,
      null,
      v_actor,
      v_actor,
      '2026-01-30 16:20:00+08'::timestamptz,
      now()
    )
  on conflict (patient_code) do update
  set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    middle_name = excluded.middle_name,
    suffix = excluded.suffix,
    sex = excluded.sex,
    birth_date = excluded.birth_date,
    phone = excluded.phone,
    email = excluded.email,
    address = excluded.address,
    nickname = excluded.nickname,
    civil_status = excluded.civil_status,
    occupation = excluded.occupation,
    office_address = excluded.office_address,
    emergency_contact_name = excluded.emergency_contact_name,
    emergency_contact_phone = excluded.emergency_contact_phone,
    guardian_name = excluded.guardian_name,
    guardian_mobile_number = excluded.guardian_mobile_number,
    guardian_occupation = excluded.guardian_occupation,
    guardian_office_address = excluded.guardian_office_address,
    health_conditions = excluded.health_conditions,
    allergen_info = excluded.allergen_info,
    medical_history = excluded.medical_history,
    dental_history = excluded.dental_history,
    authorization_accepted = excluded.authorization_accepted,
    is_active = excluded.is_active,
    archived_at = excluded.archived_at,
    archived_by = excluded.archived_by,
    updated_by = v_actor,
    updated_at = now();

  with seed_service_records (patient_code, service_name, quantity, unit_price, discount_amount, amount, notes, visit_at) as (
    values
      ('PT-000001', 'Dental Check-Up & Consultation', 1, 800::numeric, 0::numeric, 800::numeric, 'Initial consult', '2026-01-14 09:00:00+08'::timestamptz),
      ('PT-000001', 'Dental Fillings', 1, 2200::numeric, 0::numeric, 2200::numeric, 'Composite filling on #46', '2026-02-02 11:00:00+08'::timestamptz),
      ('PT-000002', 'Teeth Cleaning', 1, 1200::numeric, 0::numeric, 1200::numeric, 'Routine prophylaxis', '2026-01-18 10:00:00+08'::timestamptz),
      ('PT-000002', 'Dental X-Ray Services', 1, 950::numeric, 0::numeric, 950::numeric, 'Bitewing', '2026-02-19 14:00:00+08'::timestamptz),
      ('PT-000003', 'Tooth Extraction', 1, 3500::numeric, 0::numeric, 3500::numeric, 'Extraction of impacted molar', '2026-02-03 13:00:00+08'::timestamptz),
      ('PT-000004', 'Teeth Whitening', 1, 4800::numeric, 0::numeric, 4800::numeric, 'In-office whitening', '2026-02-16 09:00:00+08'::timestamptz),
      ('PT-000005', 'Oral Prophylaxis', 1, 1400::numeric, 0::numeric, 1400::numeric, 'Scaling and polishing', '2026-02-17 09:30:00+08'::timestamptz),
      ('PT-000006', 'Teeth Cleaning', 1, 1200::numeric, 0::numeric, 1200::numeric, 'Preventive cleaning', '2026-02-18 11:00:00+08'::timestamptz),
      ('PT-000006', 'Fluoride Application', 1, 700::numeric, 0::numeric, 700::numeric, 'Topical fluoride', '2026-02-18 11:00:00+08'::timestamptz),
      ('PT-000007', 'Root Canal Treatment', 1, 8500::numeric, 0::numeric, 8500::numeric, 'RCT session 1', '2026-02-19 10:00:00+08'::timestamptz),
      ('PT-000007', 'Root Canal Treatment', 1, 8300::numeric, 0::numeric, 8300::numeric, 'RCT session 2', '2026-02-21 10:00:00+08'::timestamptz),
      ('PT-000008', 'Dental Check-Up & Consultation', 1, 800::numeric, 0::numeric, 800::numeric, 'Ortho consult', '2026-02-20 08:30:00+08'::timestamptz),
      ('PT-000009', 'Tooth Extraction', 1, 2900::numeric, 0::numeric, 2900::numeric, 'Extraction follow-up', '2026-02-21 15:00:00+08'::timestamptz),
      ('PT-000010', 'Dental Fillings', 1, 2600::numeric, 0::numeric, 2600::numeric, 'Class II restoration', '2026-02-22 10:15:00+08'::timestamptz),
      ('PT-000011', 'Dental X-Ray Services', 1, 1200::numeric, 0::numeric, 1200::numeric, 'Panoramic x-ray', '2026-02-10 15:30:00+08'::timestamptz),
      ('PT-000011', 'Night Guard Fitting', 1, 5200::numeric, 0::numeric, 5200::numeric, 'Night guard impression', '2026-02-12 16:00:00+08'::timestamptz),
      ('PT-000012', 'Teeth Cleaning', 1, 1250::numeric, 0::numeric, 1250::numeric, '6-month recall cleaning', '2026-01-30 16:45:00+08'::timestamptz)
  )
  insert into public.service_records (
    patient_id,
    service_id,
    quantity,
    unit_price,
    discount_amount,
    performed_by,
    notes,
    amount,
    visit_at,
    created_by,
    updated_by
  )
  select
    p.id,
    s.id,
    ssr.quantity,
    ssr.unit_price,
    ssr.discount_amount,
    v_actor,
    ssr.notes,
    ssr.amount,
    ssr.visit_at,
    v_actor,
    v_actor
  from seed_service_records ssr
  join public.patients p on p.patient_code = ssr.patient_code
  join public.services s on s.service_name = ssr.service_name
  where not exists (
    select 1
    from public.service_records sr
    where sr.patient_id = p.id
      and sr.service_id = s.id
      and sr.visit_at = ssr.visit_at
  );

  with seed_dental_records (patient_code, findings, treatment, recorded_at, chart_data) as (
    values
      (
        'PT-000001',
        'Caries noted on lower molar',
        'Restoration and hygiene advice',
        '2026-02-02 11:10:00+08'::timestamptz,
        jsonb_build_object(
          'toothMap', jsonb_build_object('top-14', 'C', 'bottom-30', 'C'),
          'periodontal', jsonb_build_object('Gingivitis', true, 'Moderate Periodontitis', false, 'Early Periodontitis', false, 'Advanced Periodontitis', false),
          'occlusion', jsonb_build_object('Class I molar', true, 'Overbite', false, 'Overjet', false, 'Midline Deviation', false),
          'prescriptions', 'Ibuprofen 400mg as needed',
          'notes', 'Observe oral hygiene and review in 2 weeks.',
          'dentist', 'Dr. Adrian San Nicolas'
        )
      ),
      (
        'PT-000004',
        'No active caries, cosmetic concern only',
        'Whitening protocol started',
        '2026-02-16 09:20:00+08'::timestamptz,
        jsonb_build_object(
          'toothMap', jsonb_build_object(),
          'periodontal', jsonb_build_object('Gingivitis', false, 'Moderate Periodontitis', false, 'Early Periodontitis', false, 'Advanced Periodontitis', false),
          'occlusion', jsonb_build_object('Class I molar', true, 'Overbite', false, 'Overjet', false, 'Midline Deviation', false),
          'prescriptions', 'Avoid pigmented food for 48 hours.',
          'notes', 'Patient tolerated whitening procedure.',
          'dentist', 'Dr. Jowela Elaine Roxas'
        )
      ),
      (
        'PT-000007',
        'Pulpal involvement on #36',
        'Root canal treatment in progress',
        '2026-02-19 10:30:00+08'::timestamptz,
        jsonb_build_object(
          'toothMap', jsonb_build_object('bottom-20', 'C'),
          'periodontal', jsonb_build_object('Gingivitis', true, 'Moderate Periodontitis', true, 'Early Periodontitis', false, 'Advanced Periodontitis', false),
          'occlusion', jsonb_build_object('Class I molar', true, 'Overbite', false, 'Overjet', false, 'Midline Deviation', false),
          'prescriptions', 'Amoxicillin 500mg every 8 hours for 7 days',
          'notes', 'Return for obturation next visit.',
          'dentist', 'Dr. Keith San Miguel'
        )
      ),
      (
        'PT-000010',
        'Small carious lesion restored',
        'Composite filling completed',
        '2026-02-22 10:40:00+08'::timestamptz,
        jsonb_build_object(
          'toothMap', jsonb_build_object('top-5', 'F'),
          'periodontal', jsonb_build_object('Gingivitis', false, 'Moderate Periodontitis', false, 'Early Periodontitis', false, 'Advanced Periodontitis', false),
          'occlusion', jsonb_build_object('Class I molar', true, 'Overbite', false, 'Overjet', false, 'Midline Deviation', false),
          'prescriptions', 'Mild analgesic if needed',
          'notes', 'Final polish done.',
          'dentist', 'Dr. Adrian San Nicolas'
        )
      )
  )
  insert into public.dental_records (
    patient_id,
    tooth_number,
    findings,
    treatment,
    chart_data,
    recorded_at,
    created_by,
    updated_by
  )
  select
    p.id,
    'ALL',
    sdr.findings,
    sdr.treatment,
    sdr.chart_data,
    sdr.recorded_at,
    v_actor,
    v_actor
  from seed_dental_records sdr
  join public.patients p on p.patient_code = sdr.patient_code
  where not exists (
    select 1
    from public.dental_records dr
    where dr.patient_id = p.id
      and dr.recorded_at = sdr.recorded_at
  );

  insert into public.patient_logs (patient_id, action, details, created_by, created_at)
  select
    p.id,
    'create_patient'::public.patient_log_action,
    'Initial seeded patient record',
    v_actor,
    p.created_at
  from public.patients p
  where not exists (
    select 1
    from public.patient_logs pl
    where pl.patient_id = p.id
      and pl.action = 'create_patient'::public.patient_log_action
      and pl.details = 'Initial seeded patient record'
  );

  insert into public.patient_logs (patient_id, action, details, created_by, created_at)
  select
    sr.patient_id,
    'service_update'::public.patient_log_action,
    'Seeded service records',
    v_actor,
    min(sr.visit_at)
  from public.service_records sr
  where not exists (
    select 1
    from public.patient_logs pl
    where pl.patient_id = sr.patient_id
      and pl.action = 'service_update'::public.patient_log_action
      and pl.details = 'Seeded service records'
  )
  group by sr.patient_id;

  insert into public.patient_logs (patient_id, action, details, created_by, created_at)
  select
    dr.patient_id,
    'dental_update'::public.patient_log_action,
    'Seeded dental records',
    v_actor,
    min(dr.recorded_at)
  from public.dental_records dr
  where not exists (
    select 1
    from public.patient_logs pl
    where pl.patient_id = dr.patient_id
      and pl.action = 'dental_update'::public.patient_log_action
      and pl.details = 'Seeded dental records'
  )
  group by dr.patient_id;

  insert into public.patient_logs (patient_id, action, details, created_by, created_at)
  select
    p.id,
    'archive'::public.patient_log_action,
    'Seeded inactive status',
    v_actor,
    coalesce(p.archived_at, now())
  from public.patients p
  where p.is_active = false
    and not exists (
      select 1
      from public.patient_logs pl
      where pl.patient_id = p.id
        and pl.action = 'archive'::public.patient_log_action
        and pl.details = 'Seeded inactive status'
    );
end
$$;
