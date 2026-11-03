// Hangman rules. Pure functions, so they can be tested in node (tests/games.test.js).
export const MAX_WRONG = 6;
export const WORDS = ['PINNED', 'SUNSET', 'LANTERN', 'MOUNTAIN', 'COMPASS', 'ORBIT', 'GARDEN', 'PUZZLE', 'THUNDER', 'VELVET', 'MIRROR', 'HARBOR', 'RIVER', 'ANCHOR', 'CANDLE', 'JOURNEY'];

export function pickWord(rng = Math.random) {
  return WORDS[Math.floor(rng() * WORDS.length)];
}

// Applies a guess to the state. Returns a new state object.
export function guess(state, letter) {
  const L = letter.toUpperCase();
  if (state.guessed.includes(L) || state.over) return state;
  const guessed = [...state.guessed, L];
  const wrong = state.word.includes(L) ? state.wrong : state.wrong + 1;
  const solved = [...state.word].every((c) => guessed.includes(c));
  const lost = wrong >= MAX_WRONG;
  return { ...state, guessed, wrong, over: solved || lost, won: solved };
}

export function newState(word) {
  return { word, guessed: [], wrong: 0, over: false, won: false };
}

// Score: 100 per letter left unrevealed-to-guess plus a bonus for fewer wrong guesses. 0 on a loss.
export function scoreFor(state) {
  if (!state.won) return 0;
  return Math.max(0, 300 - state.wrong * 40 + state.word.length * 5);
}
