/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { IoClose, IoExpand, IoContract, IoDownload, IoSettings } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import Together from "together-ai";
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

interface AIImageGenModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface GeneratedImage {
    id: string;
    url: string;
}

interface ImageSettings {
    width: number;
    height: number;
    steps: number;
}

const AIImageGenModal: React.FC<AIImageGenModalProps> = ({ isOpen, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState<ImageSettings>({
        width: 1024,
        height: 768,
        steps: 4
    });
    const [showSettings, setShowSettings] = useState(false);
    const [togetherApiKey, setTogetherApiKey] = useState<string | null>(null);

    useEffect(() => {
        const fetchApiKey = async () => {
            try {
                const response = await fetch('/api/together-api-key');
                const data = await response.json();
                if (data.apiKey) {
                    setTogetherApiKey(data.apiKey);
                }
            } catch (error) {
                console.error("Lỗi khi lấy Together API Key:", error);
            }
        };

        fetchApiKey();
    }, []);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const handleGenerateImage = async () => {
        if (!togetherApiKey) {
            console.error("Together API Key chưa được tải");
            return;
        }

        setIsLoading(true);
        try {
            const together = new Together({ apiKey: togetherApiKey });
            const response = await together.images.create({
                model: "black-forest-labs/FLUX.1-schnell-Free",
                prompt: prompt,
                width: settings.width,
                height: settings.height,
                steps: settings.steps,
                n: 1,
                response_format: "b64_json"
            } as any);

            const newImages = [{
                id: uuidv4(),
                url: `data:image/png;base64,${response.data[0].b64_json}`
            }];
            setGeneratedImages(prevImages => [...newImages, ...prevImages]);
        } catch (error) {
            console.error("Lỗi khi tạo hình ảnh:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = (imageUrl: string, imageName: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = imageName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-[#0F172A] rounded-lg p-6 flex flex-col border border-[#3E52E8] transition-all duration-300 ${isExpanded ? 'w-[98%] h-[98%]' : 'w-full max-w-2xl h-3/4'}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-[#93C5FD]">Tạo hình ảnh AI</h2>
                            <div className="flex items-center">
                                <button
                                    onClick={toggleExpand}
                                    className="text-gray-400 hover:text-white transition-colors duration-300 mr-4"
                                >
                                    {isExpanded ? <IoContract className="h-5 w-5 md:h-6 md:w-6" /> : <IoExpand className="h-5 w-5 md:h-6 md:w-6" />}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors duration-300"
                                >
                                    <IoClose className="h-6 w-6 md:h-7 md:w-7" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <div className="space-y-4">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Nhập mô tả hình ảnh bạn muốn tạo..."
                                    className="w-full p-2 border rounded bg-[#1E293B] text-white border-[#3E52E8] resize-none h-32"
                                />
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="flex items-center justify-center w-full py-2 bg-[#3E52E8] text-white rounded hover:bg-[#2A3BAF] transition-colors duration-300"
                                >
                                    <IoSettings className="mr-2" />
                                    {showSettings ? 'Ẩn cài đặt' : 'Hiện cài đặt'}
                                </button>
                                <AnimatePresence>
                                    {showSettings && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div>
                                                <label htmlFor="width" className="block text-sm font-medium text-gray-300">Chiều rộng: {settings.width}</label>
                                                <input
                                                    type="range"
                                                    id="width"
                                                    name="width"
                                                    min="256"
                                                    max="1440"
                                                    step="8"
                                                    value={settings.width}
                                                    onChange={handleSettingChange}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="height" className="block text-sm font-medium text-gray-300">Chiều cao: {settings.height}</label>
                                                <input
                                                    type="range"
                                                    id="height"
                                                    name="height"
                                                    min="256"
                                                    max="1440"
                                                    step="8"
                                                    value={settings.height}
                                                    onChange={handleSettingChange}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="steps" className="block text-sm font-medium text-gray-300">Số bước: {settings.steps}</label>
                                                <input
                                                    type="range"
                                                    id="steps"
                                                    name="steps"
                                                    min="1"
                                                    max="12"
                                                    value={settings.steps}
                                                    onChange={handleSettingChange}
                                                    className="w-full"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <button
                                    onClick={handleGenerateImage}
                                    className="bg-[#3E52E8] text-white px-4 py-2 rounded w-full hover:bg-[#2A3BAF] transition-colors duration-300 flex items-center justify-center"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang tạo...
                                        </>
                                    ) : (
                                        'Tạo hình ảnh'
                                    )}
                                </button>
                                {generatedImages.length > 0 && (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {generatedImages.map((image) => (
                                            <div key={image.id} className="relative aspect-[4/3] group">
                                                <Image
                                                    src={image.url}
                                                    alt="Hình ảnh được tạo"
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="rounded"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                                                <button
                                                    onClick={() => handleDownload(image.url, `ai-image-${image.id}.png`)}
                                                    className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"
                                                    aria-label="Tải xuống hình ảnh"
                                                >
                                                    <IoDownload className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
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

export default AIImageGenModal;
