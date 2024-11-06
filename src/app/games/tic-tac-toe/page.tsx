'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSync } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ModalPortal from '@/components/ModalPortal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type Player = 'X' | 'O' | null;
type Board = Player[];
type GameResult = 'thắng' | 'thua' | 'hòa' | null;

const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

type GameHistory = {
    board: Board;
    result: GameResult;
}[];

// Thay đổi kích thước bàn cờ
const BOARD_SIZE = 15; // 15x15

export default function TicTacToeGame() {
    // Thay đổi khởi tạo bàn cờ
    const [board, setBoard] = useState<Board>(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState({ player: 0, computer: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [, setGameHistory] = useState<GameHistory>([]);

    const checkWinner = (squares: Board, lastMove: number): Player | null => {
        if (lastMove === -1) return null;

        const row = Math.floor(lastMove / BOARD_SIZE);
        const col = lastMove % BOARD_SIZE;
        const player = squares[lastMove];

        // Kiểm tra hàng ngang
        const checkHorizontal = () => {
            for (let i = Math.max(0, col - 4); i <= Math.min(col, BOARD_SIZE - 5); i++) {
                let count = 0;
                for (let j = 0; j < 5; j++) {
                    if (squares[row * BOARD_SIZE + (i + j)] === player) count++;
                }
                if (count === 5) return true;
            }
            return false;
        };

        // Kiểm tra hàng dọc
        const checkVertical = () => {
            for (let i = Math.max(0, row - 4); i <= Math.min(row, BOARD_SIZE - 5); i++) {
                let count = 0;
                for (let j = 0; j < 5; j++) {
                    if (squares[(i + j) * BOARD_SIZE + col] === player) count++;
                }
                if (count === 5) return true;
            }
            return false;
        };

        // Kiểm tra đường chéo chính
        const checkDiagonal1 = () => {
            for (let i = -4; i <= 0; i++) {
                if (row + i < 0 || col + i < 0 || row + i + 4 >= BOARD_SIZE || col + i + 4 >= BOARD_SIZE) continue;
                let count = 0;
                for (let j = 0; j < 5; j++) {
                    if (squares[(row + i + j) * BOARD_SIZE + (col + i + j)] === player) count++;
                }
                if (count === 5) return true;
            }
            return false;
        };

        // Kiểm tra đường chéo phụ
        const checkDiagonal2 = () => {
            for (let i = -4; i <= 0; i++) {
                if (row + i < 0 || col - i >= BOARD_SIZE || row + i + 4 >= BOARD_SIZE || col - i - 4 < 0) continue;
                let count = 0;
                for (let j = 0; j < 5; j++) {
                    if (squares[(row + i + j) * BOARD_SIZE + (col - i - j)] === player) count++;
                }
                if (count === 5) return true;
            }
            return false;
        };

        if (checkHorizontal() || checkVertical() || checkDiagonal1() || checkDiagonal2()) {
            return player;
        }

        return null;
    };

    const getAIMove = async (currentBoard: Board): Promise<number> => {
        setIsLoading(true);
        try {
            // Tạo delay ngẫu nhiên từ 500ms đến 2000ms
            const randomDelay = Math.floor(Math.random() * (2000 - 500 + 1)) + 500;
            await new Promise(resolve => setTimeout(resolve, randomDelay));

            // Trực tiếp sử dụng logic findBestMove thay vì gọi API
            return findBestMove(currentBoard);

        } catch (error) {
            console.error('Lỗi khi lấy nước đi của AI:', error);
            return findBestMove(currentBoard);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm tìm nước đi tốt nhất khi AI trả về kết quả không hợp lệ
    const findBestMove = (currentBoard: Board): number => {
        // Tìm các quân đã đánh
        const playedMoves = currentBoard.reduce((acc, cell, index) => {
            if (cell) acc.push(index);
            return acc;
        }, [] as number[]);

        if (playedMoves.length === 0) {
            // Nếu là nước đi đầu tiên, đánh vào trung tâm
            return Math.floor(BOARD_SIZE * BOARD_SIZE / 2);
        }

        // Tìm vùng các quân đã đánh
        const minRow = Math.floor(Math.min(...playedMoves) / BOARD_SIZE);
        const maxRow = Math.floor(Math.max(...playedMoves) / BOARD_SIZE);
        const minCol = Math.min(...playedMoves) % BOARD_SIZE;
        const maxCol = Math.max(...playedMoves) % BOARD_SIZE;

        // Mở rộng vùng tìm kiếm
        const searchMinRow = Math.max(0, minRow - 2);
        const searchMaxRow = Math.min(BOARD_SIZE - 1, maxRow + 2);
        const searchMinCol = Math.max(0, minCol - 2);
        const searchMaxCol = Math.min(BOARD_SIZE - 1, maxCol + 2);

        // Tìm ô trống tốt nhất trong vùng tìm kiếm
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let row = searchMinRow; row <= searchMaxRow; row++) {
            for (let col = searchMinCol; col <= searchMaxCol; col++) {
                const index = row * BOARD_SIZE + col;
                if (currentBoard[index] === null) {
                    const score = evaluateMove(currentBoard, index);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = index;
                    }
                }
            }
        }

        return bestMove !== -1 ? bestMove : currentBoard.findIndex(cell => cell === null);
    };

    // Hàm đánh giá điểm số cho một nước đi
    const evaluateMove = (board: Board, index: number): number => {
        const row = Math.floor(index / BOARD_SIZE);
        const col = index % BOARD_SIZE;
        let score = 0;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dx, dy] of directions) {
            let countX = 0;
            let countO = 0;
            let empty = 0;
            let blocked = false;
            let nearX = 0;
            let nearO = 0;
            let openEnds = 0; // Đếm số đầu mở

            // Kiểm tra cả hai đầu của dãy quân
            const checkLine = (startOffset: number, endOffset: number) => {
                for (let i = startOffset; i <= endOffset; i++) {
                    const newRow = row + dx * i;
                    const newCol = col + dy * i;

                    if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
                        blocked = true;
                        continue;
                    }

                    const cell = board[newRow * BOARD_SIZE + newCol];
                    if (cell === 'X') {
                        countX++;
                        if (Math.abs(i) <= 2) nearX++;
                    }
                    else if (cell === 'O') {
                        countO++;
                        if (Math.abs(i) <= 2) nearO++;
                    }
                    else {
                        empty++;
                        // Kiểm tra xem đây có phải là đầu mở không
                        if (i === startOffset || i === endOffset) {
                            openEnds++;
                        }
                    }
                }
            };

            // Kiểm tra 6 ô liên tiếp để có thể thấy được cả hai đầu của dãy 4 quân
            checkLine(-5, 5);

            // Tính điểm với logic mới
            if (countX === 4) {
                if (openEnds === 2) {
                    score += 200000; // Ưu tiên cao nhất cho việc chặn 4 quân 2 đầu mở
                } else if (openEnds === 1) {
                    score += 90000; // Chặn 4 quân 1 đầu mở
                }
            }

            if (countO === 4) {
                if (openEnds >= 1) {
                    score += 180000; // Tạo 5 quân để thắng
                }
            }

            // Các trường hợp khác
            if (countO === 3 && empty >= 2 && openEnds === 2) score += 70000;  // Tạo thế 3 quân 2 đầu mở
            if (countX === 3 && empty >= 2 && openEnds === 2) score += 65000;  // Chặn thế 3 quân 2 đầu mở
            if (countO === 3 && empty >= 2 && !blocked) score += 50000;  // Tạo cơ hội thắng
            if (countX === 3 && empty >= 2 && !blocked) score += 45000;  // Chặn 3 quân
            if (countO === 2 && empty >= 3 && openEnds === 2) score += 2000;   // Tạo thế 2 quân 2 đầu mở
            if (countX === 2 && empty >= 3 && openEnds === 2) score += 1800;   // Chặn thế 2 quân 2 đầu mở

            // Thêm điểm cho các tình huống đặc biệt
            if (nearO >= 2) score += 300;
            if (nearX >= 2) score += 250;

            // Thêm điểm cho vị trí chiến lược
            const centerBonus = Math.abs(row - BOARD_SIZE / 2) + Math.abs(col - BOARD_SIZE / 2);
            score += (BOARD_SIZE - centerBonus) * 10;
        }

        score += Math.random() * 50; // Giảm yếu tố ngẫu nhiên để AI ổn định hơn

        return score;
    };

    const handleClick = async (index: number) => {
        if (board[index] || gameOver || !isPlayerTurn || isLoading) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsPlayerTurn(false);

        const winner = checkWinner(newBoard, index);
        if (winner || !newBoard.includes(null)) {
            handleGameEnd(winner);
            return;
        }

        // Lượt của AI
        const aiMove = await getAIMove(newBoard);
        newBoard[aiMove] = 'O';
        setBoard(newBoard);
        setIsPlayerTurn(true);

        const finalWinner = checkWinner(newBoard, aiMove);
        if (finalWinner || !newBoard.includes(null)) {
            handleGameEnd(finalWinner);
        }
    };

    const handleGameEnd = (winner: Player) => {
        setGameOver(true);
        let result: GameResult = null;

        if (winner === 'X') {
            result = 'thắng';
            setScore(prev => ({ ...prev, player: prev.player + 1 }));
            toast.success('Chúc mừng! Bạn đã thắng với 5 quân liên tiếp! 🎉', toastStyle);
        } else if (winner === 'O') {
            result = 'thua';
            setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
            toast.error('AI đã thắng với 5 quân liên tiếp! Hãy thử lại! 😢', toastStyle);
        } else {
            result = 'hòa';
            toast('Ván cờ hòa! Bàn cờ đã đầy! 🤝', toastStyle);
        }

        setGameHistory(prev => [...prev, {
            board: [...board],
            result,
            lastMove: board.findIndex((cell, i) =>
                prev.length === 0 || prev[prev.length - 1].board[i] !== cell
            )
        }]);
    };

    const resetGame = () => {
        setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
        setIsPlayerTurn(true);
        setGameOver(false);
    };

    const resetScore = () => {
        setScore({ player: 0, computer: 0 });
        setGameHistory([]);
        resetGame();
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Cờ Caro</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Đấu với AI thông minh!
                </p>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={resetGame}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                        disabled={isLoading}
                    >
                        <FaSync className={isLoading ? 'animate-spin' : ''} />
                        Ván mới
                    </button>
                    <button
                        onClick={resetScore}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                        disabled={isLoading}
                    >
                        Reset tất cả
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className="text-xl font-bold">
                        Tỉ số: Bạn {score.player} - {score.computer} AI
                    </div>
                </div>

                <div className="overflow-auto p-4">
                    <div className="grid grid-cols-[repeat(15,minmax(40px,1fr))] gap-[2px] max-w-fit mx-auto mb-8 bg-gray-700">
                        {board.map((cell, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: cell ? 1 : 1.05 }}
                                whileTap={{ scale: cell ? 1 : 0.95 }}
                                onClick={() => handleClick(index)}
                                disabled={!!cell || gameOver || !isPlayerTurn || isLoading}
                                className={`aspect-square min-w-[40px] min-h-[40px] text-2xl font-bold flex items-center justify-center
                                    ${cell ? 'bg-gray-700' : 'bg-purple-600 hover:bg-purple-700'}
                                    ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
                                `}
                            >
                                {isLoading && !cell ? (
                                    <Skeleton
                                        width={30}
                                        height={30}
                                        baseColor="#1F2937"
                                        highlightColor="#374151"
                                        borderRadius={6}
                                    />
                                ) : (
                                    cell
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
