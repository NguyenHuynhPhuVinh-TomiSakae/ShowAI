'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHandRock, FaHandPaper, FaHandScissors, FaSync } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ModalPortal from '@/components/ModalPortal';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { createClient } from '@supabase/supabase-js';

type Choice = 'búa' | 'kéo' | 'bao';
type GameResult = 'thắng' | 'thua' | 'hòa' | null;

const choices: Choice[] = ['kéo', 'búa', 'bao'];

const choiceIcons = {
    búa: FaHandRock,
    kéo: FaHandScissors,
    bao: FaHandPaper,
};

// Thêm style cho toast
const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

const IconSkeleton = () => (
    <div className="text-6xl mb-4 flex justify-center">
        <Skeleton
            width={96}
            height={96}
            baseColor="#1F2937"
            highlightColor="#374151"
            borderRadius={12}
        />
    </div>
);

// Thêm type cho lịch sử game
type GameHistory = {
    playerMove: Choice;
    computerMove: Choice;
    result: GameResult;
}[];

// Thêm types mới
type GameStatus = 'waiting' | 'playing' | 'finished';
type OnlineGame = {
    id: string;
    player1_id: string;
    player2_id: string | null;
    player1_choice: Choice | null;
    player2_choice: Choice | null;
    status: GameStatus;
    winner_id: string | null;
    player1_ready: boolean;
    player2_ready: boolean;
};

// Thêm type mới
type MatchmakingStatus = 'idle' | 'finding' | 'matched';

// Thêm type mới cho role
type PlayerRole = 'player' | 'ai' | null;

// Cập nhật type Score
type Score = {
    player1: number;
    player2: number;
};

