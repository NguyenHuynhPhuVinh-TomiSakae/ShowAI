import React, { useState, useEffect } from 'react';
import { FaPlus, FaSpinner, FaRobot, FaQuestionCircle, FaLightbulb, FaCode, FaPause, FaPlay, FaEye } from 'react-icons/fa';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AdditionalInfoButtonProps {
    websiteData: string;
    className?: string;
    'data-button-id'?: string;
}

interface ChatMessage {
    role: 'user' | 'model';
    parts: string;
}

const AdditionalInfoButton: React.FC<AdditionalInfoButtonProps> = ({
    websiteData,
    className,
    'data-button-id': buttonId
}) => {
    const [additionalInfo, setAdditionalInfo] = useState<ChatMessage[]>([]);
    const [responseHistory, setResponseHistory] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [typingIndex, setTypingIndex] = useState(-1);
    const [displayedText, setDisplayedText] = useState('');
    const typingSpeed = 10; // milliseconds per character
    const [isPaused, setIsPaused] = useState(false);

    const generateContent = async (prompt: string) => {
        setIsLoading(true);
        setDisplayedText('');
        setIsPaused(false); // Thêm dòng này để reset trạng thái tạm dừng
        let apiKey;
        try {
            const apiKeyResponse = await fetch('/api/Gemini9');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Failed to get API key');
            }
            apiKey = apiKeyData.apiKey;
        } catch (error) {
            console.error('Error fetching API key:', error);
        }
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({ model: "gemini-exp-1121" });

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
        };

        const chatSession = model.startChat({
            generationConfig,
            history: additionalInfo.map(msg => ({ role: msg.role, parts: [{ text: msg.parts }] })),
        });

        try {
            const userMessage = `${prompt}: ${websiteData}`;
            const newUserMessage: ChatMessage = { role: 'user', parts: userMessage };
            setAdditionalInfo(prevInfo => [...prevInfo, newUserMessage]);

            const result = await chatSession.sendMessage(userMessage);
            const text = result.response.text();
            const newModelMessage: ChatMessage = { role: 'model', parts: text };
            setAdditionalInfo(prevInfo => [...prevInfo, newModelMessage]);
            setResponseHistory(prevHistory => [...prevHistory, text]);
            setTypingIndex(additionalInfo.length + 1);
        } catch (error) {
            console.error('Error generating content:', error);
            const errorMessage: ChatMessage = { role: 'model', parts: 'Đã xảy ra lỗi khi tạo nội dung.' };
            setAdditionalInfo(prevInfo => [...prevInfo, errorMessage]);
            setResponseHistory(prevHistory => [...prevHistory, 'Đã xảy ra lỗi khi tạo nội dung.']);
        } finally {
            setIsLoading(false);
        }
    };

    const generateAdditionalInfo = () => generateContent('Dựa trên thông tin sau về một trang web AI, hãy cung cấp thêm một số thông tin bổ sung hoặc ví dụ cụ thể về cách sử dụng, khác với những gì đã được đề cập trước đó');
    const generateQA = () => generateContent('Dựa trên thông tin sau về một trang web AI, hãy tạo ra 3 câu hỏi và trả lời liên quan đến trang web này');
    const generateUseCases = () => generateContent('Dựa trên thông tin sau về một trang web AI, hãy đề xuất 3 tình huống sử dụng cụ thể và chi tiết cho trang web này');
    const generateCodeExamples = () => generateContent('Dựa trên thông tin sau về một trang web AI, hãy cung cấp 2 ví dụ mã nguồn ngắn gọn minh họa cách tích hợp hoặc sử dụng API của trang web này');

    useEffect(() => {
        if (typingIndex >= 0 && typingIndex < additionalInfo.length && !isPaused) {
            const text = additionalInfo[typingIndex].parts;
            let charIndex = displayedText.length;
            const typingInterval = setInterval(() => {
                if (charIndex < text.length) {
                    setDisplayedText(prevText => prevText + text[charIndex]);
                    charIndex++;
                } else {
                    clearInterval(typingInterval);
                    setTypingIndex(-1);
                }
            }, typingSpeed);
            return () => clearInterval(typingInterval);
        }
    }, [typingIndex, additionalInfo, isPaused, displayedText]);

    const handlePauseResume = () => {
        setIsPaused(!isPaused);
    };

    const handleShowAll = () => {
        if (typingIndex >= 0 && typingIndex < additionalInfo.length) {
            setDisplayedText(additionalInfo[typingIndex].parts);
            setTypingIndex(-1);
        }
    };

    const renderButton = (onClick: () => void, icon: React.ReactNode, text: string, bgColor: string) => (
        <button
            onClick={onClick}
            className={`flex items-center ${bgColor} text-white px-2 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-full hover:opacity-90 transition-opacity duration-300`}
        >
            {icon}
            <span className="ml-1 md:ml-2">{text}</span>
        </button>
    );

    const renderControlButton = (onClick: () => void, icon: React.ReactNode, text: string, bgColor: string) => (
        <button
            onClick={onClick}
            className={`flex items-center ${bgColor} text-white px-1 py-1 md:px-3 md:py-2 rounded-md hover:opacity-90 transition-opacity duration-300`}
        >
            {icon}
            <span className="ml-1 text-xs md:text-sm">{text}</span>
        </button>
    );

    return (
        <div className={`mt-4 ${className}`} data-button-id={buttonId}>
            {additionalInfo.length === 0 && (
                <div className="flex flex-wrap gap-2 md:gap-4">
                    {renderButton(generateAdditionalInfo, <FaPlus />, 'Thêm thông tin', 'bg-blue-500')}
                    {renderButton(generateQA, <FaQuestionCircle />, 'Tạo Q&A', 'bg-green-500')}
                    {renderButton(generateUseCases, <FaLightbulb />, 'Tạo tình huống sử dụng', 'bg-yellow-500')}
                    {renderButton(generateCodeExamples, <FaCode />, 'Tạo ví dụ mã', 'bg-purple-500')}
                </div>
            )}
            {responseHistory.map((response, index) => (
                <div key={index} className="mt-4 text-left">
                    <div className="inline-block p-3 rounded-lg bg-gray-900 text-white shadow-md border border-blue-500">
                        <div className="flex items-center mb-2">
                            <FaRobot className="text-blue-400 mr-2" />
                            <span className="text-blue-400 font-semibold">Thông tin từ AI</span>
                        </div>
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
                                        <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            {...props}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {index === responseHistory.length - 1 && typingIndex !== -1 ? displayedText : response}
                        </ReactMarkdown>
                        {index === responseHistory.length - 1 && typingIndex !== -1 && (
                            <div className="mt-2 flex gap-2">
                                {renderControlButton(
                                    handlePauseResume,
                                    isPaused ? <FaPlay className="text-lg" /> : <FaPause className="text-lg" />,
                                    isPaused ? 'Tiếp tục' : 'Tạm dừng',
                                    isPaused ? 'bg-green-500' : 'bg-yellow-500'
                                )}
                                {renderControlButton(
                                    handleShowAll,
                                    <FaEye className="text-lg" />,
                                    'Hiển thị tất cả',
                                    'bg-blue-500'
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            {(isLoading || typingIndex !== -1) && (
                <div className="mt-4 flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    <span>Đang tạo nội dung...</span>
                </div>
            )}
            {responseHistory.length > 0 && typingIndex === -1 && !isLoading && (
                <div className="flex flex-wrap gap-2 md:gap-4 mt-4">
                    {renderButton(generateAdditionalInfo, <FaPlus className="mr-1 md:mr-2" />, 'Thêm thông tin', 'bg-blue-500')}
                    {renderButton(generateQA, <FaQuestionCircle className="mr-1 md:mr-2" />, 'Tạo Q&A', 'bg-green-500')}
                    {renderButton(generateUseCases, <FaLightbulb className="mr-1 md:mr-2" />, 'Tạo tình huống sử dụng', 'bg-yellow-500')}
                    {renderButton(generateCodeExamples, <FaCode className="mr-1 md:mr-2" />, 'Tạo ví dụ mã', 'bg-purple-500')}
                </div>
            )}
        </div>
    );
};

export default AdditionalInfoButton;
