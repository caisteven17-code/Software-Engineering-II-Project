# Editing Guide (Smiles Dental Hub UI)

## Quick start
- Run dev server: `npm run dev`
- Build: `npm run build`

## Credentials (demo)
- Username: `admin`
- Password: `admin123`

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
3. Add the page ID + label in `src/data/mockData.js` under `NAV_ITEMS`.
4. Import the page in `src/App.jsx` and add it to `pageMap`.

## Changing navigation labels
- Edit `NAV_ITEMS` in `src/data/mockData.js`.

## Updating table content
- Replace the arrays in `src/data/mockData.js` (e.g. `PATIENT_RECORDS`, `PATIENT_LOGS`).

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
- All pages are static UI layouts right now.
- Forms are placeholders (no backend calls yet).
