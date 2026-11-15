# Constellation · OPS Diagnostic

A blind, scenario-based cognitive-function quiz inspired by the Objective Personality System (OPS). Takers answer everyday scenes, get their type, subtype and saviors, and can explore every type in a glossary. Results are saved to Supabase, where only the owner can read them.

Live at **https://9bitbin.github.io/TypeConstellation/**

> Built from the Objective Personality framework (Dave & Shan Powers) and personal notes. OPS isn't peer-reviewed science, and a self-report quiz can't see blind spots. Treat results as a starting point for reflection, not a verdict.

---

## Pages

| File | What it is |
| --- | --- |
| `index.html` | The quiz and the full results page |
| `glossary.html` | Every letter, function, type and subtype, plus the function map, your saved result and growth maps |
| `admin.html` | Owner-only dashboard: overview charts, every result, item health, delete |

Test versions (`index_v8.html`, `glossary_v8.html`) hold the newest features until they're folded into the main files.

## How the quiz works

- **36 scenes** across four settings: work, social, alone, and 6 stress scenes. Each one is built fresh from a bank of 14 situations, so no two takes are the same.
- Each scene shows 6 of the 8 functions as answers (2 are left out at random, balanced so every function is dropped equally often).
- You pick your **#1** and **#2**, then say **why** you picked #1:
  - *It's just what I do* (counts most)
  - *I worked hard to get good at this*
  - *It's what I should do*
  - *It avoids something bad*
  - *Depends on the day*
- "None of these" is always allowed.
- Stress scenes are scored separately and don't count toward your type.
- Scoring weighs the why tags, rewards answers that stay consistent across settings, and ranks all 32 subtypes and 16 types.

## The results page

- Type, subtype (balanced = #1 + #2, jumper = #1 + #3), lead (observer or decider) and lead animal
- Your two saviors with their core, the void you leave and the biggest fear
- Your patterns: core functions, what you shift to in each setting, ideal vs. default, stress
- The coins, runners-up and all 16 type likelihoods
- Savior letters, function flow, growth map (by focus: general, work, relationships, big change, motivation, creative block)
- Function explorer: quadrants and stack, with a type picker and observer + decider pairing
- Feedback: fit rating, what felt off, what type you think you are, a note
- Retake, copy result, read the glossary

## The glossary

- Letters & terms, the 8 functions, the 16 types, the 32 subtypes, with search and filters
- **Function map** with four views: Quadrants, Stack, Flow and Path. Pick any type and the map rearranges; the quadrants match the 16-type chart (introverted function on the left of the top row)
- Observer + decider pairing: pick order decides which one leads
- **Your result**: coins and your saved results on this device
- **Growth map** for any type: #1 function, #4 blind spot, stuck loop, relationship pattern to watch, things to try this week. Your own result adds notes from your answers. "Back to my result" switches both the map and the growth map back
- "View full results" opens the full results page for a saved result

## Results history and optional accounts

- **On this device:** each take is saved in the browser (up to 20) with no name and no answers. **View** reopens the full results page; **×** forgets one; "Forget all" clears them.
- **Optional account:** username + password, no email. Results follow you to any device.
  - After signing in you pick which results on the device go into the account.
  - Each result has a **☁ In account / + Account** toggle.
  - New takes while signed in go to the account automatically.
  - Log out removes the account's results from that device; "Delete my account" removes the account and its results.
  - No "forgot password": the owner resets it in Supabase (Authentication → Users).

## Admin

- **Overview:** totals, takes per day, types, fit ratings, accuracy by type, where people disagree, lead animals
- **Results:** searchable list with detail view: stack, quadrants, function flow, coins, insights, all 36 answers, feedback, account tag, delete with a confirm step. Arrow keys move between results; animated maps
- **Accounts:** `@username` tags, an All / With an account / No account filter, `@username` search, and "See all takes on this account"
- **Item health:** how each question is performing

## Privacy

- The public page can only **submit** results. Database rules (RLS) let only the owner email read or delete them.
- Signed-in takers can read only their own results. Nobody can attach a result to someone else's account, and usernames on results are filled in by the database, so they can't be faked.
- Only the public anon key is on the page. Never put the `service_role` key in any page.
- Name and answers are never stored in the browser.

## Setup (Supabase)

Run these in the Supabase **SQL Editor**, in order. Each is safe to run again.

1. `supabase-setup.sql`: results table and owner rules (replace the owner email first)
2. `supabase-update-feedback.sql`: feedback table (replace the owner email first)
3. `supabase-update-v2.sql`: scenario quiz columns
4. `supabase-update-v2_1.sql`: #1 / #2 ranking and "worked hard" list
5. `supabase-accounts.sql`: optional accounts, claim / release, delete account, usernames for admin
6. `supabase-fix-signup-trigger.sql`: only needed in pinned-v2, so its new-user rule doesn't block quiz sign-ups

Then in **Authentication → Sign In / Providers → Email**: keep Email on, turn **Confirm email** off.

Paste your project URL and anon key into `index.html` and `admin.html` (`SUPABASE_URL`, `SUPABASE_ANON_KEY`). Full account steps are in `ACCOUNTS_SETUP.md`.

---

## Updates

### v1 · The first quiz
- Blind OPS cognitive-function quiz on GitHub Pages; takers enter a name first
- Results saved to Supabase (pinned-v2 project), readable only by the owner
- First owner results page

### v1.1 · Feedback
- "Did this fit?" panel: 1–5 fit rating, what felt off, self-reported type, a note
- Feedback table linked to each result (deleted along with it)

### v2 · Scenario quiz
- Rebuilt as 36 scenes across work, social, alone and stress
- Why tags, consistency scoring, core / ideal / stress / per-setting patterns
- Personalized growth guide for the #1 and #4 functions, stuck loops and things to try

### v2.1 · Ranking
- Pick a #1 and a #2 in every scene; dismissed options recorded
- New why tag: "I worked hard to get good at this"

### v3 · Glossary and function map
- New glossary page with letters, functions, types and subtypes, search and filters, and a new color palette
- Function map with the stack layout from the 16-type chart; Function Flow views (all three kept); the original quadrant map kept
- Quadrant side flip, "OBSERVERS · patterns & data" label, one idea per line formatting
- Stack and observer + decider pairing on the results page and in the glossary, with a type picker

### v4–v6 · Maps and polish
- Quadrants arranged per type and matched to the type chart (introverted function on the left of the top row; fixes Ne placement for ENTP / ESTP)
- Relationship patterns to watch, redesigned coins, rainbow buttons
- Shorter privacy line: "Your name and answers are saved so I can improve the quiz."
- Long results page kept as the main results page

### Admin overhaul
- Overview charts, results list with full detail views (stack, quadrants, flow, coins, insights, answers), delete with confirm, animated maps

### v7 · Results history on the device
- Up to 20 past results saved in the browser (no name, no answers)
- "Your results on this device" on the home screen, "Your type changed" note, take number on the results page
- Glossary can switch between saved results

### v8 · Optional accounts and full replays
- Username + password accounts with no email, built on Supabase Auth
- Choose which device results go into your account; ☁ / + toggle per result
- Admin shows `@username` tags, an account filter and "See all takes on this account"
- **View** reopens the full results page for any saved result, including account results on other devices (rebuilt from the saved answers)
- Glossary growth map works for every type, with "Back to my result"
- Clearer sign-up errors; fix for the pinned-v2 new-user trigger blocking sign-ups
