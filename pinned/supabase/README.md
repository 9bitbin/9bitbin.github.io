# Supabase edge functions

Each folder is ONE edge function. The folder name must match the function name in Supabase exactly.

| Folder | Supabase function name | What it does |
|---|---|---|
| `notify/` | `notify` | Sends push notifications and makes link previews. **Version 5.** Opening `https://skmmwiozlggchzrfsjsn.supabase.co/functions/v1/notify` in a browser should show `"function":"notify","version":5`. |
| `delete-account/` | `delete-account` | Permanently deletes the account of whoever calls it. Used by **Settings → Delete my account** (app v84+). Deploy it as its **own** function named `delete-account`. |

## Warning

Never paste `delete-account` code into the `notify` function. The app calls `notify` for every
notification and link preview, so that would delete the account of anyone who triggers one.
(This happened in Nov 2026: test notifications kicked people out and their rooms looked deleted.)

## Deploying delete-account (dashboard)

1. Supabase > Edge Functions > **Deploy a new function** (do NOT open notify).
2. Name it exactly `delete-account`.
3. Paste all of `delete-account/index.ts`, press **Deploy**.
4. Opening `https://skmmwiozlggchzrfsjsn.supabase.co/functions/v1/delete-account` in a browser should say `"Not signed in"`. That's expected.
5. Re-check that `.../functions/v1/notify` still shows `"version":5`.

## Deploying notify (dashboard)

1. Supabase > Edge Functions > **notify** > Code.
2. Select all, delete, paste all of `notify/index.ts`, press **Deploy**.
3. Check the URL above shows `"version":5`.
4. Secrets (Edge Functions > Secrets) must include `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
