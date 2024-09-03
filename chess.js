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
    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    currentPlayer = document.getElementById('player-color').value;
    drawBoard();

    if (currentPlayer === 'black') {
        // Se il giocatore ha scelto nero, lascia al computer la prima mossa
        stockfish.postMessage('position startpos');
        stockfish.postMessage('go depth 15');
    }
}

function changePlayerColor() {
    currentPlayer = document.getElementById('player-color').value;
    restartGame();
}

let stockfish = new Worker('stockfish.js');

stockfish.onmessage = function(event) {
    const bestMove = parseBestMove(event.data);
    if (bestMove) {
        // Esegui la mossa del computer sulla scacchiera
        console.log("Mossa del computer:", bestMove);
        // Codice per aggiornare la scacchiera
    }
};

function makeMove(move) {
    const fromRow = parseInt(move[1]);
    const fromCol = move.charCodeAt(0) - 'a'.charCodeAt(0);
    const toRow = parseInt(move[3]);
    const toCol = move.charCodeAt(2) - 'a'.charCodeAt(0);

    // Aggiorna la scacchiera
    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = '';

    drawBoard();

    // Invia il nuovo FEN a Stockfish
    const fen = boardToFen();
    stockfish.postMessage('position fen ' + fen);
    stockfish.postMessage('go depth 15');
}

stockfish.onmessage = function(event) {
    const bestMove = parseBestMove(event.data);
    if (bestMove) {
        const fromCol = bestMove[0].charCodeAt(0) - 'a'.charCodeAt(0);
        const fromRow = 8 - parseInt(bestMove[1]);
        const toCol = bestMove[2].charCodeAt(0) - 'a'.charCodeAt(0);
        const toRow = 8 - parseInt(bestMove[3]);

        // Aggiorna la scacchiera con la mossa del computer
        board[toRow][toCol] = board[fromRow][fromCol];
        board[fromRow][fromCol] = '';

        drawBoard();
        // Cambia il turno al giocatore
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    }
};

function parseBestMove(data) {
    const match = data.match(/bestmove\s([a-h][1-8][a-h][1-8])/);
    return match ? match[1] : null;
}

function boardToFen() {
    let fen = '';

    for (let row = 0; row < 8; row++) {
        let emptySquares = 0;
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === '') {
                emptySquares++;
            } else {
                if (emptySquares > 0) {
                    fen += emptySquares;
                    emptySquares = 0;
                }
                fen += board[row][col];
            }
        }
        if (emptySquares > 0) {
            fen += emptySquares;
        }
        if (row < 7) fen += '/';
    }

    // Aggiungi informazioni sul turno
    fen += ' ' + (currentPlayer === 'white' ? 'w' : 'b') + ' ';
    fen += 'KQkq - 0 1';  // Assumendo nessuna informazione sugli arroccamenti, en passant, ecc.

    return fen;
}

let selectedPiece = null;
let selectedSquare = null;

document.getElementById('chess-board').addEventListener('click', function(event) {
    const square = event.target.closest('.square');
    if (!square) return;

    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    if (selectedPiece === null) {
        // Se non c'è un pezzo selezionato, seleziona il pezzo
        if (board[row][col] && isPlayerPiece(board[row][col])) {
            selectedPiece = board[row][col];
            selectedSquare = { row: row, col: col };
            highlightSquare(square, true);
        }
    } else {
        // Se c'è già un pezzo selezionato, tenta di spostarlo
        const move = `${squareToAlgebraic(selectedSquare.row, selectedSquare.col)}${squareToAlgebraic(row, col)}`;
        
        // Controlla se la mossa è legale (questo richiederebbe ulteriori controlli, non inclusi in questo esempio)
        makeMove(move);

        // Deseleziona il pezzo e rimuovi l'evidenziazione
        selectedPiece = null;
        selectedSquare = null;
        clearHighlight();
    }
});

function isPlayerPiece(piece) {
    // Verifica se il pezzo appartiene al giocatore corrente
    return (currentPlayer === 'white' && piece === piece.toUpperCase()) ||
           (currentPlayer === 'black' && piece === piece.toLowerCase());
}

function squareToAlgebraic(row, col) {
    const file = String.fromCharCode('a'.charCodeAt(0) + col);
    const rank = 8 - row;
    return `${file}${rank}`;
}

function highlightSquare(square, highlight) {
    if (highlight) {
        square.style.backgroundColor = '#aaf';  // Evidenzia in blu
    } else {
        square.style.backgroundColor = '';  // Rimuove l'evidenziazione
    }
}

function clearHighlight() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        highlightSquare(square, false);
    });
}