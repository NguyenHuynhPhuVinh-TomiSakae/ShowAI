import React, { useState, useEffect } from 'react';
import { IoSend, IoStop, IoClose, IoExpand, IoContract, IoTrash, IoCopy, IoRefresh, IoCreate, IoCheckmark } from "react-icons/io5";
import { FaSpinner, FaUser, FaRobot } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import 'github-markdown-css/github-markdown-light.css';
import type { MotionProps } from 'framer-motion';
type ModalBackdropProps = MotionProps & {
    className?: string;
};


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
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    children?: React.ReactNode;
    extraButton?: React.ReactNode;
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
    setMessages,
    children,
    extraButton,
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    {...{
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0 },
                        transition: { duration: 0.3 },
                        className: "fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                    } as ModalBackdropProps}
                >
                    <motion.div
                        {...{
                            initial: { scale: 0.9, opacity: 0 },
                            animate: { scale: 1, opacity: 1 },
                            exit: { scale: 0.9, opacity: 0 },
                            transition: { duration: 0.3 },
                            className: `bg-[#0F172A] rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col border border-[#3E52E8]/20 transition-all duration-300 ${isExpanded ? 'w-full h-full' : 'w-full max-w-3xl h-[90vh] sm:h-4/5'
                                }`
                        } as ModalBackdropProps}
                    >
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                                Trò chuyện cùng AI
                            </h2>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={copyAllText}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                                    title="Copy all text"
                                >
                                    <IoCopy className="h-5 w-5 text-white/70 hover:text-white" />
                                </button>
                                <button
                                    onClick={handleClearMessages}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                                >
                                    <IoTrash className="h-5 w-5 text-white/70 hover:text-white" />
                                </button>
                                <button
                                    onClick={toggleExpand}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                                >
                                    {isExpanded ? <IoContract className="h-5 w-5 text-white/70 hover:text-white" /> : <IoExpand className="h-5 w-5 text-white/70 hover:text-white" />}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                                >
                                    <IoClose className="h-5 w-5 text-white/70 hover:text-white" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#1E293B] rounded-lg">
                            <div className="flex flex-col h-full">
                                <div className="flex-grow overflow-y-auto p-2 sm:p-4 space-y-4">
                                    {messages.map((message, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            key={index}
                                            className="relative flex flex-col w-full mb-4"
                                        >
                                            <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} w-full`}>
                                                <div className={`flex items-start gap-2 ${message.isUser ? 'flex-row-reverse' : 'flex-row'} 
                                                    max-w-[85%] sm:max-w-3/4 relative`}
                                                >
                                                    {/* Avatar */}
                                                    <div className="flex flex-col items-center">
                                                        {message.isUser ? (
                                                            <FaUser className="text-blue-500 text-lg sm:text-xl" />
                                                        ) : (
                                                            <FaRobot className="text-green-500 text-lg sm:text-xl" />
                                                        )}
                                                        <span className="text-xs text-gray-400 mt-1">
                                                            {message.isUser ? 'User' : 'AI'}
                                                        </span>
                                                    </div>

                                                    {/* Message content và action buttons */}
                                                    <div className="flex flex-col gap-2">
                                                        {/* Message content */}
                                                        <div
                                                            className={`p-3 rounded-xl shadow-md ${message.isUser
                                                                ? 'bg-blue-600 text-white'
                                                                : message.isSampleQuestion
                                                                    ? 'bg-[#1E293B] text-gray-100 hover:bg-[#2E3B52] cursor-pointer transition-colors duration-200'
                                                                    : 'bg-[#1E293B] text-gray-100'
                                                                } break-words`}
                                                            onClick={() => message.isSampleQuestion ? handleSampleQuestionClick(message.text) : null}
                                                        >
                                                            {message.isUser ? (
                                                                editingIndex === index ? (
                                                                    // Edit form
                                                                    <div className="w-full">
                                                                        <textarea
                                                                            id="edit-textarea"
                                                                            value={editedText}
                                                                            onChange={(e) => setEditedText(e.target.value)}
                                                                            className="w-full p-2 bg-[#1E293B] text-white rounded-lg border 
                                                                                     border-[#3E52E8]/20 focus:border-[#3E52E8] focus:ring-1 
                                                                                     focus:ring-[#3E52E8] transition-all duration-200"
                                                                            style={{ height: textareaHeight }}
                                                                        />
                                                                        <div className="flex justify-end gap-2 mt-2">
                                                                            <button
                                                                                onClick={() => handleSaveEdit(index)}
                                                                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white 
                                                                                         hover:bg-green-700 transition-colors duration-200 text-sm"
                                                                            >
                                                                                Lưu
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEditingIndex(null)}
                                                                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white 
                                                                                         hover:bg-red-700 transition-colors duration-200 text-sm"
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
                                                                                        className="rounded-xl shadow-lg !bg-[#1A1A1A] !p-4 my-4"
                                                                                        {...props}
                                                                                    >
                                                                                        {String(children).replace(/\n$/, '')}
                                                                                    </SyntaxHighlighter>
                                                                                    <button
                                                                                        onClick={() => copyToClipboard(String(children), index)}
                                                                                        className="absolute top-2 right-2 p-1.5 rounded-lg 
                                                                                                 bg-gray-700/50 hover:bg-gray-700 text-white/70 
                                                                                                 hover:text-white transition-all duration-200"
                                                                                    >
                                                                                        {copiedIndex === index ? (
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
                                                                    {message.text}
                                                                </ReactMarkdown>
                                                            )}
                                                        </div>

                                                        {/* Action buttons - Đã chuyển xuống dưới */}
                                                        {!message.isSampleQuestion && (
                                                            <div className={`flex gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                                                                {message.isUser && !isTyping && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleEditMessage(index)}
                                                                            className="p-1.5 rounded-lg bg-[#1E293B]/80 hover:bg-[#1E293B] 
                                                                                     text-gray-400 hover:text-white transition-all duration-200"
                                                                            title="Chỉnh sửa"
                                                                        >
                                                                            <IoCreate className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const newMessages = [...messages];
                                                                                newMessages.splice(index, 1);
                                                                                setMessages(newMessages);
                                                                            }}
                                                                            className="p-1.5 rounded-lg bg-[#1E293B]/80 hover:bg-[#1E293B] 
                                                                                     text-gray-400 hover:text-red-400 transition-all duration-200"
                                                                            title="Xóa"
                                                                        >
                                                                            <IoTrash className="h-4 w-4" />
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {!message.isUser && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => copyToClipboard(message.text, index)}
                                                                            className="p-1.5 rounded-lg bg-[#1E293B]/80 hover:bg-[#1E293B] 
                                                                                     text-gray-400 hover:text-white transition-all duration-200"
                                                                            title="Sao chép"
                                                                        >
                                                                            {copiedIndex === index ? (
                                                                                <IoCheckmark className="h-4 w-4" />
                                                                            ) : (
                                                                                <IoCopy className="h-4 w-4" />
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={regenerateResponse}
                                                                            className="p-1.5 rounded-lg bg-[#1E293B]/80 hover:bg-[#1E293B] 
                                                                                     text-gray-400 hover:text-white transition-all duration-200"
                                                                            title="Tạo lại"
                                                                        >
                                                                            <IoRefresh className="h-4 w-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const newMessages = [...messages];
                                                                                newMessages.splice(index, 1);
                                                                                setMessages(newMessages);
                                                                            }}
                                                                            className="p-1.5 rounded-lg bg-[#1E293B]/80 hover:bg-[#1E293B] 
                                                                                     text-gray-400 hover:text-red-400 transition-all duration-200"
                                                                            title="Xóa"
                                                                        >
                                                                            <IoTrash className="h-4 w-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {typingText && (
                                        <div className="flex justify-start">
                                            <div className="flex items-start">
                                                <div className="flex flex-col items-center mr-2">
                                                    <FaRobot className="text-green-500 text-xl mb-1" />
                                                    <span className="text-xs text-gray-400">AI</span>
                                                </div>
                                                <div className="max-w-[85%] sm:max-w-3/4 p-3 rounded-xl bg-[#1E293B] text-gray-100 shadow-md">
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
                                                                            onClick={() => copyToClipboard(String(children), -1)}
                                                                            className="absolute top-2 right-2 bg-gray-700 text-white p-1 rounded"
                                                                        >
                                                                            <IoCopy />
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
                                                <div className="max-w-[85%] sm:max-w-3/4 p-3 rounded-xl bg-[#1E293B] text-gray-100 shadow-md">
                                                    <div className="flex space-x-2">
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
                                    <div className="flex flex-wrap gap-2">
                                        {extraButton}
                                        <div className="flex-1 min-w-[200px]">
                                            <input
                                                type="text"
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                className="w-full p-3 rounded-xl bg-[#1E293B] text-white placeholder-gray-400 
                                                 border border-white/10 focus:border-[#3E52E8] focus:ring-1 focus:ring-[#3E52E8] 
                                                 transition-all duration-200 outline-none"
                                                placeholder={isLoadingAIWebsites ? "Đang tải dữ liệu..." : "Nhập tin nhắn của bạn..."}
                                                disabled={isLoading || isTyping || isLoadingAIWebsites}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            {children}
                                            {isLoadingAIWebsites ? (
                                                <button
                                                    type="button"
                                                    className="bg-gray-500 text-white px-2 sm:px-3 py-2 rounded"
                                                    disabled
                                                >
                                                    <FaSpinner className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
                                                </button>
                                            ) : isTyping ? (
                                                <button
                                                    type="button"
                                                    className="bg-red-500 text-white px-2 sm:px-3 py-2 rounded"
                                                    onClick={stopTyping}
                                                >
                                                    <IoStop className="h-4 w-4 sm:h-5 sm:w-5" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="submit"
                                                    className="p-3 rounded-xl bg-[#3E52E8] text-white hover:bg-[#2E42D8] 
                                                     transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                                                     disabled:hover:bg-[#3E52E8]"
                                                    disabled={isLoading || isTyping || isLoadingAIWebsites}
                                                >
                                                    <IoSend className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
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
