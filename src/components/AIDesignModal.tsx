import React, { useState, useEffect } from 'react';
import { IoClose, IoExpand, IoContract, IoArrowUndo } from 'react-icons/io5';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'framer-motion';

interface AIDesignModalProps {
    onClose: () => void;
    isOpen: boolean;
}

interface StyleHistory {
    nav: Record<string, string | number>;
    footer: Record<string, string | number>;
}

const AIDesignModal: React.FC<AIDesignModalProps> = ({ onClose, isOpen }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [styleHistory, setStyleHistory] = useState<StyleHistory[]>([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('styleHistory');
        if (savedHistory) {
            setStyleHistory(JSON.parse(savedHistory));
        }
    }, []);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const generateRandomDesign = async () => {
        setIsLoading(true);
        try {
            let apiKey;
            try {
                const apiKeyResponse = await fetch('/api/Gemini');
                const apiKeyData = await apiKeyResponse.json();
                if (!apiKeyData.success) {
                    throw new Error('Failed to get API key');
                }
                apiKey = apiKeyData.apiKey;
            } catch (error) {
                console.error('Error fetching API key:', error);
            }
            const genAI = new GoogleGenerativeAI(apiKey);

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
            });

            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                topK: 64,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            };

            const chatSession = model.startChat({
                generationConfig,
                history: [
                ],
            });

            const storedNavStyles = localStorage.getItem('newNavStyles');
            const storedFooterStyles = localStorage.getItem('newFooterStyles');
            const currentStyles = JSON.stringify({
                nav: storedNavStyles ? JSON.parse(storedNavStyles) : {},
                footer: storedFooterStyles ? JSON.parse(storedFooterStyles) : {}
            });

            const result = await chatSession.sendMessage(`Đây là các style hiện tại của nav và footer: ${currentStyles}. Hãy tạo ra các style mới với màu sắc và font chữ theo hướng dẫn sau:

1. Màu nền (bgColor): Chọn ngẫu nhiên một màu từ 7 màu cơ bản (đỏ, cam, vàng, lục, lam, chàm, tím) hoặc các biến thể của chúng. Đảm bảo màu nền khác biệt so với hiện tại và các giao diện đã tạo trước đó.

2. Màu văn bản (textColor): Chọn một màu tương phản với màu nền, cũng từ 7 màu cơ bản hoặc biến thể của chúng. Nếu nền tối thì chọn màu chữ sáng, nếu nền sáng thì chọn màu chữ tối.

3. Đảm bảo sự tương phản giữa màu nền và màu chữ để dễ đọc và KHÔNG BAO GIỜ cho màu nền cùng loại với màu chữ và đảm bảo phối màu theo đúng các tiêu chuẩn và mẫu có sẵn.

4. Sử dụng các lớp màu có sẵn trong Tailwind CSS.

5. Padding: không thay đổi.

Trả về dưới dạng JSON với 2 key là 'newNavStyles' và 'newFooterStyles', mỗi key chứa các thuộc tính 'bgColor', 'textColor', và 'padding'.`);

            const newStyles = JSON.parse(result.response.text());

            // Save current styles to history before updating
            const updatedHistory = [...styleHistory, { nav: JSON.parse(storedNavStyles || '{}'), footer: JSON.parse(storedFooterStyles || '{}') }];
            setStyleHistory(updatedHistory);
            localStorage.setItem('styleHistory', JSON.stringify(updatedHistory));

            localStorage.setItem('newNavStyles', JSON.stringify(newStyles.navStyles));
            localStorage.setItem('newFooterStyles', JSON.stringify(newStyles.footerStyles));

            // Reload the page to apply new styles
            window.location.reload();
        } catch (error) {
            console.error('Error generating random design:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const revertToPreviousDesign = () => {
        if (styleHistory.length > 0) {
            localStorage.removeItem('newNavStyles');
            localStorage.removeItem('newFooterStyles');
            localStorage.removeItem('styleHistory')
            window.location.reload();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-[#0F172A] rounded-lg p-6 flex flex-col border border-[#3E52E8] transition-all duration-300 ${isExpanded ? 'w-[98%] h-[98%]' : 'w-full max-w-2xl h-3/4'}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-[#93C5FD]">Tạo lại giao diện với AI</h2>
                            <div className="flex items-center">
                                <button
                                    onClick={toggleExpand}
                                    className="text-gray-400 hover:text-white transition-colors duration-300 mr-4"
                                >
                                    {isExpanded ? <IoContract className="h-5 w-5 md:h-6 md:w-6" /> : <IoExpand className="h-5 w-5 md:h-6 md:w-6" />}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors duration-300"
                                >
                                    <IoClose className="h-6 w-6 md:h-7 md:w-7" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <div className="space-y-4">
                                <button
                                    className={`bg-[#3E52E8] text-white px-4 py-2 rounded w-full hover:bg-[#2A3BAF] transition-colors duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={generateRandomDesign}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Đang tạo...' : 'Tạo Giao Diện Ngẫu Nhiên'}
                                </button>
                                <button
                                    className="bg-[#4A5568] text-white px-4 py-2 rounded w-full hover:bg-[#2D3748] transition-colors duration-300 flex items-center justify-center"
                                    onClick={revertToPreviousDesign}
                                    disabled={styleHistory.length === 0}
                                >
                                    <IoArrowUndo className="mr-2" /> Quay Lại Giao Diện Cũ
                                </button>
                                {/* Thêm các tính năng khác ở đây */}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIDesignModal;