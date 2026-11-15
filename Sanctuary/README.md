THE SANCTUARY - FOLDER GUIDE
============================

PLAY THIS ONE
  Sanctuary v31 - full new-game reset (latest).html

  From v21 on, the build number is shown on the title screen and in the
  bottom-right corner, so you can always confirm what you are running.

Just double-click it. Nothing to install. Three.js loads from a CDN, so the
first run needs an internet connection.

Full feature list for every version is in "Sanctuary Changelog.txt".

From v29 the title screen is the "gate" layout: one lit "begin", the two
shortcuts on a line below it, and "settings" / "controls" links that open those
panels in place. See "title screen.png".

The old per-layout previews (title screen - quiet/threshold/gate.png) are
obsolete and can be deleted.

"Sanctuary - story summary.txt" is the plot, the cast and both endings.
It carries full spoilers after its first section, which is marked.


-----------------------------------------------------------------------------
STALE FILENAMES YOU CAN DELETE
-----------------------------------------------------------------------------
Older versions were each tagged "(latest)" when they were current, and those
tags were never cleared, so several files still claim to be the latest build.
Only v19 is.

These are superseded duplicates. Deleting them loses nothing - the correctly
named copy of each is already in the folder:

  Sanctuary v07 - mouse-click Auditor fight (latest).html
  Sanctuary v08 - cutscene zoom, struggle hold (latest).html
  Sanctuary v12 - subtitle styles, main menu (latest).html
  Sanctuary v13 - wall run fix (latest).html
  Sanctuary v14 - dialogue fixes, line skipping (latest).html
  Sanctuary v16 - carry the cat, detailed characters (latest).html
  Sanctuary v17 - cat petting, carrying, lively streets (latest).html
  Sanctuary v18 - sanctuary cat cameos (latest).html
  Sanctuary v19 - black cat, rich animation, purring (latest).html
  Sanctuary v20 - real dodge animations (latest).html
  Sanctuary v21 - version stamp, dodge controls (latest).html
  Sanctuary v22 - dodge latch fix (latest).html
  Sanctuary v23 - dodge leak fix (latest).html
  Sanctuary v24 - live dodge marker (latest).html
  Sanctuary v25 - DIAGNOSTIC dodge readout (latest).html
  Sanctuary v26 - numpad shift fix (latest).html
  Sanctuary v27 - diagnostic toggle in settings (latest).html
  Sanctuary v28 - title screen picker (latest).html
  Sanctuary v29 - gate title screen (latest).html
  Sanctuary v30 - new game resets the cat (latest).html

Afterwards the folder reads cleanly: v01 through v31, with "(latest)" on v31
and nothing else.


-----------------------------------------------------------------------------
VERSION ORDER
-----------------------------------------------------------------------------
  v01  church walk - the first playable version
  v02  story, combat, hair
  v03  sound settings
  v04  parkour, ragdoll, courtyard
  v05  boss, crypt, flight, code vision
  v06  better characters, talking mouths
  v07  mouse-click Auditor fight
  v08  cutscene zoom, struggle hold
  v09  combos, falls, Rogue Assassins
  v10  subtitle backgrounds
  v11  prologue, trailer, achievements, wall running
  v12  subtitle styles, main menu
  v13  wall run fix
  v14  dialogue fixes, line skipping
  v15  cat visibility      <- did not work; identical to v14 in behaviour
  v16  carry the cat        <- cat features present but unreachable
  v17  cat petting, carrying, lively streets   <- where the cat actually works
  v18  sanctuary cat cameos
  v19  black cat, rich animation, purring
  v20  real dodge animations
  v21  version stamp, dodge controls
  v22  dodge latch fix
  v23  dodge leak fix
  v24  live dodge marker
  v25  DIAGNOSTIC dodge readout
  v26  numpad shift fix
  v27  diagnostic toggle in settings
  v28  title screen picker
  v29  gate title screen
  v30  new game resets the cat
  v31  full new-game reset                     <- CURRENT

v15 and v16 are kept only as history. Their intended features all work from
v17 onward; the changelog explains exactly what was broken and why.


-----------------------------------------------------------------------------
THE CAT, IN SHORT
-----------------------------------------------------------------------------
  E       pet the cat (5 seconds), then E again to pick it up
  ']'     set the cat down

  Carry it through the gate and set it down in the courtyard or the nave and
  the congregation starts noticing it, and you unlock "A Gentler Path".
  Where you leave it is remembered between sessions.

  If you never pick the cat up, the story plays exactly as it always did.

  From v31: begin / skip prologue / skip to the awakening / new game + reset
  the whole run - the cat, every line of prologue dialogue, the crypt captions,
  the lore pages you had found, the old checkpoint, and the cat achievement.
  Continue keeps all of it. Your best time, new game +, and every other
  achievement are kept either way.


-----------------------------------------------------------------------------
THE GENTLE PATH
-----------------------------------------------------------------------------
  Hold SHIFT as you answer any fight prompt and you evade instead of striking:

    Shift + number   in the quick-time clashes
    Shift + click    in the Auditor's fight
    Shift            in the Rogue Assassins' live melee

  HOLD Shift through the whole string. A clash is several presses ("1 / 2"),
  and before v22 only the last one counted - letting go part-way turned your
  dodge back into a strike. While it is armed the prompt says DODGE and turns
  green, so you can see it registered.

  The dodge is decided by the press that answers the prompt. Holding Shift to
  sprint does NOT arm it, and it never carries into the next fight.

  From v24: hold Shift while a prompt is up and the ring turns GREEN and reads
  DODGE before you press.

  NUMPAD: Windows cancels Shift when you press a numpad digit while holding it,
  so Shift+numpad never reached the game before v26 and always struck. v26
  detects and undoes that. The top number row was never affected.

  From v27 the readout is OFF by default. Turn it on under DIAGNOSTIC at the
  bottom of the settings panel, or press BACKSLASH. The choice is remembered.

  Get all the way through without striking once and the ending changes - the
  sanctuary welcomes you home rather than simply remembering you.
