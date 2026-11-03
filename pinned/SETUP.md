# Stuck on You: setup guide

A shared sticky-note board for two phones (iPhone + Android). It installs from the browser to the home screen, so no app store is needed.

Total time: about 30 minutes, once. Everything here is on free plans with **no credit card**.

---

## What's in this folder

| File | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app |
| `config.js` | **The only file you edit**: your Supabase keys go here |
| `sw.js`, `manifest.webmanifest`, `icons/` | What makes it installable and lets it get notifications |
| `keys.html` | Makes your notification keys (runs in your browser) |
| `supabase/schema.sql` | Database setup: paste into Supabase once |
| `supabase/notify/index.ts` | The function that sends "New note from ___" |

**Try it first (optional):** put the folder online (Step 5) before touching Supabase. With `config.js` unchanged it runs in **demo mode**: everything works on one device, and opening a second tab with `?as=2` at the end of the address lets you play the other person.

---

## Step 1: Create a Supabase project

1. Go to **supabase.com** and sign up (GitHub sign-in is easiest).
2. **New project**. Name it `stuck-on-you`, set a database password (save it somewhere), pick the region closest to you (East US).
3. Wait about 2 minutes for it to finish.

## Step 2: Set up the database

1. Left sidebar: **SQL Editor** > **New query**.
2. Open `supabase/schema.sql`, copy everything, paste it in, press **Run**.
3. You should see "Success. No rows returned."

## Step 3: Email sign-in (magic link)

You type your email, tap the link it sends, and you're in. No passwords.

**3a. Database piece.** SQL Editor > New query > paste all of `supabase/email-login.sql` > Run. (Already included if you ran the newest `schema.sql` on a fresh project.)

**3b. Allowed link address.** Authentication > **URL Configuration**:
- **Site URL:** `https://9bitbin.github.io/stuck-on-you/`
- **Redirect URLs** > Add: `https://9bitbin.github.io/stuck-on-you/**`

**3c. An email sender (required).** Supabase's built-in email only sends to people on your Supabase team, max 2 an hour, so your girlfriend's email would be rejected. Brevo's free plan fixes that:
1. Sign up at **brevo.com** (free).
2. **Senders, domains & dedicated IPs** > Senders > add the email you want links to come from and verify it.
3. **SMTP & API** > SMTP tab > **Generate a new SMTP key**. Note the login shown there too.
4. In Supabase: Authentication > **Emails** > **SMTP Settings** > turn on **Enable custom SMTP**:

| Field | Value |
|---|---|
| Sender email | the address you verified in Brevo |
| Sender name | `Stuck on You` |
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | the SMTP login from Brevo |
| Password | the SMTP key from Brevo |

5. Save. Optional: Authentication > Emails > **Magic Link** template, change the subject to something like "Your Stuck on You sign-in link".

**3d. Phones that were already set up** (signed in before email login existed): open the app > gear icon > **Account** > type your email > **Add email** > tap the link in the email. Same profile, same board, nothing lost. After that you can log in on any new phone with that email.

**How sign-in works on iPhone:** the link opens in Safari, not the app. Safari passes the sign-in back to the app and shows "You're signed in". Switch back to Stuck on You and it finishes within a few seconds. Links expire after about an hour and only work once.

## Step 4: Notifications

**4a. Make your keys.** Open `keys.html` in a browser (double-click it, or visit it after Step 5 at `.../stuck-on-you/keys.html`). Press **Generate keys** and keep the page open.

**4b. Add the notify function.**
1. Left sidebar: **Edge Functions** > **Deploy a new function** > **Via Editor**.
2. Name it exactly `notify`.
3. Delete the sample code, paste all of `supabase/notify/index.ts`, press **Deploy**.

**4c. Add the secrets.** Edge Functions > **Secrets** (or Project Settings > Edge Functions). Add three:

| Name | Value |
|---|---|
| `VAPID_PUBLIC_KEY` | the public key from keys.html |
| `VAPID_PRIVATE_KEY` | the private key from keys.html |
| `VAPID_SUBJECT` | `mailto:` followed by your email, e.g. `mailto:you@example.com` |

