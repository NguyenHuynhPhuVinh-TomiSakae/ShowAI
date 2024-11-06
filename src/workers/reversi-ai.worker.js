class ReversiAI {
    constructor(board, size = 8) {
        this.board = this.convertTo2DArray(board, size);
        this.size = size;
        this.EMPTY = null;
        this.PLAYER = 'B';
        this.AI = 'W';

        // Điều chỉnh trọng số cho phù hợp hơn
        this.CORNER_WEIGHT = 100;    // Tăng giá trị góc
        this.EDGE_WEIGHT = 15;       // Tăng giá trị cạnh
        this.MOBILITY_WEIGHT = 10;    // Tăng giá trị tính di động
        this.PIECE_WEIGHT = 1;       // Thêm trọng số cho số quân

        this.MAX_DEPTH = 5;          // Có thể điều chỉnh độ sâu tùy theo mức độ khó
    }

    convertTo2DArray(board, size) {
        const grid = [];
        for (let i = 0; i < size; i++) {
            grid[i] = board.slice(i * size, (i + 1) * size);
        }
        return grid;
    }

    convertTo1DArray(board) {
        return board.flat();
    }

    getValidMoves(board, player) {
        const moves = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.isValidMove(board, i, j, player)) {
                    moves.push(i * this.size + j);
                }
            }
        }
        return moves;
    }

    isValidMove(board, row, col, player) {
        if (board[row][col] !== this.EMPTY) return false;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        return directions.some(([dRow, dCol]) => {
            return this.canFlip(board, row, col, dRow, dCol, player);
        });
    }

    canFlip(board, row, col, dRow, dCol, player) {
        let currentRow = row + dRow;
        let currentCol = col + dCol;
        let hasOpponent = false;

        while (
            currentRow >= 0 && currentRow < this.size &&
            currentCol >= 0 && currentCol < this.size
        ) {
            const currentCell = board[currentRow][currentCol];
            if (currentCell === this.EMPTY) return false;
            if (currentCell === player) return hasOpponent;
            hasOpponent = true;
            currentRow += dRow;
            currentCol += dCol;
        }

        return false;
    }

    makeMove(board, row, col, player) {
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = player;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        directions.forEach(([dRow, dCol]) => {
            if (this.canFlip(board, row, col, dRow, dCol, player)) {
                let currentRow = row + dRow;
                let currentCol = col + dCol;

                while (true) {
                    if (newBoard[currentRow][currentCol] === player) break;
                    newBoard[currentRow][currentCol] = player;
                    currentRow += dRow;
                    currentCol += dCol;
                }
            }
        });

        return newBoard;
    }

    evaluateBoard(board) {
        let score = 0;

        // Đánh giá góc
        const corners = [
            [0, 0], [0, this.size - 1],
            [this.size - 1, 0], [this.size - 1, this.size - 1]
        ];
        corners.forEach(([row, col]) => {
            if (board[row][col] === this.AI) score += this.CORNER_WEIGHT;
            else if (board[row][col] === this.PLAYER) score -= this.CORNER_WEIGHT;
        });

        // Đánh giá cạnh và số quân
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (board[i][j] === this.AI) {
                    score += this.PIECE_WEIGHT;
                    if (i === 0 || i === this.size - 1 || j === 0 || j === this.size - 1) {
                        score += this.EDGE_WEIGHT;
                    }
                } else if (board[i][j] === this.PLAYER) {
                    score -= this.PIECE_WEIGHT;
                    if (i === 0 || i === this.size - 1 || j === 0 || j === this.size - 1) {
                        score -= this.EDGE_WEIGHT;
                    }
                }
            }
        }

        // Đánh giá tính di động
        const aiMoves = this.getValidMoves(board, this.AI).length;
        const playerMoves = this.getValidMoves(board, this.PLAYER).length;
        score += (aiMoves - playerMoves) * this.MOBILITY_WEIGHT;

        return score;
    }

    minimax(board, depth, alpha, beta, maximizingPlayer) {
        if (depth === 0) {
            return this.evaluateBoard(board);
        }

        const validMoves = this.getValidMoves(board, maximizingPlayer ? this.AI : this.PLAYER);
        if (validMoves.length === 0) {
            const otherPlayerMoves = this.getValidMoves(board, maximizingPlayer ? this.PLAYER : this.AI);
            if (otherPlayerMoves.length === 0) {
                return this.evaluateBoard(board);
            }
            return this.minimax(board, depth - 1, alpha, beta, !maximizingPlayer);
        }

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of validMoves) {
                const row = Math.floor(move / this.size);
                const col = move % this.size;
                const newBoard = this.makeMove(board, row, col, this.AI);
                const evaluation = this.minimax(newBoard, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of validMoves) {
                const row = Math.floor(move / this.size);
                const col = move % this.size;
                const newBoard = this.makeMove(board, row, col, this.PLAYER);
                const evaluation = this.minimax(newBoard, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    findBestMove() {
        const validMoves = this.getValidMoves(this.board, this.AI);
        if (validMoves.length === 0) return null;

        let bestScore = -Infinity;
        let bestMove = validMoves[0];

        for (const move of validMoves) {
            const row = Math.floor(move / this.size);
            const col = move % this.size;
            const newBoard = this.makeMove(this.board, row, col, this.AI);
            const score = this.minimax(newBoard, this.MAX_DEPTH, -Infinity, Infinity, false);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }
}

self.onmessage = function (e) {
    const { board, size } = e.data;
    const ai = new ReversiAI(board, size);
    const bestMove = ai.findBestMove();
    self.postMessage(bestMove);
};
