# Pinned V2 (live version)

Files:
- `index.html`: the app
- `supabase.js`: the Supabase library (bundled, so the app doesn't depend on a CDN)
- `schema.sql`: database setup. Run once in Supabase. Don't upload it to the website.

## 1. Set up the database (5 minutes)
1. Supabase → your project → **SQL Editor** → **New query**.
2. Paste all of `schema.sql` and click **Run**. It should say "Success. No rows returned".

## 2. Auth settings
1. **Authentication → URL Configuration**
   - Site URL: `https://9bitbin.github.io/pinned-v2/`
   - Redirect URLs: add the same address.
2. **Authentication → Sign In / Providers → Email**: leave **Confirm email** on.
   Supabase's built-in email sender has a low hourly limit. That's fine for testing with friends. Set up custom SMTP (Resend, Postmark, etc.) before a public launch.

## 3. Put it online (GitHub Pages)
1. Create a new public repo named `pinned-v2` on your GitHub account.
2. Upload `index.html` and `supabase.js` to it.
3. Repo **Settings → Pages** → Source: **Deploy from a branch** → `main` / `(root)` → Save.
4. After a minute it's live at `https://9bitbin.github.io/pinned-v2/`.

## 4. Make yourself admin
Sign up in the app first, then run this in the SQL Editor (use your username):
```sql
update public.profiles set is_admin = true where lower(username) = 'yourusername';
```
Refresh the app. A **Reports** tab appears for you.

## Optional
- Move unhandled room reports to the admin queue after 48 hours. Turn on the `pg_cron` extension (Database → Extensions), then run:
  ```sql
  select cron.schedule('escalate-reports', '0 * * * *', 'select public.escalate_stale_reports()');
  ```

## What's enforced by the database (not just the page)
- 18+ check at sign-up (birthdate stored privately, never readable by the app)
- Room passwords (hashed), 5 wrong tries → 60-second lockout
- Private rooms hidden from non-members; invite codes
- Bans, blocks, owner/mod powers
- Report routing (room owner vs admin; threats and "seems under 18" go to admin as urgent)
- Rate limits on rooms, notes, strokes, friend requests and reports
- Live channels (cursors, voice signals) only for room members

## Known limits
- Voice connects people directly (peer to peer), up to 6 per room. Some strict networks block it. A TURN server fixes that later.
- "Remove from voice" works in the app, but someone with a modified app could rejoin. To truly keep someone out, remove or ban them from the room.
- Direct messages and room chat aren't built yet.
- People must sign in to browse rooms.
