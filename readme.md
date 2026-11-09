<!--
  File: readme.md
  Author: Himal Shrestha
  Description: Repository readme for 9bitbin.github.io.
-->
# 9bitbin.github.io

Himal Shrestha's portfolio hub: IT support and systems, browser games, apps, and music.
Live at **https://9bitbin.github.io**. Plain HTML, CSS and JavaScript, hosted on GitHub Pages. No build step.

## What's on the site

| Address | What it is |
|---|---|
| `/` | Home page. Tabs: Music, Games, Apps, IT tools, Résumé, Contact (keys 1–6 switch tabs) |
| `/#music` | Steampunk music player (gears, beat needle, live wave screen, steam) |
| `/#resume` | Résumé. The PDF is embedded on big screens, text version on phones |
| `/#contact` | Contact form (sent through Formspree) |
| `/pinned/` | Pinned, a shared sticky-note board app (Supabase backend, installable) |
| `/pinned/games/…` | Single-player browser games, also playable inside Pinned |
| `/games/tpt-flappy/` | TPT Flappy |
| `/tools/pdf-toolkit/` | Merge, split, watermark and compress PDFs in the browser |
| `/tools/sop-creator/` | Builds IT standard operating procedures |
| `/side/electronix/` | Electronix Setup price sheet |
| `/404.html` | "Page not found" page (also points old addresses to their new homes) |

## Folders

```
/                index.html, 404.html, resume.pdf, favicon.ico
/assets/         theme.css (shared look), game-theme.css (game menus), game-back.js (games' Back button),
                 favicon + app icons, og-image.png (link preview card)
/music/audio/    the songs (MP3). Add them to TRACKS in index.html
/pinned/         the Pinned app. pinned/supabase/ holds its server functions (see the README there)
/games/  /tools/  /side/
/archive/        old site and unused files (nothing loads these)
```

## Common edits

- **Homepage tiles:** `const MODULES` near the bottom of `index.html`.
- **Songs:** put the MP3 in `music/audio/`, add a line to `const TRACKS` in `index.html`. Keep `src` relative (`music/audio/name.mp3`).
- **Résumé PDF:** replace `resume.pdf` (keep the name).
- **Readout text (LOC / INTEREST / STATUS):** the `rx` block near the top of `index.html`; the interests cycle from `const INTERESTS`.
- **Game Back button:** `assets/game-back.js`. After changing it, bump `?v=` in each game's `<script src="/assets/game-back.js?v=…">`.
- **Pinned updates:** bump `?v=` in `pinned/index.html` (app.js and styles.css) and in the `church.js` import in `pinned/app.js`, and change `CACHE` in `pinned/sw.js`.

## Notes

- `REORGANIZE.md` lists where files moved in Nov 2026 and how to undo it.
- `POLISH-STEPS.md` covers the link preview card, icons and 404 page.
- `index2.html` is the previous homepage (old readout), kept as a backup.
