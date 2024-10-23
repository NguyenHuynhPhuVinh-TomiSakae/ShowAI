'use client'
import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoMicOutline, IoStopOutline } from "react-icons/io5";
import { motion, AnimatePresence } from 'framer-motion';
import { ElevenLabsClient } from "elevenlabs";
import type { MotionProps } from 'framer-motion';

interface VoiceCallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalBackdropProps = MotionProps & {
    className?: string;
};

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ isOpen, onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [toggleListening, setToggleListening] = useState(() => () => { });

    useEffect(() => {
        // Khởi tạo Web Speech API
        const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
        recognition.continuous = false;
        recognition.lang = 'vi-VN';

        recognition.onresult = async (event: any) => {
            try {
                const text = event.results[0][0].transcript;
                if (!text || text.trim() === '') {
                    throw new Error('Không nhận được văn bản từ giọng nói');
                }
                setTranscript(text);
                setIsListening(false);  // Chỉ tắt ghi âm sau khi nhận được kết quả

                // Gửi văn bản đến AI để xử lý
                try {
                    setIsLoading(true);
                    const aiResponse = await fetch('/api/ai', {
                        method: 'POST',
                        body: JSON.stringify({
                            messages: [{ role: 'user', content: "Trả lời bằng tiếng việt và chỉ trả lời theo kiểu đối thoại giữa 2 người với 1 dòng và ít từ. Hãy trả lời câu này: " + text }]
                        }),
                    });
                    const aiText = await aiResponse.text();
                    setResponse(aiText);

                    // Chuyển phản hồi thành giọng nói
                    const keyResponse = await fetch('/api/elevenlabs-key');
                    const { key } = await keyResponse.json();

                    const elevenlabs = new ElevenLabsClient({
                        apiKey: key,
                    });

                    const audio = await elevenlabs.generate({
                        voice: "Ly Hai",
                        text: aiText.slice(0, 500),
                        model_id: "eleven_turbo_v2_5",
                    });

                    const chunks = [];
                    for await (const chunk of audio) {
                        chunks.push(chunk);
                    }
                    const audioBuffer = Buffer.concat(chunks);
                    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
                    const url = URL.createObjectURL(blob);

                    if (audioRef.current) {
                        audioRef.current.src = url;
                        audioRef.current.play();
                        setIsPlaying(true);
                    }
                } catch (error) {
                    console.error('Lỗi:', error);
                    setResponse('Đã xảy ra lỗi khi xử lý yêu cầu.');
                } finally {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Lỗi khi xử lý giọng nói:', error);
                setIsListening(false);
                setResponse('Xin lỗi, không thể nhận dạng được giọng nói. Vui lòng thử lại.');
                return;
            }
        };

        recognition.addEventListener('error', (event: any) => {
            console.error('Lỗi nhận dạng giọng nói:', event.error);
            setIsListening(false);
            setResponse('Đã xảy ra lỗi khi nhận dạng giọng nói. Vui lòng thử lại.');
        });

        recognition.addEventListener('nomatch', () => {
            setIsListening(false);
            setResponse('Không thể nhận dạng được giọng nói. Vui lòng nói rõ hơn và thử lại.');
        });

        setToggleListening(() => () => {
            if (!isListening) {
                recognition.start();
                setIsListening(true);
                setTranscript(''); // Reset transcript khi bắt đầu ghi âm mới
            } else {
                // Chỉ cho phép tắt nếu đã có transcript
                if (transcript.trim()) {
                    recognition.stop();
                    setIsListening(false);
                }
            }
        });

    }, [isListening]);

    useEffect(() => {
        audioRef.current = new Audio();

        const handleEnded = () => {
            setIsPlaying(false);
        };

        audioRef.current.addEventListener('ended', handleEnded);
        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleEnded);
            }
        };
    }, []);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    {...{
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0 },
                        className: "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    } as ModalBackdropProps}
                >
                    <motion.div
                        {...{
                            initial: { scale: 0.9, opacity: 0 },
                            animate: { scale: 1, opacity: 1 },
                            exit: { scale: 0.9, opacity: 0 },
                            className: "bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-700"
                        } as ModalBackdropProps}
                    >
                        <div className="p-8">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <IoClose className="h-6 w-6" />
                            </button>

                            <h2 className="text-2xl font-bold text-[#93C5FD] mb-6 text-center">Gọi điện với AI</h2>

                            <div className="flex flex-col items-center space-y-6">
                                <button
                                    onClick={toggleListening}
                                    className={`p-8 rounded-full ${isListening
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-[#4ECCA3] hover:bg-[#3db892]'
                                        } transition-all duration-300 shadow-lg transform hover:scale-105`}
                                >
                                    {isListening ? (
                                        <IoStopOutline className="h-10 w-10 text-white" />
                                    ) : (
                                        <IoMicOutline className="h-10 w-10 text-white" />
                                    )}
                                </button>

                                <p className="text-gray-300 text-lg font-medium">
                                    {isListening ? 'Đang nghe...' : 'Nhấn để bắt đầu nói'}
                                </p>

                                {transcript && (
                                    <div className="w-full bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                                        <p className="text-white text-lg">{transcript}</p>
                                    </div>
                                )}

                                {response && (
                                    <div className="w-full bg-[#4ECCA3]/10 p-6 rounded-xl border border-[#4ECCA3]/20">
                                        <p className="text-[#4ECCA3] text-lg">{response}</p>
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="text-white flex items-center space-x-2">
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        <span>Đang xử lý...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VoiceCallModal;