## Step 5: Fill in config.js and put it online

**5a. config.js.** In Supabase: **Project Settings** > **API** (or **API Keys**). Copy:
- **Project URL** → `supabaseUrl`
- **anon public** key (or **publishable** key) → `supabaseAnonKey`
- Your VAPID **public** key from keys.html → `vapidPublicKey`

Never put the private key or the `service_role` / secret key in config.js.

**5b. GitHub Pages.**
1. On github.com (signed in as 9bitbin): **New repository** named `stuck-on-you`, Public, create.
2. **Add file** > **Upload files**, drag in *everything inside this folder* (including the `icons` and `supabase` folders), **Commit**.
3. Repo **Settings** > **Pages** > Source: **Deploy from a branch**, Branch: `main`, folder `/ (root)`, **Save**.
4. After a minute or two, it's live at **https://9bitbin.github.io/stuck-on-you/**

## Step 6: Install on both phones

**iPhone (needs iOS 16.4 or newer):**
1. Open the link in **Safari** (not Chrome; iPhone only allows installing from Safari).
2. Share button > **Add to Home Screen** > Add.
3. Open **Stuck on You from the home screen icon** (notifications only work from the icon, not the Safari tab).
4. Enter your email > tap the link in your inbox > switch back to the app.
5. Enter your name and color > **Start a new board**. You'll see your 8-character code.
6. Gear icon > Notifications > **Turn on** > Allow.

**Android:**
1. Open the link in **Chrome**.
2. Menu (⋮) > **Add to Home screen** or **Install app**.
3. Open it from the icon, sign in with email (tap the link, come back), enter name and color, then type the code under **Got a code?** > **Join board**.
4. Gear icon > Notifications > **Turn on** > Allow.

Test it: post a note from one phone while the other is locked.

---

## How it works

- **Board:** one shared board. Long-press a note (about a quarter second) then drag to move it; a quick swipe still scrolls. On a computer, just click and drag.
- **Tap a note** to see it bigger, bring it to the front, or remove it (removes it for both of you).
- **Composer (+):** Note (6 paper colors), Emoji (grid or type any), Photo (shrunk to ~1280px before upload), Draw (8 inks, 3 brush sizes, eraser, undo, clear, paper color).
- **Themes:** each phone picks its own in Settings. Cozy corkboard, Pastel, Dark & minimal, Liminal & dreamy.
- **Privacy:** only the two people on a board can read its notes and pictures (enforced in the database, not just the app). A board holds two people max, so once you're both in, the code stops working for anyone else.

## Troubleshooting

| Problem | Fix |
|---|---|
| No sign-in email arrives | Check spam. Check Step 3c (custom SMTP on, sender verified in Brevo). Supabase > Authentication > Logs shows send errors. |
| "That link expired or was already used" | Send a new one. Always tap the newest email. |
| Tapped the link but the app still says "Check your email" | Make sure Step 3b is saved, then switch back to the app and wait 5 seconds. |
| Notifications say "Add to Home Screen first" on iPhone | Open it from the home-screen icon, not Safari |
| No notification arrives | Check the other phone turned notifications on. Supabase > Edge Functions > notify > **Logs** shows errors. Re-check the three secrets. |
| Android notifications late | Settings > Apps > Chrome (or Stuck on You) > Battery > **Unrestricted** |
| New version not showing | Close the app fully and reopen it twice |
| Lost a phone or reset it | If you added your email: just sign in again with it. If not: on the other phone, Settings > On this board > **Remove** the old one, then rejoin with the code |
| "This needs the latest database update" | Run `upgrade-v2.sql` (Upgrade to v2, step 1) |
| Scheduled note never notified | Check step 1 finished without errors, and that the notify function says version 2 |
| Supabase says the project is paused | Free projects pause after about a week with no use. Press **Restore** in the dashboard. |

