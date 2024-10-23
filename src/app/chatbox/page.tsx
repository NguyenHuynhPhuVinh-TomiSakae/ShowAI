'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoTrash, IoArrowUndo, IoClose } from "react-icons/io5";
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
import SimpleMarkdown from '@/components/SimpleMarkdown';
import { useMediaQuery } from 'react-responsive';

const modelGroups = [
    {
        provider: 'Meta',
        models: [
            { name: 'Llama 3.1 405B', icon: '🦙', modal: 'meta-llama/llama-3.1-405b-instruct:free' },
            { name: 'Llama 3.1 70B', icon: '🦙', modal: 'meta-llama/llama-3.1-70b-instruct:free' },
            { name: 'Llama 3.2 3B', icon: '🦙', modal: 'meta-llama/llama-3.2-3b-instruct:free' },
            { name: 'Llama 3.2 1B', icon: '🦙', modal: 'meta-llama/llama-3.2-1b-instruct:free' },
            { name: 'Llama 3.1 8B', icon: '🦙', modal: 'meta-llama/llama-3.1-8b-instruct:free' },
            { name: 'Llama 3 8B', icon: '🦙', modal: 'meta-llama/llama-3-8b-instruct:free' },
            { name: 'Llama 3.2 11B Vision', icon: '👁️', modal: 'meta-llama/llama-3.2-11b-vision-instruct:free' },
        ]
    },
    {
        provider: 'Nous',
        models: [
            { name: 'Hermes 3 405B', icon: '🧠', modal: 'nousresearch/hermes-3-llama-3.1-405b:free' },
        ]
    },
    {
        provider: 'Mistral AI',
        models: [
            { name: 'Mistral 7B', icon: '🌪️', modal: 'mistralai/mistral-7b-instruct:free' },
            { name: 'Codestral Mamba', icon: '🐍', modal: 'mistralai/codestral-mamba' },
        ]
    },
    {
        provider: 'Microsoft',
        models: [
            { name: 'Phi-3 Medium', icon: '🔬', modal: 'microsoft/phi-3-medium-128k-instruct:free' },
            { name: 'Phi-3 Mini', icon: '🔬', modal: 'microsoft/phi-3-mini-128k-instruct:free' },
        ]
    },
    {
        provider: 'Hugging Face',
        models: [
            { name: 'Zephyr 7B', icon: '🌬️', modal: 'huggingfaceh4/zephyr-7b-beta:free' },
        ]
    },
    {
        provider: 'Liquid',
        models: [
            { name: 'LFM 40B', icon: '💧', modal: 'liquid/lfm-40b:free' },
        ]
    },
    {
        provider: 'Qwen',
        models: [
            { name: 'Qwen 2 7B', icon: '🐼', modal: 'qwen/qwen-2-7b-instruct:free' },
        ]
    },
    {
        provider: 'Google',
        models: [
            { name: 'Gemma 2 9B', icon: '💎', modal: 'google/gemma-2-9b-it:free' },
        ]
    },
    {
        provider: 'OpenChat',
        models: [
            { name: 'OpenChat 7B', icon: '💬', modal: 'openchat/openchat-7b:free' },
        ]
    },
    {
        provider: 'Gryphe',
        models: [
            { name: 'Mythomist 7B', icon: '🧙', modal: 'gryphe/mythomist-7b:free' },
            { name: 'Mythomax L2 13B', icon: '🧙', modal: 'gryphe/mythomax-l2-13b:free' },
        ]
    },
    {
        provider: 'Undi95',
        models: [
            { name: 'Toppy M 7B', icon: '🔝', modal: 'undi95/toppy-m-7b:free' },
        ]
    },

];

