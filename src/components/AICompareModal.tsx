import React, { useState, useEffect } from 'react';
import { IoClose, IoExpand, IoContract, IoSwapHorizontal } from 'react-icons/io5';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown-dark.css';

interface AIWebsite {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string[];
    link: string;
    keyFeatures: string[];
}

interface AICompareModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AICompareModal: React.FC<AICompareModalProps> = ({ isOpen, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [aiTool1, setAiTool1] = useState('');
    const [aiTool2, setAiTool2] = useState('');
    const [comparisonResult, setComparisonResult] = useState('');
    const [aiWebsites, setAiWebsites] = useState<AIWebsite[]>([]);
    const [filteredAiWebsites, setFilteredAiWebsites] = useState<AIWebsite[]>([]);
    const [typingIndex, setTypingIndex] = useState(0);

    useEffect(() => {
        fetchAIWebsites();
    }, []);

    useEffect(() => {
        if (comparisonResult && typingIndex < comparisonResult.length) {
            const timer = setTimeout(() => {
                setTypingIndex(typingIndex + 1);
            }, 20);
            return () => clearTimeout(timer);
        }
    }, [comparisonResult, typingIndex]);

    const fetchAIWebsites = async () => {
        try {
            const response = await fetch('/api/showai');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setAiWebsites(data.data);
        } catch (error) {
            console.error('Error fetching AI websites:', error);
        }
    };

    const handleAiTool1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTool = e.target.value;
        setAiTool1(selectedTool);

        if (selectedTool) {
            const selectedWebsite = aiWebsites.find(website => website.name === selectedTool);
            if (selectedWebsite) {
                const filteredWebsites = aiWebsites.filter(website =>
                    website.name !== selectedTool &&
                    website.tags.some(tag => selectedWebsite.tags.includes(tag))
                );
                setFilteredAiWebsites(filteredWebsites);
            }
        } else {
            setFilteredAiWebsites([]);
        }

        setAiTool2('');
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleCompare = async () => {
        setIsLoading(true);
        setComparisonResult('');
        setTypingIndex(0);
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
                temperature: 0.9,
                topP: 1,
                topK: 32,
                maxOutputTokens: 4096,
            };

            const chatSession = model.startChat({
                generationConfig,
                history: [],
            });

            const tool1Data = aiWebsites.find(website => website.name === aiTool1);
            const tool2Data = aiWebsites.find(website => website.name === aiTool2);

            const result = await chatSession.sendMessage(`So sánh hai công cụ AI: ${aiTool1} và ${aiTool2}. 
            
            Thông tin về ${aiTool1}:
            Mô tả: ${tool1Data?.description.join(' ')}
            Tính năng chính: ${tool1Data?.keyFeatures.join(', ')}
            Tags: ${tool1Data?.tags.join(', ')}
            
            Thông tin về ${aiTool2}:
            Mô tả: ${tool2Data?.description.join(' ')}
            Tính năng chính: ${tool2Data?.keyFeatures.join(', ')}
            Tags: ${tool2Data?.tags.join(', ')}
            
            Hãy đưa ra một phân tích chi tiết về ưu điểm, nhược điểm, và các trường hợp sử dụng phù hợp cho mỗi công cụ. Trình bày kết quả dưới dạng bảng so sánh với các tiêu chí cụ thể.`);

            // Trim the result to remove leading and trailing whitespace
            setComparisonResult(result.response.text().trim());
        } catch (error) {
            console.error('Error comparing AI tools:', error);
            setComparisonResult('Đã xảy ra lỗi khi so sánh các công cụ AI. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

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
                            <h2 className="text-xl md:text-2xl font-bold text-[#93C5FD]">So sánh công cụ AI</h2>
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
                                <div className="flex items-center justify-between">
                                    <select
                                        value={aiTool1}
                                        onChange={handleAiTool1Change}
                                        className="w-[45%] p-2 border rounded bg-[#1E293B] text-white border-[#3E52E8]"
                                    >
                                        <option value="">Chọn công cụ AI thứ nhất</option>
                                        {aiWebsites.map(website => (
                                            <option key={website.id} value={website.name}>{website.name}</option>
                                        ))}
                                    </select>
                                    <IoSwapHorizontal className="text-[#3E52E8] text-2xl" />
                                    <select
                                        value={aiTool2}
                                        onChange={(e) => setAiTool2(e.target.value)}
                                        className="w-[45%] p-2 border rounded bg-[#1E293B] text-white border-[#3E52E8]"
                                        disabled={!aiTool1}
                                    >
                                        <option value="">Chọn công cụ AI thứ hai</option>
                                        {filteredAiWebsites.map(website => (
                                            <option key={website.id} value={website.name}>{website.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleCompare}
                                    className={`bg-[#3E52E8] text-white px-4 py-2 rounded w-full hover:bg-[#2A3BAF] transition-colors duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLoading || !aiTool1 || !aiTool2}
                                >
                                    {isLoading ? 'Đang so sánh...' : 'So sánh'}
                                </button>
                                {comparisonResult && (
                                    <div className="mt-4 p-4 bg-[#1E293B] rounded border border-[#3E52E8] markdown-body">
                                        <ReactMarkdown
                                            className="whitespace-pre-wrap text-white"
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                table: ({ ...props }) => (
                                                    <table className="border-collapse w-full" {...props} />
                                                ),
                                                td: ({ ...props }) => (
                                                    <td className="border border-[#3E52E8] p-2" {...props} />
                                                ),
                                                th: ({ ...props }) => (
                                                    <th className="border border-[#3E52E8] p-2 bg-[#2D3748]" {...props} />
                                                )
                                            }}
                                        >
                                            {comparisonResult.slice(0, typingIndex)}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AICompareModal;