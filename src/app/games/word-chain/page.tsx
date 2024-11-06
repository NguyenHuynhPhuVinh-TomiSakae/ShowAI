'use client'

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSync, FaHistory } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import ModalPortal from '@/components/ModalPortal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface WordHistory {
    firstWord: string;
    secondWord: string;
    isAI: boolean;
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

const WordSkeleton = () => (
    <div className="w-full">
        <Skeleton
            height={50}
            baseColor="#1F2937"
            highlightColor="#374151"
            borderRadius="0.5rem"
        />
    </div>
);

export default function WordChainGame() {
    const [history, setHistory] = useState<WordHistory[]>([]);
    const [currentWord, setCurrentWord] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const generateWord = async (lastWord: string) => {
        try {
            const apiKeyResponse = await fetch('/api/Gemini');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được khóa API');
            }
            const apiKey = apiKeyData.apiKey;
            const genAI = new GoogleGenerativeAI(apiKey);

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
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

            const prompt = `Hãy tạo một từ ghép tiếng Việt có nghĩa bắt đầu bằng từ "${lastWord}".
            Ví dụ: 
            - nếu input là "chào" có thể trả về "chào hỏi"
            - nếu input là "hỏi" có thể trả về "hỏi han"
            
            Yêu cầu:
            - Phải là từ ghép có nghĩa trong tiếng Việt
            - Từ thứ nhất phải là "${lastWord}"
            - Không dùng từ đã xuất hiện trong chuỗi từ trước
            - Không dùng tên riêng hoặc từ địa phương
            
            CHỈ TRẢ VỀ TỪ GHÉP HOÀN CHỈNH, không kèm theo giải thích.
            Nếu không thể tìm được từ ghép phù hợp, hãy trả về "không thể".`;

            const result = await model.generateContent(prompt);
            const fullWord = result.response.text().trim();

            if (fullWord.toLowerCase() === "không thể") {
                return null;
            }

            // Tách từ ghép thành hai phần
            const words = fullWord.split(' ');
            if (words.length !== 2 || words[0].toLowerCase() !== lastWord.toLowerCase()) {
                return null;
            }

            return words[1];
        } catch (error) {
            console.error('Lỗi khi tạo từ:', error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        const word = currentWord.trim();
        if (!word) {
            toast.error('Vui lòng nhập một từ!', toastStyle);
            return;
        }

        // Lấy từ cuối cùng để kiểm tra
        const lastWord = history.length > 0 ? history[history.length - 1].secondWord : 'xin';

        // Kiểm tra từ đã được sử dụng
        const usedWords = history.flatMap(h => [h.firstWord, h.secondWord]);
        if (usedWords.includes(word)) {
            toast.error('Từ này đã được sử dụng!', toastStyle);
            return;
        }

        // Thêm lượt của người chơi
        setHistory(prev => [...prev, { firstWord: lastWord, secondWord: word, isAI: false }]);
        setCurrentWord('');
        setIsLoading(true);

        // AI trả lời
        const aiWord = await generateWord(word);
        if (aiWord) {
            setHistory(prev => [...prev, { firstWord: word, secondWord: aiWord, isAI: true }]);
        } else {
            toast.success('Chúc mừng! AI không tìm được từ ghép phù hợp, bạn đã thắng!', toastStyle);
        }
        setIsLoading(false);
    };

    const resetGame = () => {
        setHistory([]);
        setCurrentWord('');
        setIsLoading(false);
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Trò Chơi Nối Từ</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Nhập từ bắt đầu bằng chữ cái cuối cùng của từ trước đó
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
                        Chơi lại
                    </button>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
                    >
                        <FaHistory />
                        Lịch sử
                    </button>
                </div>

                <div className="max-w-2xl mx-auto">
                    {showHistory && history.length > 0 && (
                        <div className="mb-8 space-y-2">
                            {history.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-4 rounded-lg ${item.isAI ? 'bg-purple-600' : 'bg-blue-600'
                                        }`}
                                >
                                    <span className="font-bold">{item.isAI ? 'AI: ' : 'Bạn: '}</span>
                                    {item.firstWord} {item.secondWord}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={currentWord}
                                onChange={(e) => setCurrentWord(e.target.value)}
                                className="w-full p-4 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                                placeholder={
                                    history.length > 0
                                        ? `Nối tiếp từ "${history[history.length - 1].secondWord}"`
                                        : 'Bắt đầu với từ "xin"...'
                                }
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                                disabled={isLoading}
                            >
                                Gửi
                            </button>
                        </div>
                    </form>

                    {isLoading && <WordSkeleton />}
                </div>
            </div>
        </div>
    );
}
