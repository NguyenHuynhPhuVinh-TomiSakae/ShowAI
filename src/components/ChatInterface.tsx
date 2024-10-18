import React, { useState, useEffect } from 'react';
import { IoSend, IoStop, IoClose, IoExpand, IoContract, IoTrash, IoCopy, IoRefresh, IoCreate } from "react-icons/io5";
import { FaSpinner, FaUser, FaRobot } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import 'github-markdown-css/github-markdown-light.css';

interface Message {
    text: string;
    isUser: boolean;
    isError?: boolean;
    isSampleQuestion?: boolean;
}

interface ChatInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
    messages: Message[];
    typingText: string;
    input: string;
    setInput: (input: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    isTyping: boolean;
    isLoadingAIWebsites: boolean;
    isExpanded: boolean;
    toggleExpand: () => void;
    handleClearMessages: () => void;
    stopTyping: () => void;
    handleSampleQuestionClick: (question: string) => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    regenerateResponse: () => void;
    editMessage: (index: number, newText: string) => void;
    children?: React.ReactNode;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    isOpen,
    onClose,
    messages,
    typingText,
    input,
    setInput,
    handleSubmit,
    isLoading,
    isTyping,
    isLoadingAIWebsites,
    isExpanded,
    toggleExpand,
    handleClearMessages,
    stopTyping,
    handleSampleQuestionClick,
    messagesEndRef,
    regenerateResponse,
    editMessage,
    children,
}) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editedText, setEditedText] = useState<string>('');
    const [textareaHeight, setTextareaHeight] = useState<string>('auto');

    useEffect(() => {
        if (editingIndex !== null) {
            const textarea = document.getElementById('edit-textarea');
            if (textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
                setTextareaHeight(`${textarea.scrollHeight}px`);
            }
        }
    }, [editedText, editingIndex]);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    const copyAllText = () => {
        const allText = messages.map(m => m.text).join('\n\n');
        copyToClipboard(allText, -1);
    };

    const handleEditMessage = (index: number) => {
        setEditingIndex(index);
        setEditedText(messages[index].text);
    };

    const handleSaveEdit = (index: number) => {
        editMessage(index, editedText);
        setEditingIndex(null);
        setEditedText('');
        regenerateResponse();
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
                            <h2 className="text-xl md:text-2xl font-bold text-[#93C5FD]">Trò chuyện cùng AI</h2>
                            <div className="flex items-center">
                                <button
                                    onClick={copyAllText}
                                    className="text-gray-400 hover:text-white transition-colors duration-300 mr-4 relative"
                                    title="Copy all text"
                                >
                                    <IoCopy className="h-5 w-5 md:h-6 md:w-6" />
                                    {copiedIndex === -1 && (
                                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">Đã Sao Chép!</span>
                                    )}
                                </button>
                                <button
                                    onClick={handleClearMessages}
                                    className="text-gray-400 hover:text-white transition-colors duration-300 mr-4"
                                >
                                    <IoTrash className="h-5 w-5 md:h-6 md:w-6" />
                                </button>
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
                        <div className="flex-grow overflow-hidden">
                            <div className="flex flex-col h-full">
                                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                    {messages.map((message, index) => (
                                        <div key={index} className={`flex flex-col ${message.isUser || message.isSampleQuestion ? 'items-end' : 'items-start'}`}>
                                            <div className={`flex items-start ${message.isUser || message.isSampleQuestion ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`flex flex-col items-center mr-2 ${message.isUser || message.isSampleQuestion ? 'ml-2 mr-0' : ''}`}>
                                                    {message.isUser || message.isSampleQuestion ? (
                                                        <FaUser className="text-blue-500 text-xl mb-1" />
                                                    ) : (
                                                        <FaRobot className="text-green-500 text-xl mb-1" />
                                                    )}
                                                    <span className="text-xs text-gray-400">
                                                        {message.isUser || message.isSampleQuestion ? 'User' : 'AI'}
                                                    </span>
                                                </div>
                                                <div
                                                    className={`max-w-3/4 p-3 rounded-lg ${message.isUser
                                                        ? 'bg-blue-500 text-white'
                                                        : message.isError
                                                            ? 'bg-red-500 text-white'
                                                            : message.isSampleQuestion
                                                                ? 'bg-green-500 text-white cursor-pointer'
                                                                : 'bg-gray-200 text-black'
                                                        } max-w-[80%] break-words ${!message.isUser && !message.isError && !message.isSampleQuestion ? 'markdown-body' : ''}`}
                                                    onClick={message.isSampleQuestion ? () => handleSampleQuestionClick(message.text) : undefined}
                                                >
                                                    {message.isUser || message.isSampleQuestion ? (
                                                        editingIndex === index ? (
                                                            <div>
                                                                <textarea
                                                                    id="edit-textarea"
                                                                    value={editedText}
                                                                    onChange={(e) => setEditedText(e.target.value)}
                                                                    className="w-full p-2 text-black rounded"
                                                                    style={{ height: textareaHeight }}
                                                                />
                                                                <div className="mt-2 flex justify-end">
                                                                    <button
                                                                        onClick={() => handleSaveEdit(index)}
                                                                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                                                    >
                                                                        Lưu
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingIndex(null)}
                                                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                                                    >
                                                                        Hủy
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div>{message.text}</div>
                                                        )
                                                    ) : (
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
                                                                                {...props}
                                                                            >
                                                                                {String(children).replace(/\n$/, '')}
                                                                            </SyntaxHighlighter>
                                                                            <button
                                                                                onClick={() => copyToClipboard(String(children), index)}
                                                                                className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded"
                                                                            >
                                                                                <IoCopy />
                                                                            </button>
                                                                            {copiedIndex === index && (
                                                                                <span className="absolute top-2 right-10 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">Đã Sao Chép!</span>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    )
                                                                }
                                                            }}
                                                        >
                                                            {message.text}
                                                        </ReactMarkdown>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex space-x-2">
                                                {message.isUser && !message.isSampleQuestion && !isTyping && (
                                                    <button
                                                        onClick={() => handleEditMessage(index)}
                                                        className="text-gray-400 hover:text-white"
                                                    >
                                                        <IoCreate />
                                                    </button>
                                                )}
                                                {!message.isUser && !message.isSampleQuestion && (
                                                    <>
                                                        <button
                                                            onClick={() => copyToClipboard(message.text, index)}
                                                            className="text-gray-400 hover:text-white relative"
                                                        >
                                                            <IoCopy />
                                                            {copiedIndex === index && (
                                                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">Đã Sao Chép!</span>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => regenerateResponse()}
                                                            className="text-gray-400 hover:text-white"
                                                        >
                                                            <IoRefresh />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {typingText && (
                                        <div className="flex justify-start">
                                            <div className="flex items-start">
                                                <div className="flex flex-col items-center mr-2">
                                                    <FaRobot className="text-green-500 text-xl mb-1" />
                                                    <span className="text-xs text-gray-400">AI</span>
                                                </div>
                                                <div className="max-w-3/4 p-3 rounded-lg bg-gray-200 text-black max-w-[80%] break-words markdown-body">
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
                                                        {typingText}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {isLoading && !typingText && (
                                        <div className="flex justify-start">
                                            <div className="flex items-start">
                                                <div className="flex flex-col items-center mr-2">
                                                    <FaRobot className="text-green-500 text-xl mb-1" />
                                                    <span className="text-xs text-gray-400">AI</span>
                                                </div>
                                                <div className="max-w-3/4 p-3 rounded-lg bg-gray-200 text-black max-w-[80%]">
                                                    <span className="animate-pulse">...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form onSubmit={handleSubmit} className="p-4 border-t">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            className="flex-grow p-2 border rounded text-black"
                                            placeholder={isLoadingAIWebsites ? "Đang tải dữ liệu..." : "Nhập tin nhắn của bạn..."}
                                            disabled={isLoading || isTyping || isLoadingAIWebsites}
                                        />
                                        {children}
                                        {isLoadingAIWebsites ? (
                                            <button
                                                type="button"
                                                className="bg-gray-500 text-white px-3 py-2 rounded"
                                                disabled
                                            >
                                                <FaSpinner className="animate-spin" />
                                            </button>
                                        ) : isTyping ? (
                                            <button
                                                type="button"
                                                className="bg-red-500 text-white px-3 py-2 rounded"
                                                onClick={stopTyping}
                                            >
                                                <IoStop />
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="bg-blue-500 text-white px-3 py-2 rounded"
                                                disabled={isLoading || isTyping || isLoadingAIWebsites}
                                            >
                                                <IoSend />
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChatInterface;