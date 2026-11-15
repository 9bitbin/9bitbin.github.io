SANCTUARY - CHANGELOG
=====================

Current build: v31 - full new-game reset
A single self-contained HTML file. Open it in a browser; nothing to install.
Three.js r128 loads from cdnjs, so the first run needs an internet connection.


-----------------------------------------------------------------------------
v01 - Church walk
-----------------------------------------------------------------------------
  - First-person walk through an Orthodox church
  - Glossy marble floors with real reflections, stained glass, rose window, sunbeams
  - Footsteps on stone and gravel; Orthodox choir swells when you cross the threshold
  - Everything made in code: no image or audio files needed

-----------------------------------------------------------------------------
v02 - Story, combat, hair
-----------------------------------------------------------------------------
  - Hell mode: altar button slams the doors, gong, heavy metal, red fog, ghosts and ghouls
  - Original Matrix-inspired story: the Auditor (villain), congregation characters with lines
  - Possession cutscene with the Auditor's long monologue
  - Awakening as the Witness, switch to third person
  - Combat: press the flashing number, hold E for 6 seconds to free people, freed people sit in shock
  - Health bars for you and the enemy
  - Full human bodies, green Matrix code on every transformation
  - Smooth blended animation (walk, run, punch, lunge, thrash), safe camera with mouse look
  - Hair with physics (Witness has long black hair)
  - Checkpoint saves

-----------------------------------------------------------------------------
v03 - Sound settings
-----------------------------------------------------------------------------
  - Volume sliders on the pause screen (choir, music, voices, effects)

-----------------------------------------------------------------------------
v04 - Parkour, ragdoll, courtyard
-----------------------------------------------------------------------------
  - Muscle-shaped arms and legs
  - Jump; sprint at a wall to run up it and backflip in slow motion
  - Hold right mouse to ragdoll anyone
  - Spooky courtyard: grass in the wind, glowing mushrooms, graves, dead trees, mist, owl, footprints
  - Memory flashbacks when freeing people, lagging reflection, candles lean as you pass
  - New Game+, speedrun timer, no-violence route (Shift+number dodges)
  - Load your own song, customise the Witness's look
  - Photo mode (P), graphics presets, voices on/off
  - Fixes: subtitles no longer vanish on Linux, faster flashbacks

-----------------------------------------------------------------------------
v05 - Boss, crypt, flight, code vision
-----------------------------------------------------------------------------
  - Boss fight: 5 waves through purple portals, then the Auditor with number strings
  - Starry sky with the Milky Way, solid ground and hills; stars brighten when you win
  - Much bigger church: about 40 m tall, upper windows, tree-like columns, 12 Gaudi-inspired spires
  - The crypt: stairs down from the courtyard, skull shelves, coffins, the Builder's empty tomb
  - 9 lore pages (some only reachable by wall-running) and a journal on J
  - Finding everything changes the last line of the game
  - After the ending: the choir stops following you; double-tap Space to fly
  - Code vision (;): the world turns to green code; people glow mint, the Auditor red, the Witness gold

-----------------------------------------------------------------------------
v06 - Better characters, talking mouths
-----------------------------------------------------------------------------
  - Robes move with the hips and legs (fixes the chaotic limbs)
  - Faces: eyes with whites and lids, eyebrows, a real nose, lips, chin
  - Jointed fingers and thumbs, collars, cuffs, shoe heels
  - Mouths move while characters talk, including during cutscenes
  - Freed people's thank-you lines now finish; all 3 chanters speak

-----------------------------------------------------------------------------
v07 - Mouse-click Auditor fight
-----------------------------------------------------------------------------
  - The final fight against the Auditor himself uses left/right click (< >) instead of numbers

-----------------------------------------------------------------------------
v08 - Cutscene zoom, struggle hold
-----------------------------------------------------------------------------
  - Scroll wheel zooms in and out during cutscenes and fights (resets each new shot; walls still respected)
  - New 6-second E hold: the possessed person stays on their feet, turns away and pulls to escape
    in bursts, caught arm stretched back, free arm pumping or shoving at the grip
  - The Witness braces with a wide stance, leaning back, both hands holding the arm, and gets tugged on each burst
  - Wider camera on the hold so both bodies are in frame; no kneeling or pleading poses

