# Editing Guide (Smiles Dental Hub UI)

## Quick start
- Run dev server: `npm run dev`
- Build: `npm run build`

## Credentials
- Login form accepts username/password.
- Username is resolved to Auth email through backend RPC `public.resolve_login_email`.
- No hardcoded frontend credentials are used.

## Folder structure
```
frontend/
  src/
    components/        Reusable UI pieces (Sidebar, etc.)
    data/              Mock data for tables/lists
    pages/             Page layouts (Home, Patient Records, Add Patient, etc.)
    App.jsx            App shell + auth + page switching
    App.css            All styles
    index.css          Global reset + fonts
```

## Adding or editing a page
1. Create a new file in `src/pages/` (e.g. `Reports.jsx`).
2. Export a default React component.
3. Add a route in `src/App.jsx`.
4. Add a navigation entry in backend table `public.navigation_items` and map it in `public.role_navigation_permissions`.

## Changing navigation labels
- Update `public.navigation_items` in Supabase.

## Updating table content
- Patient records come from `public.patients`.
- Service list comes from `public.services`.
- Dental chart legends come from `public.tooth_conditions`.
- Patient logs come from `public.patient_logs` via RPC `public.list_patient_logs`.
- User management uses `public.staff_profiles` and admin RPCs.

## Replacing the logo / left background image
- Put your assets in `src/assets/`.
- Update the `.logo-placeholder` block in `src/components/Sidebar.jsx` and `src/pages/Login.jsx`:
  - Replace the placeholder with an `<img src={logo} alt="Smiles Dental Hub" />`.
- For a custom left background image on the login page, update the `.hero` class in `src/App.css`:
  - Replace the gradient with `background-image: url(...);` and add `background-size: cover;`.

## Password eye toggle
- The eye icon toggles visibility in `src/pages/Login.jsx`.

## Layout/spacing tweaks
- Global colors and sizes live in `src/App.css` under `:root`.
- Sidebar width: update `.dashboard { grid-template-columns: 300px 1fr; }`.

## Notes
- App auth/session uses Supabase (`src/lib/supabaseClient.js`).
- Core records pages are Supabase-backed (no mock arrays for records/services/logs/users).
