let board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let currentPlayer = 'white';
let stockfish = new Worker('stockfish.js'); // Carica Stockfish come Web Worker

document.addEventListener('DOMContentLoaded', () => {
    drawBoard();
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('player-color').addEventListener('change', changePlayerColor);
});

function drawBoard() {
    const chessBoard = document.getElementById('chess-board');
    chessBoard.innerHTML = ''; // Reset board

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((row + col) % 2 === 0 ? 'white' : 'black');
            if (board[row][col] !== '') {
                const piece = document.createElement('div');
                piece.className = 'piece';
                piece.textContent = getPieceSymbol(board[row][col]);
                square.appendChild(piece);
            }
            square.dataset.row = row;
            square.dataset.col = col;
            chessBoard.appendChild(square);
        }
    }
}

function getPieceSymbol(piece) {
    const pieceSymbols = {
        'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
        'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
    };
    return pieceSymbols[piece];
}

function restartGame() {
    // Codice per resettare la partita
}

function changePlayerColor() {
    currentPlayer = document.getElementById('player-color').value;
    restartGame();
}

function makeMove(move) {
    // Aggiorna la scacchiera con la mossa del giocatore
    // ...
    drawBoard();
    if (currentPlayer !== 'black') {  // Se è il turno del computer
        stockfish.postMessage('position fen ' + boardToFen());
        stockfish.postMessage('go depth 15');
    }
}

stockfish.onmessage = function(event) {
    const bestMove = parseBestMove(event.data);
    if (bestMove) {
        // Esegui la mossa del computer sulla scacchiera
        // ...
        drawBoard();
    }
};

function parseBestMove(data) {
    const match = data.match(/bestmove\s([a-h][1-8][a-h][1-8])/);
    return match ? match[1] : null;
}

function boardToFen() {
    // Funzione per convertire la scacchiera in FEN string
}
