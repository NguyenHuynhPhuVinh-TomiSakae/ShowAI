'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextClassifier } from '@mediapipe/tasks-text';
import { toast, Toaster } from 'react-hot-toast';
import ModalPortal from '@/components/ModalPortal';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { NavigationGuard } from '@/components/NavigationGuard'
import MediaPipeService from '@/services/MediaPipeService';

// Thêm cấu hình toast style
const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

export default function SentimentGuessGame() {
    const [sentences, setSentences] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [result, setResult] = useState<string>('');
    const [scores, setScores] = useState<number[]>([]);
    const [textClassifier, setTextClassifier] = useState<TextClassifier | null>(null);
    // Thêm state mới
    const [score, setScore] = useState<number>(10);
    const [streak, setStreak] = useState<number>(0);
    const [wrongAttempts, setWrongAttempts] = useState<number>(0);

    // Cập nhật useEffect
    useEffect(() => {
        const initClassifier = async () => {
            try {
                const service = MediaPipeService.getInstance();
                const classifier = await service.getClassifier();
                setTextClassifier(classifier);
            } catch (error) {
                console.error('Lỗi khi lấy classifier:', error);
                toast.error('Không thể khởi tạo hệ thống phân tích. Vui lòng thử lại!', toastStyle);
            }
        };

        initClassifier();
    }, []);

    const generateSentences = async () => {
        setLoading(true);
        // Reset selection và kết quả khi tạo câu mới
        setSelectedIndex(null);
        setResult('');

        try {
            const apiKeyResponse = await fetch('/api/Gemini6');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được khóa API');
            }
            const apiKey = apiKeyData.apiKey;

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            // Sửa lại prompt để yêu cầu response JSON thuần túy
            const prompt = `Tạo 5 câu văn tiếng Việt khác nhau về các chủ đề khác nhau, mỗi câu có mức độ tích cực khác nhau. 
            CHỈ trả về một mảng JSON chứa 5 câu, không kèm theo markdown hay bất kỳ định dạng nào khác.
            Ví dụ response mong muốn: ["Câu 1", "Câu 2", "Câu 3", "Câu 4", "Câu 5"]`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Xử lý text để lấy phần JSON hợp lệ
            const jsonMatch = text.match(/\[([\s\S]*)\]/);
            if (!jsonMatch) {
                throw new Error('Không tìm thấy JSON hợp lệ trong response');
            }

            const newSentences = JSON.parse(jsonMatch[0]);
            if (!Array.isArray(newSentences) || newSentences.length !== 5) {
                throw new Error('Response không đúng định dạng mong muốn');
            }

            setSentences(newSentences);

            // Phân tích sentiment cho mỗi câu
            const service = MediaPipeService.getInstance();
            const classifier = await service.getClassifier();

            const sentimentScores = newSentences.map((sentence: string) => {
                const result = classifier.classify(sentence);
                return result.classifications[0].categories.find(
                    cat => cat.categoryName === 'positive'
                )?.score || 0;
            });
            setScores(sentimentScores);
        } catch (error) {
            console.error('Lỗi khi tạo câu:', error);
            toast.error('Có lỗi xảy ra khi tạo câu. Vui lòng thử lại!');
            setSentences([]);
            setScores([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (textClassifier) {
            generateSentences();
        }
    }, [textClassifier]);

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
        const maxScore = Math.max(...scores);
        const isCorrect = scores[index] === maxScore;

        if (isCorrect) {
            setResult('Chính xác! Đây là câu tích cực nhất.');
            setStreak(prev => prev + 1);
            setWrongAttempts(0);
            toast.success(`Chúc mừng! Chuỗi thắng: ${streak + 1}`, toastStyle);
        } else {
            setWrongAttempts(prev => prev + 1);
            if (wrongAttempts + 1 >= 2) {
                setScore(prev => Math.max(0, prev - 1));
                setWrongAttempts(0);
                setStreak(0);
                setResult('Sai 2 lần liên tiếp! Bị trừ 1 điểm.');
                toast.error(`Tiếc quá! Bạn bị trừ 1 điểm. Điểm còn lại: ${score - 1}`, toastStyle);
            } else {
                setResult('Chưa đúng! Bạn còn 1 lần thử nữa.');
                toast.error('Tiếc quá! Hãy thử lại nhé.', toastStyle);
            }
        }

        // Kiểm tra điều kiện thua
        if (score <= 1 && wrongAttempts + 1 >= 2) {
            toast.error('Game Over! Bạn đã hết điểm.', toastStyle);
            // Reset game sau 2 giây
            setTimeout(() => {
                setScore(10);
                setStreak(0);
                setWrongAttempts(0);
                generateSentences();
            }, 2000);
        }
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <NavigationGuard isBlocked={loading} />

            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Phán Đoán Cảm Xúc</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Chọn câu có cảm xúc tích cực nhất với sự trợ giúp của AI.
                </p>
            </div>

            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <>
                        <div className="flex justify-center gap-8 mb-8">
                            <div className="bg-gray-800 px-6 py-3 rounded-lg">
                                <Skeleton width={80} height={24} baseColor="#374151" highlightColor="#4B5563" />
                            </div>
                            <div className="bg-gray-800 px-6 py-3 rounded-lg">
                                <Skeleton width={100} height={24} baseColor="#374151" highlightColor="#4B5563" />
                            </div>
                        </div>

                        <div className="mb-8 text-center px-4">
                            <p className="text-lg text-gray-300">Đang tải mô hình, vui lòng đợi trong giây lát...</p>
                            <div className="max-w-[400px] w-full mx-auto">
                                <Skeleton height={24} baseColor="#374151" highlightColor="#4B5563" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[...Array(5)].map((_, index) => (
                                <Skeleton
                                    key={index}
                                    height={60}
                                    baseColor="#374151"
                                    highlightColor="#4B5563"
                                    className="rounded-lg"
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Di chuyển phần hiển thị điểm và chuỗi thắng vào đây */}
                        <div className="flex justify-center gap-8 mb-8">
                            <div className="bg-gray-800 px-6 py-3 rounded-lg">
                                <p className="text-lg font-bold">Điểm: {score}</p>
                            </div>
                            <div className="bg-gray-800 px-6 py-3 rounded-lg">
                                <p className="text-lg font-bold">Chuỗi thắng: {streak}</p>
                            </div>
                        </div>

                        <div className="mb-8 text-center">
                            <p className="text-lg text-gray-300">
                                Chọn câu mà bạn nghĩ là tích cực nhất trong các câu sau:
                            </p>
                        </div>

                        <div className="space-y-4">
                            {sentences.map((sentence, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`p-4 rounded-lg cursor-pointer transition-all ${selectedIndex === index
                                        ? 'bg-purple-600'
                                        : 'bg-gray-800 hover:bg-gray-700'
                                        }`}
                                    onClick={() => handleSelect(index)}
                                >
                                    {sentence}
                                </motion.div>
                            ))}
                        </div>

                        {result && (
                            <div className="text-center mt-8">
                                <p className="text-xl font-bold">{result}</p>
                            </div>
                        )}

                        <button
                            onClick={generateSentences}
                            className="mt-8 mx-auto block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold"
                        >
                            Tạo Câu Mới
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
