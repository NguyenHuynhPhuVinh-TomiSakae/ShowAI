import React, { useState, useRef, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import VoiceSearch from './VoiceSearch';
import ModelSelectionModal from './ModelSelectionModal';
import { AI_MODELS } from './ModelList';

interface Message {
    text: string;
    isUser: boolean;
    isError?: boolean;
    isSampleQuestion?: boolean;
}

interface MarcoChatProps {
    isOpen: boolean;
    onClose: () => void;
    initialInput?: string;
}

const MarcoChat: React.FC<MarcoChatProps> = ({ isOpen, onClose, initialInput = '' }) => {
    const [input, setInput] = useState(initialInput);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typewriterRef = useRef<NodeJS.Timeout | null>(null);
    const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>('marco');

    const sampleQuestions = [
        "Bạn có thể giúp tôi viết code không?",
        "Giải thích về AI là gì?",
        "Làm thế nào để học lập trình?",
    ];

    useEffect(() => {
        const savedMessages = sessionStorage.getItem('marcoMessages');
        if (savedMessages) {
            try {
                const parsedMessages = JSON.parse(savedMessages);
                if (Array.isArray(parsedMessages)) {
                    setMessages(parsedMessages);
                }
            } catch (error) {
                console.error('Error parsing saved messages:', error);
                sessionStorage.removeItem('marcoMessages');
            }
        } else {
            setMessages(sampleQuestions.map(q => ({ text: q, isUser: false, isSampleQuestion: true })));
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('marcoMessages', JSON.stringify(messages));
        }
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleClearMessages = () => {
        sessionStorage.removeItem('marcoMessages');
        setMessages([]);
    };

    const handleSampleQuestionClick = (question: string) => {
        setMessages(prevMessages => prevMessages.filter(msg => !msg.isSampleQuestion));
        setInput(question);
        handleSubmit({ preventDefault: () => { } } as React.FormEvent);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const stopTyping = () => {
        if (typewriterRef.current) {
            clearTimeout(typewriterRef.current);
        }
        setMessages(prevMessages => [...prevMessages, { text: typingText, isUser: false }]);
        setTypingText('');
        setIsTyping(false);
    };

    const regenerateResponse = async () => {
        if (messages.length < 2) return;

        const lastUserMessage = [...messages].reverse().find(m => m.isUser);
        if (!lastUserMessage) return;

        setIsLoading(true);
        setMessages(prevMessages => prevMessages.slice(0, -1));
        await handleSubmit({ preventDefault: () => { } } as React.FormEvent, lastUserMessage.text);
    };

    const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
        e.preventDefault();
        const messageText = overrideInput || input;
        if (!messageText.trim() || isTyping || !selectedModel) return;

        setIsLoading(true);
        const newMessage = { text: messageText, isUser: true };
        setMessages(prev => prev.filter(msg => !msg.isSampleQuestion).concat(newMessage));
        setInput('');

        try {
            const response = await fetch('/api/marco', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    modelId: selectedModel
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let responseText = '';

            setIsTyping(true);
            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                const chunk = decoder.decode(value);
                responseText += chunk;
                setTypingText(responseText);
            }

            setMessages(prev => [...prev, { text: responseText, isUser: false }]);
            setTypingText('');
            setIsTyping(false);

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
                isUser: false,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const editMessage = (index: number, newText: string) => {
        setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            newMessages[index] = { ...newMessages[index], text: newText };
            return newMessages;
        });
    };

    const handleVoiceInput = (transcript: string) => {
        setInput(transcript);
    };

    const handleClearInput = () => {
        setInput('');
    };

    const handleModelSelection = (modelId: string) => {
        setSelectedModel(modelId);
        setIsModelSelectionOpen(false);
    };

    const ModelSwitchButton = () => (
        <button
            onClick={() => setIsModelSelectionOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg 
                     bg-[#1E293B] hover:bg-[#2D3B4E] transition-colors text-sm text-white/90"
        >
            <span>{AI_MODELS.find(m => m.id === selectedModel)?.name || 'Chọn mô hình'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    );

    return (
        <>
            <ModelSelectionModal
                isOpen={isModelSelectionOpen}
                onClose={() => setIsModelSelectionOpen(false)}
                onSelectModel={handleModelSelection}
            />

            <ChatInterface
                isOpen={isOpen}
                onClose={onClose}
                messages={messages}
                typingText={typingText}
                input={input}
                setInput={setInput}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                isTyping={isTyping}
                isExpanded={isExpanded}
                toggleExpand={toggleExpand}
                handleClearMessages={handleClearMessages}
                stopTyping={stopTyping}
                handleSampleQuestionClick={handleSampleQuestionClick}
                messagesEndRef={messagesEndRef}
                regenerateResponse={regenerateResponse}
                editMessage={editMessage}
                setMessages={setMessages}
                isLoadingAIWebsites={false}
                extraButton={<ModelSwitchButton />}
            >
                <VoiceSearch
                    onTranscript={handleVoiceInput}
                    onClearInput={handleClearInput}
                    className="ml-2"
                    isGemini={false}
                />
            </ChatInterface>
        </>
    );
};

export default MarcoChat; 