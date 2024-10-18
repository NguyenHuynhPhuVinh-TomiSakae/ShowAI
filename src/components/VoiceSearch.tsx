import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';

interface VoiceSearchProps {
    onTranscript: (transcript: string) => void;
    onClearInput: () => void;
    className?: string;
    isGemini?: boolean; // Thêm prop mới này
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ onTranscript, onClearInput, className, isGemini = false }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'vi-VN';

            recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                onTranscript(transcript);
            };

            setRecognition(recognitionInstance);
        }
    }, [onTranscript]);

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const startListening = () => {
        onClearInput();
        recognition?.start();
        setIsListening(true);
    };

    const stopListening = () => {
        recognition?.stop();
        setIsListening(false);
        if (isGemini) {
            onClearInput(); // Chỉ xóa input nếu là Gemini chat
        }
    };

    useEffect(() => {
        return () => {
            if (isListening) {
                stopListening();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isListening]);

    if (!recognition) {
        return null;
    }

    return (
        <button
            className={`voice-search-button ${className || ''}`}
            onClick={toggleListening}
        >
            {isListening ? <FaStop className="text-xl" /> : <FaMicrophone className="text-xl" />}
        </button>
    );
};

export default VoiceSearch;
