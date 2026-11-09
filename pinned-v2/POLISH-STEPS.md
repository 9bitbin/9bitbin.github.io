<!--
  File: POLISH-STEPS.md
  Author: Himal Shrestha
  Description: Notes on the site polish pass and any follow-up steps.
-->
# Quick polish: what was added and what you might need to do

Everything below is already live. **Nothing is required from you.** The optional steps are there if
you want to check things or change them later.

## 1. Link preview card

**What it does:** when you paste `https://9bitbin.github.io` into LinkedIn, Discord, iMessage, Slack or X,
it now shows a brass card with your name instead of a blank box.

- Image: `assets/og-image.png` (1200 × 630)
- Text: the `og:` and `twitter:` lines in the `<head>` of `index.html`

**Optional: check it / refresh old previews**
Sites remember previews for a while. If you shared the link before today, it may still show the old (blank) one.
1. LinkedIn: open https://www.linkedin.com/post-inspector/ , paste `https://9bitbin.github.io`, press **Inspect**. This also refreshes LinkedIn's copy.
2. Discord: previews refresh on their own within a day. Adding `?v=2` to the end of the link forces a fresh one.
3. Facebook: https://developers.facebook.com/tools/debug/ then **Scrape Again**.

**Optional: change the text on the card**
Ask Claude, or edit the `og:title` / `og:description` lines in `index.html`.
To change the picture itself, replace `assets/og-image.png` with a new 1200 × 630 image (same name).

## 2. Icons (browser tab + phone home screen)

**What it does:** a brass gear with a green light shows in the browser tab, bookmarks, and on a phone's
home screen if someone adds your site there.

- `favicon.ico` (root): browsers use it automatically on every page
- `assets/favicon.svg`, `assets/favicon-32.png`: sharper versions, linked from the homepage and 404 page
- `assets/apple-touch-icon.png`: iPhone/iPad home-screen icon
- Pinned keeps its own icons (`pinned/icons/`)

**Optional:** browsers hold on to old tab icons. If you still see the old one, open the site in a private
window, or clear the site's data.

## 3. "Page not found" page

**What it does:** any address that doesn't exist on the site shows a steampunk 404 page (a pressure gauge
that drops to zero) with buttons to Home, Games, Music and Contact.

It also knows the **old addresses from the reorganize** and offers a button to the new place, for example:
`/TPTFlappy.html` → `/games/tpt-flappy/`, `/Himal_PDF_Edit_toolkit.html` → `/tools/pdf-toolkit/`.

**Optional: test it** by opening https://9bitbin.github.io/TPTFlappy.html

**If you move a page later:** add the old and new address to `const MOVED` at the bottom of `404.html`.

## 4. README

`readme.md` now describes the current site (it used to describe the old purple site).

## 5. Things left as they are (your call)

- **TPT Flappy logo:** the game draws its own logo. If you want the real one, put the image at
  `games/tpt-flappy/tpt-logo.png` and the game uses it automatically. It's TransPerfect's logo, so only add it
  if you're allowed to use it.
- **`index2.html`:** the previous homepage. Delete it whenever you're happy with the new one.

## Undo

Each piece is its own file, so removing one doesn't affect the rest:
- Preview card: delete the `og:` / `twitter:` lines in `index.html` (and `assets/og-image.png`)
- Icons: delete `favicon.ico`, the `assets/favicon*` and `assets/apple-touch-icon.png` files, and the
  `<!-- icons -->` lines in `index.html`
- 404 page: delete `404.html` (GitHub falls back to its plain 404)
