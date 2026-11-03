// Connect Four rules. Pure functions, so they can be tested in node (tests/games.test.js).
// Board: 6 rows (top row 0) by 7 columns. Players are 'R' (you) and 'Y' (computer).
export const ROWS = 6, COLS = 7;

export const createBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));
export const cloneBoard = (b) => b.map((r) => r.slice());

// lowest empty row in a column, or -1 when the column is full
export function dropRow(board, col) {
  for (let r = ROWS - 1; r >= 0; r--) if (!board[r][col]) return r;
  return -1;
}

// drops a disc. Returns the row it landed in, or -1 if the column is full
export function drop(board, col, player) {
  const r = dropRow(board, col);
  if (r >= 0) board[r][col] = player;
  return r;
}

// 'R' or 'Y' when someone has four in a row, 'draw' when the board is full, otherwise null
export function winnerOf(board) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const p = board[r][c];
    if (!p) continue;
    for (const [dr, dc] of dirs) {
      let ok = true;
      for (let k = 1; k < 4 && ok; k++) {
        const rr = r + dr * k, cc = c + dc * k;
        if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || board[rr][cc] !== p) ok = false;
      }
      if (ok) return p;
    }
  }
  return board.every((row) => row.every(Boolean)) ? "draw" : null;
}

export const legalCols = (board) => [0, 1, 2, 3, 4, 5, 6].filter((c) => dropRow(board, c) >= 0);

// The computer's move: take a win, block a win, otherwise prefer the middle columns.
export function chooseMove(board, me, rng = Math.random) {
  const opp = me === "R" ? "Y" : "R";
  const legal = legalCols(board);
  for (const c of legal) { const b = cloneBoard(board); drop(b, c, me); if (winnerOf(b) === me) return c; }
  for (const c of legal) { const b = cloneBoard(board); drop(b, c, opp); if (winnerOf(b) === opp) return c; }
  const order = [3, 2, 4, 1, 5, 0, 6].filter((c) => legal.includes(c));
  return rng() < 0.7 ? order[0] : order[Math.min(1, order.length - 1)];
}
