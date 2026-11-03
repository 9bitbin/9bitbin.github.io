// Reaction Duel rules. Pure functions, so they can be tested in node (tests/games.test.js).
// Random wait before the light turns green, between 1.5 and 4.5 seconds.
export const randomDelay = (rng = Math.random) => 1500 + rng() * 3000;

// Faster reactions score higher. 2000 is the best possible (0 ms).
export const scoreFor = (ms) => Math.max(0, Math.round(2000 - ms));
