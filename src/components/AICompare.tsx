import React, { useState, useEffect } from 'react';
import { IoSwapHorizontal } from 'react-icons/io5';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown-dark.css';
import { FaPlay, FaPause, FaEye } from 'react-icons/fa';

interface AIWebsite {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string[];
    link: string;
    keyFeatures: string[];
}

interface AICompareProps {
    currentWebsite: AIWebsite;
    className?: string;
    'data-button-id'?: string;
}

const AICompare: React.FC<AICompareProps> = ({
    currentWebsite,
    className,
    'data-button-id': buttonId
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiTool2, setAiTool2] = useState('');
    const [comparisonResult, setComparisonResult] = useState('');
    const [aiWebsites, setAiWebsites] = useState<AIWebsite[]>([]);
    const [filteredAiWebsites, setFilteredAiWebsites] = useState<AIWebsite[]>([]);
    const [typingIndex, setTypingIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isComparing, setIsComparing] = useState(false);

    useEffect(() => {
        fetchAIWebsites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (comparisonResult && typingIndex < comparisonResult.length && !isPaused) {
            const timer = setTimeout(() => {
                setTypingIndex(typingIndex + 1);
            }, 20);
            return () => clearTimeout(timer);
        }
    }, [comparisonResult, typingIndex, isPaused]);

    const fetchAIWebsites = async () => {
        try {
            const response = await fetch('/api/showai');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setAiWebsites(data.data);
            filterWebsites(data.data, currentWebsite);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách trang web AI:', error);
        }
    };

    const filterWebsites = (websites: AIWebsite[], selectedWebsite: AIWebsite) => {
        const filtered = websites.filter(website =>
            website.name !== selectedWebsite.name &&
            website.tags.some(tag => selectedWebsite.tags.includes(tag))
        );
        setFilteredAiWebsites(filtered);
    };

    const handleCompare = async () => {
        setIsLoading(true);
        setComparisonResult('');
        setTypingIndex(0);
        setIsPaused(false);
        setIsComparing(true);
        try {
            let apiKey;
            try {
                const apiKeyResponse = await fetch('/api/Gemini12');
                const apiKeyData = await apiKeyResponse.json();
                if (!apiKeyData.success) {
                    throw new Error('Không lấy được khóa API');
                }
                apiKey = apiKeyData.apiKey;
            } catch (error) {
                console.error('Lỗi khi lấy khóa API:', error);
            }
            const genAI = new GoogleGenerativeAI(apiKey);

            const model = genAI.getGenerativeModel({
                model: "gemini-exp-1121",
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

            const tool2Data = aiWebsites.find(website => website.name === aiTool2);

            const result = await chatSession.sendMessage(`So sánh hai công cụ AI: ${currentWebsite.name} và ${aiTool2}. 
            
            Thông tin về ${currentWebsite.name}:
            Mô tả: ${currentWebsite.description.join(' ')}
            Tính năng chính: ${currentWebsite.keyFeatures.join(', ')}
            Tags: ${currentWebsite.tags.join(', ')}
            
            Thông tin về ${aiTool2}:
            Mô tả: ${tool2Data?.description.join(' ')}
            Tính năng chính: ${tool2Data?.keyFeatures.join(', ')}
            Tags: ${tool2Data?.tags.join(', ')}
            
            Hãy đưa ra một phân tích chi tiết về ưu điểm, nhược điểm, và các trường hợp sử dụng phù hợp cho mỗi công cụ. Trình bày kết quả dưới dạng bảng so sánh với các tiêu chí cụ thể.`);

            setComparisonResult(result.response.text().trim());
        } catch (error) {
            console.error('Lỗi khi so sánh công cụ AI:', error);
            setComparisonResult('Đã xảy ra lỗi khi so sánh các công cụ AI. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePauseResume = () => {
        setIsPaused(!isPaused);
    };

    const handleShowAll = () => {
        setTypingIndex(comparisonResult.length);
    };

    return (
        <div className={`mt-8 bg-gray-800 rounded-xl p-4 sm:p-6 ${className}`} data-button-id={buttonId}>
            <h3 className="text-xl sm:text-2xl font-bold text-blue-300 mb-4">So sánh với công cụ AI khác</h3>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                <div className="w-full sm:w-[45%] p-2 border rounded bg-[#1E293B] text-white border-[#3E52E8] mb-2 sm:mb-0">
                    {currentWebsite.name}
                </div>
                <IoSwapHorizontal className="text-[#3E52E8] text-2xl my-2 sm:my-0" />
                <select
                    value={aiTool2}
                    onChange={(e) => setAiTool2(e.target.value)}
                    className="w-full sm:w-[45%] p-2 border rounded bg-[#1E293B] text-white border-[#3E52E8]"
                >
                    <option value="">Chọn công cụ AI để so sánh</option>
                    {filteredAiWebsites.map(website => (
                        <option key={website.id} value={website.name}>{website.name}</option>
                    ))}
                </select>
            </div>
            <button
                onClick={handleCompare}
                className={`bg-[#3E52E8] text-white px-4 py-2 rounded w-full hover:bg-[#2A3BAF] transition-colors duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading || !aiTool2}
            >
                {isLoading ? 'Đang so sánh...' : 'So sánh'}
            </button>
            {comparisonResult && (
                <div className="mt-4 p-2 sm:p-4 bg-[#1E293B] rounded border border-[#3E52E8] markdown-body overflow-x-auto">
                    <ReactMarkdown
                        className="whitespace-pre-wrap text-white text-sm sm:text-base"
                        remarkPlugins={[remarkGfm]}
                        components={{
                            table: ({ ...props }) => (
                                <table className="border-collapse w-full" {...props} />
                            ),
                            td: ({ ...props }) => (
                                <td className="border border-[#3E52E8] p-1 sm:p-2" {...props} />
                            ),
                            th: ({ ...props }) => (
                                <th className="border border-[#3E52E8] p-1 sm:p-2 bg-[#2D3748]" {...props} />
                            )
                        }}
                    >
                        {comparisonResult.slice(0, typingIndex)}
                    </ReactMarkdown>
                    {isComparing && (
                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={handlePauseResume}
                                className={`flex items-center ${isPaused ? 'bg-green-500' : 'bg-yellow-500'} text-white px-2 py-1 rounded-md hover:opacity-90 transition-opacity duration-300`}
                            >
                                {isPaused ? (
                                    <>
                                        <FaPlay className="mr-1" />
                                        <span>Tiếp tục</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPause className="mr-1" />
                                        <span>Tạm dừng</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleShowAll}
                                className="flex items-center bg-blue-500 text-white px-2 py-1 rounded-md hover:opacity-90 transition-opacity duration-300"
                            >
                                <FaEye className="mr-1" />
                                <span>Hiển thị tất cả</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AICompare;
