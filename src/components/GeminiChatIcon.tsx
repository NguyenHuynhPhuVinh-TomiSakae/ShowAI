'use client'
import React, { useState } from 'react';
import GeminiChat from './GeminiChat';
import { IoChatbubbleEllipses } from "react-icons/io5";

const GeminiChatIcon: React.FC = () => {
    const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);

    const toggleGeminiChat = () => {
        setIsGeminiChatOpen(!isGeminiChatOpen);
    };

    return (
        <>
            <button
                onClick={toggleGeminiChat}
                className="fixed bottom-20 right-4 bg-[#3E52E8] text-white rounded-full p-3 shadow-lg hover:bg-[#2A3BAF] transition-colors duration-300"
                aria-label="Mở Gemini Chat"
            >
                <IoChatbubbleEllipses className="h-6 w-6" />
            </button>
            <GeminiChat isOpen={isGeminiChatOpen} onClose={() => setIsGeminiChatOpen(false)} />
        </>
    );
};

export default GeminiChatIcon;
