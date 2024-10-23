'use client'

import React, { useState, useEffect, useRef } from 'react';
import { IoChevronDown, IoSend, IoReload } from "react-icons/io5";

export default function ChatBox() {
    const [message, setMessage] = useState('');
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState({ name: 'Llama 3.1 405B', description: 'Meta', icon: '🌟', modal: 'meta-llama/llama-3.1-405b-instruct:free' });
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAIResponding, setIsAIResponding] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() !== '') {
            setMessages([...messages, { text: message, isUser: true }]);
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
                        "messages": [
                            {
                                "role": "user",
                                "content": message
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Kiểm tra cấu trúc dữ liệu trước khi sử dụng
                if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
                    const aiResponse = data.choices[0].message.content;
                    setMessages(prevMessages => [...prevMessages, { text: aiResponse, isUser: false }]);
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
            }
        }
    };

    const models = [
        { name: 'Llama 3.1 405B', description: 'Meta', icon: '🌟', modal: 'meta-llama/llama-3.1-405b-instruct:free' },
        { name: 'Hermes 3 405B', description: 'Nous', icon: '🧠', modal: 'nousresearch/hermes-3-llama-3.1-405b:free' },
        { name: 'Llama 3.1 70B', description: 'Meta', icon: '🦙', modal: 'meta-llama/llama-3.1-70b-instruct:free' },
        { name: 'Mistral 7B', description: 'Mistral AI', icon: '🌪️', modal: 'mistralai/mistral-7b-instruct:free' },
        { name: 'Llama 3.2 3B', description: 'Meta', icon: '🦙', modal: 'meta-llama/llama-3.2-3b-instruct:free' },
        { name: 'Llama 3.2 1B', description: 'Meta', icon: '🦙', modal: 'meta-llama/llama-3.2-1b-instruct:free' },
        { name: 'Llama 3.1 8B', description: 'Meta', icon: '🦙', modal: 'meta-llama/llama-3.1-8b-instruct:free' },
        { name: 'Phi-3 Medium', description: 'Microsoft', icon: '🔬', modal: 'microsoft/phi-3-medium-128k-instruct:free' },
        { name: 'Llama 3 8B', description: 'Meta', icon: '🦙', modal: 'meta-llama/llama-3-8b-instruct:free' },
        { name: 'Phi-3 Mini', description: 'Microsoft', icon: '🔬', modal: 'microsoft/phi-3-mini-128k-instruct:free' },
        { name: 'Zephyr 7B', description: 'Hugging Face H4', icon: '🌬️', modal: 'huggingfaceh4/zephyr-7b-beta:free' },
        { name: 'LFM 40B', description: 'Liquid', icon: '💧', modal: 'liquid/lfm-40b:free' },
        { name: 'Qwen 2 7B', description: 'Qwen', icon: '🐼', modal: 'qwen/qwen-2-7b-instruct:free' },
        { name: 'Gemma 2 9B', description: 'Google', icon: '💎', modal: 'google/gemma-2-9b-it:free' },
        { name: 'OpenChat 7B', description: 'OpenChat', icon: '💬', modal: 'openchat/openchat-7b:free' },
        { name: 'Mythomist 7B', description: 'Gryphe', icon: '🧙', modal: 'gryphe/mythomist-7b:free' },
        { name: 'Mythomax L2 13B', description: 'Gryphe', icon: '🧙', modal: 'gryphe/mythomax-l2-13b:free' },
        { name: 'Toppy M 7B', description: 'Undi95', icon: '🔝', modal: 'undi95/toppy-m-7b:free' },
        { name: 'Codestral Mamba', description: 'Mistral AI', icon: '🐍', modal: 'mistralai/codestral-mamba' },
    ];

    return (
        <>
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Trò Chuyện</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Hỏi bất cứ điều gì bạn muốn.
                </p>
            </div>
            <div className="flex flex-col h-screen bg-[#0E0E0E] text-white">
                <div className="p-4">
                    <div className="relative">
                        <button
                            type="button"
                            className="flex items-center space-x-2 px-4 py-2 text-sm bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors duration-200"
                            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                        >
                            <span className="text-xl">{selectedModel.icon}</span>
                            <span>{selectedModel.name.split(' ')[0]}</span>
                            <IoChevronDown className={`ml-2 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isModelDropdownOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-[#1E1E1E] rounded-lg shadow-lg z-10 overflow-hidden">
                                <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
                                    {models.map((model) => (
                                        <button
                                            key={model.name}
                                            className="w-full text-left px-4 py-3 hover:bg-[#2A2A2A] flex items-center space-x-3 text-sm transition-colors duration-200"
                                            onClick={() => {
                                                setSelectedModel(model);
                                                setIsModelDropdownOpen(false);
                                            }}
                                        >
                                            <span className="text-2xl">{model.icon}</span>
                                            <div>
                                                <div className="font-medium">{model.name}</div>
                                                <div className="text-xs text-gray-400">{model.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-4 md:px-[20vw]">
                    {messages.length === 0 ? (
                        <h1 className="text-4xl font-bold text-center mb-8">Hỏi bất cứ điều gì</h1>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={index} className="mb-4">
                                <div className="mb-2">
                                    <span className={`inline-block ${msg.isUser ? 'text-lg font-semibold' : 'text-base'} max-w-[80%]`}>
                                        {msg.text}
                                    </span>
                                </div>
                                {!msg.isUser && index > 0 && messages[index - 1].isUser && (
                                    <div className="border-b border-gray-700 my-4"></div>
                                )}
                            </div>
                        ))
                    )}
                    {isAIResponding && (
                        <div className="mb-4">
                            <span className="inline-block">
                                <IoReload className="animate-spin text-2xl" />
                            </span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 md:px-20">
                    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
                        <div className="relative bg-[#1E1E1E] rounded-full">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-6 py-4 pr-16 bg-transparent focus:outline-none text-lg rounded-full"
                                placeholder="Hỏi bất cứ điều gì..."
                                disabled={isLoading}
                            />
                            <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 bg-[#2A3284] rounded-full p-2" disabled={isLoading}>
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <IoSend size={20} />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
