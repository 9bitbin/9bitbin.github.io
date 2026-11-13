# Changelog

## v2.1 (constellation-v2.1) — ranking + full playlist pass
**Source:** all 14 videos in the "important." playlist, read in full (including Se-ExxPs and Te-ExxJs, which now have transcripts, and the new Fe-ExxJs).

**Quiz**
- Ranking: tap #1 (most you), then #2 (next most). The other 4 are dismissed. Tap a pick again to undo it, and Esc resets the scene. The strength scale is removed.
- "Why your #1?" on every scene, with a new option, "I worked hard to get good at this." Dave's core tell is whether a behavior is automatic (savior) or worked up to (demon).
- 2 new behaviors (14 total, 56 scenes): "When a conversation gets uncomfortable" (people vs things, a direct observer/decider tell) and "Where you think and feel best" (talk it out = Te, alone = Ti, own feelings = Fi, everyone's feelings = Fe).
- Rewrote 15 options that said "what I care about / what matters to me." Per the transcripts, everyone cares about their 4th function, so caring isn't savior evidence.
- A take is still 36 scenes: 8 behaviors get 3 scenes and 6 get 2. Every behavior keeps at least 2 regular scenes for consistency, plus 6 stress scenes.

**Scoring:** #1 = 1.0 × why weight, #2 = 0.5. "Worked hard" = ×0.5 and feeds a new "Automatic vs. built up" card. The uncomfortable-conversation behavior also adds observer/decider evidence, balanced 4/4 so random answers don't skew it.

**Explorer fix:** bubble size now always follows stack position (1 > 2 > 3, then a big drop to 4), per Dave's Function Stacks video. Jumpers keep the #2 naturally bigger, ring the #3 as a savior, and get a steeper drop to #4. v1.3 had wrongly swapped #2 and #3 for jumpers.

**Data / admin:** answers save #1, #2, the dismissed options and the why. New learned_fns column. Admin shows #1/#2/dismissed per scene, "Worked hard to build," and the top #2 per scene in Item health.

**Tests run:** 32/32 subtypes and types recovered (average confidence 0.82). 20,000 random takes: every type between 5.6% and 7.1%, 98% flagged loose. 200/200 inconsistent takes flagged. Balance and structure checked across 300 takes. Browser runs by mouse (desktop, including undo and skipping the why) and by keyboard (390px) had no errors. Postgres chain v1 → v2 → v2.1: all versions coexist, the public can't read them, bad values are rejected. Admin had no overflow on desktop or phone.
**Not tested:** your live Supabase project and real people.

## v2 (constellation-v2)
**Quiz**
- Replaced the 32 fixed questions with a 48-scene bank: 12 behaviors × 4 settings, 384 options. Each take draws 36 scenes: 30 regular and 6 stress.
- Each scene shows 6 of 8 options, one per function. Which 2 are left out rotates, so every function appears equally often (exactly 27 times). Option order is shuffled, and the same behavior never appears twice in a row.
- After picking an option, a 5-point strength scale appears (A little → Exactly me). The default is "Mostly" if skipped.
- On 9 scenes, an optional "Why that one?" tag: just what I do (×1.2), what I should do (×0.5), avoids something bad (×0.8, feeds the blind-spot section), depends on the day (×0.6).
- "None of these fit me" escape on every scene. Keyboard support: 1–6 pick, 1–5 strength, 1–4 why, Enter next, Esc re-pick, ← back. Shows "about X min left."

**Scoring**
- Evidence = strength × why weight. A pick counts ×1.5 if it's the person's consistent choice for that behavior (same function in 2+ settings), ×0.75 if not.
- Subtypes are scored from function evidence (dom weighted 1.0, second savior 0.7). Coins now show each side's probability across the subtype results.
- Consistency is counted by function only. Counting "same coin side" would make every take 100% consistent, because 3 picks always put at least 2 on one side.
- Stress scenes are excluded from type scoring and feed a separate "Under stress you go to" profile.
- "Loose read" when consistency is under 35% or the top subtype is under 25%.

**Results:** new "Your patterns" cards (core default + consistency, you adapt when…, who you think you should be, under stress). The growth guide uses fear tags, "should" tags and the stress profile, and points "Try this week" at the setting where you were least consistent.

**Data:** answers now save scene, scenario, the 6 shown options, the pick, strength, why and none-fit. New columns: consistency, core_default, context_fns, ideal_gap, stress_profile. The size limit was raised.

**Admin:** Consistent % and Core default columns, a Patterns box, v2 answer display (v1 still supported), and the Item health tab.

**Tests run**
1. Ideal respondent for every subtype across 20 random takes: 32/32 subtypes and 32/32 types recovered.
2. 20,000 random takes: every type between 6.0% and 6.5% (target 4–9%). 93% of random takes flagged "loose."
3. Inconsistent respondent: 200/200 under 35% consistency and flagged loose.
4. Balance: every function shown equally (±1), no back-to-back behaviors, always 36 scenes / 6 stress / 9 why, checked across 300 takes.
5. Headless browser, desktop by mouse and 390px mobile by keyboard, with mocked Supabase: no console errors, payload matches the schema.
6. Migration on Postgres 16 with Supabase auth stubs: v1 and v2 rows insert, strangers and other users read 0 rows, the owner reads all, bad values rejected.

**Not tested:** the live Supabase project itself, and real people. Fit ratings and Item health will show how it performs.

## v1.3 — explorer bubbles sized by stack order and subtype
## v1.2 — function explorer
## v1.1 — growth guide + feedback
## v1 — Constellation quiz, Supabase saving, admin page
