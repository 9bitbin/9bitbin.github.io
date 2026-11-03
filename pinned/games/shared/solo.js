/* shared/solo.js — single-player stand-in for the old multiplayer bridge.
 *
 * Some games were built to also run as a "race" against friends. That is switched
 * OFF in this build. Those games read window.PB, so this file provides a harmless
 * solo version of it:
 *   - race is always false, so every game plays as a normal single-player game
 *   - there are no ghosts (no other players to show)
 *   - send(t, data) reports a finished run to the Pinned app (only when the game
 *     is inside the app's Scores panel, which is an iframe). Otherwise it does nothing
 *   - state() and on() do nothing
 *   - rng(seed) is a small seeded random-number generator the games use for layouts
 */
(function () {
  const rng = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  window.PB = {
    embed: false, race: false, mode: "solo", seed: 0, color: "#ff8fb1", name: "",
    rng, ghosts: new Map(),
    send(t, data) {
      // Report the run to the page that holds this game (the Scores panel).
      if (window.parent === window) return;
      try { window.parent.postMessage({ pinned: 1, t, ...(data || {}) }, location.origin); } catch (e) { /* ignore */ }
    },
    state() {}, on() {},
    ghostD: (g) => g.d, ghostY: (g) => g.y,
  };
})();
