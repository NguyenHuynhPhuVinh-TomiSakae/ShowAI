import React, { useState, useEffect } from 'react';
import { FaRobot, FaChevronDown, FaSpinner } from 'react-icons/fa';
import { GoogleGenerativeAI } from "@google/generative-ai";
import AIAnalysisModal from './AIAnalysisModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IoCopy, IoCheckmark } from "react-icons/io5";
import 'github-markdown-css/github-markdown-light.css';

interface AIButtonProps {
    websiteName: string;
    description: string[];
    keyFeatures: string[];
}

const AIButton: React.FC<AIButtonProps> = ({ websiteName, description, keyFeatures }) => {
    const [showAIOptions, setShowAIOptions] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiContent, setAIContent] = useState('');
    const [aiLoading, setAILoading] = useState(false);
    const [aiModalTitle, setAIModalTitle] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-button-id="website-ai"]')) {
                setShowAIOptions(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleAIAnalysis = async (type: 'summary' | 'analysis' | 'features' | 'audience' | 'competition') => {
        setAILoading(true);
        setShowAIOptions(false);
        setShowAIModal(true);
        setAIContent('');

        let prompt = '';
        let title = '';

        switch (type) {
            case 'summary':
                prompt = `Hãy tóm tắt ngắn gọn về website ${websiteName}:\n\nMô tả: ${description.join('\n')}\n\nTính năng chính: ${keyFeatures.join('\n')}`;
                title = 'Tóm tắt nội dung';
                break;
            case 'analysis':
                prompt = `Hãy phân tích chi tiết về website ${websiteName}:\n\nMô tả: ${description.join('\n')}\n\nTính năng chính: ${keyFeatures.join('\n')}\n\nHãy đánh giá các điểm mạnh, điểm yếu và tiềm năng của website này.`;
                title = 'Phân tích website';
                break;
            case 'features':
                prompt = `Dựa trên thông tin về website ${websiteName}:\n\nMô tả: ${description.join('\n')}\n\nTính năng chính: ${keyFeatures.join('\n')}\n\nHãy suy đoán và dự đoán các tính năng tiềm năng mà người dùng có thể mong đợi từ website này.`;
                title = 'Suy đoán tính năng';
                break;
            case 'audience':
                prompt = `Phân tích đối tượng người dùng tiềm năng cho website ${websiteName}:\n\nMô tả: ${description.join('\n')}\n\nTính năng chính: ${keyFeatures.join('\n')}\n\nHãy xác định và mô tả chi tiết các nhóm đối tượng người dùng phù hợp nhất.`;
                title = 'Phân tích đối tượng';
                break;
            case 'competition':
                prompt = `Dựa trên thông tin về website ${websiteName}:\n\nMô tả: ${description.join('\n')}\n\nTính năng chính: ${keyFeatures.join('\n')}\n\nHãy phân tích vị thế cạnh tranh và đề xuất các chiến lược để nổi bật trong thị trường.`;
                title = 'Phân tích cạnh tranh';
                break;
        }

        setAIModalTitle(title);

        try {
            const response = await fetch('/api/Gemini10');
            const apiKeyData = await response.json();
            if (!apiKeyData.success) throw new Error('Failed to get API key');

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-exp-1121" });

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            setAIContent(text);
        } catch (error) {
            console.error('Error:', error);
            setAIContent('Đã có lỗi xảy ra khi phân tích.');
        } finally {
            setAILoading(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowAIOptions(!showAIOptions)}
                className="flex items-center px-3 py-1.5 rounded-lg
                    border-2 border-blue-500 
                    bg-gradient-to-r from-blue-600/20 to-blue-500/10
                    text-blue-400 hover:text-blue-300
                    transition-all duration-300
                    hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]
                    hover:border-blue-400
                    group
                    ai-hoverable
                    disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={aiLoading}
                data-button-id="website-ai"
            >
                {aiLoading ? (
                    <FaSpinner className="animate-spin text-xl sm:text-2xl mr-1.5" />
                ) : (
                    <>
                        <FaRobot className="text-xl sm:text-2xl mr-1.5 group-hover:scale-110 transition-transform" />
                        <FaChevronDown className={`text-sm transition-all duration-200 
                            ${showAIOptions ? 'rotate-180' : ''} 
                            group-hover:translate-y-0.5`}
                        />
                    </>
                )}
            </button>

            {showAIOptions && !aiLoading && (
                <div className="absolute top-full right-0 mt-2 w-48 
                    bg-gray-800/95 backdrop-blur-sm
                    border border-blue-500/30
                    rounded-lg shadow-lg shadow-blue-500/20 
                    py-2 z-50"
                >
                    <button
                        onClick={() => handleAIAnalysis('summary')}
                        className="w-full text-left px-4 py-2 text-gray-300 
                            hover:bg-blue-500/20 hover:text-blue-300 
                            transition-colors duration-200"
                    >
                        Tóm tắt nội dung
                    </button>
                    <button
                        onClick={() => handleAIAnalysis('analysis')}
                        className="w-full text-left px-4 py-2 text-gray-300 
                            hover:bg-blue-500/20 hover:text-blue-300 
                            transition-colors duration-200"
                    >
                        Phân tích website
                    </button>
                    <button
                        onClick={() => handleAIAnalysis('features')}
                        className="w-full text-left px-4 py-2 text-gray-300 
                            hover:bg-blue-500/20 hover:text-blue-300 
                            transition-colors duration-200"
                    >
                        Suy đoán tính năng
                    </button>
                    <button
                        onClick={() => handleAIAnalysis('audience')}
                        className="w-full text-left px-4 py-2 text-gray-300 
                            hover:bg-blue-500/20 hover:text-blue-300 
                            transition-colors duration-200"
                    >
                        Phân tích đối tượng
                    </button>
                    <button
                        onClick={() => handleAIAnalysis('competition')}
                        className="w-full text-left px-4 py-2 text-gray-300 
                            hover:bg-blue-500/20 hover:text-blue-300 
                            transition-colors duration-200"
                    >
                        Phân tích cạnh tranh
                    </button>
                </div>
            )}

            <AIAnalysisModal
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                content={
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ inline, className, children, ...props }: {
                                inline?: boolean;
                                className?: string;
                                children?: React.ReactNode;
                            }) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                    <div className="relative">
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            className="rounded-xl shadow-lg !bg-[#1A1A1A] !p-4 my-4"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                        <button
                                            onClick={() => copyToClipboard(String(children), 0)}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg 
                                                     bg-gray-700/50 hover:bg-gray-700 text-white/70 
                                                     hover:text-white transition-all duration-200"
                                        >
                                            {copiedIndex === 0 ? (
                                                <IoCheckmark className="h-4 w-4" />
                                            ) : (
                                                <IoCopy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                        className="markdown-body dark"
                    >
                        {aiContent}
                    </ReactMarkdown>
                }
                isLoading={aiLoading}
                title={aiModalTitle}
            />
        </div>
    );
};

export default AIButton;
