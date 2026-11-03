// Dots and Boxes rules. Pure functions, so they can be tested in node (tests/games.test.js).
// An n x n game has n*n boxes and (n+1) x (n+1) dots.
// Lines: h[r][c] is the horizontal line under dot row r (r 0..n, c 0..n-1);
//        v[r][c] is the vertical line right of dot column c (r 0..n-1, c 0..n).
export function createGame(n) {
  return {
    n,
    h: Array.from({ length: n + 1 }, () => Array(n).fill(null)),
    v: Array.from({ length: n }, () => Array(n + 1).fill(null)),
    owner: Array.from({ length: n }, () => Array(n).fill(null)),
    turn: 'P',       // 'P' = you, 'C' = computer
    over: false,
  };
}

// the four sides of box (r, c)
const sidesOf = (g, r, c) => [g.h[r][c], g.h[r + 1][c], g.v[r][c], g.v[r][c + 1]];

// draws one line for the player whose turn it is. Returns how many boxes were completed (0 if none),
// or -1 when the line is already drawn or out of range.
export function drawLine(g, type, r, c) {
  const arr = type === 'h' ? g.h : g.v;
  if (!arr[r] || arr[r][c] === undefined || arr[r][c] !== null) return -1;
  arr[r][c] = g.turn;
  let done = 0;
  const boxes = type === 'h'
    ? [[r - 1, c], [r, c]]
    : [[r, c - 1], [r, c]];
  for (const [br, bc] of boxes) {
    if (br < 0 || bc < 0 || br >= g.n || bc >= g.n) continue;
    if (g.owner[br][bc]) continue;
    if (sidesOf(g, br, bc).every(Boolean)) { g.owner[br][bc] = g.turn; done++; }
  }
  if (g.owner.every((row) => row.every(Boolean))) g.over = true;
  // completing a box keeps the turn; any other line passes it
  if (done === 0) g.turn = g.turn === 'P' ? 'C' : 'P';
  return done;
}

export const countOf = (g, who) => g.owner.flat().filter((o) => o === who).length;

// every line that is still free
export function freeLines(g) {
  const out = [];
  g.h.forEach((row, r) => row.forEach((v, c) => { if (v === null) out.push(['h', r, c]); }));
  g.v.forEach((row, r) => row.forEach((v, c) => { if (v === null) out.push(['v', r, c]); }));
  return out;
}

// how many sides a box has drawn
const drawnSides = (g, r, c) => sidesOf(g, r, c).filter(Boolean).length;

// the computer: finish a box if it can, otherwise avoid giving a box away (a box with 2 sides drawn),
// otherwise draw something random.
export function chooseLine(g, rng = Math.random) {
  const lines = freeLines(g);
  const completes = (type, r, c) => {
    const boxes = type === 'h' ? [[r - 1, c], [r, c]] : [[r, c - 1], [r, c]];
    return boxes.some(([br, bc]) => br >= 0 && bc >= 0 && br < g.n && bc < g.n && !g.owner[br][bc] && drawnSides(g, br, bc) === 3);
  };
  const gives = (type, r, c) => {
    const boxes = type === 'h' ? [[r - 1, c], [r, c]] : [[r, c - 1], [r, c]];
    return boxes.some(([br, bc]) => br >= 0 && bc >= 0 && br < g.n && bc < g.n && !g.owner[br][bc] && drawnSides(g, br, bc) === 2);
  };
  const win = lines.find(([t, r, c]) => completes(t, r, c));
  if (win) return win;
  const safe = lines.filter(([t, r, c]) => !gives(t, r, c));
  const pool = safe.length ? safe : lines;
  return pool[Math.floor(rng() * pool.length)];
}
