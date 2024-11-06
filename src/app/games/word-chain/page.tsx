'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSync, FaHistory } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ModalPortal from '@/components/ModalPortal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface WordHistory {
    firstWord: string;
    secondWord: string;
    isAI: boolean;
}

interface DictionaryWord {
    text: string;
    source: string[];
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
    const [initialWord, setInitialWord] = useState<string>('');

    const generateWord = async (lastWord: string) => {
        try {
            const response = await fetch('/words.txt');
            const text = await response.text();

            const words: DictionaryWord[] = text
                .split('\n')
                .filter(line => line.trim())
                .map(line => JSON.parse(line));

            const matchingWords = words.filter(word => {
                const parts = word.text.toLowerCase().split(' ');
                return parts.length === 2 && parts[0] === lastWord.toLowerCase();
            });

            const usedWords = history.flatMap(h => [h.firstWord, h.secondWord]);
            const availableWords = matchingWords.filter(word =>
                !usedWords.includes(word.text.split(' ')[1])
            );

            if (availableWords.length === 0) {
                return null;
            }

            const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
            return randomWord.text.split(' ')[1];
        } catch (error) {
            console.error('Lỗi khi đọc từ điển:', error);
            return null;
        }
    };

    const checkWordExists = async (firstWord: string, secondWord: string): Promise<boolean> => {
        try {
            const response = await fetch('/words.txt');
            const text = await response.text();
            const words: DictionaryWord[] = text
                .split('\n')
                .filter(line => line.trim())
                .map(line => JSON.parse(line));

            // Kiểm tra cụm từ ghép có tồn tại trong từ điển
            const combinedWord = `${firstWord} ${secondWord}`.toLowerCase();
            return words.some(dictWord => dictWord.text.toLowerCase() === combinedWord);
        } catch (error) {
            console.error('Lỗi khi kiểm tra từ:', error);
            return false;
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

        const lastWord = history.length > 0 ? history[history.length - 1].secondWord : initialWord;

        // Kiểm tra từ đã được sử dụng
        const usedWords = history.flatMap(h => [h.firstWord, h.secondWord]);
        if (usedWords.includes(word)) {
            toast.error('Từ này đã được sử dụng!', toastStyle);
            return;
        }

        // Kiểm tra cụm từ ghép có tồn tại trong từ điển
        const wordExists = await checkWordExists(lastWord, word);
        if (!wordExists) {
            toast.error('Cụm từ ghép này không có trong từ điển! Vui lòng nhập từ khác hoặc đầu hàng.', toastStyle);
            return;
        }

        setHistory(prev => [...prev, { firstWord: lastWord, secondWord: word, isAI: false }]);
        setCurrentWord('');
        setIsLoading(true);

        const aiWord = await generateWord(word);
        if (aiWord) {
            setHistory(prev => [...prev, { firstWord: word, secondWord: aiWord, isAI: true }]);
        } else {
            toast.success('Chúc mừng! AI không tìm được từ ghép phù hợp, bạn đã thắng!', toastStyle);
        }
        setIsLoading(false);
    };

    const resetGame = async () => {
        const newWord = await getRandomWord();
        setInitialWord(newWord);
        setHistory([]);
        setCurrentWord('');
        setIsLoading(false);
    };

    const handleSurrender = () => {
        toast.error('Bạn đã đầu hàng! Trò chơi kết thúc.', {
            ...toastStyle,
            duration: 3000, // Hiển thị thông báo trong 3 giây
            icon: '🏳️' // Thêm icon cờ trắng
        });

        // Thêm kết quả đầu hàng vào lịch sử nếu có lượt chơi
        if (history.length > 0) {
            setHistory(prev => [...prev, {
                firstWord: history[history.length - 1].secondWord,
                secondWord: "ĐẦU HÀNG",
                isAI: false
            }]);
        }

        // Đợi 1 giây trước khi reset game để người chơi kịp đọc thông báo
        setTimeout(() => {
            resetGame();
        }, 1000);
    };

    const getRandomWord = async () => {
        try {
            const response = await fetch('/words.txt');
            const text = await response.text();
            const words: DictionaryWord[] = text
                .split('\n')
                .filter(line => line.trim())
                .map(line => JSON.parse(line));

            // Lọc các từ đơn (không có dấu cách)
            const singleWords = words.filter(word => !word.text.includes(' '));

            if (singleWords.length === 0) return 'xin';

            const randomWord = singleWords[Math.floor(Math.random() * singleWords.length)];
            return randomWord.text.toLowerCase();
        } catch (error) {
            console.error('Lỗi khi lấy từ ngẫu nhiên:', error);
            return 'xin';
        }
    };

    useEffect(() => {
        const initGame = async () => {
            const word = await getRandomWord();
            setInitialWord(word);
        };
        initGame();
    }, []);

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
                    <button
                        onClick={handleSurrender}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                        disabled={isLoading || history.length === 0} // Disable nếu chưa có lượt chơi
                    >
                        🏳️ Đầu hàng
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
                                        : `Bắt đầu với từ "${initialWord}"`
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
