'use client'
import React, { useState } from 'react';
import { FaStar, FaSpinner } from 'react-icons/fa';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

interface AIRatingProps {
    websiteName: string;
    description: string[];
    keyFeatures: string[];
}

interface RatingCategory {
    name: string;
    score: number;
    description: string;
}

const AIRating: React.FC<AIRatingProps> = ({ websiteName, description, keyFeatures }) => {
    const [ratings, setRatings] = useState<RatingCategory[]>([]);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const generateRating = async () => {
        setRatings([]);
        setAnalysis('');
        setIsLoading(true);
        try {
            const apiKeyResponse = await fetch('/api/Gemini8');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được khóa API');
            }

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-exp-1121" });

            const prompt = `Đánh giá chi tiết công cụ AI "${websiteName}" dựa trên:

            Mô tả: ${description.join(' ')}
            Tính năng chính: ${keyFeatures.join(', ')}

            Hãy đánh giá theo 5 tiêu chí sau và trả về kết quả theo định dạng JSON:
            1. Tính năng và Khả năng (Features & Capabilities)
            2. Hiệu suất và Độ chính xác (Performance & Accuracy)
            3. Trải nghiệm người dùng (User Experience)
            4. Độ tin cậy và Bảo mật (Reliability & Security)
            5. Giá trị tổng thể (Overall Value)

            Format JSON mong muốn:
            {
                "ratings": [
                    {
                        "name": "tên tiêu chí",
                        "score": điểm số (0-10),
                        "description": "nhận xét chi tiết"
                    }
                ],
                "analysis": "phân tích tổng quan về điểm mạnh, điểm yếu và tiềm năng phát triển"
            }`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const jsonStr = response.text().match(/\{[\s\S]*\}/)?.[0];

            if (!jsonStr) throw new Error('Không thể phân tích kết quả từ AI');

            const aiResponse = JSON.parse(jsonStr);
            setRatings(aiResponse.ratings);
            setAnalysis(aiResponse.analysis);

            setTimeout(() => {
                const firstResult = document.getElementById('ratings-section');
                if (firstResult) {
                    firstResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } catch (error) {
            console.error('Lỗi khi đánh giá:', error);
            setAnalysis('Đã xảy ra lỗi khi đánh giá. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderStars = (score: number) => {
        return (
            <div className="flex items-center">
                {[...Array(10)].map((_, index) => (
                    <FaStar
                        key={index}
                        className={`w-4 h-4 ${index < score
                            ? 'text-yellow-400'
                            : 'text-gray-400'
                            }`}
                    />
                ))}
                <span className="ml-2 text-white">
                    {score}/10
                </span>
            </div>
        );
    };

    const scrollToElement = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    return (
        <div className="mt-4 sm:mt-8 bg-gray-800 rounded-xl p-3 sm:p-6">
            <h3 className="text-lg sm:text-2xl font-bold text-blue-300 mb-3 sm:mb-4">
                Đánh giá AI
            </h3>

            <button
                onClick={generateRating}
                disabled={isLoading}
                className={`bg-[#3E52E8] text-white px-4 py-2 rounded w-full text-sm sm:text-base hover:bg-[#2A3BAF] transition-colors duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Đang đánh giá...
                    </span>
                ) : 'Đánh giá'}
            </button>

            <div id="ratings-section">
                <AnimatePresence mode="wait">
                    {ratings.length > 0 && (
                        <motion.div
                            className="mt-4 space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {ratings.map((rating, index) => (
                                <motion.div
                                    key={index}
                                    id={`rating-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.8,
                                        delay: index * 0.8
                                    }}
                                    onAnimationComplete={() => {
                                        scrollToElement(`rating-${index}`);
                                    }}
                                    className="bg-gray-700 rounded-lg p-3 sm:p-4"
                                >
                                    <h4 className="text-blue-300 font-semibold mb-2">
                                        {rating.name}
                                    </h4>
                                    {renderStars(rating.score)}
                                    <p className="text-gray-300 mt-2 text-sm sm:text-base">
                                        {rating.description}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {analysis && (
                        <motion.div
                            id="analysis-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: ratings.length * 0.8
                            }}
                            onAnimationComplete={() => {
                                scrollToElement('analysis-section');
                            }}
                            className="mt-4 p-4 bg-[#1E293B] rounded border border-[#3E52E8]"
                        >
                            <h4 className="text-blue-300 font-semibold mb-2">
                                Phân tích tổng quan
                            </h4>
                            <div className="prose prose-invert max-w-none text-sm sm:text-base">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {analysis}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AIRating;
