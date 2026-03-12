export const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/home' },
  { id: 'records', label: 'Patient Records', path: '/records' },
  { id: 'add-patient', label: 'Add Patient', path: '/add-patient' },
  { id: 'procedure', label: 'Procedure', path: '/procedure' },
  { id: 'logs', label: 'Patient Logs', path: '/logs' },
  { id: 'admin', label: 'Admin', path: '/admin' },
]

export const PATIENT_RECORDS = [
  {
    id: 1,
    name: 'Doe, John',
    sex: 'M',
    age: 21,
    date: 'Dec 1, 2024',
    active: false,
  },
  {
    id: 2,
    name: 'Evans, Paul',
    sex: 'F',
    age: 23,
    date: 'Dec 9, 2024',
    active: true,
  },
  {
    id: 3,
    name: 'John, Mark',
    sex: 'M',
    age: 32,
    date: 'Feb 23, 2025',
    active: false,
  },
  {
    id: 4,
    name: 'Curry, Steph',
    sex: 'F',
    age: 25,
    date: 'Jun 27, 2025',
    active: true,
  },
  {
    id: 5,
    name: 'Mike, John',
    sex: 'F',
    age: 21,
    date: 'Aug 17, 2025',
    active: true,
  },
]

export const SERVICES = [
  'Dental Check-Up & Consultation',
  'Teeth Cleaning',
  'Tooth Extraction',
  'Dental Fillings',
  'Root Canal Treatment',
  'Dental X-Ray Services',
  'Teeth Whitening',
]

export const LEGENDS = [
  { code: 'C', label: 'Caries' },
  { code: 'ABR', label: 'Abrasion' },
  { code: 'F', label: 'For Exo' },
  { code: 'Ex', label: 'Braces' },
  { code: 'X', label: 'Missing' },
  { code: 'I', label: 'Impacted' },
  { code: '?', label: 'Good Condition', good: true },
]

export const PATIENT_LOGS = [
  {
    id: 1,
    name: 'Doe, John',
    datetime: 'Apr 04, 2024 9:05am',
    dentist: 'Dr. Jowela Elaine Roxas',
  },
  {
    id: 2,
    name: 'Evans, Paul',
    datetime: 'Apr 04, 2024 9:35am',
    dentist: 'Dr. Erica Herrera',
  },
  {
    id: 3,
    name: 'John, Mark',
    datetime: 'Apr 04, 2024 9:55am',
    dentist: 'Dr. Jowela Elaine Roxas',
  },
  {
    id: 4,
    name: 'Curry, Steph',
    datetime: 'Apr 04, 2024 10:05am',
    dentist: 'Dr. Jowela Elaine Roxas',
  },
  {
    id: 5,
    name: 'Wilson, Hannah',
    datetime: 'Apr 04, 2024 10:25am',
    dentist: 'Dr. Erica Herrera',
  },
  {
    id: 6,
    name: 'Tan, Michael',
    datetime: 'Apr 04, 2024 11:25am',
    dentist: 'Dr. Jowela Elaine Roxas',
  },
  {
    id: 7,
    name: 'Lee, Jasmine',
    datetime: 'Apr 04, 2024 12:15pm',
    dentist: 'Dr. Erica Herrera',
  },
  {
    id: 8,
    name: 'Patel, Keven',
    datetime: 'Apr 04, 2024 12:30pm',
    dentist: 'Dr. Jowela Elaine Roxas',
  },
  {
    id: 9,
    name: 'Cruz, Daniel',
    datetime: 'Apr 04, 2024 1:15am',
    dentist: 'Dr. Jowela Elaine Roxas',
  },
  {
    id: 10,
    name: 'Morgan, Alex',
    datetime: 'Apr 04, 2024 1:55am',
    dentist: 'Dr. Erica Herrera',
  },
]

export const USERS = [
  {
    id: 1,
    name: 'Jowela Elaine Roxas',
    username: 'Ella',
    password: '1234',
    role: 'Admin',
    date: 'Oct 20, 2019',
  },
  {
    id: 2,
    name: 'Erica Herrera',
    username: 'Erica',
    password: '1234',
    role: 'Associate Dentist',
    date: 'Nov 8, 2022',
  },
  {
    id: 3,
    name: 'Janis Roxas',
    username: 'Ella',
    password: '4567',
    role: 'Receptionist',
    date: 'Nov 15, 2024',
  },
]

export const INACTIVE_PATIENTS = [
  {
    id: 1,
    name: 'Doe, John',
    sex: 'M',
    age: 12,
    date: 'Oct 10, 2025',
  },
  {
    id: 2,
    name: 'Evans, Paul',
    sex: 'F',
    age: 23,
    date: 'Nov 8, 2025',
  },
  {
    id: 3,
    name: 'James, Mark',
    sex: 'M',
    age: 32,
    date: 'Nov 15, 2025',
  },
]

export const ARCHIVE_PATIENTS = [
  {
    id: 1,
    name: 'Doe, John',
    sex: 'M',
    age: 21,
    date: 'Mar 23, 2019',
  },
  {
    id: 2,
    name: 'Evans, Paul',
    sex: 'F',
    age: 23,
    date: 'Dec 9, 2020',
  },
  {
    id: 3,
    name: 'Mark, John',
    sex: 'M',
    age: 32,
    date: 'Apr 13, 2023',
  },
]
