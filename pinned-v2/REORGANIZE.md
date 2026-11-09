<!--
  File: REORGANIZE.md
  Author: Himal Shrestha
  Description: Notes on the November 2026 file reorganize (old paths and where they moved).
-->
# File reorganize (Nov 2026)

The site files were sorted into folders and all links were updated to match.
Nothing was deleted. Unused files were moved to `archive/unused/`.

## What moved where

| Old location | New location |
|---|---|
| `theme.css` | `assets/theme.css` |
| `game-theme.css` | `assets/game-theme.css` |
| `game-back.js` | `assets/game-back.js` |
| `Himal_PDF_Edit_toolkit.html` | `tools/pdf-toolkit/index.html` |
| `SOP_creator.html` | `tools/sop-creator/index.html` |
| `TPTFlappy.html` | `games/tpt-flappy/index.html` |
| `electronix-setup.html` | `side/electronix/index.html` |
| `old-index.html` | `archive/old-site/old-index.html` |
| `contact.html` | `archive/old-site/contact.html` |
| `styles.css` (old site's CSS) | `archive/old-site/styles.css` |

New web addresses:
- PDF Toolkit: `/tools/pdf-toolkit/`
- SOP Creator: `/tools/sop-creator/`
- TPT Flappy: `/games/tpt-flappy/`
- Electronix price sheet: `/side/electronix/`
- Old site: `/archive/old-site/old-index.html`

Old addresses like `/TPTFlappy.html` no longer work (no redirects were added).

## Unused files (moved to `archive/unused/`)

Nothing on the site loads these. Safe to delete for good if you don't need them.

| File | What it is |
|---|---|
| `script.js`, `scriptz.js` | Scripts from an old Mother's Day page (the page itself is no longer in the repo) |
| `style.css`, `stylez.css` | Styles for that same Mother's Day page |
| `MUSIC_SETUP.txt`, `README_FIXED.txt` | Notes for that Mother's Day page |
| `SOP_creator.md` | Empty file |
| `pinned/hi dave.txt` | Empty file |

## Links that were updated

- `index.html`: tile links for PDF Toolkit, SOP Creator and TPT Flappy.
- All 12 games in `pinned/games/`, `pinned/larry_the_cat.html` and TPT Flappy: `/game-back.js` to `/assets/game-back.js`, and `/game-theme.css` to `/assets/game-theme.css`.
- PDF Toolkit, Pinned privacy and keys pages: `/theme.css` to `/assets/theme.css`.
- Old site pages: logo link `index.html` to `/`.

## Known issue (not caused by the move)

TPT Flappy loads `tpt-logo.png`, which isn't in the repo, so its logo image is missing.
To fix it, put the image at `games/tpt-flappy/tpt-logo.png`.

## How to undo

Everything was done in one commit named **"Reorganize files into folders"**.

Undo it (keeps history, safe on a shared repo):

```bash
git log --oneline --grep "Reorganize files into folders"   # copy the commit id
git revert <commit id>
git push
```

If later commits touched the same files, `git revert` may ask you to fix conflicts.
In that case, use the table above to move files back by hand and change the links back.
