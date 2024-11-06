'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import ModalPortal from '@/components/ModalPortal';

const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

const HANGMAN_PARTS = [
    'đầu', 'thân', 'tay trái', 'tay phải', 'chân trái', 'chân phải'
];

const WordSkeleton = () => (
    <div className="animate-pulse space-y-4 text-center">
        <div className="h-6 bg-gray-700 rounded w-48 mx-auto mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-96 mx-auto mb-8"></div>
        <div className="grid grid-cols-7 sm:grid-cols-9 gap-2 max-w-4xl mx-auto">
            {Array(26).fill(0).map((_, i) => (
                <div key={i} className="h-10 bg-gray-700 rounded"></div>
            ))}
        </div>
    </div>
);

// Thêm variants cho animation
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0
    }
};

const letterVariants = {
    hidden: { scale: 0 },
    visible: {
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 10
        }
    }
};

// Thêm variants cho animation chiến thắng
const winVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 15
        }
    }
};

// Thêm bảng chữ cái tiếng Việt
const VIETNAMESE_LETTERS = [
    'a', 'ă', 'â', 'b', 'c', 'd', 'đ',
    'e', 'ê', 'g', 'h', 'i', 'k', 'l',
    'm', 'n', 'o', 'ô', 'ơ', 'p', 'q',
    'r', 's', 't', 'u', 'ư', 'v', 'x', 'y'
];

// Hàm chuyển đổi chữ có dấu thành không dấu
const removeDiacritics = (str: string) => {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

export default function HangmanGame() {
    const [word, setWord] = useState('');
    const [hint, setHint] = useState('');
    const [explanation, setExplanation] = useState('');
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    useEffect(() => {
        initializeGame();
    }, []);

    const generateWord = async () => {
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

            const prompt = `Hãy tạo một từ ghép tiếng Việt ngẫu nhiên (2-3 âm tiết), một gợi ý ngắn gọn, và một giải thích chi tiết về nghĩa của từ.
            Trả về dưới định dạng: từ|gợi ý|giải thích
            Ví dụ: mặt trời|Nguồn sáng tự nhiên chính của Trái Đất|Mặt trời là ngôi sao ở trung tâm Thái Dương Hệ, cung cấp năng lượng và ánh sáng cho Trái Đất
            CHỈ TRẢ VỀ KẾT QUẢ theo định dạng trên, không kèm theo nội dung khác.`;

            const result = await model.generateContent(prompt);
            const response = result.response.text().trim();
            const [newWord, newHint, explanation] = response.split('|');

            return { word: newWord.toLowerCase(), hint: newHint, explanation: explanation };
        } catch (error) {
            console.error('Lỗi khi tạo từ:', error);
            return null;
        }
    };

    const initializeGame = async () => {
        setIsLoading(true);
        const result = await generateWord();
        if (result) {
            setWord(result.word);
            setHint(result.hint);
            setExplanation(result.explanation);
            setGuessedLetters([]);
            setWrongGuesses(0);
            setGameOver(false);
            setWon(false);
        } else {
            toast.error('Không thể tạo từ mới!', toastStyle);
        }
        setIsLoading(false);
    };

    const handleGuess = (letter: string) => {
        if (gameOver || guessedLetters.includes(letter)) return;

        setGuessedLetters([...guessedLetters, letter]);

        // Kiểm tra cả chữ có dấu và không dấu
        const normalizedWord = removeDiacritics(word);
        const normalizedLetter = removeDiacritics(letter);

        if (!word.includes(letter) && !normalizedWord.includes(normalizedLetter)) {
            const newWrongGuesses = wrongGuesses + 1;
            setWrongGuesses(newWrongGuesses);

            if (newWrongGuesses >= HANGMAN_PARTS.length) {
                setGameOver(true);
                toast.error(`Bạn đã thua! Từ đúng là: ${word}`, toastStyle);
            }
        } else {
            // Kiểm tra chiến thắng
            const isComplete = word.split('').every(char => {
                if (char === ' ') return true;
                const normalizedChar = removeDiacritics(char);
                return guessedLetters.concat(letter).some(guessed =>
                    removeDiacritics(guessed) === normalizedChar
                );
            });

            if (isComplete) {
                setGameOver(true);
                setWon(true);
                toast.success('Chúc mừng! Bạn đã thắng!', toastStyle);
            }
        }
    };

    const displayWord = word
        .split('')
        .map(letter => {
            if (letter === ' ') return ' ';
            const normalizedLetter = removeDiacritics(letter);
            return guessedLetters.some(guessed =>
                removeDiacritics(guessed) === normalizedLetter
            ) ? letter : '_';
        })
        .join(' ');

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <motion.div
                className="bg-[#2A3284] text-center py-8 mb-8 px-4"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
            >
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Trò Chơi Đoán Từ</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Đoán từ bằng cách chọn các chữ cái. Bạn có thể đoán sai tối đa 6 lần.
                </p>
            </motion.div>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {isLoading ? (
                        <WordSkeleton />
                    ) : (
                        <motion.div
                            className="text-center mb-8"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.p
                                className="text-xl mb-4"
                                variants={itemVariants}
                            >
                                Số lần đoán sai: {wrongGuesses}/{HANGMAN_PARTS.length}
                            </motion.p>

                            <motion.p
                                className="text-lg mb-4"
                                variants={itemVariants}
                            >
                                Gợi ý: {hint}
                            </motion.p>

                            <motion.div
                                className="text-3xl font-mono mb-8"
                                variants={itemVariants}
                            >
                                {displayWord.split('').map((char, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: won && char !== ' ' ? [1, 1.2, 1] : 1,
                                            color: won && char !== ' ' ? ["#fff", "#4ADE80", "#fff"] : "#fff"
                                        }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: won ? 0.5 : 0.3,
                                            repeat: won ? Infinity : 0,
                                            repeatDelay: 1
                                        }}
                                        className="inline-block mx-1"
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </motion.div>

                            <motion.div
                                className="grid grid-cols-6 sm:grid-cols-8 gap-2 mb-8"
                                variants={containerVariants}
                            >
                                {VIETNAMESE_LETTERS.map((letter) => (
                                    <motion.button
                                        key={letter}
                                        variants={letterVariants}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleGuess(letter)}
                                        disabled={guessedLetters.includes(letter) || gameOver}
                                        className={`p-2 rounded ${guessedLetters.includes(letter)
                                            ? 'bg-gray-600'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {letter.toUpperCase()}
                                    </motion.button>
                                ))}
                            </motion.div>

                            {gameOver && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring" }}
                                    className="space-y-4"
                                >
                                    {won ? (
                                        <motion.div
                                            variants={winVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="text-2xl font-bold text-green-500 mb-4"
                                        >
                                            🎉 Chúc mừng! Bạn đã chiến thắng! 🎉
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            variants={winVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="text-2xl font-bold text-red-500 mb-4"
                                        >
                                            😢 Rất tiếc! Từ đúng là: {word} 😢
                                        </motion.div>
                                    )}

                                    <motion.p
                                        variants={winVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto"
                                    >
                                        Giải thích: {explanation}
                                    </motion.p>

                                    <motion.button
                                        onClick={initializeGame}
                                        className={`px-6 py-3 rounded-lg text-lg ${won ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Chơi lại
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