-----------------------------------------------------------------------------
v09 - Combos, falls, Rogue Assassins
-----------------------------------------------------------------------------
  - Hits land on the sound: the strike connects about a tenth of a second after a correct press,
    with impact, shake, sparks and recoil on the same frame; varied impact sounds, heavier final hits
  - Every press in the Auditor's click strings lands its own jab; dodges get a whoosh-and-cloth sound
  - Slow motion now eases in and out; heavy hits get a short hit-stop
  - Realistic falls: physics-driven knockdowns from the direction of the hit, then a full get-up
    (roll over, hands and knees, one knee, stand, a shake of the head) for the Witness and enemies
  - Combo meter (x2, x3...); at x3 in quick-time fights the next press triggers a special move:
    step-up head kick, vault strike, leg sweep or rising knee, each in slow motion
  - No-violence dodges build combos too and trigger evasive specials (flip over, slide through)
  - NEW: 7 rounds of Rogue Assassins between the echo waves and the Auditor, through red portals:
    live melee with no prompts (left click strike / 3-hit chain, right click heavy, Shift dodge,
    Space + click aerial slam, hold left click on a fallen one to finish, Tab to switch targets)
  - Assassins circle, feint and take turns; their red face-light flares before each attack;
    blade variant in rounds 5-7, an elite with its own 3-hit combo in round 7
  - At x5 combo, right click unleashes a special in melee; perfect dodges drain an Assassin's light
  - Losing a round restarts that round, not the whole fight

-----------------------------------------------------------------------------
v10 - Subtitle backgrounds
-----------------------------------------------------------------------------
  - Spoken lines now sit on a dark, rounded panel that fits the text, so subtitles stay readable
    over bright scenes

