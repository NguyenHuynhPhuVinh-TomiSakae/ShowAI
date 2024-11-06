'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSync } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ModalPortal from '@/components/ModalPortal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LeaderboardModal from '@/components/LeaderboardModal';
import { useFirebase } from '@/components/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useSupabase } from '@/hooks/useSupabase';

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
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const { auth, db } = useFirebase();
    const { supabase, loading: supabaseLoading } = useSupabase();

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
            updateLeaderboard();
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

        // Đợi animation hoàn thành (500ms + buffer 100ms)
        await new Promise(resolve => setTimeout(resolve, 600));

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

    const getDropAnimation = (index: number) => {
        const row = Math.floor(index / COLS);
        const startRow = 0;
        const distance = (row - startRow) * 100;

        return {
            initial: { y: -distance, opacity: 1 },
            animate: { y: 0, opacity: 1 },
            transition: {
                type: "spring",
                stiffness: 150,     // Giảm xuống 150
                damping: 15,        // Giảm xuống 15
                mass: 3,            // Tăng lên 3
                velocity: 2,        // Giảm xuống 2
                duration: 0.5       // Thêm duration để kiểm soát thời gian
            }
        };
    };

    const updateLeaderboard = async () => {
        if (!auth?.currentUser || !db || !supabase || supabaseLoading) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const userData = userDoc.data();

            const { data: existingRecord } = await supabase
                .from('connectfour_leaderboard')
                .select('wins')
                .eq('firebase_id', auth.currentUser.uid)
                .single();

            const { error } = await supabase
                .from('connectfour_leaderboard')
                .upsert(
                    {
                        firebase_id: auth.currentUser.uid,
                        display_name: userData?.displayName || 'Người chơi ẩn danh',
                        wins: existingRecord ? existingRecord.wins + 1 : 1,
                    },
                    { onConflict: 'firebase_id' }
                );

            if (error) throw error;
        } catch (error) {
            console.error('Lỗi khi cập nhật bảng xếp hạng:', error);
        }
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-4 sm:py-8 mb-4 sm:mb-8 px-2 sm:px-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Cờ Thả (Connect Four)</h1>
                <p className="text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
                    Đấu với AI thông minh!
                </p>
            </div>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-8">
                    <button
                        onClick={resetGame}
                        className="flex items-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base"
                        disabled={isLoading}
                    >
                        <FaSync className={isLoading ? 'animate-spin' : ''} />
                        Ván mới
                    </button>
                    <button
                        onClick={resetScore}
                        className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base"
                        disabled={isLoading}
                    >
                        Reset tất cả
                    </button>
                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="bg-yellow-600 hover:bg-yellow-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base"
                        disabled={isLoading}
                    >
                        Bảng xếp hạng
                    </button>
                </div>

                <div className="text-center mb-4 sm:mb-8">
                    <div className="text-base sm:text-xl font-bold">
                        Tỉ số: Bạn {score.player} - {score.computer} AI
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-hidden pb-4">
                    <div className="min-w-[280px] sm:min-w-[320px] w-full max-w-[560px] mx-auto p-2 sm:p-4">
                        <div className="grid grid-cols-7 bg-gray-700 p-0.5 sm:p-1 gap-0.5 sm:gap-1 rounded-lg">
                            {board.map((cell, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: !gameOver && isPlayerTurn ? 1.05 : 1 }}
                                    whileTap={{ scale: !gameOver && isPlayerTurn ? 0.95 : 1 }}
                                    onClick={() => handleClick(index % COLS)}
                                    disabled={gameOver || !isPlayerTurn || isLoading}
                                    className={`relative w-full pt-[100%] 
                                    ${cell ? 'bg-gray-800' : 'bg-white/5 hover:bg-white/10'}
                                    ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
                                    ${index === lastMove ? 'ring-1 sm:ring-2 ring-yellow-400' : ''}
                                    rounded-full transition-colors
                                `}
                                >
                                    {(cell || isLoading) && (
                                        <motion.div
                                            className={`absolute inset-0 flex items-center justify-center`}
                                            initial="initial"
                                            animate="animate"
                                            variants={getDropAnimation(index)}
                                            key={`${index}-${cell}`}
                                            onAnimationComplete={() => {
                                                // Có thể thêm logic phụ ở đây nếu cần
                                            }}
                                        >
                                            {isLoading && !cell ? (
                                                <Skeleton
                                                    width="70%"
                                                    height="70%"
                                                    baseColor="#1F2937"
                                                    highlightColor="#374151"
                                                    borderRadius="50%"
                                                />
                                            ) : (
                                                <div className={`w-[80%] h-[80%] rounded-full
                                                ${cell === 'X' ? 'bg-yellow-500' : cell === 'O' ? 'bg-red-500' : ''}
                                                shadow-lg
                                            `} />
                                            )}
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <LeaderboardModal
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
                tableName="connectfour_leaderboard"
            />
        </div>
    );
}
