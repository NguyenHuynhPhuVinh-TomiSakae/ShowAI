'use client'
import React, { useState } from 'react';
import GeminiChat from './GeminiChat';
import { IoChatbubbleEllipses } from "react-icons/io5";
import BotSelectionModal from './BotSelectionModal';
import ShowAIChat from './ShowAIChat';
import MarcoChat from './MarcoChat';

const GeminiChatIcon: React.FC = () => {
    const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
    const [isBotSelectionOpen, setIsBotSelectionOpen] = useState(false);
    const [selectedBot, setSelectedBot] = useState<'gemini' | 'showai' | 'marco' | null>(null);

    const handleBotSelection = (bot: 'gemini' | 'showai' | 'marco') => {
        setSelectedBot(bot);
        setIsBotSelectionOpen(false);
        setIsGeminiChatOpen(true);
    };

    const toggleChat = () => {
        if (!isGeminiChatOpen) {
            setIsBotSelectionOpen(true);
        } else {
            setIsGeminiChatOpen(false);
        }
    };

    return (
        <>
            <button
                onClick={toggleChat}
                className="fixed bottom-20 right-4 bg-[#3E52E8] text-white rounded-full p-3 shadow-lg hover:bg-[#2A3BAF] transition-colors duration-300"
                aria-label="Mở Chat Bot"
            >
                <IoChatbubbleEllipses className="h-6 w-6" />
            </button>

            <BotSelectionModal
                isOpen={isBotSelectionOpen}
                onClose={() => setIsBotSelectionOpen(false)}
                onSelectBot={handleBotSelection}
            />

            {selectedBot === 'gemini' && (
                <GeminiChat
                    isOpen={isGeminiChatOpen}
                    onClose={() => setIsGeminiChatOpen(false)}
                />
            )}
            {selectedBot === 'showai' && (
                <ShowAIChat
                    isOpen={isGeminiChatOpen}
                    onClose={() => setIsGeminiChatOpen(false)}
                />
            )}
            {selectedBot === 'marco' && (
                <MarcoChat
                    isOpen={isGeminiChatOpen}
                    onClose={() => setIsGeminiChatOpen(false)}
                />
            )}
        </>
    );
};

export default GeminiChatIcon;
