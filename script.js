const board = document.getElementById('board');
const statusDiv = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const modeRadios = document.querySelectorAll('input[name="mode"]');

let cells = [];
let boardState = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let vsAI = false;

const winCombos = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function createBoard() {
  board.innerHTML = '';
  cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
    cells.push(cell);
  }
}
createBoard();

function handleCellClick(e) {
  const idx = e.target.dataset.index;
  if (boardState[idx] || !gameActive) return;
  makeMove(idx, currentPlayer);
  if (vsAI && gameActive && currentPlayer === 'O') {
    setTimeout(aiMove, 400); // short delay for realism
  }
}

function makeMove(idx, player) {
  boardState[idx] = player;
  cells[idx].textContent = player;
  cells[idx].classList.add(player.toLowerCase());

  if (checkWin(player)) {
    statusDiv.textContent = `Player ${player} wins!` + (vsAI && player === 'O' ? ' (AI)' : '');
    gameActive = false;
    highlightWin(player);
  } else if (boardState.every(cell => cell)) {
    statusDiv.textContent = "It's a draw!";
    gameActive = false;
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDiv.textContent = vsAI 
      ? (currentPlayer === 'X' ? 'Your turn (X)' : 'AI\'s turn (O)')
      : `Player ${currentPlayer}'s turn`;
  }
}

// --- AI Logic: Basic Heuristic ---
function aiMove() {
  if (!gameActive) return;
  // 1. Try to win
  for (let i = 0; i < 9; i++) {
    if (!boardState[i]) {
      boardState[i] = 'O';
      if (checkWin('O')) {
        makeMove(i, 'O');
        return;
      }
      boardState[i] = '';
    }
  }
  // 2. Block human win
  for (let i = 0; i < 9; i++) {
    if (!boardState[i]) {
      boardState[i] = 'X';
      if (checkWin('X')) {
        boardState[i] = '';
        makeMove(i, 'O');
        return;
      }
      boardState[i] = '';
    }
  }
  // 3. Take center
  if (!boardState[4]) {
    makeMove(4, 'O');
    return;
  }
  // 4. Take a corner
  const corners = [0,2,6,8];
  const availableCorners = corners.filter(i => !boardState[i]);
  if (availableCorners.length) {
    makeMove(availableCorners[Math.floor(Math.random()*availableCorners.length)], 'O');
    return;
  }
  // 5. Take any empty
  for (let i = 0; i < 9; i++) {
    if (!boardState[i]) {
      makeMove(i, 'O');
      return;
    }
  }
}

function checkWin(player) {
  return winCombos.some(combo =>
    combo.every(idx => boardState[idx] === player)
  );
}

function highlightWin(player) {
  winCombos.forEach(combo => {
    if (combo.every(idx => boardState[idx] === player)) {
      combo.forEach(idx => cells[idx].style.background = '#d4edda');
    }
  });
}

resetBtn.addEventListener('click', resetGame);

function resetGame() {
  boardState = Array(9).fill('');
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o');
    cell.style.background = '';
  });
  currentPlayer = 'X';
  gameActive = true;
  statusDiv.textContent = vsAI
    ? 'Your turn (X)'
    : "Player X's turn";
  if (vsAI && currentPlayer === 'O') {
    aiMove();
  }
}

modeRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    vsAI = document.querySelector('input[name="mode"]:checked').value === 'ai';
    resetScores();
    resetGame();
  });
});
function resetScores() {
  scoreX = 0;
  scoreO = 0;
  scoreDraw = 0;
  scoreXEl.textContent = "0";
  scoreOEl.textContent = "0";
  scoreDrawEl.textContent = "0";
}
// Initial mode setup
vsAI = document.querySelector('input[name="mode"]:checked').value === 'ai';
statusDiv.textContent = vsAI
  ? 'Your turn (X)'
  : "Player X's turn";

// Score variables and DOM refs
let scoreX = 0, scoreO = 0, scoreDraw = 0;
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawEl = document.getElementById('score-draw');

// Update this function to increment scores:
function makeMove(idx, player) {
  boardState[idx] = player;
  cells[idx].textContent = player;
  cells[idx].classList.add(player.toLowerCase());

  if (checkWin(player)) {
    statusDiv.textContent = `Player ${player} wins!` + (vsAI && player === 'O' ? ' (AI)' : '');
    gameActive = false;
    highlightWin(player);
    if (player === 'X') {
      scoreX++;
      scoreXEl.textContent = scoreX;
    } else if (player === 'O') {
      scoreO++;
      scoreOEl.textContent = scoreO;
    }
  } else if (boardState.every(cell => cell)) {
    statusDiv.textContent = "It's a draw!";
    gameActive = false;
    scoreDraw++;
    scoreDrawEl.textContent = scoreDraw;
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDiv.textContent = vsAI 
      ? (currentPlayer === 'X' ? 'Your turn (X)' : 'AI\'s turn (O)')
      : `Player ${currentPlayer}'s turn`;
  }
}

// In resetGame(), do NOT reset scores, only board and status

// Optional: Add a "Reset Scores" button if you want to let users clear the scores
// <button id="reset-scores" class="reset-btn" aria-label="Reset Scores">Reset Scores</button>

const resetScoresBtn = document.getElementById('reset-scores');
if (resetScoresBtn) {
  resetScoresBtn.addEventListener('click', () => {
    scoreX = 0; scoreO = 0; scoreDraw = 0;
    scoreXEl.textContent = scoreOEl.textContent = scoreDrawEl.textContent = "0";
  });
}