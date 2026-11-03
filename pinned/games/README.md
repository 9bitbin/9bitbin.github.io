# Games (single player)

Each game lives in its own folder with an index.html. The header comment at the top of each file explains the game, its rules, scoring and controls.

| Folder | Game | Notes |
|---|---|---|
| quick-draw/ | Quick Draw | Reaction game. Tap to shoot when the pad turns green. (formerly Reaction Duel) |
| tower-tap/ | Tower Tap | 3D stacking, uses Three.js. (formerly Stack 3D) |
| tetra-stack/ | Tetra Stack | Falling-block puzzle. (formerly Block Drop) |
| four-feud/ | Four Feud | Connect Four vs the computer. (formerly Connect Four) |
| box-claim/ | Box Claim | Dots and boxes vs the computer. (formerly Dots and Boxes) |
| word-gallows/ | Word Gallows | Hangman. (formerly Hangman) |
| bullseye-drop/ | Bullseye Drop | Timing game. (formerly Pin Drop) |
| matrix-flap/ | Matrix Flap | One-tap flyer. (formerly Flappy Matrix) |
| paper-glide/ | Paper Glide | Hold-to-climb flyer. (formerly Paper Plane) |
| lantern-hop/ | Lantern Hop | Charge-and-hop game. (formerly Hop) |
| neon-kestrel/ | Neon Kestrel | Endless one-button flyer. Largest game. |
| parry-brawl/ | Parry Brawl | Platform fighter vs the CPU. Parry to stun and punish. |

## Shared files (games/shared/)
- solo.js: single-player stand-in for the old multiplayer bridge. Race is always off.
- lib/: rules for Quick Draw, Four Feud, Box Claim and Word Gallows.
- vendor/three.module.js: Three.js, used by Tower Tap.

Games load shared files with relative paths, so serve the folder over a web server (not by opening files directly).
