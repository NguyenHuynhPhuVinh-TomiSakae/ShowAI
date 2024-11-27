'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { GoogleGenerativeAI } from '@google/generative-ai';
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

interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

const QuizSkeleton = () => (
    <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-8"></div>
        <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-gray-700 rounded w-full"></div>
            ))}
        </div>
    </div>
);

export default function QuizBattle() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    useEffect(() => {
        generateQuestions();
    }, []);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const generateQuestions = async (retryCount = 0) => {
        try {
            const apiKeyResponse = await fetch('/api/Gemini4');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success || !apiKeyData.apiKey) {
                throw new Error('API key không hợp lệ');
            }

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-exp-1121",
            });

            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            };

            const chatSession = model.startChat({
                generationConfig,
                history: [],
            });

            const prompt = `Tạo 5 câu hỏi trắc nghiệm ngẫu nhiên từ các lĩnh vực khác nhau (lịch sử, địa lý, khoa học, văn hóa, nghệ thuật, thể thao, công nghệ, v.v.) bằng tiếng Việt. Mỗi lĩnh vực chỉ được chọn một lần. Câu hỏi phải có độ khó vừa phải và thú vị.

Trả về CHÍNH XÁC định dạng JSON sau:
{
    "questions": [
        {
            "question": "Câu hỏi",
            "options": ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"],
            "correctAnswer": "A. Đáp án 1",
            "explanation": "Giải thích chi tiết tại sao đáp án này đúng"
        }
    ]
}`;

            try {
                const result = await chatSession.sendMessage(prompt);
                const response = result.response.text();

                try {
                    const parsedResponse = JSON.parse(response);

                    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
                        throw new Error('Định dạng câu hỏi không hợp lệ');
                    }

                    setQuestions(parsedResponse.questions);
                    setIsLoading(false);
                } catch (parseError) {
                    console.error('Response gốc:', response);
                    console.error('Lỗi parse JSON:', parseError);

                    if (retryCount < 3) {
                        const waitTime = Math.pow(2, retryCount) * 1000;
                        toast.loading(`Đang thử lại sau ${waitTime / 1000} giây...`, {
                            ...toastStyle,
                            duration: waitTime,
                        });
                        await delay(waitTime);
                        return generateQuestions(retryCount + 1);
                    }

                    const fallbackQuestions = [
                        {
                            question: "Thủ đô của Việt Nam là gì?",
                            options: ["A. Hà Nội", "B. TP.HCM", "C. Đà Nẵng", "D. Huế"],
                            correctAnswer: "A. Hà Nội",
                            explanation: "Hà Nội là thủ đô của Việt Nam từ năm 1945."
                        },
                        {
                            question: "Việt Nam có bao nhiêu tỉnh thành?",
                            options: ["A. 61", "B. 62", "C. 63", "D. 64"],
                            correctAnswer: "C. 63",
                            explanation: "Việt Nam có 63 tỉnh thành, bao gồm 58 tỉnh và 5 thành phố trực thuộc trung ương."
                        },
                        {
                            question: "Sông nào dài nhất Việt Nam?",
                            options: ["A. Sông Hồng", "B. Sông Mê Kông", "C. Sông Đà", "D. Sông Đồng Nai"],
                            correctAnswer: "B. Sông Mê Kông",
                            explanation: "Sông Mê Kông là con sông dài nhất chảy qua Việt Nam với chiều dài khoảng 4.350 km."
                        }
                    ];

                    setQuestions(fallbackQuestions);
                    setIsLoading(false);
                }
            } catch (error: unknown) {
                console.error('Lỗi gọi API:', error);
                if (error instanceof Error && error.message.includes('429') && retryCount < 3) {
                    const waitTime = Math.pow(2, retryCount) * 1000;
                    toast.loading(`Đang thử lại sau ${waitTime / 1000} giây...`, {
                        duration: waitTime,
                    });
                    await delay(waitTime);
                    return generateQuestions(retryCount + 1);
                }
                throw error;
            }
        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            toast.error('Không thể tạo câu hỏi! Vui lòng thử lại sau.', {
                ...toastStyle,
                duration: 3000,
            });

            const fallbackQuestions = [
                {
                    question: "Thủ đô của Việt Nam là gì?",
                    options: ["A. Hà Nội", "B. TP.HCM", "C. Đà Nẵng", "D. Huế"],
                    correctAnswer: "A. Hà Nội",
                    explanation: "Hà Nội là thủ đô của Việt Nam từ năm 1945."
                },
                {
                    question: "Việt Nam có bao nhiêu tỉnh thành?",
                    options: ["A. 61", "B. 62", "C. 63", "D. 64"],
                    correctAnswer: "C. 63",
                    explanation: "Việt Nam có 63 tỉnh thành, bao gồm 58 tỉnh và 5 thành phố trực thuộc trung ương."
                },
                {
                    question: "Sông nào dài nhất Việt Nam?",
                    options: ["A. Sông Hồng", "B. Sông Mê Kông", "C. Sông Đà", "D. Sông Đồng Nai"],
                    correctAnswer: "B. Sông Mê Kông",
                    explanation: "Sông Mê Kông là con sông dài nhất chảy qua Việt Nam với chiều dài khoảng 4.350 km."
                }
            ];
            setQuestions(fallbackQuestions);
            setIsLoading(false);
        }
    };

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;

        setSelectedAnswer(answer);
        const isCorrect = answer === questions[currentQuestion].correctAnswer;

        if (isCorrect) {
            setScore(score + 1);
            toast.success('Đáp án chính xác!', toastStyle);
        } else {
            toast.error('Đáp án sai!', toastStyle);
        }

        setShowExplanation(true);

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setSelectedAnswer(null);
                setShowExplanation(false);
            } else {
                setGameOver(true);
            }
        }, 3000);
    };

    const restartGame = () => {
        setIsLoading(true);
        setCurrentQuestion(0);
        setScore(0);
        setGameOver(false);
        setSelectedAnswer(null);
        setShowExplanation(false);
        generateQuestions();
    };

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
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Đấu trí Quiz</h1>
                <p className="text-base sm:text-lg">
                    Hãy trả lời các câu hỏi để kiểm tra kiến thức của bạn
                </p>
            </motion.div>

            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-6">
                    <p className="text-xl font-semibold">
                        Điểm số: {score}/{questions.length}
                    </p>
                </div>
                <div className="max-w-2xl mx-auto">
                    {isLoading ? (
                        <QuizSkeleton />
                    ) : gameOver ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <h2 className="text-2xl font-bold mb-4">
                                Kết thúc! Điểm của bạn: {score}/{questions.length}
                            </h2>
                            <motion.button
                                onClick={restartGame}
                                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Chơi lại
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <h2 className="text-xl font-semibold mb-4">
                                Câu hỏi {currentQuestion + 1}: {questions[currentQuestion].question}
                            </h2>

                            <div className="space-y-4">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => handleAnswer(option)}
                                        className={`w-full p-4 rounded-lg text-left ${selectedAnswer
                                            ? option === questions[currentQuestion].correctAnswer
                                                ? 'bg-green-600'
                                                : option === selectedAnswer
                                                    ? 'bg-red-600'
                                                    : 'bg-gray-700'
                                            : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                        disabled={!!selectedAnswer}
                                        whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
                                        whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                                    >
                                        {option}
                                    </motion.button>
                                ))}
                            </div>

                            {showExplanation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 bg-gray-800 rounded-lg"
                                >
                                    <p className="text-lg">Giải thích: {questions[currentQuestion].explanation}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