export default function ChatBox() {
    const [message, setMessage] = useState('');
    const [selectedProvider, setSelectedProvider] = useState('Google');
    const [selectedModel, setSelectedModel] = useState(modelGroups.find(group => group.provider === 'Google')?.models[0] || modelGroups[0].models[0]);
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; images?: string[] }>>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAIResponding, setIsAIResponding] = useState(false);
    const [files, setFiles] = useState<{ file: File; base64: string }[]>([]);
    const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: any }>>([]);
    const isMobile = useMediaQuery({ maxWidth: 767 });

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

            // Cập nhật lịch sử chat
            let messageContent: any = message;
            if (selectedModel.modal === 'meta-llama/llama-3.2-11b-vision-instruct:free' && files.length > 0) {
                messageContent = [
                    { type: "text", text: message },
                    ...imageBases64.map(img => ({ type: "image_url", image_url: { url: img } }))
                ];
            }

            const newChatHistory = [
                ...chatHistory,
                { role: "user", content: messageContent }
            ];
            setChatHistory(newChatHistory);

            setMessage('');
            setIsLoading(true);
            setIsAIResponding(true);

            try {
                // Lấy khóa OPENROUTER từ API
                const keyResponse = await fetch('/api/openrouter-key');
                const { key } = await keyResponse.json();

                if (!key) {
                    throw new Error('Không thể lấy khóa OPENROUTER');
                }

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

                    // Cập nhật lịch sử chat với phản hồi của AI
                    setChatHistory(prevHistory => [...prevHistory, { role: "assistant", content: aiResponse }]);
                } else if (data && data.error) {
                    console.error("Lỗi từ API:", data.error);
                    throw new Error(data.error.message || 'Lỗi không xác định từ API');
                } else {
                    console.error("Cấu trúc phản hồi không hợp lệ:", data);
                    throw new Error('Phản hồi từ API không hợp lệ');
                }
            } catch (error: unknown) {
                console.error("Lỗi khi gọi API:", error);
                const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
                setMessages(prevMessages => [...prevMessages, { text: `Xin lỗi, đã xảy ra lỗi: ${errorMessage}`, isUser: false }]);
            } finally {
                setIsLoading(false);
                setIsAIResponding(false);
                setFiles([]);
            }
        }
    };

    const handleClearMessages = () => {
        setMessages([]);
        setChatHistory([]); // Xóa cả lịch sử chat
    };

    const handleUndo = () => {
        if (messages.length > 0) {
            const newMessages = messages.slice(0, -2);
            setMessages(newMessages);
            setChatHistory(prevHistory => prevHistory.slice(0, -2)); // Xóa 2 tin nhắn cuối cùng khỏi lịch sử chat
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <>
            <div className="bg-[#2A3284] text-center py-4 sm:py-8 px-2 sm:px-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Trò Chuyện</h1>
                <p className="text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
                    Hỏi bất cứ điều gì với ShowAI.
                </p>
            </div>
            <main className="flex min-h-screen max-h-screen bg-[#0F172A] text-white">
                <div className="grid w-full">
                    <div className="flex flex-col w-full h-screen max-w-[800px] mx-auto px-2 sm:px-4">
                        {/* NavBar */}
                        <nav className="w-full flex bg-[#0F172A] py-2 sm:py-4 text-white">
                            <div className="flex flex-1 items-center text-sm sm:text-base">
                                <h1 className="whitespace-pre">Trò chuyện với </h1>
                                <span className="text-[#4ECCA3] text-base sm:text-lg font-bold">ShowAI</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-4">
                                <button
                                    onClick={handleUndo}
                                    disabled={messages.length === 0 || isLoading}
                                    className="text-white hover:bg-[#1A1A2E] hover:text-[#4B5EFF] p-1 sm:p-2 rounded"
                                >
                                    <IoArrowUndo className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <button
                                    onClick={handleClearMessages}
                                    disabled={messages.length === 0}
                                    className="text-white hover:bg-[#1A1A2E] hover:text-[#4B5EFF] p-1 sm:p-2 rounded"
                                >
                                    <IoTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </div>
                        </nav>

                        {/* Messages */}
                        <div
                            ref={chatContainerRef}
                            id="chat-container"
                            className="flex flex-col pb-2 sm:pb-4 gap-2 sm:gap-4 overflow-y-auto flex-grow bg-[#0F172A] text-white"
                        >
                            {messages.length === 0 ? (
                                <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-8">Hỏi bất cứ điều gì</h1>
                            ) : (
                                messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex flex-col ${!message.isUser
                                            ? 'bg-[#1A1A2E] border border-[#3E52E8] text-gray-200 py-2 sm:py-4 px-2 sm:px-4 rounded-2xl'
                                            : 'text-white'
                                            } w-full`}
                                    >
                                        {message.isUser ? (
                                            <span className="text-base sm:text-lg whitespace-pre-wrap">{message.text}</span>
                                        ) : (
                                            <SimpleMarkdown content={message.text} />
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
                                ))
                            )}
                            {isAIResponding && (
                                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400">
                                    <LoaderIcon strokeWidth={2} className="animate-spin w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Đang tạo...</span>
                                </div>
                            )}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSubmit} className="mb-1 sm:mb-2 mt-auto bg-[#0F172A]">
                            <div className="shadow-md rounded-2xl border border-[#4ECCA3]">
                                <div className="flex flex-col sm:flex-row items-center px-2 sm:px-3 py-1 sm:py-2 gap-1 sm:gap-2">
                                    {/* Provider Selector */}
                                    <Select
                                        value={selectedProvider}
                                        onValueChange={(value) => {
                                            setSelectedProvider(value);
                                            setSelectedModel(modelGroups.find(group => group.provider === value)?.models[0] || modelGroups[0].models[0]);
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
                                            <SelectValue placeholder="Chọn nhà cung cấp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modelGroups.map((group) => (
                                                <SelectItem key={group.provider} value={group.provider}>
                                                    {group.provider}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Model Selector */}
                                    <Select
                                        value={selectedModel.modal}
                                        onValueChange={(value) => {
                                            const newModel = modelGroups
                                                .find(group => group.provider === selectedProvider)
                                                ?.models.find(model => model.modal === value);
                                            if (newModel) {
                                                setSelectedModel(newModel);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
                                            <SelectValue placeholder="Chọn mô hình" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modelGroups
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
                                    autoFocus={true}
                                    minRows={1}
                                    maxRows={5}
                                    className="text-sm sm:text-normal px-2 sm:px-3 resize-none ring-0 bg-inherit w-full m-0 outline-none text-white"
                                    required={true}
                                    placeholder="Hỏi bất cứ điều gì..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <div className="flex p-2 sm:p-3 gap-1 sm:gap-2 items-center">
                                    <div className="flex items-center flex-1 gap-1 sm:gap-2">
                                        {selectedModel.modal === 'meta-llama/llama-3.2-11b-vision-instruct:free' && (
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
                                                // Thêm hàm dừng tạo ở đây
                                            }} />
                                        ) : (
                                            <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
