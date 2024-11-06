// Tạo class ConnectFourAI
class ConnectFourAI {
    constructor(board, rows = 6, cols = 7) {
        this.board = this.convertTo2DArray(board, rows, cols);
        this.rows = rows;
        this.cols = cols;
        this.EMPTY = null;
        this.PLAYER = 'X';
        this.AI = 'O';

        this.LiveOne = 10;
        this.DeadOne = 1;
        this.LiveTwo = 100;
        this.DeadTwo = 10;
        this.LiveThree = 1000;
        this.DeadThree = 100;
        this.LiveFour = 10000;
        this.DeadFour = 1000;
        this.Five = 100000;

        this.hashTable = this.initHashTable(rows, cols);
        this.transpositionTable = new Map();
    }

    convertTo2DArray(board, rows, cols) {
        const grid = [];
        for (let i = 0; i < rows; i++) {
            grid[i] = board.slice(i * cols, (i + 1) * cols);
        }
        return grid;
    }

    findBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        let validMoves = [];

        // Tìm tất cả các cột có thể đi
        for (let col = 0; col < this.cols; col++) {
            const row = this.getLowestEmptyRow(col);
            if (row !== -1) {
                validMoves.push(col);
            }
        }

        // Nếu không có nước đi hợp lệ, trả về null
        if (validMoves.length === 0) {
            return null;
        }

        // Chọn ngẫu nhiên một trong các nước đi tốt nhất
        for (let col of validMoves) {
            const row = this.getLowestEmptyRow(col);
            this.board[row][col] = this.AI;
            let score = this.minimax(this.board, 5, false, -Infinity, Infinity);
            this.board[row][col] = this.EMPTY;

            if (score > bestScore) {
                bestScore = score;
                bestMove = col;
            }
        }

