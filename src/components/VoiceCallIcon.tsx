'use client'
import React, { useState } from 'react';
import { IoCall } from "react-icons/io5";
import VoiceCallModal from './VoiceCallModal';

const VoiceCallIcon: React.FC = () => {
    const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);

    const toggleVoiceCall = () => {
        setIsVoiceCallOpen(!isVoiceCallOpen);
    };

    return (
        <>
            <button
                onClick={toggleVoiceCall}
                className="fixed bottom-36 right-4 bg-[#3E52E8] text-white rounded-full p-3 shadow-lg hover:bg-[#4B5EFF] transition-colors duration-300"
                aria-label="Mở Voice Call AI"
            >
                <IoCall className="h-6 w-6" />
            </button>
            <VoiceCallModal isOpen={isVoiceCallOpen} onClose={() => setIsVoiceCallOpen(false)} />
        </>
    );
};

export default VoiceCallIcon;
