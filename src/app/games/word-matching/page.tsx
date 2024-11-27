'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSync } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import ModalPortal from '@/components/ModalPortal';
import type { MotionProps } from 'framer-motion';

type ModalBackdropProps = MotionProps & {
    className?: string;
};

interface Word {
    word: string;
    isMatched: boolean;
    isBase?: boolean;
    combination?: string;
}

const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

// Thêm interface mới
interface AddWordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddWord: (word: string) => void;
}

// Thêm component Skeleton
const WordSkeleton = () => (
    <div className="p-4 rounded-lg bg-gray-800 animate-pulse">
        <div className="h-6 bg-gray-700 rounded"></div>
    </div>
);

export default function WordMatchingGame() {
    // Thêm state mới
    const [gameStarted, setGameStarted] = useState(false);

    // Sửa lại các state hiện có
    const [words, setWords] = useState<Word[]>([]);
    const [selectedWords, setSelectedWords] = useState<Word[]>([]);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [discoveredCombinations, setDiscoveredCombinations] = useState<string[]>([]);
    const [showAddWordModal, setShowAddWordModal] = useState(false);
    const [showCustomWordsModal, setShowCustomWordsModal] = useState(false);

    // Sửa lại hàm initializeGame
    const initializeGame = (customWords?: string[]) => {
        const baseWords: Word[] = customWords ?
            customWords.map(word => ({ word, isMatched: false, isBase: true })) :
            [
                { word: "Đất", isMatched: false, isBase: true },
                { word: "Nước", isMatched: false, isBase: true },
                { word: "Lửa", isMatched: false, isBase: true },
                { word: "Gió", isMatched: false, isBase: true },
            ];

        setWords(baseWords);
        setSelectedWords([]);
        setScore(0);
        setDiscoveredCombinations([]);
        setGameStarted(true);
    };

    // Xóa useEffect ban đầu vì chúng ta không muốn tự động khởi tạo game nữa

    // Thêm component màn hình bắt đầu
    const generateCombination = async (word1: string, word2: string) => {
        try {
            const apiKeyResponse = await fetch('/api/Gemini6');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được khóa API');
            }
            const apiKey = apiKeyData.apiKey;
            const genAI = new GoogleGenerativeAI(apiKey);

            // Thêm cấu hình safety settings
            const model = genAI.getGenerativeModel({
                model: "gemini-exp-1121",
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

            const prompt = `Hãy tạo ra một từ mới bằng cách kết hợp ý nghĩa của hai từ "${word1}" và "${word2}". 
            Kết quả phải là một từ hoàn toàn mới có ý nghĩa liên quan đến cả hai từ gốc, KHÔNG ĐƯỢC đơn thuần ghép hai từ lại với nhau.
            CHỈ TRẢ VỀ KẾT QUẢ, không kèm theo giải thích, markdown hay bất kỳ nội dung nào khác.
            Ví dụ: 
            - nếu input là "Đất" và "Nước" thì output là "Bùn"
            - nếu input là "Lửa" và "Gió" thì output là "Nhiệt"
            Nếu không thể tạo ra từ mới có ý nghĩa tiếng việt không hán tự, hãy trả về "không thể"`;

            const result = await model.generateContent(prompt);
            const combination = result.response.text().trim();

            // Kiểm tra xem kết quả có phải là sự ghép nối đơn thuần không
            const combinedWords = `${word1} ${word2}`.toLowerCase();
            if (combination.toLowerCase() === combinedWords ||
                combination.toLowerCase() === `${word2} ${word1}`.toLowerCase()) {
                return null;
            }

            return combination;
        } catch (error) {
            console.error('Lỗi khi tạo kết hợp:', error);
            return null;
        }
    };

    const handleWordClick = async (word: Word) => {
        if (word.isMatched || isLoading) return;

        // Bỏ điều kiện kiểm tra isBase
        if (selectedWords.length < 2) {
            setSelectedWords(prev => [...prev, word]);
        }
    };

    useEffect(() => {
        const processCombination = async () => {
            if (selectedWords.length === 2) {
                setIsLoading(true);
                const [word1, word2] = selectedWords;

                // Kiểm tra kết hợp đã tồn tại
                const combinationKey = [word1.word, word2.word].sort().join('-');
                if (discoveredCombinations.includes(combinationKey)) {
                    toast.error('Kết hợp này đã được tìm ra!', toastStyle);
                    setSelectedWords([]);
                    setIsLoading(false);
                    return;
                }

                const combination = await generateCombination(word1.word, word2.word);

                if (combination && combination.toLowerCase() !== "không thể") {
                    // Kiểm tra xem từ mới đã tồn tại trong danh sách chưa
                    const isWordExists = words.some(w => w.word.toLowerCase() === combination.toLowerCase());

                    if (!isWordExists) {
                        setWords(prevWords => [...prevWords, {
                            word: combination,
                            isMatched: false,
                            isBase: false,
                            combination: `${word1.word} + ${word2.word}`
                        }]);
                        setScore(prev => prev + 1);
                        setDiscoveredCombinations(prev => [...prev, combinationKey]);
                        toast.success('Đã tạo kết hợp mới!', toastStyle);
                    } else {
                        toast.error('Từ này đã tồn tại!', toastStyle);
                    }
                } else {
                    toast.error('Không thể kết hợp hai từ này!', toastStyle);
                }

                setTimeout(() => {
                    setSelectedWords([]);
                    setIsLoading(false);
                }, 1000);
            }
        };

        processCombination();
    }, [selectedWords]);

    if (!gameStarted) {
        return (
            <div className="bg-[#0F172A] text-white min-h-screen">
                <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4">Trò Chơi Ghép Từ AI</h1>
                </div>
                <div className="container mx-auto px-4 py-8 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                        <button
                            onClick={() => initializeGame()}
                            className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-lg"
                        >
                            Chơi với từ mặc định
                        </button>
                        <button
                            onClick={() => setShowCustomWordsModal(true)}
                            className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-lg"
                        >
                            Tự nhập từ của bạn
                        </button>
                    </div>
                </div>

                {showCustomWordsModal && (
                    <CustomWordsModal
                        onClose={() => setShowCustomWordsModal(false)}
                        onSubmit={(words) => {
                            initializeGame(words);
                            setShowCustomWordsModal(false);
                        }}
                    />
                )}
            </div>
        );
    }


    // Thêm hàm xử lý thêm từ mới
    const handleAddNewWord = (newWord: string) => {
        if (score >= 5) {
            setWords(prev => [...prev, {
                word: newWord,
                isMatched: false,
                isBase: true
            }]);
            setScore(prev => prev - 5);
            setShowAddWordModal(false);
            toast.success('Đã thêm từ mới thành công!', toastStyle);
        }
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Trò Chơi Ghép Từ AI</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Kết hợp các từ cơ bản để tạo từ mới với sự giúp đỡ của AI.
                </p>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => initializeGame()}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                        disabled={isLoading}
                    >
                        <FaSync className={isLoading ? 'animate-spin' : ''} />
                        Chơi lại
                    </button>
                </div>

                <div className="text-center mb-8">
                    <p className="text-xl font-bold">Điểm: {score}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                    {/* Hiển thị các từ hiện có */}
                    {words.map((word, index) => (
                        <motion.div
                            key={`word-${index}`}
                            {...{
                                initial: { opacity: 0, y: 20 },
                                animate: { opacity: 1, y: 0 },
                                transition: { delay: index * 0.1 },
                                onClick: () => !isLoading && handleWordClick(word),
                                className: `p-4 rounded-lg transition-all ${selectedWords.includes(word)
                                    ? 'bg-blue-600'
                                    : word.isBase
                                        ? 'bg-purple-600 hover:bg-purple-700'
                                        : 'bg-gray-800 hover:bg-gray-700'
                                    } cursor-pointer`
                            } as ModalBackdropProps}
                        >
                            <div>
                                <div className="font-bold">{word.word}</div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Hiển thị skeleton chỉ khi đang loading và có 2 từ được chọn */}
                    {isLoading && selectedWords.length === 2 && (
                        <WordSkeleton />
                    )}
                </div>

                {/* Di chuyển nút thêm từ mới xuống đây */}
                {score >= 5 && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setShowAddWordModal(true)}
                            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-lg"
                        >
                            Đổi từ mới (5 điểm)
                        </button>
                    </div>
                )}
            </div>

            {/* Thêm Modal component */}
            {showAddWordModal && (
                <ModalPortal>
                    <AddWordModal
                        isOpen={showAddWordModal}
                        onClose={() => setShowAddWordModal(false)}
                        onAddWord={handleAddNewWord}
                    />
                </ModalPortal>
            )}
        </div>
    );
}

// Thêm component Modal
function AddWordModal({ onClose, onAddWord }: AddWordModalProps) {
    const [newWord, setNewWord] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWord.trim()) {
            onAddWord(newWord.trim());
            setNewWord('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Thêm từ mới</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
                        placeholder="Nhập từ mới..."
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Thêm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Thêm component modal nhập từ tùy chỉnh
interface CustomWordsModalProps {
    onClose: () => void;
    onSubmit: (words: string[]) => void;
}

function CustomWordsModal({ onClose, onSubmit }: CustomWordsModalProps) {
    const [customWords, setCustomWords] = useState(['', '', '', '']);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customWords.every(word => word.trim())) {
            onSubmit(customWords.map(w => w.trim()));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">Nhập 4 từ của bạn</h2>
                <form onSubmit={handleSubmit}>
                    {customWords.map((word, index) => (
                        <input
                            key={index}
                            type="text"
                            value={word}
                            onChange={(e) => {
                                const newWords = [...customWords];
                                newWords[index] = e.target.value;
                                setCustomWords(newWords);
                            }}
                            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
                            placeholder={`Từ ${index + 1}...`}
                            required
                        />
                    ))}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                        >
                            Bắt đầu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