        return bestMove;
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
        // Kiểm tra điều kiện dừng
        if (depth === 0 || this.isGameOver(board)) {
            return this.evaluateBoard(board);
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (let col = 0; col < this.cols; col++) {
                const row = this.getLowestEmptyRow(col);
                if (row !== -1) {
                    board[row][col] = this.AI;
                    let score = this.minimax(board, depth - 1, false, alpha, beta);
                    board[row][col] = this.EMPTY;
                    maxScore = Math.max(score, maxScore);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break;
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (let col = 0; col < this.cols; col++) {
                const row = this.getLowestEmptyRow(col);
                if (row !== -1) {
                    board[row][col] = this.PLAYER;
                    let score = this.minimax(board, depth - 1, true, alpha, beta);
                    board[row][col] = this.EMPTY;
                    minScore = Math.min(score, minScore);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break;
                }
            }
            return minScore;
        }
    }

    getLowestEmptyRow(col) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === this.EMPTY) {
                return row;
            }
        }
        return -1;
    }

    // Các hàm đánh giá và kiểm tra trạng thái game
    evaluateBoard(board) {
        let score = 0;
        const restrictions = this.getRestrictions(board);
        const [minRow, minCol, maxRow, maxCol] = restrictions;

        // Đánh giá theo hướng ngang (horizontal)
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol - 3; col++) {
                score += this.evaluateDirection(
                    [board[row][col],
                    board[row][col + 1],
                    board[row][col + 2],
                    board[row][col + 3]]
                );
            }
        }

        // Đánh giá theo hướng dọc (vertical)
        for (let col = minCol; col <= maxCol; col++) {
            for (let row = minRow; row <= maxRow - 3; row++) {
                score += this.evaluateDirection(
                    [board[row][col],
                    board[row + 1][col],
                    board[row + 2][col],
                    board[row + 3][col]]
                );
            }
        }

        // Đánh giá theo đường chéo xuống (diagonal down)
        for (let row = minRow; row <= maxRow - 3; row++) {
            for (let col = minCol; col <= maxCol - 3; col++) {
                score += this.evaluateDirection(
                    [board[row][col],
                    board[row + 1][col + 1],
                    board[row + 2][col + 2],
                    board[row + 3][col + 3]]
                );
            }
        }

        // Đánh giá theo đường chéo lên (diagonal up)
        for (let row = maxRow; row >= minRow + 3; row--) {
            for (let col = minCol; col <= maxCol - 3; col++) {
                score += this.evaluateDirection(
                    [board[row][col],
                    board[row - 1][col + 1],
                    board[row - 2][col + 2],
                    board[row - 3][col + 3]]
                );
            }
        }

        return score;
    }

    evaluateDirection(cells) {
        let aiCount = 0;
        let playerCount = 0;
        let empty = 0;

        cells.forEach(cell => {
            if (cell === this.AI) aiCount++;
            else if (cell === this.PLAYER) playerCount++;
            else empty++;
        });

        if (aiCount === 4) return this.Five;
        if (playerCount === 4) return -this.Five;

        if (empty === 0) return 0;

        if (aiCount === 3 && empty === 1) return this.LiveThree;
        if (playerCount === 3 && empty === 1) return -this.LiveThree;

        if (aiCount === 2 && empty === 2) return this.LiveTwo;
        if (playerCount === 2 && empty === 2) return -this.LiveTwo;

        return 0;
    }

    getRestrictions(board) {
        let minRow = this.rows;
        let minCol = this.cols;
        let maxRow = 0;
        let maxCol = 0;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (board[i][j] !== this.EMPTY) {
                    minRow = Math.min(minRow, i);
                    minCol = Math.min(minCol, j);
                    maxRow = Math.max(maxRow, i);
                    maxCol = Math.max(maxCol, j);
                }
            }
        }

        return [
            Math.max(0, minRow - 2),
            Math.max(0, minCol - 2),
            Math.min(this.rows - 1, maxRow + 2),
            Math.min(this.cols - 1, maxCol + 2)
        ];
    }

    isGameOver(board) {
        // Kiểm tra chiến thắng theo hàng ngang
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols - 3; col++) {
                if (board[row][col] !== this.EMPTY &&
                    board[row][col] === board[row][col + 1] &&
                    board[row][col] === board[row][col + 2] &&
                    board[row][col] === board[row][col + 3]) {
                    return true;
                }
            }
        }

        // Kiểm tra theo cột
        for (let row = 0; row < this.rows - 3; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (board[row][col] !== this.EMPTY &&
                    board[row][col] === board[row + 1][col] &&
                    board[row][col] === board[row + 2][col] &&
                    board[row][col] === board[row + 3][col]) {
                    return true;
                }
            }
        }

        // Kiểm tra đường chéo
        for (let row = 0; row < this.rows - 3; row++) {
            for (let col = 0; col < this.cols - 3; col++) {
                if (board[row][col] !== this.EMPTY &&
                    board[row][col] === board[row + 1][col + 1] &&
                    board[row][col] === board[row + 2][col + 2] &&
                    board[row][col] === board[row + 3][col + 3]) {
                    return true;
                }
            }
        }

        for (let row = 3; row < this.rows; row++) {
            for (let col = 0; col < this.cols - 3; col++) {
                if (board[row][col] !== this.EMPTY &&
                    board[row][col] === board[row - 1][col + 1] &&
                    board[row][col] === board[row - 2][col + 2] &&
                    board[row][col] === board[row - 3][col + 3]) {
                    return true;
                }
            }
        }

        return false;
    }

    initHashTable(rows, cols) {
        const table = [];
        for (let i = 0; i < rows; i++) {
            table[i] = [];
            for (let j = 0; j < cols; j++) {
                table[i][j] = [
                    this.random32(), // Cho người chơi
                    this.random32()  // Cho AI
                ];
            }
        }
        return table;
    }

    random32() {
        const o = new Uint32Array(1);
        crypto.getRandomValues(o);
        return o[0];
    }
}

// Xử lý message từ main thread
self.onmessage = function (e) {
    const { board, rows, cols } = e.data;
    const ai = new ConnectFourAI(board, rows, cols);
    const bestMove = ai.findBestMove();
    self.postMessage(bestMove);
};