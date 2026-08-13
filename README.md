# Clevent Personnel Manager

Static HTML/CSS/JS personnel management connected to Supabase.

## Files

- `index.html` — UI
- `style.css` — dark neutral UI + Vazir
- `app.js` — CRUD logic
- `supabase-config.js` — Supabase URL/key
- `supabase-policies.sql` — temporary test policies

## Supabase table expected

Table: `Clevent_Users`

Columns:
- `id` — int8, primary key
- `name` — text
- `position` — text
- `password` — numeric (matches the current table shown in the screenshot)

## Setup

1. Open `supabase-config.js`.
2. Replace `YOUR_PROJECT_REF` with your Supabase project reference.
3. Replace `YOUR_SUPABASE_PUBLISHABLE_KEY` with the project's publishable key.
4. Open `index.html` through a local server (VS Code Live Server is fine) or deploy the folder to GitHub Pages.
5. Make sure RLS policies allow the operations you need.

### Security warning

This frontend uses a public/publishable Supabase key. That key is expected to be visible in a static site. Security must be enforced with RLS.

Do NOT put a `service_role` or secret key in this project.

For real user login, do not store passwords in `Clevent_Users`. Use Supabase Auth and keep only profile/role information in the table.

## Important: ID generation

The Add operation omits `id` and expects Postgres to generate it automatically. If your current `id` column does not have an Identity/default, configure it in Supabase before testing Add.

## GitHub Pages

Upload these files to a repository and enable GitHub Pages. No Node.js server is required.