Free-tier limits that matter here: 500 MB database and 1 GB file storage. That's thousands of photos.

---

## Upgrade to v2 (reactions, voice notes, scheduled notes and more)

Do these in order, about 5 minutes:

1. **Database.** Supabase > SQL Editor > New query > paste all of `supabase/upgrade-v2.sql` > **Run**. It should end with a number (that's the timer job being created). Safe to run twice.
2. **Notify function.** Edge Functions > notify > Code > paste the new `supabase/notify/index.ts` over everything > **Deploy**. Visit `https://skmmwiozlggchzrfsjsn.supabase.co/functions/v1/notify` and check it says `"version":2`.
3. **App files.** Upload the new `app.js`, `index.html`, `styles.css` and `sw.js` to GitHub.
4. **Phones.** Close the app fully on both phones and reopen it twice.

**What's new**

| Feature | Where |
|---|---|
| Reactions ❤️ 😂 🥺 😍 🔥 👍 | Tap a note |
| Replies | Tap a note, type at the bottom |
| ✓ Seen | Shows on your notes once the other person has opened the board |
| Your pin color | Pins, tape and strips match each person's color |
| Pin to top 📌 | Tap a note > Pin (it stays on top and can't be dragged by accident) |
| Voice notes | + > Voice (up to 60 seconds) |
| Send later ⏰ | + > any note > Send later. Hidden from the other person until its time, then it notifies them |
| Countdown | + > Countdown |
| Draw together 🎨 | Bottom-left > Together. You both draw live on the same canvas; Stick it saves it to the board |
| Daily question ❓ | Bottom-left > Today. You see their answer once you've both answered |
| Check in 💭 | Bottom-left > Check in. Feelings send a notification; your mood shows on your bubble for 24 hours |
| Mute some notifications | Settings > Notifications (new notes always notify) |

**Good to know**
- Scheduled notes are checked once a minute, so they can arrive up to a minute late.
- The draw-together canvas isn't saved until someone taps **Stick it**. If you both close it, it's gone.
- Voice notes recorded on Android may not play on an older iPhone (before iOS 17). Update iOS if one won't play.

---

## Upgrade to v3 (join another board, leave, delete and start over)

1. Supabase > SQL Editor > New query > paste `supabase/upgrade-v3.sql` > **Run**.
2. Upload the new `app.js`, `index.html`, `styles.css` and `sw.js` to GitHub.
3. Close and reopen the app twice on both phones.

Then in **Settings > Board**:

| Option | What happens |
|---|---|
| Join a different board | Type a code. You move to that board and leave the current one (the other person keeps it). A wrong code leaves you where you are. |
| Leave this board | You go back to the start-or-join screen. The board stays for the other person. |
| Delete board and start over | Erases the board and everything on it for both of you. Only the person who made the board can do this (or whoever is alone on it). It asks twice. |

Only the board's creator can remove the other person.

---

## Upgrade to v4: Phase 1 (endless board)

1. Supabase > SQL Editor > paste `supabase/upgrade-v4.sql` > **Run** (v2 and v3 must already be run).
2. Upload `app.js`, `index.html`, `styles.css`, `sw.js` to GitHub.
3. Close and reopen the app twice on every phone.

| Feature | How |
|---|---|
| Up to 10 people | Share the code; the 11th person gets "That board is full" |
| Endless board | Drag empty space to move around, pinch to zoom (computer: drag, scroll wheel to zoom) |
| Move a note | Press and hold it, then drag (computer: just drag) |
| 🏠 Home | Jumps back to the newest notes |
| 👀 Find | Jumps to where someone else is looking (with several people online, opens the people list) |
| ✏️ Draw on the board | Pencil button. One finger draws, two fingers move/zoom. You can only erase or undo your own lines |
| Live cursors | Everyone sees each other's pointer or finger with their name |
| People panel | Tap the name bubbles at the top: Online, Active now, or Last seen, plus Find |

---

## iPhone notifications fix (notify function v3)

Apple rejects notifications whose contact is a placeholder like `mailto:you@example.com` (Android accepts it). The function now ignores placeholders and uses the app's web address instead.

1. Supabase > Edge Functions > notify > paste the new `supabase/notify/index.ts` > **Deploy**. The function page should say `"version":3`.
2. Optional: set the `VAPID_SUBJECT` secret to `mailto:` plus an email you actually use.
3. Upload the new app files to GitHub, then on the iPhone open Pinned from the home screen > gear > Notifications > **Reset**.
4. Still nothing? Remove the home-screen icon, add it again from Safari, open it, and turn notifications on again.

---

## Upgrade to v5: Phase 1.5 (resize, rotate, flip, edit)

1. Supabase > SQL Editor > paste `supabase/upgrade-v5.sql` > **Run** (v2, v3 and v4 first).
2. Upload `app.js`, `index.html`, `styles.css`, `sw.js` to GitHub.
3. Close and reopen the app twice on every phone.

| Action | How |
|---|---|
| Select | Tap something you made (the owner can select anything) |
| Open it | Tap it again, or **Open** |
| Resize | Drag any corner dot, or pinch it with two fingers |
| Rotate | Drag the top dot, twist with two fingers, or ⟲ ⟳ (15° steps). Snaps straight near 0/90/180/270° |
| Flip | ⇋ left-right, ⇵ upside down |
| Reset | Back to normal size, straight, unflipped |
| Edit | **Edit**: text and color, emoji, caption or swap the photo, countdown name/date/color, paper color |
| Your board lines | Tap a line you drew to select it: drag to move, resize, rotate, flip or delete |
| Done | **Done**, or tap empty space |

Rules: anyone can still move notes. Only the person who made something, or the board owner, can resize, rotate, flip or edit it (enforced by the database). Board lines can only be changed by whoever drew them. Text grows with the note.

---

## Upgrade to v6: Phase 2 (messages, backgrounds, playlists)

1. Supabase > SQL Editor > paste `supabase/upgrade-v6.sql` > **Run** (v2–v5 first).
2. Supabase > Edge Functions > notify > paste the new `supabase/notify/index.ts` > **Deploy** (page should say `"version":4`).
3. Upload `app.js`, `index.html`, `styles.css`, `sw.js` to GitHub.
4. Close and reopen the app twice on every phone.

| Feature | How |
|---|---|
| Messages | 💬 Chats (bottom left). "Everyone" is the group chat; each person has a private 1-on-1 thread. Photos with 📷, "typing…", ✓ Seen / Seen by N |
| Background (owner) | Settings > Background: choose **Shared for everyone** or **Each person picks**, then a color, image, GIF or video (muted, loops, up to 15 s, 10 MB) |
| Background (members) | Shared mode: **Suggest an image or GIF**. The owner gets a notification, previews it in Settings, and approves or declines; you're told which. Personal mode: pick your own color, image or GIF |
| Music cards | + > Music > paste a Spotify, YouTube, Apple Music or SoundCloud link. Tap ▶ on the card to play it right there, ■ Stop to stop. Other links pin as a card with ↗ |

Notes: Spotify plays 30-second previews unless you're logged in to Spotify in that browser. Music stops when the app is closed on iPhone. New mutes in Settings: Messages, Background requests, Background replies.


---

## Live location (opt-in, both ways)

No database or notify changes. Upload `app.js`, `index.html`, `styles.css` and `sw.js` to GitHub, then close and reopen the app twice on every phone.

| Thing | How it works |
|---|---|
| Open it | 📍 button on the right (above 👀). Slides in from the right as its own panel, separate from the board |
| Turn on | Flip **Share my live location**. Your phone asks permission once; allow it. It uses high-accuracy GPS |
| See others | Everyone who's sharing shows up with how far and which way they are from you (e.g. "1.9 mi NE"), their GPS accuracy, when it last updated, and a **Map** button |
| Turn off | Flip it off any time — your location clears for everyone right away |

Important notes:
- It's **both ways**: if you can see someone, they can see you. There's no hidden mode.
- It only works **while Pinned is open** on each person's phone. Phones (especially iPhone) stop web apps from reading location in the background, so this isn't 24/7 tracking like Find My — that would need a real native app.
- Locations are **live only** — they're sent phone-to-phone through the live channel and never saved in the database.
- Your choice is remembered per board, so if you leave it on it comes back on next time you open that board (your phone may ask permission again).

---

## Batch A: Polish & trust (front-end only)

No database or function changes. Upload `app.js`, `index.html`, `styles.css`, `sw.js` to GitHub, then close and reopen the app twice on every phone.

What changed:
- **Reduced motion** — animations and emoji rain now respect your phone's "Reduce Motion" setting.
- **Haptics** — a gentle buzz when you stick a note, send a message, or win. Toggle it in Settings > Feel (Android; iPhone web has no vibration).
- **Failed-send retry** — if a note or message can't send, you get a toast with a one-tap **Retry** instead of it silently vanishing.
- **Invite link + QR** — the waiting banner now has **Share invite** (sends a tap-to-join link with the code built in) and a **QR** button to scan. Opening a `?join=CODE` link prefills the code automatically.
- **Loading skeleton** — a shimmer of placeholder notes while a board loads, instead of a blank screen.
- **Remembers your last** composer tab, note color and pen color.
- **Notification health check** — Settings now shows whether this phone is actually registered for push ("On · this phone is registered ✓" vs "tap Reset"), and Reset is always available when notifications are on.
- **App version** shown at the bottom of Settings, so it's obvious when a phone is on an old cached build.
- **Contrast** — darkened the muted text in the cork and pastel themes for readability.
- **Safer delete** — deleting a board now spells out how many notes and what else will be erased.

Note: the QR code loads a tiny library from the same CDN the app already uses; if it can't load, the QR button falls back to copying the invite link.

---

## Batch B: Reliability & confidence (front-end + a monitoring helper)

No schema or function changes. Upload `app.js`, `index.html`, `styles.css`, `sw.js` to GitHub, then reopen the app twice on every phone. `supabase/monitoring.sql` is optional read-only queries you can paste anytime.

What changed:
- **Offline queue** — if you're offline (or the send fails), a text note or message is saved with a ⏳ badge and sends itself when you're back. Nothing is lost.
- **Connection banner** — a bar shows "You're offline / Reconnecting… / Back online — sending…".
- **Auto-reconnect** — realtime resubscribes with backoff after a drop, and flushes anything queued.
- **Board undo/redo** — ↶ ↷ buttons (and Ctrl/Cmd-Z / Shift-Z) undo a move, edit, delete or new note. Session-local, best-effort on a shared board.
- **Read-receipt fix** — "seen" now re-syncs on reconnect, on resume, and every 30s, not only on live events.
- **Usage monitoring** — `monitoring.sql` shows row counts, DB size, media storage used, orphaned files, and free-tier guideposts.

Note: media notes (photos, voice, drawings) still need a connection; only text/emoji notes and text messages queue offline.


---

---

## Upgrade to v11: drawing board tools (fill and text)

The drawing board has a palette: pen, marker, highlighter, eyedropper, fill bucket, text, eraser, undo, and zoom.
Fill and text need two new columns on the strokes table.

1. Supabase > SQL Editor > paste `supabase/upgrade-v11.sql` > **Run**.
2. Pen, marker, highlighter, eyedropper, undo, and zoom work without it.

## Upgrade to v12: profile picture fix

Profile picture uploads failed with `invalid input syntax for type uuid: "avatars"`. The photo rules read the first folder name as a board ID.

1. Supabase > SQL Editor > paste `supabase/upgrade-v12.sql` > **Run**. It replaces the three photo rules and adds profile picture rules.
2. Check a board photo still uploads, then try the profile picture again.

## Removed: Delete my account

The delete-account feature was removed in v20. If you deployed the `delete-account` function in Supabase, delete it there (Edge Functions > delete-account > Delete).
