# Supabase edge functions

Each folder is ONE edge function. The folder name must match the function name in Supabase exactly.

| Folder | Supabase function name | What it does |
|---|---|---|
| `notify/` | `notify` | Sends push notifications and makes link previews. **Version 5.** Opening `https://skmmwiozlggchzrfsjsn.supabase.co/functions/v1/notify` in a browser should show `"function":"notify","version":5`. |
| `delete-account/` | `delete-account` | Permanently deletes the account of whoever calls it. **The app does not use this.** Don't deploy it unless a "delete my account" button is added. |

## Warning

Never paste `delete-account` code into the `notify` function. The app calls `notify` for every
notification and link preview, so that would delete the account of anyone who triggers one.
(This happened in Nov 2026: test notifications kicked people out and their rooms looked deleted.)

## Deploying notify (dashboard)

1. Supabase > Edge Functions > **notify** > Code.
2. Select all, delete, paste all of `notify/index.ts`, press **Deploy**.
3. Check the URL above shows `"version":5`.
4. Secrets (Edge Functions > Secrets) must include `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
