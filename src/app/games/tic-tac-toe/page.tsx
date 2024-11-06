'use client'

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSync } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ModalPortal from '@/components/ModalPortal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useFirebase } from '@/components/FirebaseConfig';
import LeaderboardModal from '@/components/LeaderboardModal';
import { doc, getDoc } from 'firebase/firestore';
import { useSupabase } from '@/hooks/useSupabase';

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

let aiWorker: Worker | null = null;

export default function TicTacToeGame() {
    // Thay đổi khởi tạo bàn cờ
    const [board, setBoard] = useState<Board>(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState({ player: 0, computer: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [, setGameHistory] = useState<GameHistory>([]);
    const isGameEndingRef = useRef(false);
    const [lastMove, setLastMove] = useState<number | null>(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const { auth, db } = useFirebase();
    const { supabase, loading: supabaseLoading } = useSupabase();

    // Khởi tạo worker
    useEffect(() => {
        if (typeof window !== 'undefined') {
            aiWorker = new Worker(new URL('../../../workers/ai-worker.js', import.meta.url));
            aiWorker.onmessage = (e) => {
                const result = e.data;
                if (result.bestmove) {
                    const moveIndex = result.bestmove.i * BOARD_SIZE + result.bestmove.j;

                    setBoard(prevBoard => {
                        const newBoard = [...prevBoard];
                        newBoard[moveIndex] = 'O';

                        if (!gameOver) {
                            const winner = checkWinner(newBoard, moveIndex);
                            if (winner || !newBoard.includes(null)) {
                                handleGameEnd(winner);
                            }
                        }

                        return newBoard;
                    });

                    setLastMove(moveIndex);
                    setIsLoading(false);
                    setIsPlayerTurn(true);
                }
            };
        }
        return () => {
            if (aiWorker) {
                aiWorker.terminate();
            }
        };
    }, []);

    const getAIMove = async (currentBoard: Board): Promise<void> => {
        setIsLoading(true);
        try {
            // Chuyển đổi board 1D thành 2D cho worker
            const board2D = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    board2D[i][j] = currentBoard[i * BOARD_SIZE + j] === 'X' ? -1 :
                        currentBoard[i * BOARD_SIZE + j] === 'O' ? 1 : 0;
                }
            }

            // Gửi board đến worker
            if (aiWorker) {
                aiWorker.postMessage([board2D, 1, 2000]); // board, player, maxTime
            }
        } catch (error) {
            console.error('Lỗi khi tính toán nước đi của AI:', error);
            setIsLoading(false);
        }
    };

    const handleClick = async (index: number) => {
        if (board[index] || gameOver || !isPlayerTurn || isLoading) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsPlayerTurn(false);
        setLastMove(index);

        // Kiểm tra người thắng
        const winner = checkWinner(newBoard, index);
        if (winner || !newBoard.includes(null)) {
            handleGameEnd(winner);
            return;
        }

        // Nếu game chưa kết thúc, để AI đánh
        if (!gameOver && newBoard.includes(null)) {
            await getAIMove(newBoard);
        }
    };

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

    const handleGameEnd = (winner: Player) => {
        if (isGameEndingRef.current) return;
        isGameEndingRef.current = true;

        setGameOver(true);
        let result: GameResult = null;

        if (winner === 'X') {
            result = 'thắng';
            setScore(prev => ({ ...prev, player: prev.player + 1 }));
            updateLeaderboard();
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
            result
        }]);
    };

    const resetGame = () => {
        setBoard(Array(BOARD_SIZE * BOARD_SIZE).fill(null));
        setIsPlayerTurn(true);
        setGameOver(false);
        isGameEndingRef.current = false;
        setLastMove(null);
    };

    const resetScore = () => {
        setScore({ player: 0, computer: 0 });
        setGameHistory([]);
        resetGame();
    };

    const updateLeaderboard = async () => {
        if (!auth?.currentUser || !db || !supabase || supabaseLoading) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const userData = userDoc.data();

            // Lấy record hiện tại từ database
            const { data: existingRecord } = await supabase
                .from('tictactoe_leaderboard')
                .select('wins')
                .eq('firebase_id', auth.currentUser.uid)
                .single();

            const { error } = await supabase
                .from('tictactoe_leaderboard')
                .upsert(
                    {
                        firebase_id: auth.currentUser.uid,
                        display_name: userData?.displayName || 'Người chơi ẩn danh',
                        // Nếu đã có record thì cộng thêm 1, nếu chưa có thì set wins = 1
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
        <div className="bg-[#0F172A] text-white min-h-screen relative">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            {/* Header responsive */}
            <div className="bg-[#2A3284] text-center py-4 sm:py-8 mb-4 sm:mb-8 px-2 sm:px-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Cờ Caro</h1>
                <p className="text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
                    Đấu với AI thông minh!
                </p>
            </div>

            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
                {/* Buttons responsive */}
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

                {/* Score responsive */}
                <div className="text-center mb-4 sm:mb-8">
                    <div className="text-base sm:text-xl font-bold">
                        Tỉ số: Bạn {score.player} - {score.computer} AI
                    </div>
                </div>

                {/* Game board responsive */}
                <div className="overflow-x-auto overflow-y-hidden pb-4">
                    <div className="min-w-[280px] sm:min-w-[320px] w-full max-w-[640px] mx-auto p-2 sm:p-4">
                        <div className={`grid grid-cols-[repeat(15,1fr)] gap-0.5 sm:gap-1 rounded-lg
                            ${isLoading ? 'opacity-50' : ''}`}>
                            {board.map((cell, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: !gameOver && isPlayerTurn && !cell ? 1.05 : 1 }}
                                    whileTap={{ scale: !gameOver && isPlayerTurn && !cell ? 0.95 : 1 }}
                                    onClick={() => handleClick(index)}
                                    disabled={!!cell || gameOver || !isPlayerTurn || isLoading}
                                    className={`relative w-full pt-[100%] bg-white/10
                                        ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
                                        ${index === lastMove ? 'ring-1 sm:ring-2 ring-yellow-400' : ''}
                                        rounded-md sm:rounded-lg
                                    `}
                                >
                                    {(cell || isLoading) && (
                                        <div className={`absolute inset-0 flex items-center justify-center
                                            text-base sm:text-xl md:text-2xl lg:text-3xl font-bold
                                            ${cell === 'X' ? 'text-yellow-400' : cell === 'O' ? 'text-red-400' : ''}
                                        `}>
                                            {isLoading && !cell ? (
                                                <Skeleton
                                                    width="50%"
                                                    height="50%"
                                                    baseColor="#1F2937"
                                                    highlightColor="#374151"
                                                    borderRadius="50%"
                                                />
                                            ) : (
                                                cell
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
                tableName="tictactoe_leaderboard"
            />
        </div>
    );
}