-----------------------------------------------------------------------------
v11 - Prologue, trailer, achievements, wall running
-----------------------------------------------------------------------------
  - NEW PROLOGUE "The Quiet Part of Town": a new game now starts out in the city at night,
    walking from the loud end of a long street to the church
    - Busy end: rain-slick road, neon signs and their reflections, traffic with working lights,
      a crosswalk, horns and sirens, pedestrians with umbrellas and phones who step around you
    - Quieter blocks: shuttered shops, a laundromat with a flickering light, a bus stop that
      never gets a bus, an alley with a cat that leads you on
    - Edge of town: the city noise fades, streetlights hum and stutter, fog thickens, then the church
    - Optional moments: a street preacher, a busker, an overheard phone argument, a shopkeeper
      pulling down his shutter, a puddle reflecting the wrong sky, a clock stopped at 11:59
    - The main character's inner voice comments on his life as you walk
    - Walk through a new gate in the courtyard's east wall and the game carries on as before
    - Menu: begin (prologue) / skip prologue / continue / new game + / skip to the awakening
    - The gate shuts during the story and opens again after the ending, so you can fly over the town
  - WATCH TRAILER on the main menu: about two minutes, in the game engine, letterboxed, with its own
    score (drones, pulses, braams, risers, hits), sound and voiced original dialogue;
    city -> pull -> sanctuary -> turn -> awakening -> action montage -> final confrontation -> title;
    any key or click skips it and returns to the menu
  - ACHIEVEMENTS: 24 cards that slide in at the top right with a chime: prologue milestones,
    secret spots (alley, cross street, back to the busy end, the busker's whole song), crypt,
    lore pages, story moments; they persist between sessions
  - NEW MOVES, unlocked as you progress (a card announces each):
    - Wall run (after freeing your first person): sprint alongside a wall and press Space
    - Wall transfer (after freeing three): press Space mid-run to leap to the opposite wall
      and keep running without losing speed; chains as long as there are walls
  - Smoother landings: fast dismounts flow straight into a run with only a slight dip;
    slow landings settle into a walk; long falls end in a forward roll
  - Subtitle panels from v10 kept

-----------------------------------------------------------------------------
v12 - Auditor subtitle styles, return to main menu
-----------------------------------------------------------------------------
  - New SUBTITLES section in the pause/settings panel: three on/off toggles for how the
    Auditor's lines look (also his echoes and the Rogue Assassins):
    glitch (flickers, jitters and splits into colour now and then), red, all caps
  - Mix them any way you like; a preview line in the menu updates as you flip them;
    your choices are remembered like the volume settings
  - "Return to main menu" on the pause screen (Esc), anytime: walking, cutscenes, fights, the prologue;
    asks to confirm first, then fades back to the title menu; checkpoints and achievements are kept

-----------------------------------------------------------------------------
v13 - Wall run fix
-----------------------------------------------------------------------------
  - Running along walls now triggers whenever you approach a wall at a glancing angle
    (up to about 50 degrees), not only when running perfectly parallel; you no longer need to
    hold Shift, just be moving fast
  - Head-on approaches still do the original run up the wall and backflip
  - If you try it before it's unlocked, a hint tells you it opens once you free your first soul

-----------------------------------------------------------------------------
v14 - Dialogue fixes, line skipping
-----------------------------------------------------------------------------
  - Fixed repeating prologue dialogue: lines that play automatically as you walk past and lines you
    ask for share the same progress, so an introduction never plays again by itself
  - Holding E no longer re-triggers an interaction over and over
  - Replay on purpose: press E or click on a town character to cycle through their lines again;
    the automatic walk-by lines still play only once
  - Skip a line: press E or left click while someone is talking to cut the line, its voice and its
    subtitle; works in cutscenes too; never during fights, holds or quick-time events
  - Controls list updated

-----------------------------------------------------------------------------
v15 - Cat visibility and behavior      [NON-FUNCTIONAL - kept for history]
-----------------------------------------------------------------------------
  Built from v14. Intended to make the alley cat warmer, give it glowing eyes and a light of its
  own, and improve its behaviour.

  Nothing in it worked. The file differs from v14 by 21 added lines and nothing else, and both
  added blocks are bare top-level statements placed before townUpdate, so they execute once while
  TOWN.cat is still null - the guard `if (TOWN.cat && ...)` is false forever. The fur stayed
  0x1a1816 and the eyes stayed (1.2, 1.4, 0.3); neither colour change applied at all.

  v15 is therefore functionally identical to v14. The work it intended was done properly in v17.

-----------------------------------------------------------------------------
v16 - Carry the cat, detailed characters      [MOSTLY NON-FUNCTIONAL]
-----------------------------------------------------------------------------
  What actually shipped and worked:
  - Pedestrian variety: 9 coat colours, 5 skin tones, 4 hair shades
  - An achievement slot, "A Gentler Path"

  What shipped but did not work:
  - Pet / carry / drop and the ']' key were all present in the file but unreachable, for four
    separate reasons:
      1. the cat object was never given its new fields, so `C.petT -= dt` evaluated to NaN and
         the state machine died on first contact
      2. the E hitbox was handed the cat's WORLD position as a LOCAL offset and then parented to
         the cat, double-offsetting it roughly 70 m away, so the camera raycast never hit it
      3. nothing in the file ever called the pick-up function, so carrying was unreachable
      4. the "is it in the sanctuary" test was hypot(x-50, z-18) < 20, which measures the middle
         of the town - the achievement could never fire

  What was described but never written at all:
  - Varied walking speeds and the mood system
  - NPC collision response ("notice and step aside")
  - All of the cat cameos

  Everything above is implemented and verified in v17 and v18.

-----------------------------------------------------------------------------
v17 - Cat petting, carrying, lively streets
-----------------------------------------------------------------------------
  Consolidates the v15 cat-visibility work and the v16 cat-interaction work into one build, and
  fixes the v16 bugs. Verified in a browser against the real game code: 31 automated checks,
  no runtime errors.

  THE CAT
  - Pet the cat: look at it and press E. Five seconds of slow stroking, with the prompt "pet the
    cat"; it swells gently, curls its tail and purrs.
  - Pick it up: press E again while still petting; the prompt changes to "pick the cat up".
    This was impossible in v16 - the function existed but nothing called it.
  - Carrying: it rides your right shoulder, easing in over about half a second, then lag-follows
    with a vertical bob and a slow sway, leaning rather than staying rigid.
  - Put it down with ']' anywhere: an eased fall, a small squash on landing, then it settles and
    stays where you left it.
  - Carrying it OUT of town now works. townUpdate returns early once you pass the gate at x 9.2,
    which used to freeze a carried cat at the gate and made the sanctuary literally unreachable.
    The cat now keeps following you west of the gate and stays visible inside the church.
  - Leave it in the sanctuary to unlock "A Gentler Path".
  - Its position is saved to browser storage and restored next session, and a cat you petted or
    carried no longer trots off down the alley on its own.
  - Folded in from v15, properly this time: warmer fur with a faint glow, a warmer gold catchlight
    in the eyes, and a small warm light that travels with the cat.
  - The periodic meow (7-13 s while you are nearby) works; its timer was never initialised before.

  LIVELY STREETS
  - Pedestrians walk at genuinely different speeds, 0.85 to 1.55, set by mood: hurried (fast,
    longer stride), strolling (slow, shorter stride), distracted (in between).
  - They notice you: they slow as you close in, and a near-miss stops them short for about half a
    second before they carry on.
  - They give way, sidestepping along the pavement instead of walking through you.
  - Their heads turn to track you as you pass, then drift back.
  - A pedestrian within about 4.5 m of the cat looks at it. NOTE: the pedestrians are bounded to
    x 99-181 while the cat lives at x 67.5, so in practice they are never close enough for this to
    fire; you would have to carry the cat up to the busy end and set it down among them. The
    sanctuary cameo that actually matters arrived in v18.

  CONTROLS
  - E     pet the cat, then E again to pick it up
  - ']'   set the cat down

-----------------------------------------------------------------------------
v18 - Sanctuary cat cameos
-----------------------------------------------------------------------------
  The congregation notices a cat you chose to bring home. Entirely opt-in, behaviour only, no new
  dialogue and no changes to the story or cutscenes. Verified: 40 automated checks (9 new plus all
  31 from v17 re-run as a regression), no runtime errors.

  - If you never pick the cat up, nothing changes. The reaction hangs off story.catHome, which is
    only ever set by putting the cat down west of the gate, and without it the code does not touch
    a single character. Measured: with an untouched cat every congregation head stays at exactly 0.
  - Carry the cat in and set it down and the congregation turns to look at it, more strongly the
    closer they are, with a slow drift so it does not read as a stare.
  - Set it down in the COURTYARD and Pavel - nearest the courtyard at z +12 - glances over.
    The others are too far away to see it and do not react.
  - Carry it further in and set it down in the NAVE and the reaction spreads through the whole
    congregation, strongest for whoever you put it beside.
  - Pick the cat back up and every head settles home again.
  - Anyone the game is already animating is skipped: during a cutscene or fight, while frozen,
    kneeling or walking home, and above all during the shock of being freed, which is the one
    other thing in the game that turns these characters' heads.
  - The flag is saved with the cat's position, so a cat left in the sanctuary is still home, and
    still noticed, next time you play.
  - The look reaches 20 m, fading in over the last 10 m. Wider than it sounds: the nearest member
    of the congregation sits about 18 m from where a cat set down in the courtyard ends up, so a
    tighter radius meant nobody ever reacted.

  Gate condition, in full - all of these must hold:
    story.catHome && cat.atHome && !cat.carrying && cat.state === 'sit' && cat.visible
  So: never touching the cat, petting it only, carrying it without setting it down, or dropping it
  in town all produce no cameo. Only carrying it in and setting it down does.

-----------------------------------------------------------------------------
v19 - Black cat, rich animation, purring
-----------------------------------------------------------------------------
  Verified: all v18 checks re-run plus 16 new ones, no runtime errors.

  A BLACK CAT
  - The fur is now near-black (0x090a0d) instead of the warm brown v17 gave it.
  - Roughness dropped to 0.42 so streetlights and its own light catch along its back; a pure matte
    black would have been a flat silhouette in the dark alley.
  - Its warm point light went from 0.45 to 0.6 intensity and 3.2 to 3.6 range, so it still reads
    against dark stone.
  - The eyes are a brighter amber-gold, which is the only strong colour on it now.

  MUCH RICHER ANIMATION
  - The head, ears and eyes were siblings of each other, so the head could not turn without
    leaving the face behind. They now live in a head group, whose rest pose puts every part at
    exactly its old position - verified to within 0.0015 units, so nothing moved visually.
  - Breathing, always: the body swells and settles, deeper while being petted or carried.
  - Ear flicks: one ear twitches every 2-6 seconds, and both swivel back a little while it is
    being handled.
  - Blinking: ordinary blinks every 3-7 seconds, and the slow, lingering contented blink that cats
    do while being petted or carried.
  - The head follows you when you come within 6 m, more strongly the closer you are, and drifts
    back once you leave. It watches you less intently while being petted - it has its eyes closed.
  - The tail now runs on two frequencies instead of one sine, so it no longer looks like a
    metronome, and swishes faster while being carried.
  - The landing squash from v17 still plays and settles out.

  A REAL PURR
  - Replaced the old chopped half-second bursts with a sustained rumble: a low oscillator through
    a lowpass, amplitude-modulated around 24 Hz, which is what actually makes a purr read as a
    purr. It is ramped in and out rather than switched.
  - It drifts: the modulation rate and pitch wander every couple of seconds, so it never loops
    audibly.
  - Three levels: loudest while you pet it, softer while carrying it, and a quiet murmur if you
    simply stand within 2.6 m of it.
  - It fades out whenever the cat stops being updated, so it can never be left ringing.

  MEOWS HERE AND THERE
  - Every meow now varies in pitch and tail length instead of being one fixed sound.
  - More often: every 5-11 seconds while you are within 16 m, up from 7-13 seconds.
  - A quieter, higher "mew" when you are right beside it, rather than the full call.
  - A soft mew every 11-21 seconds while you are carrying it.

  CONTROLS (unchanged)
  - E     pet the cat, then E again to pick it up
  - ']'   set the cat down

-----------------------------------------------------------------------------
v20 - Real dodge animations
-----------------------------------------------------------------------------
  The no-violence route looked like it was not working. The input was never the
  problem - what was missing was the animation.

  WHAT WAS ACTUALLY WRONG
  - Shift was being read correctly the whole time, for both inputs:
    story.qteDodge = e.shiftKey on keydown for the numbered clashes, and the
    same on mousedown for the Auditor's left/right click strings.
  - story.struck is only ever set on the strike branch, so the gentle path was
    being tracked correctly too and the ending could fire.
  - But the dodge ANIMATION called guardPose(w, 1) - the ordinary guard stance -
    and then added a small torso lean and a dip, sliding 0.65 units sideways
    over 0.32 seconds. So a successful dodge looked like standing still.
  - The live melee had the same flaw: the Assassin dodge fell back to the same
    guardPose-plus-a-lean unless it happened to roll.
  - The two detailed evasions that do exist, the flip-over and the slide-
    through, only ever trigger at a x3 combo, so most dodges never saw them.

  FOUR REAL EVASIONS
  Every dodge now plays one of four distinct whole-body movements, cycling, so
  no two in a row look the same:
    - LEAN   feet planted, bend away hard at the waist, head taken off the
             line, arms out wide for balance
    - DUCK   drop right underneath it, pelvis low, head tucked, hands up
    - WEAVE  slip out to the side and roll the shoulders through the gap
    - PIVOT  turn off the line on the lead foot and let it pass behind you
  Each is mirrored left and right, and how far you travel depends on which one
  it is - lean and duck stay planted, weave and pivot carry you clear.

  USED IN ALL THREE FIGHTS
  - Shift + number in the quick-time clashes
  - Shift + click in the Auditor's click strings (same code path)
  - Shift in the Rogue Assassins' live melee
  The clash dodge also runs longer now, 0.46 s instead of 0.32 s, and the
  attacker over-commits and sails past you rather than just leaning.

  BUILT TO BLEND
  Every joint is written as the guard value plus an offset that scales to zero
  at both ends of the move, so a dodge starts and finishes exactly on the guard
  stance with no snap. Verified: all four land back on the guard with a drift of
  exactly 0. The head and hip twist return to neutral on their own, so nothing
  is left tilted after a melee dodge.

  Verified: all v19 checks re-run plus 9 new ones. Each evasion is a measured
  departure from the guard stance (2.0 to 2.56), all four are distinct from one
  another (closest pair 1.89), left and right mirror properly, and no dodge sets
  story.struck. No runtime errors.

-----------------------------------------------------------------------------
v21 - Version stamp, dodge controls
-----------------------------------------------------------------------------
  No gameplay changes. This exists because there was no way to tell which build
  a file was once it was open, and several older files on disk are still named
  "(latest)" from when they were current - so it was easy to test a fix in the
  wrong file and conclude it had not worked.

  - The window title now reads "Sanctuary v21".
  - The title screen shows BUILD V21 under "click to enter".
  - A small "v21" sits in the bottom right corner at all times. It is
    click-through, so it can never intercept anything, and it is hidden in
    photo mode so it stays out of screenshots.
  - The controls list named only "shift + number" for dodging. It now reads
    "shift + number / shift + click / shift in melee", because the Auditor's
    fight takes clicks and the Rogue Assassins are live melee - all three
    dodge, and only one of them was ever written down.

  Verified: the stamp renders and is click-through, the menu is still clickable
  and still starts the game, and the dodge wiring still fires on both
  shift + number and shift + click. No runtime errors.

-----------------------------------------------------------------------------
v22 - Dodge latch fix
-----------------------------------------------------------------------------
  THE ACTUAL REASON DODGING DID NOT WORK.

  A clash is not one press. qteSeq runs a STRING of them - 2 by default, 4 for
  some foes, and 2 + hits for the Auditor. The prompt counts "1 / 2".

  Both input handlers did this on every press:

      story.qteDodge = e.shiftKey;

  That OVERWRITES. So only the LAST press in the string decided whether the
  whole clash was a dodge. Press Shift+4, let go of Shift, press 7 for the
  second prompt, and you strike - having meant to dodge the entire time. Which
  is exactly what it feels like when "dodging doesn't work".

  Reproduced and fixed, measured on a real fight:
      v21   shift on press 1, released for press 2  ->  qteDodge false, STRIKE
      v22   same input                              ->  qteDodge true,  DODGE
  Holding shift the whole way still dodges in both; never touching shift still
  strikes in both, so it does not over-dodge.

  WHAT CHANGED
  - Dodge intent is now LATCHED for a whole clash. Shift on any press in the
    string arms it, and it is cleared once per clash instead of once per press.
  - It is also read live from the key state, not only from the event, so
    holding Shift counts even if the press that resolves the prompt reports
    shiftKey false.
  - Pressing Shift on its own while a prompt is up arms it too, so you can
    decide after the prompt appears.

  AND YOU CAN NOW SEE IT
  - While the dodge is armed the prompt says DODGE and turns green.
    No more guessing whether the game heard you. If it is not green, it did not
    register - and that is now a thing you can report instead of a mystery.
  - The controls line now reads "hold shift through the whole string", which is
    the part that was catching people out.

  Also: the build is stamped on screen from v21 on - title bar, title screen,
  and a small marker in the bottom right corner.

-----------------------------------------------------------------------------
v23 - Dodge leak fix
-----------------------------------------------------------------------------
  v22 fixed the dodge not sticking across a multi-press string. It then stuck
  too well: dodge once and every later fight dodged too, whether or not you
  held Shift. Three things I added in v22 caused it.

  1. shiftHeld() fell back to the live key state:

         return !!((e && e.shiftKey) || keys['ShiftLeft'] || keys['ShiftRight']);

     But Shift is also the sprint key - "shift - quicken". Hold Shift to run
     into a fight, or lose a Shift keyup to a focus change, and keys['ShiftLeft']
     stays true, arming a dodge on every prompt from then on.
  2. v22 also armed on a bare Shift keydown while a prompt was up. Holding
     Shift auto-repeats that keydown, so it re-armed over and over.
  3. The latch was only cleared inside qteSeq, so any clash resolved by another
     route carried the previous intent into the next fight.

  FIXED
  - The dodge is armed only by the modifier state of the press that actually
    answers the prompt. keys[] is no longer consulted at all.
  - Bare Shift no longer arms anything.
  - The latch is cleared in three places now: when a fight starts, at the start
    of every clash, and at the start of every press string.

  Measured, same test on both builds:
      held Shift (sprint), answer press without Shift
          v22  armed   -> dodged when you did not ask it to
          v23  not armed
      Shift on press 1, released for press 2
          v22  armed   v23  armed      (the v22 fix is kept)
      never touching Shift
          v22  not armed   v23  not armed

  Verified directly: the held-Shift leak, the multi-press latch, and the
  no-Shift case. NOT verified end to end: the clear across consecutive clashes
  in a live fight - the cutscenes between clashes outran the test budget. The
  three clears are in the code and the first two cases are proven; if a dodge
  still carries over, the green DODGE marker on the prompt will show it.

-----------------------------------------------------------------------------
v24 - Live dodge marker
-----------------------------------------------------------------------------
  The DODGE marker added in v22 could never have appeared, so "it never turns
  green" told us nothing about whether dodging works. Two reasons:

  1. The word DODGE was appended to the prompt subtitle inside qteSeq, which
     writes that text ONCE when the prompt appears - before you have pressed
     anything, and immediately after the latch was cleared. The condition was
     always false at the only moment it was ever evaluated.
  2. The green styling was toggled only by armDodge, i.e. on the press that
     ALSO resolves the prompt and hides it. Any green lasted a single frame.

  So the marker was useless as a diagnostic. That was my mistake, and it sent
  us looking in the wrong place.

  NOW IT IS LIVE
  - The marker is refreshed every frame from the live key state while a prompt
    is up. Hold Shift and the ring turns green and DODGE appears BEFORE you
    commit to the press. Let go and it goes dark again.
  - Reading the key state here is safe because it decides nothing - it only
    displays. The arming decision is unchanged from v23: still only the
    modifier on the press that answers the prompt, so the v22 leak cannot come
    back. Verified in the same build: Shift held without pressing does NOT arm
    (false), the answering press with Shift does (true).
  - The tag's opacity is set directly from JS rather than through a CSS rule,
    because the rule was losing to the cascade and the tag stayed invisible
    even with the class applied. The ring colour still comes from the class.

  WHAT THIS IS FOR
  If you hold Shift during a prompt and it does NOT go green, the keypress is
  not reaching the game at all, and that is a completely different problem from
  the dodge logic. If it DOES go green and you still strike, the branch is not
  honouring it. Either way it stops being guesswork.

-----------------------------------------------------------------------------
v25 - DIAGNOSTIC dodge readout
-----------------------------------------------------------------------------
  Not a fix. The dodge logic is byte-for-byte the same as v24. This build only
  prints what is actually happening, because the reported symptom is a
  contradiction I cannot resolve by reading the code:

      the ring goes GREEN   -> keys['ShiftLeft'] is true
      but the press strikes -> story.qteDodge was false when clash read it

  Both cannot be right. The readout settles it.

  A small panel in the top left logs the last 8 events:
    SHIFT down / SHIFT up            - so a stuck key shows up immediately
    press Digit4  e.shiftKey=true  keys.Shift=true  want=4  repeat=false
      -> qteDodge=true               - what arming actually decided
    CLASH  ok=true  qteDodge=true  -> DODGE      (green)
    CLASH  ok=true  qteDodge=false -> STRIKE     (red)

  Press BACKSLASH to hide the panel. It is hidden in photo mode.

  HOW TO READ IT
  - e.shiftKey=false while keys.Shift=true  ->  the number keypress is arriving
    without its modifier. The dodge is being asked for and not heard.
  - want= differs from the key pressed       ->  the wrong key is resolving it.
  - no "SHIFT up" after a "SHIFT down"       ->  the key is stuck, and the green
    ring is a false positive from stale state.
  - CLASH says qteDodge=true but you still see a punch -> the branch is right
    and the animation is wrong, which is a completely different problem.

-----------------------------------------------------------------------------
v26 - Numpad shift fix
-----------------------------------------------------------------------------
  THE ACTUAL CAUSE, and it was never in the dodge code.

  The v25 readout caught it on the first try:

      SHIFT up
      press Numpad3  e.shiftKey=false  keys.Shift=false  want=3  repeat=false
        -> qteDodge=false
      CLASH  ok=true  qteDodge=false  -> STRIKE
      SHIFT down

  Dodging was being done on the NUMPAD. On Windows, holding Shift and pressing
  a numpad digit makes the OS cancel the modifier: it synthesises a Shift-up,
  delivers the digit with shiftKey FALSE, then restores Shift-down. It is the
  mechanism that lets Shift+Numpad act as the navigation cluster when NumLock
  is on.

  So the Shift never reached the page. The game was told "digit 3, no shift"
  and did exactly what it was asked. Every fix in v20 through v24 was aimed at
  logic that was already working.

  FIX
  - The moment Shift is released is now remembered. If a NUMPAD digit arrives
    within 150 ms of that release, it is the OS quirk rather than the player
    letting go - nobody releases Shift and hits a number 40 ms later on
    purpose - so Shift counts as held.
  - Scoped to Numpad codes only. The top number row, the Auditor's clicks and
    the melee are untouched.
  - The green marker also stays lit through the OS's fake Shift-up, so a numpad
    dodge now shows as armed.
  - The readout prints "[numpad shift restored]" when the compensation fires.

  Measured, v25 vs v26, same six cases:
      the exact Windows sequence          v25 false  ->  v26 TRUE
      top row without Shift               false      ->  false
      numpad, Shift released 320 ms ago   false      ->  false
      numpad with Shift                   true       ->  true
      top row with Shift                  true       ->  true
      nothing held                        false      ->  false
  Exactly one case changed.

  The diagnostic panel from v25 is still here. Press BACKSLASH to hide it.

-----------------------------------------------------------------------------
v27 - Diagnostic toggle in settings
-----------------------------------------------------------------------------
  The dodge readout was always on in v25 and v26 because it was there to catch
  a bug. Now it is an ordinary option, and off unless you ask for it.

  - New DIAGNOSTIC section at the bottom of the pause/settings panel, with a
    "dodge readout" on/off control.
  - Off by default, so normal play is clean.
  - Remembered between sessions alongside the volume sliders and subtitle
    styles.
  - Backslash still toggles it, and now flips the same setting - the dropdown
    stays in step and the choice is saved either way.
  - Turning it off wipes the panel immediately rather than leaving the last
    lines on screen.

  Verified: off by default and silent; turning it on through the dropdown makes
  the readout appear; backslash flips the setting, syncs the dropdown and
  clears the panel; the choice survives a reload; and the v26 numpad fix still
  works. No runtime errors.

-----------------------------------------------------------------------------
v28 - Title screen picker
-----------------------------------------------------------------------------
  Four title screens, chosen in settings under TITLE SCREEN, switching live
  with no reload.

    classic     exactly what v27 had - nothing moved
    quiet       centred, one clear action, the rest demoted to small text
    threshold   anchored left, choices stacked, the church gets the screen
    gate        centred and ceremonial, a rule above a lit door

  The three new ones tuck the settings panel and the control list behind
  "settings" and "controls" links, so the title screen is the title and three
  choices rather than everything at once.

  HOW IT IS BUILT
  - CSS only, on the original menu markup. "classic" is therefore the untouched
    original rather than a reconstruction of it, and switching is instant.
  - The settings panel is SHARED with the pause screen (it holds "return to
    main menu"), so it is hidden by a body class rather than removed. Pausing
    mid-game is completely unaffected.
  - Several rules need !important: the buttons carry inline styles, and the
    game sets the menu's display inline when it reveals it, which beat the
    stylesheet until this was accounted for.

  ALSO FIXED
  - The settings panel showed 278px of 851px of content with no indication
    there was more, which is why the DIAGNOSTIC toggle added in v27 sat
    off-screen at y=984. There is now a fade at the lower edge in every layout,
    so it never looks truncated.

  Verified: all four layouts apply the right classes and switch instantly;
  settings and controls are hidden in the three new ones and shown in classic;
  the disclosure links open, swap and close; begin and the trailer each get
  their own row in all three; no runtime errors.

  A note on the testing: an early check reported the layouts correct when they
  were not. It compared element 'top' values to decide whether two buttons
  shared a row, and because 'begin' has more padding, baseline alignment made
  them differ even on the same line. The screenshots disagreed with the test,
  and the screenshots were right. The check now tests for vertical overlap.

-----------------------------------------------------------------------------
v29 - Gate title screen
-----------------------------------------------------------------------------
  One title screen - the gate - and the picker is gone.

  Built from v27 rather than v28, so classic, quiet, threshold and the TITLE
  SCREEN setting are absent rather than switched off. Nothing to toggle, no
  dead CSS: menuStyle, menuQuiet, menuThreshold and menuGate appear zero times
  in the file.

  THE SCREEN
  - A thin rule under "click to enter", then a single lit "begin".
  - The two shortcuts share one line, separated by a slash:
        skip prologue  /  skip to the awakening
  - A compact bordered "watch trailer" beneath.
  - "settings" and "controls" links at the bottom open the panel and the
    control list in place; both are hidden until asked for.
  - The build number moved to the bottom-right corner only.

  This restores the original gate proportions, which v28 could not reproduce.
  v28 restyled the ORIGINAL markup with CSS alone so that "classic" could stay
  untouched - and that markup has no separator between the shortcuts and no
  way to let "begin" hug its text while still taking its own row. With only one
  layout to support, the markup itself is the gate, so: begin 157px wide, the
  two shortcuts on one line, the trailer 150px.

  Verified: begin and the trailer each take their own row, the two shortcuts
  share one, settings and controls are hidden until their link is clicked and
  close again on a second click, the build line is hidden, and the settings
  panel keeps the fade at its lower edge so it never looks truncated. No
  runtime errors.

  The settings panel is still shared with the pause screen, so pausing mid-game
  is unchanged.

-----------------------------------------------------------------------------
v30 - New game resets the cat
-----------------------------------------------------------------------------
  Pressing "begin" started a fresh story but left the cat wherever it had been
  left on a previous run, still flagged as living in the sanctuary.

  WHY
  The cat's position is saved under its own key, sanctuary_catLoc, which sat
  alongside sanctuary_ach, sanctuary_pages and sanctuary_best - keys that are
  SUPPOSED to outlive a new game. clearSave() only ever removed
  sanctuary_save, and nothing anywhere removed the cat's key. It was filed with
  the things that persist on purpose, without anyone deciding it should.

  FIXED
  - Any fresh start - begin, skip prologue, skip to the awakening, new game + -
    now puts the cat back in the alley and clears its saved position.
  - Continue does not. Carrying on from a checkpoint keeps the cat exactly
    where you left it, which is the point of continuing.
  - Achievements are untouched: "A Gentler Path" stays earned once earned.

  Clearing storage alone was not enough. The town, and the cat, are built while
  the game loads - BEFORE the title menu appears - so by the time you click
  begin the cat has already been moved to its saved spot. The reset also has to
  put it back physically: position, facing, scale, the carry/pet/drop timers,
  the 'placed' flag that stops it leading you down the alley, and the purr.

  Measured, same seeded save on both paths:
      begin     cat (5, 31) atHome=true stored  ->  (67.5, 24.6) all flags false, key cleared
      continue  cat (5, 31) atHome=true stored  ->  unchanged

-----------------------------------------------------------------------------
v31 - Full new-game reset (latest)
-----------------------------------------------------------------------------
  begin / skip prologue / skip to the awakening / new game + now forget
  everything a run can remember. Continue still continues.

  RE-LOCKED
  - "A Gentler Path" is locked again on a fresh start. The cat is back in the
    alley, so it is no longer true. Other achievements stay earned.

  EVENTS RESET
  - Every prologue line, inner-voice moment and walk-by trigger (TOWN.seen,
    TOWN.heard, TOWN.listened).
  - Each town character's place in their own dialogue, so they introduce
    themselves again instead of carrying on mid-conversation.
  - The crypt's first-time captions ("stairs, going down", "the crypt").

  AND TWO THINGS THAT HAD BEEN SURVIVING EVERYTHING
  - The lore pages you had found. These persisted through a page reload, and
    finding all nine changes the game's last line - so a brand new run was
    ending as though you had found everything without reading a word. Pages,
    and the Builder's tomb, now start unfound.
  - The old checkpoint. Starting a new game left "continue" pointing at an
    abandoned run; it is cleared now.

  ONE THING WORTH KNOWING
  Returning to the main menu already does a full page reload, so the in-memory
  flags above were in fact being cleared that way. They are reset explicitly
  now regardless, so a fresh start no longer depends on which route you took
  back to the menu. The lore pages, the achievement and the checkpoint are the
  parts that genuinely never reset before.

  Measured, with a well-progressed run seeded, begin vs continue:
      begin     seen 2->0  heard 1->0  lines 3->0  crypt true->false
                pages 4->0  tomb true->false  cat achievement true->false
                cat x 5->67.5  save/pages/catLoc keys all cleared
                other achievements untouched
      continue  every one of those unchanged

  STILL PERSISTENT ON PURPOSE: your best speedrun time, the new game + unlock,
  and every achievement other than the cat one.
