# GuideMe SPA (Vite + React Router + Supabase)

Pure client-side React SPA. No SSR, no TanStack. Talks directly to Supabase from the browser.

## Run locally

```bash
cd spa-export
npm install      # or: bun install / pnpm install
npm run dev
```

Open http://localhost:5173

## Configuration

Credentials are in `.env`:

```
VITE_SUPABASE_URL=https://usxrskkuxztbrocatpfz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_nud214IQuEYeIcEcWvbSwQ_LMYu8aa9
```

## Supabase dashboard setup

In **Authentication → URL Configuration**, add to "Redirect URLs":

- `http://localhost:5173/login`
- `http://localhost:5173/reset-password`

And set **Site URL** to `http://localhost:5173`.

## Routes

| Path | Page |
| --- | --- |
| `/login` | Email + password sign in |
| `/register` | Sign up (sends confirmation email) |
| `/forgot-password` | Sends reset email |
| `/reset-password` | Landing page for reset email link |
| `/change-password` | Update password while signed in |
| `/` | Tiny home that shows session status |

## What's next

Once auth works on your machine, the same pattern (`supabase` client + react-router page) can be used to port the rest of the app (dashboards, mentors, settings, etc.).
