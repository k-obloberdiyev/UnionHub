PocketBase setup for UnionHub
=============================

This guide helps you run PocketBase locally and connect it to the UnionHub frontend.

Why PocketBase?
- Single binary, low ops, good for small teams (30 users is trivial).
- Built-in admin UI and file storage.

Overview
- Run the PocketBase binary locally (default UI at http://127.0.0.1:8090).
- Create the collections: `departments`, `profiles`, `tasks` from the admin UI (or import schema JSON).
- Seed the `departments` and `profiles` collections (we provide a seed template).
- Configure the frontend to use the PocketBase URL and enable adapter mode.

Collections (recommended fields)

1) departments
- name: text (required)
- description: text

2) profiles
- first_name: text
- last_name: text
- email: email (unique) — used for login
- avatar_url: file or text
- department_id: relation -> departments (use a text field storing department id)

3) tasks
- title: text
- description: text
- deadline: datetime
- department_id: relation -> departments (text)
- assignee: relation -> profiles (text)
- status: text (default: todo)

Admin user and API tokens
- Start PocketBase and open the admin UI (http://127.0.0.1:8090/_/).
- Create an admin user (first-time flow will ask you for an admin user).
- In the admin UI you can manage collections and records manually.

Seeding data (manual)
- Using the admin UI you can add departments and profiles quickly (30 users is small).

Seeding via script (example)
- We included `scripts/seed-pocketbase.js` which shows how to authenticate as an admin and create records via the Admin API. You will need Node.js and `node-fetch`.
- Run:
  1) Start PocketBase locally: `./pocketbase serve`
  2) Install deps in the repo (once): `npm install node-fetch@2 minimist`
  3) Run the script, passing the admin email/password or set env vars:
    ```powershell
    # If your project uses "type": "module" in package.json, run the .cjs script
    node .\scripts\seed-pocketbase.cjs --url http://127.0.0.1:8090 --admin-email admin@example.com --admin-password "secret"
    ```

Frontend configuration
- In your project `.env` (copy from `.env.example`), add:
  VITE_POCKETBASE_URL=http://127.0.0.1:8090
  VITE_USE_POCKETBASE=1

- Restart the dev server. The repo contains a small PocketBase adapter stub that will be used when you set `VITE_USE_POCKETBASE=1`.

Notes & limitations
- The adapter in `src/integrations/pocketbase-adapter.ts` is a small compatibility layer and covers the subset of Supabase calls the app uses (auth and simple collection queries). For production you may want to extend it.
- If you prefer not to change the frontend, consider running Supabase locally (we have `supabase/setup.sql`) — that requires Docker + supabase CLI but needs no adapter.

If you want, I can:
- Extend the adapter to cover more query options (filters, sorts, range->pagination mappings).
- Add a small admin serverless endpoint to create users remotely (for automated user onboarding).
