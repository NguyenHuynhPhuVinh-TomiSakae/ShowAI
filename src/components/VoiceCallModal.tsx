'use client'
import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoMicOutline, IoStopOutline, IoSwapHorizontalOutline } from "react-icons/io5";
import { motion, AnimatePresence } from 'framer-motion';
import { ElevenLabsClient } from "elevenlabs";
import type { MotionProps } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface VoiceCallModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ModalBackdropProps = MotionProps & {
    className?: string;
};

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({ isOpen, onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [toggleListening, setToggleListening] = useState(() => () => { });
    const [isLoli, setIsLoli] = useState(false);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

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

                    // Lấy API key từ endpoint
                    const keyResponse = await fetch('/api/Gemini5');
                    const { apiKey } = await keyResponse.json();

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

                    const promptText = isLoli
                        ? "Trả lời bằng cả tiếng Nhật và tiếng Việt, mỗi ngôn ngữ một dòng. Hãy trả lời theo format: [Tiếng Nhật]\n[Tiếng Việt]. Hãy trả lời câu này: "
                        : "Trả lời bằng tiếng việt và chỉ trả lời theo kiểu đối thoại giữa 2 người với 1 dòng và ít từ. Hãy trả lời câu này: ";

                    const chatSession = model.startChat({
                        generationConfig,
                        history: [
                            {
                                role: "user",
                                parts: [{ text: promptText + text }],
                            },
                        ],
                    });

                    const result = await chatSession.sendMessage(text);
                    const aiText = result.response.text();

                    if (isLoli) {
                        // Tách phản hồi thành tiếng Nhật và tiếng Việt
                        const [japaneseText, vietnameseText] = aiText.split('\n');
                        setResponse(`${japaneseText}\n${vietnameseText}`);

                        try {
                            // Sử dụng text tiếng Nhật cho VOICEVOX
                            const voicevoxResponse = await fetch('/api/voicevox', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ text: japaneseText }),
                            });

                            if (!voicevoxResponse.ok) {
                                throw new Error('VOICEVOX API failed');
                            }

                            const arrayBuffer = await voicevoxResponse.arrayBuffer();

                            if (audioContext) {
                                try {
                                    // Log để debug
                                    console.log('Audio data length:', arrayBuffer.byteLength);
                                    console.log('Content-Type:', voicevoxResponse.headers.get('content-type'));

                                    await audioContext.resume();
                                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer).catch(e => {
                                        console.error('Decode error:', e);
                                        throw new Error('Không thể decode audio data');
                                    });

                                    const source = audioContext.createBufferSource();
                                    source.buffer = audioBuffer;
                                    source.connect(audioContext.destination);
                                    source.start(0);
                                    setIsPlaying(true);
                                } catch (decodeError) {
                                    console.error('Lỗi decode:', decodeError);
                                    throw new Error('Lỗi xử lý audio');
                                }
                            }
                        } catch (error) {
                            console.error('Lỗi VOICEVOX:', error);
                            setResponse(prevResponse => prevResponse + '\n[Lỗi phát âm thanh]');
                        }
                    } else {
                        setResponse(aiText);
                        try {
                            // Chuyển phản hồi thành giọng nói qua ElevenLabs
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
                                await audioRef.current.play();
                                setIsPlaying(true);
                            }
                        } catch (error) {
                            console.error('Lỗi khi xử lý ElevenLabs:', error);
                            setResponse(prevResponse => prevResponse + '\n[Lỗi chuyển đổi giọng nói]');
                        }
                    }
                } catch (error) {
                    console.error('Lỗi chi tiết:', error);
                    setResponse('Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.');
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
        const context = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 24000  // Chỉ định sample rate
        });
        setAudioContext(context);

        return () => {
            context.close();
        };
    }, []);

    const handleVoiceToggle = () => {
        setIsLoli(!isLoli);
    };

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

                            <button
                                onClick={handleVoiceToggle}
                                className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <IoSwapHorizontalOutline className="h-6 w-6" />
                                <span className="text-xs">{isLoli ? 'Loli' : 'Normal'}</span>
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
                                        {isLoli ? (
                                            response.split('\n').map((text, index) => (
                                                <p key={index} className={`text-lg ${index === 0 ? 'text-yellow-400 mb-2' : 'text-[#4ECCA3]'}`}>
                                                    {text}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="text-[#4ECCA3] text-lg">{response}</p>
                                        )}
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
