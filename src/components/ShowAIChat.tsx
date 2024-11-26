import React, { useState, useRef, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import VoiceSearch from './VoiceSearch';

interface Message {
    text: string;
    isUser: boolean;
    isError?: boolean;
    isSampleQuestion?: boolean;
}

interface ShowAIChatProps {
    isOpen: boolean;
    onClose: () => void;
    initialInput?: string;
}

const ShowAIChat: React.FC<ShowAIChatProps> = ({ isOpen, onClose, initialInput = '' }) => {
    const [input, setInput] = useState(initialInput);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typewriterRef = useRef<NodeJS.Timeout | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [, setTranscript] = useState('');

    const sampleQuestions = [
        "Chào bạn, mình có thể trò chuyện được không?",
        "Bạn có thể kể cho mình nghe về bản thân được không?",
        "Mình muốn tâm sự với bạn một chút được không?",
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const savedMessages = sessionStorage.getItem('showAIChatMessages');
        if (savedMessages) {
            try {
                const parsedMessages = JSON.parse(savedMessages);
                if (Array.isArray(parsedMessages)) {
                    setMessages(parsedMessages);
                }
            } catch (error) {
                console.error('Error parsing saved messages:', error);
                sessionStorage.removeItem('showAIChatMessages');
            }
        } else {
            setMessages(sampleQuestions.map(q => ({ text: q, isUser: false, isSampleQuestion: true })));
        }
        scrollToBottom();
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('showAIChatMessages', JSON.stringify(messages));
        }
        scrollToBottom();
    }, [messages]);

    const stopTyping = () => {
        if (typewriterRef.current) {
            clearTimeout(typewriterRef.current);
        }
        setMessages(prevMessages => [...prevMessages, { text: typingText, isUser: false }]);
        setTypingText('');
        setIsTyping(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        setIsLoading(true);
        const newMessage = { text: input, isUser: true };
        setMessages(prevMessages => prevMessages.filter(msg => !msg.isSampleQuestion).concat(newMessage));
        setInput('');

        const url = "http://3.106.53.200:8283/v1/agents/agent-e8e67594-5545-4d4e-bcda-c26f91ec43b8/messages";
        const payload = {
            messages: [
                {
                    role: "user",
                    text: input
                }
            ],
            stream_steps: true,
            stream_tokens: false
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Reader not available');
            }

            let fullMessage = '';
            setIsTyping(true);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim() || line.includes('[DONE_GEN]') ||
                        line.includes('[DONE_STEP]') || line.includes('[DONE]')) {
                        continue;
                    }

                    try {
                        const cleanData = line.replace('data: ', '');
                        const messageData = JSON.parse(cleanData);

                        if (messageData.message_type === 'function_call') {
                            const functionArgs = JSON.parse(messageData.function_call.arguments);
                            if (functionArgs.message) {
                                fullMessage = functionArgs.message;
                                setTypingText(fullMessage);
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                }
            }

            setMessages(prevMessages => [...prevMessages, { text: fullMessage, isUser: false }]);
            setTypingText('');
            setIsTyping(false);

        } catch (error) {
            console.error('Error:', error);
            setMessages(prevMessages => [...prevMessages, {
                text: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn.',
                isUser: false,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSampleQuestionClick = (question: string) => {
        setMessages(prevMessages => prevMessages.filter(msg => !msg.isSampleQuestion));
        setInput(question);
        handleSubmit({ preventDefault: () => { } } as React.FormEvent);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleClearMessages = () => {
        sessionStorage.removeItem('showAIChatMessages');
        setMessages([]);
    };

    const regenerateResponse = async () => {
        if (messages.length < 2) return;
        const lastUserMessage = [...messages].reverse().find(m => m.isUser);
        if (!lastUserMessage) return;

        setMessages(prevMessages => prevMessages.slice(0, -1));
        setInput(lastUserMessage.text);
        handleSubmit({ preventDefault: () => { } } as React.FormEvent);
    };

    const handleTranscript = (newTranscript: string) => {
        setTranscript(newTranscript);
        setInput(newTranscript);
    };

    const handleClearInput = () => {
        setInput('');
    };

    return (
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
            isLoadingAIWebsites={false}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            handleClearMessages={handleClearMessages}
            stopTyping={stopTyping}
            handleSampleQuestionClick={handleSampleQuestionClick}
            messagesEndRef={messagesEndRef}
            regenerateResponse={regenerateResponse}
            editMessage={(index: number, newText: string) => {
                setMessages(prevMessages => {
                    const newMessages = [...prevMessages];
                    newMessages[index] = { ...newMessages[index], text: newText };
                    return newMessages;
                });
            }}
            setMessages={setMessages}
        >
            <VoiceSearch
                onTranscript={handleTranscript}
                onClearInput={handleClearInput}
                className="ml-2"
                isGemini={false}
            />
        </ChatInterface>
    );
};

export default ShowAIChat; 