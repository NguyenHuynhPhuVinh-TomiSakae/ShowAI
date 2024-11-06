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

type Player = 'B' | 'W' | null; // B: Black (Đen), W: White (Trắng)
type Board = Player[];

const BOARD_SIZE = 8;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

export default function ReversiGame() {
    const [board, setBoard] = useState<Board>(() => {
        const initial = Array(TOTAL_CELLS).fill(null);
        // Đặt 4 quân cờ ban đầu ở giữa bàn cờ
        const center = BOARD_SIZE / 2;
        initial[(center - 1) * BOARD_SIZE + center - 1] = 'W';
        initial[(center - 1) * BOARD_SIZE + center] = 'B';
        initial[center * BOARD_SIZE + center - 1] = 'B';
        initial[center * BOARD_SIZE + center] = 'W';
        return initial;
    });
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState({ player: 2, computer: 2 });
    const [isLoading, setIsLoading] = useState(false);
    const [lastMove, setLastMove] = useState<number | null>(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const { auth, db } = useFirebase();
    const { supabase, loading: supabaseLoading } = useSupabase();

    const getValidMoves = (currentBoard: Board, player: Player): number[] => {
        const validMoves: number[] = [];
        for (let i = 0; i < TOTAL_CELLS; i++) {
            if (currentBoard[i] === null && isValidMove(currentBoard, i, player)) {
                validMoves.push(i);
            }
        }
        return validMoves;
    };

    const isValidMove = (squares: Board, index: number, player: Player): boolean => {
        if (squares[index] !== null) return false;

        const row = Math.floor(index / BOARD_SIZE);
        const col = index % BOARD_SIZE;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1], // Trên
            [0, -1], [0, 1],           // Giữa
            [1, -1], [1, 0], [1, 1]    // Dưới
        ];

        return directions.some(([dRow, dCol]) => {
            return canFlip(squares, row, col, dRow, dCol, player);
        });
    };

    const canFlip = (squares: Board, row: number, col: number, dRow: number, dCol: number, player: Player): boolean => {
        let currentRow = row + dRow;
        let currentCol = col + dCol;
        let hasOpponent = false;

        while (
            currentRow >= 0 && currentRow < BOARD_SIZE &&
            currentCol >= 0 && currentCol < BOARD_SIZE
        ) {
            const currentIndex = currentRow * BOARD_SIZE + currentCol;
            const currentCell = squares[currentIndex];

            if (currentCell === null) return false;
            if (currentCell === player) return hasOpponent;
            hasOpponent = true;

            currentRow += dRow;
            currentCol += dCol;
        }

        return false;
    };

    const makeMove = (squares: Board, index: number, player: Player): Board => {
        const newBoard = [...squares];
        newBoard[index] = player;

        const row = Math.floor(index / BOARD_SIZE);
        const col = index % BOARD_SIZE;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        directions.forEach(([dRow, dCol]) => {
            if (canFlip(squares, row, col, dRow, dCol, player)) {
                let currentRow = row + dRow;
                let currentCol = col + dCol;

                while (true) {
                    const currentIndex = currentRow * BOARD_SIZE + currentCol;
                    if (newBoard[currentIndex] === player) break;
                    newBoard[currentIndex] = player;
                    currentRow += dRow;
                    currentCol += dCol;
                }
            }
        });

        return newBoard;
    };

    const updateScore = (currentBoard: Board) => {
        let blackCount = 0;
        let whiteCount = 0;
        currentBoard.forEach(cell => {
            if (cell === 'B') blackCount++;
            else if (cell === 'W') whiteCount++;
        });
        setScore({ player: blackCount, computer: whiteCount });
    };

    const handleClick = async (index: number) => {
        if (gameOver || !isPlayerTurn || isLoading) return;

        if (!isValidMove(board, index, 'B')) return;

        const newBoard = makeMove(board, index, 'B');
        setBoard(newBoard);
        setLastMove(index);
        updateScore(newBoard);

        const validMovesForAI = getValidMoves(newBoard, 'W');
        if (validMovesForAI.length === 0) {
            const validMovesForPlayer = getValidMoves(newBoard, 'B');
            if (validMovesForPlayer.length === 0) {
                handleGameEnd(calculateWinner(newBoard));
                return;
            }
            // Nếu AI không có nước đi, nhưng người chơi có
            setIsPlayerTurn(true);
            toast.success('AI không có nước đi hợp lệ, đến lượt bạn!', toastStyle);
            return;
        }

        setIsPlayerTurn(false);
        makeAIMove(newBoard);
    };

    const makeAIMove = (currentBoard: Board) => {
        setIsLoading(true);

        const worker = new Worker(new URL('../../../workers/reversi-ai.worker.js', import.meta.url));

        worker.postMessage({
            board: currentBoard,
            size: BOARD_SIZE
        });

        worker.onmessage = (e) => {
            const bestMove = e.data;

            if (bestMove !== null) {
                const newBoard = makeMove(currentBoard, bestMove, 'W');
                setBoard(newBoard);
                setLastMove(bestMove);
                updateScore(newBoard);

                const validMovesForPlayer = getValidMoves(newBoard, 'B');
                if (validMovesForPlayer.length === 0) {
                    const validMovesForAI = getValidMoves(newBoard, 'W');
                    if (validMovesForAI.length === 0) {
                        handleGameEnd(calculateWinner(newBoard));
                    } else {
                        // Nếu người chơi không có nước đi, nhưng AI có
                        setIsPlayerTurn(false);
                        toast.success('Bạn không có nước đi hợp lệ, AI sẽ tiếp tục!', toastStyle);
                        makeAIMove(newBoard);
                        return;
                    }
                }
            }

            worker.terminate();
            setIsLoading(false);
            setIsPlayerTurn(true);
        };
    };

    const calculateWinner = (squares: Board): Player => {
        let blackCount = 0;
        let whiteCount = 0;

        squares.forEach(cell => {
            if (cell === 'B') blackCount++;
            else if (cell === 'W') whiteCount++;
        });

        if (blackCount > whiteCount) return 'B';
        if (whiteCount > blackCount) return 'W';
        return null;
    };

    const resetGame = () => {
        const initial = Array(TOTAL_CELLS).fill(null);
        const center = BOARD_SIZE / 2;
        initial[(center - 1) * BOARD_SIZE + center - 1] = 'W';
        initial[(center - 1) * BOARD_SIZE + center] = 'B';
        initial[center * BOARD_SIZE + center - 1] = 'B';
        initial[center * BOARD_SIZE + center] = 'W';

        setBoard(initial);
        setIsPlayerTurn(true);
        setGameOver(false);
        setLastMove(null);
        setScore({ player: 2, computer: 2 });
    };

    const resetScore = () => {
        setScore({ player: 2, computer: 2 });
        resetGame();
    };

    const updateLeaderboard = async () => {
        if (!auth?.currentUser || !db || !supabase || supabaseLoading) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const userData = userDoc.data();

            const { data: existingRecord } = await supabase
                .from('reversi_leaderboard')
                .select('wins')
                .eq('firebase_id', auth.currentUser.uid)
                .single();

            const { error } = await supabase
                .from('reversi_leaderboard')
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

    const handleGameEnd = (winner: Player) => {
        setGameOver(true);

        if (winner === 'B') {
            setScore(prev => ({ ...prev, player: prev.player + 1 }));
            toast.success('Chúc mừng! Bạn đã thắng! 🎉', toastStyle);
            updateLeaderboard();
        } else if (winner === 'W') {
            setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
            toast.error('AI đã thắng! Hãy thử lại! 😢', toastStyle);
        } else {
            toast('Ván cờ hòa! 🤝', toastStyle);
        }
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-4 sm:py-8 mb-4 sm:mb-8 px-2 sm:px-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Cờ Lật (Reversi)</h1>
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
                        Tỉ số: Bạn (Đen) {score.player} - {score.computer} AI (Trắng)
                    </div>
                    {!gameOver && (
                        <div className="text-sm sm:text-lg mt-2">
                            {isPlayerTurn ? 'Đến lượt bạn đi!' : 'AI đang suy nghĩ...'}
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto overflow-y-hidden pb-4">
                    <div className="min-w-[280px] sm:min-w-[320px] w-full max-w-[560px] mx-auto p-2 sm:p-4">
                        <div className="grid grid-cols-8 bg-gray-700 p-0.5 sm:p-1 gap-0.5 sm:gap-1 rounded-lg">
                            {board.map((cell, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: !gameOver && isPlayerTurn && isValidMove(board, index, 'B') ? 1.05 : 1 }}
                                    whileTap={{ scale: !gameOver && isPlayerTurn && isValidMove(board, index, 'B') ? 0.95 : 1 }}
                                    onClick={() => handleClick(index)}
                                    disabled={gameOver || !isPlayerTurn || isLoading || !isValidMove(board, index, 'B')}
                                    className={`relative w-full pt-[100%]
                                        ${cell ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'}
                                        ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
                                        ${index === lastMove ? 'ring-1 sm:ring-2 ring-yellow-400' : ''}
                                        ${!cell && isValidMove(board, index, 'B') ? 'ring-1 sm:ring-2 ring-yellow-400 ring-opacity-50' : ''}
                                        rounded-md sm:rounded-lg
                                    `}
                                >
                                    {(cell || isLoading) && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {isLoading && !cell ? (
                                                <Skeleton
                                                    width="60%"
                                                    height="60%"
                                                    baseColor="#1F2937"
                                                    highlightColor="#374151"
                                                    borderRadius="50%"
                                                />
                                            ) : (
                                                cell && (
                                                    <div className={`w-[70%] sm:w-[80%] h-[70%] sm:h-[80%] rounded-full
                                                        ${cell === 'B' ? 'bg-black' : 'bg-white'}
                                                        shadow-lg
                                                    `} />
                                                )
                                            )}
                                        </div>
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
                tableName="reversi_leaderboard"
            />
        </div>
    );
}
