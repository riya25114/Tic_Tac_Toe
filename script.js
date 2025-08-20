const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const setupDiv = document.getElementById("setup");
const gameDiv = document.getElementById("game");
const playerXInput = document.getElementById("playerX");
const playerOInput = document.getElementById("playerO");
const difficultyBox = document.getElementById("difficultyBox");
const difficultySelect = document.getElementById("difficulty");

let playerX = "Player X";
let playerO = "Player O";
let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let running = false;
let vsComputer = false;
let difficulty = "hard";

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// toggle difficulty box & playerO field
document.querySelectorAll("input[name='mode']").forEach(radio => {
    radio.addEventListener("change", () => {
        if (radio.value === "computer" && radio.checked) {
            difficultyBox.classList.remove("hidden");
            playerOInput.classList.add("hidden");
        }
        else {
            difficultyBox.classList.add("hidden");
            playerOInput.classList.remove("hidden");
        }
    });
});

// Start game
startBtn.addEventListener("click", () => {
    playerX = playerXInput.value.trim() || "Player X";
    const mode = document.querySelector('input[name="mode"]:checked').value;
    vsComputer = mode === "computer";
    difficulty = difficultySelect.value;
    if (vsComputer) {
        playerO = "Computer";
    }
    else {
        playerO = playerOInput.value.trim() || "Player O";
    }
    setupDiv.classList.add("hidden");
    gameDiv.classList.remove("hidden");
    startGame();
});

function startGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    running = true;
    currentPlayer = "X";
    statusText.textContent = `${playerX}'s turn (X)`;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("taken", "winner", "x", "o");
        cell.addEventListener("click", cellClicked);
    });
    restartBtn.addEventListener("click", resetGame);
}

function cellClicked() {
    const index = this.getAttribute("data-index");
    if (board[index] !== "" || !running) return;
    makeMove(index, currentPlayer);
    checkWinner();
    if (running && vsComputer && currentPlayer === "O") {
        setTimeout(computerMove, 400);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add("taken", player === "X" ? "x" : "o");
}

function checkWinner() {
    let won = false;
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            won = true;
            highlightWinner(pattern);
            break;
        }
    }
    if (won) {
        let winnerName = currentPlayer === "X" ? playerX : playerO;
        statusText.textContent = `${winnerName} Wins!`;
        running = false;
    }
    else if (!board.includes("")) {
        statusText.textContent = "It's a Draw!";
        running = false;
    }
    else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.textContent = currentPlayer === "X"
            ? `${playerX}'s turn (X)`
            : `${playerO}'s turn (O)`;
    }
}

function highlightWinner(pattern) {
    pattern.forEach(index => cells[index].classList.add("winner"));
}
function resetGame() {
    // Instead of just resetting the board, go back to landing page
    gameDiv.classList.add("hidden");
    setupDiv.classList.remove("hidden");
    // Reset inputs
    playerXInput.value = "";
    playerOInput.value = "";
    playerOInput.disabled = false;
    document.querySelector('input[name="mode"][value="two"]').checked = true;
    // Reset game state
    board = ["", "", "", "", "", "", "", "", ""];
    running = false;
    currentPlayer = "X";
}

// Computer Move with difficulty
function computerMove() {
    let move;
    if (difficulty === "easy") {
        move = randomMove();
    }
    else if (difficulty === "medium") {
        move = Math.random() < 0.5 ? randomMove() : bestMove();
    }
    else {
        move = bestMove();
    }
    makeMove(move, "O");
    checkWinner();
}

function randomMove() {
    const available = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    return available[Math.floor(Math.random() * available.length)];
}

function bestMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

const scores = { O: 1, X: -1, tie: 0 };

function minimax(newBoard, depth, isMaximizing) {
    let winner = evaluateBoard(newBoard);
    if (winner !== null) return scores[winner];

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = "O";
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    }
    else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = "X";
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function evaluateBoard(b) {
    for (let pattern of winPatterns) {
        const [a, b1, c] = pattern;
        if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    if (!b.includes("")) return "tie";
    return null;
}
