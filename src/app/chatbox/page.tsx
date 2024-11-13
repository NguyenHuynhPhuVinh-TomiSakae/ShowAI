'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoTrash, IoArrowUndo, IoClose, IoCheckmark, IoCopy } from "react-icons/io5";
import { ArrowUp, Square, LoaderIcon, Paperclip } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'github-markdown-css/github-markdown-light.css';
import { useMediaQuery } from 'react-responsive';
import { modelGroups as freeModelGroups } from './modelGroups';
import { modelGroups as vipModelGroups } from './vipModelGroups';
import { Groq } from 'groq-sdk';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/components/FirebaseConfig';
import { toast, Toaster } from 'react-hot-toast';
import ModalPortal from '@/components/ModalPortal';

// Định nghĩa type cho messages theo đúng yêu cầu của Groq
type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
    name?: string;
};

// Thêm style cho toast
const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

export default function ChatBox() {
    const { auth, db } = useFirebase();
    const [message, setMessage] = useState('');
    const [isVipMode, setIsVipMode] = useState(false);
    const currentModelGroups = isVipMode ? vipModelGroups : freeModelGroups;

    // Lấy provider và model đầu tiên làm mặc định
    const [selectedProvider, setSelectedProvider] = useState(currentModelGroups[0].provider);
    const [selectedModel, setSelectedModel] = useState(currentModelGroups[0].models[0]);
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; images?: string[] }>>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAIResponding, setIsAIResponding] = useState(false);
    const [files, setFiles] = useState<{ file: File; base64: string }[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const isMobile = useMediaQuery({ maxWidth: 767 });

    // Thêm state để theo dõi trạng thái VIP
    const [isVIPEnabled, setIsVIPEnabled] = useState(false);

    // Thêm state và function cho copy code
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    // Thêm useEffect để kiểm tra trạng thái VIP khi component được mount
    useEffect(() => {
        const checkVIPStatus = async () => {
            if (auth?.currentUser?.uid && db) {
                const userDoc = doc(db, 'users', auth.currentUser.uid);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setIsVIPEnabled(userData.isVIP === true);
                }
            }
        };

        checkVIPStatus();
    }, [auth?.currentUser?.uid, db]);

    // Sửa useEffect để cập nhật cả provider và model khi chuyển đổi mode
    useEffect(() => {
        // Lấy provider và model đầu tiên của mode mới
        const newProvider = currentModelGroups[0].provider;
        const newDefaultModel = currentModelGroups[0].models[0];

        setSelectedProvider(newProvider);
        setSelectedModel(newDefaultModel);
    }, [isVipMode, currentModelGroups]);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            const scrollHeight = chatContainerRef.current.scrollHeight;
            const height = chatContainerRef.current.clientHeight;
            const maxScrollTop = scrollHeight - height;
            chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileChange = useCallback((newFiles: File[]) => {
        Promise.all(
            newFiles.map((file) =>
                new Promise<{ file: File; base64: string }>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({ file, base64: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                })
            )
        ).then((results) => {
            setFiles(results);
        });
    }, []);

    const handleFileRemove = useCallback((fileToRemove: File) => {
        setFiles((prevFiles) => prevFiles.filter(({ file }) => file !== fileToRemove));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() !== '' && !isLoading) {
            const imageBases64 = files.map(f => f.base64);
            const newUserMessage = { text: message, isUser: true, images: imageBases64 };
            setMessages(prevMessages => [...prevMessages, newUserMessage]);

            // Đơn giản hóa messageContent khi sử dụng với Groq
            const newMessage: ChatMessage = {
                role: "user",
                content: message
            };

            const newChatHistory = [...chatHistory, newMessage];
            setChatHistory(newChatHistory);

            setMessage('');
            setIsLoading(true);
            setIsAIResponding(true);

            try {
                if (isVipMode) {
                    const groqKeyResponse = await fetch('/api/groq-key');
                    const data = await groqKeyResponse.json();

                    if (data.error) {
                        throw new Error(data.error);
                    }

                    const groq = new Groq({
                        apiKey: data.key,
                        dangerouslyAllowBrowser: true
                    });

                    const groqMessages = newChatHistory.map(msg => ({
                        role: msg.role,
                        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
                    }));

                    const chatCompletion = await groq.chat.completions.create({
                        messages: groqMessages,
                        model: selectedModel.modal,
                        temperature: 1,
                        max_tokens: 1024,
                        top_p: 1,
                        stream: true,
                        stop: null
                    });

                    let fullResponse = '';
                    for await (const chunk of chatCompletion) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        fullResponse += content;

                        setMessages(prevMessages => {
                            const newMessages = [...prevMessages];
                            const lastMessage = newMessages[newMessages.length - 1];

                            if (lastMessage && !lastMessage.isUser) {
                                newMessages[newMessages.length - 1] = {
                                    ...lastMessage,
                                    text: fullResponse
                                };
                            } else {
                                newMessages.push({
                                    text: fullResponse,
                                    isUser: false
                                });
                            }

                            return newMessages;
                        });
                    }

                    // Cập nhật chatHistory với response từ AI
                    setChatHistory(prevHistory => [
                        ...prevHistory,
                        {
                            role: "assistant",
                            content: fullResponse
                        }
                    ]);

                } else {
                    const keyResponse = await fetch('/api/openrouter-key');
                    const { key } = await keyResponse.json();

                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${key}`,
                            "HTTP-Referer": `${process.env.NEXT_PUBLIC_SITE_URL}`,
                            "X-Title": `${process.env.NEXT_PUBLIC_SITE_NAME}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "model": selectedModel.modal,
                            "messages": newChatHistory
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();

                    if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
                        const aiResponse = data.choices[0].message.content.trim();
                        setMessages(prevMessages => [...prevMessages, { text: aiResponse, isUser: false }]);

                        setChatHistory(prevHistory => [...prevHistory, { role: "assistant", content: aiResponse }]);
                    } else if (data && data.error) {
                        console.error("Lỗi từ API:", data.error);
                        throw new Error(data.error.message || 'Lỗi không xác định từ API');
                    } else {
                        console.error("Cấu trúc phản hồi không hợp lệ:", data);
                        throw new Error('Phản hồi từ API không hợp lệ');
                    }
                }
            } catch (error: unknown) {
                console.error("Lỗi khi gọi API:", error);
                const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
                setMessages(prevMessages => [
                    ...prevMessages,
                    { text: `Xin lỗi, đã xảy ra lỗi: ${errorMessage}`, isUser: false }
                ]);
            } finally {
                setIsLoading(false);
                setIsAIResponding(false);
                setFiles([]);
            }
        }
    };

    const handleClearMessages = () => {
        setMessages([]);
        setChatHistory([]);
    };

    const handleUndo = () => {
        if (messages.length > 0) {
            const newMessages = messages.slice(0, -2);
            setMessages(newMessages);
            setChatHistory(prevHistory => prevHistory.slice(0, -2));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Sửa đổi phần xử lý chuyển đổi mode
    const handleVIPModeToggle = () => {
        if (!isVIPEnabled && !isVipMode) {
            toast.error('Bạn cần kích hoạt tài khoản VIP để sử dụng tính năng này', toastStyle);
            return;
        }
        setIsVipMode(!isVipMode);
    };

    // Thêm state để kiểm soát hiển thị tooltip
    const [showVIPTooltip, setShowVIPTooltip] = useState(true);

    // Thêm hàm kiểm tra vision model
    const isVisionModel = (modelName: string) => {
        return modelName.toLowerCase().includes('vision');
    };

    return (
        <>
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Trò chuyện</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Hỏi bất cứ điều gì với ShowAI.
                </p>
            </div>
            <main className="flex min-h-screen bg-[#0F172A] text-white">
                <div className="w-full max-w-4xl mx-auto px-4 py-6">
                    <nav className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-800 gap-4 sm:gap-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-base sm:text-lg">Trò chuyện với</span>
                                <span className="text-[#4ECCA3] text-lg sm:text-xl font-bold">ShowAI</span>
                            </div>
                            <TooltipProvider>
                                <Tooltip
                                    open={!isVipMode && showVIPTooltip}
                                    delayDuration={0}
                                >
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => {
                                                handleVIPModeToggle();
                                                setShowVIPTooltip(false);
                                            }}
                                            className={`
                                                px-3 py-1.5 
                                                rounded-full 
                                                text-sm sm:text-base 
                                                font-semibold 
                                                transition-all 
                                                duration-300 
                                                shadow-lg
                                                ${isVipMode
                                                    ? 'bg-gradient-to-r from-[#4ECCA3] to-[#2EAF7D] text-white hover:shadow-[#4ECCA3]/50 scale-105 hover:scale-110'
                                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                                                }
                                            `}
                                        >
                                            {isVipMode ? (
                                                <span className="flex items-center gap-1">
                                                    <span className="animate-pulse">⭐</span>
                                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">
                                                        VIP
                                                    </span>
                                                </span>
                                            ) : 'Free'}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="bottom"
                                        sideOffset={5}
                                        className="
                                            relative
                                            bg-[#1A1A2E] 
                                            text-white 
                                            border-[#4ECCA3] 
                                            px-3 sm:px-4 
                                            py-1.5 sm:py-2 
                                            text-xs sm:text-base
                                            rounded-lg
                                            shadow-lg
                                            shadow-[#4ECCA3]/20
                                            animate-fade-in-down
                                            z-50
                                            max-w-[150px] sm:max-w-[300px]
                                            text-center
                                            before:content-['']
                                            before:absolute
                                            before:top-[-8px]
                                            before:left-1/2
                                            before:-translate-x-1/2
                                            before:border-[8px]
                                            before:border-transparent
                                            before:border-b-[#4ECCA3]
                                            after:content-['']
                                            after:absolute
                                            after:top-[-7px]
                                            after:left-1/2
                                            after:-translate-x-1/2
                                            after:border-[7px]
                                            after:border-transparent
                                            after:border-b-[#1A1A2E]
                                            sm:whitespace-normal
                                            whitespace-nowrap
                                        "
                                    >
                                        <p className="font-medium">
                                            <span className="hidden sm:inline">Nhấn để sử dụng </span>
                                            <span className="sm:hidden">Sử dụng </span>
                                            <span className="text-[#4ECCA3] font-bold">VIP</span>
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleUndo}
                                disabled={messages.length === 0 || isLoading}
                                className="p-2 rounded-lg hover:bg-[#1E293B] transition-colors"
                            >
                                <IoArrowUndo className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handleClearMessages}
                                disabled={messages.length === 0}
                                className="p-2 rounded-lg hover:bg-[#1E293B] transition-colors"
                            >
                                <IoTrash className="h-5 w-5" />
                            </button>
                        </div>
                    </nav>

                    <div ref={chatContainerRef} className="space-y-6 mb-6 overflow-y-auto">
                        {messages.length === 0 ? (
                            <div className="text-center py-20">
                                <h1 className="text-4xl font-bold mb-4">Hỏi bất cứ điều gì</h1>
                                <p className="text-gray-400">Bắt đầu cuộc trò chuyện của bạn với ShowAI</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`${!message.isUser
                                            ? 'bg-[#1E293B] border border-[#2A3284] rounded-xl p-4'
                                            : 'bg-transparent'
                                            }`}
                                    >
                                        {message.isUser ? (
                                            <span className="text-base sm:text-lg whitespace-pre-wrap">{message.text}</span>
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
                                        {message.images && message.images.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {message.images.map((img, imgIndex) => (
                                                    <img
                                                        key={imgIndex}
                                                        src={img}
                                                        alt={`Attached image ${imgIndex + 1}`}
                                                        className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-md border border-[#4ECCA3]"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isAIResponding && (
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <LoaderIcon className="h-4 w-4 animate-spin" />
                                        <span>ShowAI đang trả lời...</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="border border-[#2A3284] rounded-xl bg-[#1E293B]">
                        <div className="p-4 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Select
                                    value={selectedProvider}
                                    onValueChange={(value) => {
                                        setSelectedProvider(value);
                                        setSelectedModel(currentModelGroups.find(group => group.provider === value)?.models[0] || currentModelGroups[0].models[0]);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[200px] bg-[#0F172A] border-[#2A3284]">
                                        <SelectValue placeholder="Chọn nhà cung cấp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentModelGroups.map((group) => (
                                            <SelectItem key={group.provider} value={group.provider}>
                                                {group.provider}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={selectedModel.modal}
                                    onValueChange={(value) => {
                                        const newModel = currentModelGroups
                                            .find(group => group.provider === selectedProvider)
                                            ?.models.find(model => model.modal === value);
                                        if (newModel) {
                                            setSelectedModel(newModel);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-[200px] bg-[#0F172A] border-[#2A3284]">
                                        <SelectValue placeholder="Chọn mô hình" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currentModelGroups
                                            .find(group => group.provider === selectedProvider)
                                            ?.models.map((model) => (
                                                <SelectItem key={model.modal} value={model.modal}>
                                                    <span className="mr-2">{model.icon}</span>
                                                    {model.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <TextareaAutosize
                                className="w-full bg-[#0F172A] rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                placeholder="Hỏi bất cứ điều gì..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1 gap-1 sm:gap-2">
                                    {isVisionModel(selectedModel.modal) && (
                                        <>
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="rounded-xl h-8 w-8 sm:h-10 sm:w-10 bg-[#1A1A2E] text-white border-[#4ECCA3] hover:bg-[#3E52E8]"
                                                            onClick={() => document.getElementById('file-input')?.click()}
                                                        >
                                                            <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-[#1A1A2E] text-white border-[#4ECCA3]">Thêm tệp đính kèm</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <input
                                                id="file-input"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
                                            />
                                        </>
                                    )}
                                    {files.map(({ file }, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-md border border-[#4ECCA3]"
                                            />
                                            <button
                                                onClick={() => handleFileRemove(file)}
                                                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-[#1A1A2E] rounded-full p-0.5 sm:p-1 border border-[#4ECCA3]"
                                            >
                                                <IoClose className="h-2 w-2 sm:h-3 sm:w-3 text-[#4ECCA3]" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-xl h-8 w-8 sm:h-10 sm:w-10 bg-[#3E52E8] hover:bg-[#4B5EFF] text-white flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <Square className="h-4 w-4 sm:h-5 sm:w-5" onClick={(e) => {
                                            e.preventDefault();
                                            // Thêm hàm dừng tạo  đây
                                        }} />
                                    ) : (
                                        <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}