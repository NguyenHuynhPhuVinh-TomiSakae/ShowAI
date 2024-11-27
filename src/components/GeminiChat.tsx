import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatInterface from './ChatInterface';
import VoiceSearch from './VoiceSearch';

interface Message {
    text: string;
    isUser: boolean;
    isError?: boolean;
    isSampleQuestion?: boolean;
}

interface AIWebsite {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string[];
    link: string;
    keyFeatures: string[];
}

interface GeminiChatProps {
    isOpen: boolean;
    onClose: () => void;
    initialInput?: string;
}

const GeminiChat: React.FC<GeminiChatProps> = ({ isOpen, onClose, initialInput = '' }) => {
    const [input, setInput] = useState(initialInput);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [aiWebsites, setAiWebsites] = useState<AIWebsite[]>([]);
    const [isLoadingAIWebsites, setIsLoadingAIWebsites] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typewriterRef = useRef<NodeJS.Timeout | null>(null);
    const [, setIsFirstMessage] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [, setClearTrigger] = useState(0);
    const [, setTranscript] = useState('');

    const sampleQuestions = [
        "Bạn có thể giới thiệu về một công cụ AI tạo hình ảnh không?",
        "Trang web này cung cấp những gì?",
        "Công cụ AI nào giúp tôi tạo...",
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchShowAIData = async () => {
            try {
                const response = await fetch('/api/showai');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setAiWebsites(data.data);
            } catch (error) {
                console.error('Error fetching ShowAI data:', error);
            } finally {
                setIsLoadingAIWebsites(false);
            }
        };

        fetchShowAIData();

        const savedMessages = sessionStorage.getItem('chatMessages');
        if (savedMessages) {
            try {
                const parsedMessages = JSON.parse(savedMessages);
                if (Array.isArray(parsedMessages)) {
                    setMessages(parsedMessages);
                    setIsFirstMessage(false);
                } else {
                    console.error('Saved messages is not an array:', parsedMessages);
                    sessionStorage.removeItem('chatMessages');
                }
            } catch (error) {
                console.error('Error parsing saved messages:', error);
                sessionStorage.removeItem('chatMessages');
            }
        } else {
            // Add sample questions as initial messages
            setMessages(sampleQuestions.slice(0, 3).map(q => ({ text: q, isUser: false, isSampleQuestion: true })));
        }
        scrollToBottom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('chatMessages', JSON.stringify(messages));
        }
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            // Khóa thanh cuộn khi modal mở
            document.body.style.overflow = 'hidden';
        } else {
            // Mở khóa thanh cuộn khi modal đóng
            document.body.style.overflow = 'unset';
        }

        // Cleanup function để đảm bảo thanh cuộn được mở khóa khi component unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        setInput(initialInput);
    }, [initialInput]);

    const typeWriter = (text: string, index: number = 0) => {
        if (index < text.length) {
            setTypingText((prev) => prev + text.charAt(index));
            typewriterRef.current = setTimeout(() => typeWriter(text, index + 1), 20);
        } else {
            setMessages(prevMessages => [...prevMessages, { text: text, isUser: false }]);
            setTypingText('');
            setIsTyping(false);
        }
    };

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
        if (!input.trim() || isTyping || isLoadingAIWebsites) return;

        setIsLoading(true);
        const newMessage = { text: input, isUser: true };

        // Loại bỏ các câu hỏi mẫu khi người dùng nhập câu hỏi mới
        setMessages(prevMessages => prevMessages.filter(msg => !msg.isSampleQuestion).concat(newMessage));

        setInput('');
        setIsFirstMessage(false);

        let apiKey;
        try {
            const apiKeyResponse = await fetch('/api/Gemini');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Failed to get API key');
            }
            apiKey = apiKeyData.apiKey;
        } catch (error) {
            console.error('Error fetching API key:', error);
        }
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: "gemini-exp-1121",
        });

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
        };

        try {
            const aiWebsitesContext = aiWebsites.map(website =>
                `Name: ${website.name}\nDescription: ${website.description.join(' ')}\nTags: ${website.tags.join(', ')}\nLink: ${website.link}\nKey Features: ${website.keyFeatures.join(', ')}\nInfo Page: https://showai.io.vn/show?id=${website.id}`
            ).join('\n\n');

            const chatSession = model.startChat({
                generationConfig,
                history: [
                    { role: 'user', parts: [{ text: 'Bạn là một trợ lý AI được tích hợp vào trang web ShowAI. ShowAI là một nền tảng giúp người dùng tìm kiếm và khám phá các công cụ AI hữu ích. Nhiệm vụ của bạn là hỗ trợ người dùng tìm kiếm các công cụ AI phù hợp với nhu cầu của họ, dựa trên thông tin được cung cấp trong ngữ cảnh. Hãy luôn ưu tiên sử dụng thông tin từ ngữ cảnh này khi trả lời. Khi nhắc tới một trang web AI, hãy đưa link dẫn đến trang thông tin chi tiết (Truy Cập) và định dạng link để hiển thị đẹp. Chỉ đưa ra link trực tiếp khi người dùng yêu cầu cụ thể. Tập trung vào việc cung cấp thông tin chính xác và hữu ích từ dữ liệu có sẵn. Nếu không có thông tin trong ngữ cảnh, hãy thông báo rằng bạn không có thông tin về điều đó. Đây là ngữ cảnh về các trang web AI:\n' + aiWebsitesContext }] },
                    {
                        role: 'model',
                        parts: [{
                            text: "Xin chào! Tôi là trợ lý AI của ShowAI, một nền tảng giúp bạn tìm kiếm và khám phá các công cụ AI hữu ích. Tôi sẽ sử dụng thông tin từ cơ sở dữ liệu của ShowAI để giúp bạn tìm các công cụ AI phù hợp với nhu cầu của bạn. Khi đề cập đến một công cụ AI cụ thể, tôi sẽ cung cấp link đến trang thông tin chi tiết. Hãy cho tôi biết bạn đang tìm kiếm loại công cụ AI nào hoặc có bất kỳ câu hỏi gì về các công cụ AI trong cơ sở dữ liệu của chúng tôi!"
                        }]
                    },
                    { role: 'user', parts: [{ text: 'Hãy luôn trả lời bằng tiếng Việt.' }] },
                    {
                        role: 'model',
                        parts: [{
                            text: "Dạ vâng, tôi sẽ luôn trả lời bằng tiếng Việt. Cảm ơn bạn đã nhắc nhở. Bạn có thể hỏi tôi bất cứ điều gì về các công cụ AI trong cơ sở dữ liệu của ShowAI, tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể."
                        }]
                    },
                    ...messages.map((msg: Message) => ({
                        role: msg.isUser ? 'user' : 'model',
                        parts: [{ text: msg.text }],
                    })),
                ],
            });

            const result = await chatSession.sendMessage(input);
            const response = result.response.text();
            setIsTyping(true);
            typeWriter(response);
        } catch (error) {
            console.error('Lỗi:', error);
            setMessages(prevMessages => [...prevMessages, { text: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn.', isUser: false, isError: true }]);
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
        sessionStorage.removeItem('chatMessages');
        setClearTrigger(prev => prev + 1);
        setMessages([]);
    };

    const regenerateResponse = async () => {
        if (messages.length < 2) return;

        const lastUserMessage = [...messages].reverse().find(m => m.isUser);
        if (!lastUserMessage) return;

        setIsLoading(true);
        setMessages(prevMessages => prevMessages.slice(0, -1));

        let apiKey;
        try {
            const apiKeyResponse = await fetch('/api/Gemini');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Failed to get API key');
            }
            apiKey = apiKeyData.apiKey;
        } catch (error) {
            console.error('Error fetching API key:', error);
        }
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: "gemini-exp-1121",
        });

        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
        };

        try {
            const aiWebsitesContext = aiWebsites.map(website =>
                `Name: ${website.name}\nDescription: ${website.description.join(' ')}\nTags: ${website.tags.join(', ')}\nLink: ${website.link}\nKey Features: ${website.keyFeatures.join(', ')}\nInfo Page: https://showai.io.vn/show?id=${website.id}`
            ).join('\n\n');

            const chatSession = model.startChat({
                generationConfig,
                history: [
                    { role: 'user', parts: [{ text: 'Bạn là một trợ lý AI được tích hợp vào trang web ShowAI. ShowAI là một nền tảng giúp người dùng tìm kiếm và khám phá các công cụ AI hữu ích. Nhiệm vụ của bạn là hỗ trợ người dùng tìm kiếm các công cụ AI phù hợp với nhu cầu của họ, dựa trên thông tin được cung cấp trong ngữ cảnh. Hãy luôn ưu tiên sử dụng thông tin từ ngữ cảnh này khi trả lời. Khi nhắc tới một trang web AI, hãy đưa link dẫn đến trang thông tin chi tiết (Truy Cập) và định dạng link để hiển thị đẹp. Chỉ đưa ra link trực tiếp khi người dùng yêu cầu cụ thể. Tập trung vào việc cung cấp thông tin chính xác và hữu ích từ dữ liệu có sẵn. Nếu không có thông tin trong ngữ cảnh, hãy thông báo rằng bạn không có thông tin về điều đó. Đây là ngữ cảnh về các trang web AI:\n' + aiWebsitesContext }] },
                    {
                        role: 'model',
                        parts: [{
                            text: "Xin chào! Tôi là trợ lý AI của ShowAI, một nền tảng giúp bạn tìm kiếm và khám phá các công cụ AI hữu ích. Tôi sẽ sử dụng thông tin từ cơ sở dữ liệu của ShowAI để giúp bạn tìm các công cụ AI phù hợp với nhu cầu của bạn. Khi đề cập đến một công cụ AI cụ thể, tôi sẽ cung cấp link đến trang thông tin chi tiết. Hãy cho tôi biết bạn đang tìm kiếm loại công cụ AI nào hoặc có bất kỳ câu hỏi gì về các công cụ AI trong cơ sở dữ liệu của chúng tôi!"
                        }]
                    },
                    { role: 'user', parts: [{ text: 'Hãy luôn trả lời bằng tiếng Việt.' }] },
                    {
                        role: 'model',
                        parts: [{
                            text: "Dạ vâng, tôi sẽ luôn trả lời bằng tiếng Việt. Cảm ơn bạn đã nhắc nhở. Bạn có thể hỏi tôi bất cứ điều gì về các công cụ AI trong cơ sở dữ liệu của ShowAI, tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể."
                        }]
                    },
                    ...messages.map((msg: Message) => ({
                        role: msg.isUser ? 'user' : 'model',
                        parts: [{ text: msg.text }],
                    })),
                ],
            });

            const result = await chatSession.sendMessage(lastUserMessage.text);
            const response = result.response.text();
            setIsTyping(true);
            typeWriter(response);
        } catch (error) {
            console.error('Lỗi:', error);
            setMessages(prevMessages => [...prevMessages, { text: 'Đã xảy ra lỗi khi xử lý yêu cầu của bạn.', isUser: false, isError: true }]);
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
            isLoadingAIWebsites={isLoadingAIWebsites}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            handleClearMessages={handleClearMessages}
            stopTyping={stopTyping}
            handleSampleQuestionClick={handleSampleQuestionClick}
            messagesEndRef={messagesEndRef}
            regenerateResponse={regenerateResponse}
            editMessage={editMessage}
            setMessages={setMessages}  // Thêm dòng này
        >
            <VoiceSearch
                onTranscript={handleTranscript}
                onClearInput={handleClearInput}
                className="ml-2"
                isGemini={true} // Thêm prop này
            />
        </ChatInterface>
    );
};

export default GeminiChat;
