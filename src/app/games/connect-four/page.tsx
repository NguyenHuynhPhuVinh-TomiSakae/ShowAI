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

const ROWS = 6;
const COLS = 7;
const BOARD_SIZE = ROWS * COLS;

const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

export default function ConnectFourGame() {
    const [board, setBoard] = useState<Board>(Array(BOARD_SIZE).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState({ player: 0, computer: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [lastMove, setLastMove] = useState<number | null>(null);

    const getLowestEmptyCell = (col: number): number => {
        // Kiểm tra từ dưới lên trên
        for (let row = ROWS - 1; row >= 0; row--) {
            const index = row * COLS + col;
            // Kiểm tra nghiêm ngặt hơn
            if (board[index] === null) {
                return index;
            }
        }
        return -1;
    };

    const checkWinner = (squares: Board, lastMove: number): Player | null => {
        if (lastMove === -1) return null;

        const row = Math.floor(lastMove / COLS);
        const col = lastMove % COLS;
        const player = squares[lastMove];

        // Kiểm tra ngang
        for (let c = Math.max(0, col - 3); c <= col; c++) {
            if (c + 3 < COLS) {
                if (squares[row * COLS + c] === player &&
                    squares[row * COLS + c + 1] === player &&
                    squares[row * COLS + c + 2] === player &&
                    squares[row * COLS + c + 3] === player) {
                    return player;
                }
            }
        }

        // Kiểm tra dọc
        for (let r = Math.max(0, row - 3); r <= row; r++) {
            if (r + 3 < ROWS) {
                if (squares[r * COLS + col] === player &&
                    squares[(r + 1) * COLS + col] === player &&
                    squares[(r + 2) * COLS + col] === player &&
                    squares[(r + 3) * COLS + col] === player) {
                    return player;
                }
            }
        }

        // Kiểm tra đường chéo chính
        for (let r = -3; r <= 0; r++) {
            const currentRow = row + r;
            const currentCol = col + r;
            if (currentRow >= 0 && currentRow + 3 < ROWS &&
                currentCol >= 0 && currentCol + 3 < COLS) {
                if (squares[currentRow * COLS + currentCol] === player &&
                    squares[(currentRow + 1) * COLS + (currentCol + 1)] === player &&
                    squares[(currentRow + 2) * COLS + (currentCol + 2)] === player &&
                    squares[(currentRow + 3) * COLS + (currentCol + 3)] === player) {
                    return player;
                }
            }
        }

        // Kiểm tra đường chéo phụ
        for (let r = -3; r <= 0; r++) {
            const currentRow = row + r;
            const currentCol = col - r;
            if (currentRow >= 0 && currentRow + 3 < ROWS &&
                currentCol < COLS && currentCol - 3 >= 0) {
                if (squares[currentRow * COLS + currentCol] === player &&
                    squares[(currentRow + 1) * COLS + (currentCol - 1)] === player &&
                    squares[(currentRow + 2) * COLS + (currentCol - 2)] === player &&
                    squares[(currentRow + 3) * COLS + (currentCol - 3)] === player) {
                    return player;
                }
            }
        }

        return null;
    };

    const handleGameEnd = (winner: Player) => {
        setGameOver(true);

        if (winner === 'X') {
            setScore(prev => ({ ...prev, player: prev.player + 1 }));
            toast.success('Chúc mừng! Bạn đã thắng! 🎉', toastStyle);
        } else if (winner === 'O') {
            setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
            toast.error('AI đã thắng! Hãy thử lại! 😢', toastStyle);
        } else {
            toast('Ván cờ hòa! Bàn cờ đã đầy! 🤝', toastStyle);
        }
    };

    const handleClick = async (col: number) => {
        if (gameOver || !isPlayerTurn || isLoading) return;

        const index = getLowestEmptyCell(col);
        if (index === -1) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setLastMove(index);

        const winner = checkWinner(newBoard, index);
        if (winner || !newBoard.includes(null)) {
            handleGameEnd(winner);
            return;
        }

        setIsPlayerTurn(false);
        makeAIMove(newBoard);
    };

    const makeAIMove = (currentBoard: Board) => {
        setIsLoading(true);

        const worker = new Worker(new URL('../../../workers/connect-four-ai.worker.js', import.meta.url));

        worker.postMessage({
            board: currentBoard,
            rows: ROWS,
            cols: COLS
        });

        worker.onmessage = (e) => {
            const bestCol = e.data;

            if (bestCol !== null) {
                let lowestEmptyIndex = -1;
                for (let row = ROWS - 1; row >= 0; row--) {
                    const index = row * COLS + bestCol;
                    if (currentBoard[index] === null) {
                        lowestEmptyIndex = index;
                        break;
                    }
                }

                if (lowestEmptyIndex !== -1) {
                    const newBoard = [...currentBoard];
                    newBoard[lowestEmptyIndex] = 'O';
                    setBoard(newBoard);
                    setLastMove(lowestEmptyIndex);

                    const winner = checkWinner(newBoard, lowestEmptyIndex);
                    if (winner || !newBoard.includes(null)) {
                        handleGameEnd(winner);
                    }
                }
            }

            worker.terminate();
            setIsLoading(false);
            setIsPlayerTurn(true);
        };
    };

    const resetGame = () => {
        setBoard(Array(BOARD_SIZE).fill(null));
        setIsPlayerTurn(true);
        setGameOver(false);
        setLastMove(null);
    };

    const resetScore = () => {
        setScore({ player: 0, computer: 0 });
        resetGame();
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Cờ Thả (Connect Four)</h1>
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
                    <div className="grid grid-cols-7 gap-[2px] max-w-fit mx-auto mb-8 bg-gray-700">
                        {board.map((cell, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: !gameOver && isPlayerTurn ? 1.05 : 1 }}
                                whileTap={{ scale: !gameOver && isPlayerTurn ? 0.95 : 1 }}
                                onClick={() => handleClick(index % COLS)}
                                disabled={gameOver || !isPlayerTurn || isLoading}
                                className={`aspect-square min-w-[40px] min-h-[40px] text-2xl font-bold flex items-center justify-center
                                    ${cell ? 'bg-gray-700' : 'bg-purple-600 hover:bg-purple-700'}
                                    ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
                                    ${index === lastMove ? 'text-red-500' : ''}
                                    ${cell === 'X' ? 'text-yellow-400' : cell === 'O' ? 'text-red-400' : ''}
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
                                    cell && '●'
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
