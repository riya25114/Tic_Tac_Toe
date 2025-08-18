const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");
const setupDiv = document.getElementById("setup");
const gameDiv = document.getElementById("game");
const playerXInput = document.getElementById("playerX");
const playerOInput = document.getElementById("playerO");

let playerX = "Player X";
let playerO = "Player O";
let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let running = false;
let vsComputer = false;

const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

// Start game
startBtn.addEventListener("click", () => {
    playerX = playerXInput.value.trim() || "Player X";
    const mode = document.querySelector('input[name="mode"]:checked').value;
    vsComputer = mode === "computer";

    if (vsComputer) {
        playerO = "Computer";
        playerOInput.value = "Computer";
        playerOInput.disabled = true;
    } else {
        playerO = playerOInput.value.trim() || "Player O";
        playerOInput.disabled = false;
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
        cell.classList.remove("taken","winner","x","o");
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
        setTimeout(computerMove, 400); // delay for natural play
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
    pattern.forEach(index => {
        cells[index].classList.add("winner");
    });
}

// Reset
function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    running = true;
    currentPlayer = "X";
    statusText.textContent = `${playerX}'s turn (X)`;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("taken","winner","x","o");
    });
}

// Computer Move using Minimax
function computerMove() {
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
    makeMove(move, "O");
    checkWinner();
}

const scores = { O: 1, X: -1, tie: 0 };

function minimax(newBoard, depth, isMaximizing) {
    let winner = evaluateBoard(newBoard);
    if (winner !== null) {
        return scores[winner];
    }

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
        const [a,b1,c] = pattern;
        if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
            return b[a];
        }
    }
    if (!b.includes("")) return "tie";
    return null;
}