export default function RockPaperScissorsGame() {
    const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
    const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
    const [, setResult] = useState<GameResult>(null);
    const [score, setScore] = useState<Score>({ player1: 0, player2: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [gameHistory, setGameHistory] = useState<GameHistory>([]);
    const [isOnline, setIsOnline] = useState(false);
    const [currentGame, setCurrentGame] = useState<OnlineGame | null>(null);
    const [playerId] = useState<string>(Math.random().toString(36).substring(7));
    const [supabase, setSupabase] = useState<any>(null);
    const [matchmakingStatus, setMatchmakingStatus] = useState<MatchmakingStatus>('idle');
    const [playerRole, setPlayerRole] = useState<PlayerRole>(null);

    const determineWinner = (player: Choice, computer: Choice): GameResult => {
        if (player === computer) return 'hòa';
        if (
            (player === 'búa' && computer === 'kéo') ||
            (player === 'kéo' && computer === 'bao') ||
            (player === 'bao' && computer === 'búa')
        ) {
            return 'thắng';
        }
        return 'thua';
    };

    const getAIChoice = async (): Promise<Choice> => {
        setIsLoading(true);
        try {
            const apiKeyResponse = await fetch('/api/Gemini');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được khóa API');
            }

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: {
                    temperature: 1,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 8192,
                },
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    }
                ]
            });

            // Sửa lại prompt để không tiết lộ lựa chọn hiện tại
            const historyText = gameHistory
                .slice(-5) // Chỉ lấy 5 lượt chơi gần nhất
                .map(h => `Người chơi: ${h.playerMove}, AI: ${h.computerMove}, Kết quả: ${h.result}`)
                .join('\n');

            const prompt = `Bạn là AI chơi kéo búa bao. Dựa vào lịch sử 5 lượt gần nhất:
${historyText}

Hãy phân tích pattern của người chơi và đưa ra lựa chọn thông minh để thắng. Ví dụ:
- Nếu người chơi thường chọn lặp lại các nước đi
- Nếu người chơi có xu hướng thay đổi sau khi thua
- Nếu người chơi thích dùng một lựa chọn cụ thể

CHỈ TRẢ VỀ một trong ba từ: "búa", "kéo" hoặc "bao" (không kèm giải thích).`;

            const result = await model.generateContent(prompt);
            const aiChoice = result.response.text().trim().toLowerCase() as Choice;

            // Nếu không có lịch sử hoặc AI trả về không hợp lệ, chọn ngẫu nhiên
            if (!gameHistory.length || !choices.includes(aiChoice)) {
                return choices[Math.floor(Math.random() * choices.length)];
            }

            return aiChoice;
        } catch (error) {
            console.error('Lỗi khi lấy lựa chọn của AI:', error);
            return choices[Math.floor(Math.random() * choices.length)];
        } finally {
            setIsLoading(false);
        }
    };

    const handleChoice = async (choice: Choice) => {
        if (isOnline && currentGame && supabase) {
            if (playerRole === 'ai') {
                // Nếu là AI, cập nhật lựa chọn vào player2_choice
                await supabase
                    .from('games')
                    .update({ player2_choice: choice })
                    .eq('id', currentGame.id);
            } else {
                // Nếu là người chơi, cập nhật lựa chọn vào player1_choice
                await supabase
                    .from('games')
                    .update({ player1_choice: choice })
                    .eq('id', currentGame.id);
            }
            return;
        }
        const computerMove = await getAIChoice();
        setPlayerChoice(choice);
        setComputerChoice(computerMove);

        const gameResult = determineWinner(choice, computerMove);
        setResult(gameResult);

        if (gameResult === 'thắng') {
            setScore(prev => ({ ...prev, player1: prev.player1 + 1 }));
            toast.success('Bạn thắng! 🎉', toastStyle);
        } else if (gameResult === 'thua') {
            setScore(prev => ({ ...prev, player2: prev.player2 + 1 }));
            toast.error('Bạn thua! 😢', toastStyle);
        } else {
            toast('Hòa! 🤝', toastStyle);
        }

        // Cập nhật lịch sử
        setGameHistory(prev => [...prev, {
            playerMove: choice,
            computerMove: computerMove,
            result: gameResult
        }]);
    };

    const resetGame = () => {
        setPlayerChoice(null);
        setComputerChoice(null);
        setResult(null);
        setScore({ player1: 0, player2: 0 });
        setGameHistory([]); // Reset lịch sử
    };

    // Thêm functions để xử lý game online
    const createOnlineGame = async () => {
        if (!supabase) {
            toast.error('Đang kết nối tới server, vui lòng thử lại');
            return;
        }

        const { data, error } = await supabase
            .from('games')
            .insert({
                player1_id: playerId,
                status: 'waiting'
            })
            .select()
            .single();

        if (error) {
            toast.error('Không thể tạo game mới');
            return;
        }
        setCurrentGame(data);
        setIsOnline(true);
    };

    const joinGame = async () => {
        if (!supabase) {
            toast.error('Đang kết nối tới server, vui lòng thử lại');
            return;
        }

        setMatchmakingStatus('finding');
        toast.loading('Đang tìm đối thủ...', { id: 'finding-match' });

        try {
            const { data: availableGame, error } = await supabase
                .from('games')
                .select('*')
                .eq('status', 'waiting')
                .neq('player1_id', playerId)
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Lỗi khi tìm game:', error);
                toast.error('Không thể tìm trận đấu', { id: 'finding-match' });
                setMatchmakingStatus('idle');
                return;
            }

            if (availableGame) {
                const { data: updatedGame, error: updateError } = await supabase
                    .from('games')
                    .update({
                        player2_id: playerId,
                        status: 'playing'
                    })
                    .eq('id', availableGame.id)
                    .select()
                    .single();

                if (updateError) {
                    console.error('Lỗi khi tham gia game:', updateError);
                    toast.error('Không thể tham gia game', { id: 'finding-match' });
                    setMatchmakingStatus('idle');
                    return;
                }

                setCurrentGame(updatedGame);
                setIsOnline(true);
                setMatchmakingStatus('matched');
                toast.dismiss('finding-match');
                toast.success('Đã tìm thấy đối thủ!');
            } else {
                await createOnlineGame();
            }
        } catch (error) {
            console.error('Lỗi:', error);
            toast.error('Đã có lỗi xảy ra', { id: 'finding-match' });
            setMatchmakingStatus('idle');
        }
    };

    // Thêm effect để lắng nghe thay đổi game
    useEffect(() => {
        if (!currentGame || !supabase) return;

        const gameSubscription = supabase
            .channel(`game_${currentGame.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'games',
                filter: `id=eq.${currentGame.id}`
            }, (payload: any) => {
                const updatedGame = payload.new as OnlineGame;
                setCurrentGame(updatedGame);

                // Cập nhật trạng thái khi game chuyển sang playing
                if (updatedGame.status === 'playing') {
                    setMatchmakingStatus('matched');
                    toast.dismiss('finding-match');
                    toast.success('Trận đấu bắt đầu!');
                }
            })
            .subscribe();

        return () => {
            gameSubscription.unsubscribe();
        };
    }, [currentGame, supabase]);

    // Thêm useEffect để khởi tạo Supabase client
    useEffect(() => {
        const initSupabase = async () => {
            try {
                const response = await fetch('/api/supabase-key');
                const { url, key } = await response.json();

                if (!url || !key) {
                    toast.error('Không thể kết nối tới server');
                    return;
                }

                const supabaseClient = createClient(url, key);
                setSupabase(supabaseClient);
            } catch (error) {
                toast.error('Lỗi kết nối tới server');
                console.error(error);
            }
        };

        initSupabase();
    }, []);

    useEffect(() => {
        return () => {
            // Cleanup khi component unmount
            if (currentGame?.status === 'waiting' && currentGame.player1_id === playerId) {
                supabase?.from('games').delete().eq('id', currentGame.id);
            }
        };
    }, [currentGame, playerId, supabase]);

    useEffect(() => {
        if (currentGame?.status === 'playing') {
            // Player1 sẽ là người chơi, Player2 sẽ là AI
            const role = currentGame.player1_id === playerId ? 'player' : 'ai';
            setPlayerRole(role);
        }
    }, [currentGame?.status, currentGame?.player1_id, playerId]);

    useEffect(() => {
        if (currentGame?.player1_choice && currentGame?.player2_choice) {
            const result = determineWinner(
                playerRole === 'player' ? currentGame.player1_choice : currentGame.player2_choice,
                playerRole === 'player' ? currentGame.player2_choice : currentGame.player1_choice
            );

            if (result === 'thắng') {
                setScore(prev => ({
                    ...prev,
                    [playerRole === 'player' ? 'player1' : 'player2']: prev[playerRole === 'player' ? 'player1' : 'player2'] + 1
                }));
                toast.success('Bạn thắng! 🎉', toastStyle);
            } else if (result === 'thua') {
                setScore(prev => ({
                    ...prev,
                    [playerRole === 'player' ? 'player2' : 'player1']: prev[playerRole === 'player' ? 'player2' : 'player1'] + 1
                }));
                toast.error('Bạn thua! 😢', toastStyle);
            } else {
                toast('Hòa! 🤝', toastStyle);
            }
        }
    }, [currentGame?.player1_choice, currentGame?.player2_choice]);

    const handleReady = async () => {
        if (!currentGame || !supabase) return;

        const updateData = playerRole === 'player'
            ? { player1_ready: true }
            : { player2_ready: true };

        await supabase
            .from('games')
            .update(updateData)
            .eq('id', currentGame.id);
    };

    const resetOnlineGame = async () => {
        if (!currentGame || !supabase) return;

        if (currentGame.player1_ready && currentGame.player2_ready) {
            await supabase
                .from('games')
                .update({
                    player1_choice: null,
                    player2_choice: null,
                    player1_ready: false,
                    player2_ready: false,
                    status: 'playing'
                })
                .eq('id', currentGame.id);
        }
    };

    // Thêm useEffect để tự động reset game khi cả hai sẵn sàng
    useEffect(() => {
        if (currentGame?.player1_ready && currentGame?.player2_ready) {
            resetOnlineGame();
        }
    }, [currentGame?.player1_ready, currentGame?.player2_ready]);

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-4 sm:py-8 mb-4 sm:mb-8 px-2 sm:px-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Kéo Búa Bao</h1>
                <p className="text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
                    Chọn một trong ba để đấu với AI thông minh!
                </p>
            </div>

            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-8">
                    {!isOnline ? (
                        <>
                            <button
                                onClick={joinGame}
                                disabled={matchmakingStatus === 'finding'}
                                className={`px-4 py-2 rounded-lg ${matchmakingStatus === 'finding'
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {matchmakingStatus === 'finding' ? (
                                    <div className="flex items-center gap-2">
                                        <FaSync className="animate-spin" />
                                        Đang tìm đối thủ...
                                    </div>
                                ) : (
                                    'Chơi Online'
                                )}
                            </button>

                            <button
                                onClick={resetGame}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                            >
                                Chơi lại
                            </button>
                        </>
                    ) : (
                        <div className="text-center">
                            {currentGame?.status === 'playing' ? (
                                <p className="mb-2">Đang trong trận đấu</p>
                            ) : currentGame?.status === 'waiting' ? (
                                <div className="flex items-center gap-2 justify-center">
                                    <FaSync className="animate-spin" />
                                    Đang chờ người chơi khác tham gia...
                                </div>
                            ) : null}
                        </div>
                    )}

                    {matchmakingStatus === 'finding' && !isOnline && (
                        <button
                            onClick={() => {
                                setMatchmakingStatus('idle');
                                toast.dismiss('finding-match');
                                toast.success('Đã hủy tìm trận');
                            }}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                        >
                            Hủy tìm trận
                        </button>
                    )}

                    {isOnline && (
                        <div className="text-center">
                            {currentGame?.status === 'playing' &&
                                !currentGame.player1_choice &&
                                !currentGame.player2_choice && (
                                    <p className="mb-2">Lượt mới bắt đầu!</p>
                                )}
                            {currentGame?.status === 'waiting' && (
                                <div className="flex items-center gap-2 justify-center">
                                    <FaSync className="animate-spin" />
                                    Đang chờ người chơi khác tham gia...
                                </div>
                            )}
                        </div>
                    )}

                    {isOnline && currentGame?.player1_choice && currentGame?.player2_choice && (
                        <>
                            <button
                                onClick={handleReady}
                                disabled={
                                    (playerRole === 'player' && currentGame.player1_ready) ||
                                    (playerRole === 'ai' && currentGame.player2_ready)
                                }
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${(playerRole === 'player' && currentGame.player1_ready) ||
                                    (playerRole === 'ai' && currentGame.player2_ready)
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {(playerRole === 'player' && currentGame.player1_ready) ||
                                    (playerRole === 'ai' && currentGame.player2_ready)
                                    ? 'Đã sẵn sàng'
                                    : 'Sẵn sàng chơi lại'}
                            </button>

                            <div className="text-sm text-gray-400">
                                {playerRole === 'player' ? (
                                    currentGame.player2_ready ? 'Đối thủ đã sẵn sàng' : 'Đang đợi đối thủ sẵn sàng...'
                                ) : (
                                    currentGame.player1_ready ? 'Đối thủ đã sẵn sàng' : 'Đang đợi đối thủ sẵn sàng...'
                                )}
                            </div>
                        </>
                    )}
                </div>

                <div className="text-center mb-4 sm:mb-8">
                    <div className="text-base sm:text-xl font-bold">
                        {isOnline ? (
                            `Tỉ số: ${playerRole === 'player' ? 'Bạn' : 'Đối thủ'} ${score.player1} - ${score.player2} ${playerRole === 'player' ? 'Đối thủ' : 'Bạn'}`
                        ) : (
                            `Tỉ số: Bạn ${score.player1} - ${score.player2} AI`
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto mb-4 sm:mb-8">
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-4">
                            {isOnline ? (playerRole === 'player' ? 'Bạn' : 'Đối thủ') : 'Bạn'}
                        </h2>
                        {isLoading ? (
                            <IconSkeleton />
                        ) : (
                            <motion.div
                                className="text-6xl mb-4"
                                initial={{ scale: 0 }}
                                animate={{
                                    scale: isOnline
                                        ? (currentGame?.player1_choice && currentGame?.player2_choice ? 1 : 0)
                                        : Boolean(playerChoice) ? 1 : 0
                                }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                {isOnline ?
                                    (playerRole === 'player' ?
                                        (currentGame?.player1_choice && currentGame?.player2_choice) &&
                                        choiceIcons[currentGame.player1_choice]?.({ className: "mx-auto" }) :
                                        (currentGame?.player1_choice && currentGame?.player2_choice) &&
                                        choiceIcons[currentGame.player2_choice]?.({ className: "mx-auto" })
                                    ) :
                                    playerChoice && choiceIcons[playerChoice]?.({ className: "mx-auto" })
                                }
                            </motion.div>
                        )}
                        {isOnline && ((playerRole === 'player' && currentGame?.player1_choice) ||
                            (playerRole === 'ai' && currentGame?.player2_choice)) &&
                            !(currentGame?.player1_choice && currentGame?.player2_choice) && (
                                <p className="text-green-500">Đã chọn xong</p>
                            )}
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-4">
                            {isOnline ? (playerRole === 'ai' ? 'Bạn' : 'Đối thủ') : 'AI'}
                        </h2>
                        {isLoading ? (
                            <IconSkeleton />
                        ) : (
                            <motion.div
                                className="text-6xl mb-4"
                                initial={{ scale: 0 }}
                                animate={{
                                    scale: isOnline
                                        ? (currentGame?.player1_choice && currentGame?.player2_choice ? 1 : 0)
                                        : Boolean(computerChoice) ? 1 : 0
                                }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                {isOnline ?
                                    (playerRole === 'ai' ?
                                        (currentGame?.player1_choice && currentGame?.player2_choice) &&
                                        choiceIcons[currentGame.player1_choice]?.({ className: "mx-auto" }) :
                                        (currentGame?.player1_choice && currentGame?.player2_choice) &&
                                        choiceIcons[currentGame.player2_choice]?.({ className: "mx-auto" })
                                    ) :
                                    computerChoice && choiceIcons[computerChoice]?.({ className: "mx-auto" })
                                }
                            </motion.div>
                        )}
                        {isOnline && ((playerRole === 'player' && currentGame?.player2_choice) ||
                            (playerRole === 'ai' && currentGame?.player1_choice)) &&
                            !(currentGame?.player1_choice && currentGame?.player2_choice) && (
                                <p className="text-green-500">Đã chọn xong</p>
                            )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto">
                    {choices.map((choice) => {
                        const Icon = choiceIcons[choice];
                        const isDisabled = isLoading ||
                            (isOnline && currentGame?.status !== 'playing') ||
                            (isOnline && ((playerRole === 'player' && currentGame?.player1_choice) ||
                                (playerRole === 'ai' && currentGame?.player2_choice)));

                        return (
                            <motion.button
                                key={choice}
                                whileHover={{ scale: isDisabled ? 1 : 1.05 }}
                                whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                                onClick={() => handleChoice(choice)}
                                disabled={isDisabled as boolean}
                                className={`p-3 sm:p-6 rounded-lg transition-all ${isDisabled
                                    ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                    } flex flex-col items-center gap-1 sm:gap-2`}
                            >
                                <Icon className={`text-2xl sm:text-4xl ${isLoading ? 'animate-pulse' : ''}`} />
                                <span className="capitalize text-sm sm:text-base">{choice}</span>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
