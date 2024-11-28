import React, { useState, useEffect } from 'react';
import { IoClose, IoExpand, IoContract, IoDownload, IoSettings } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { NovitaSDK, TaskStatus } from "novita-sdk";
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { humanModels, HumanModel } from '../utils/humanModels';
import HumanModelSelector from './HumanModelSelector';

interface HumanGenModalProps {
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
    image_num: number;
}

const HumanGenModal: React.FC<HumanGenModalProps> = ({ isOpen, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [settings, setSettings] = useState<ImageSettings>({
        width: 512,
        height: 512,
        image_num: 1
    });
    const [showSettings, setShowSettings] = useState(false);
    const [novitaApiKey, setNovitaApiKey] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<HumanModel>(humanModels[0]);
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);

    useEffect(() => {
        const fetchApiKey = async () => {
            try {
                const response = await fetch('/api/novita-api-key');
                const data = await response.json();
                if (data.apiKey) {
                    setNovitaApiKey(data.apiKey);
                }
            } catch (error) {
                console.error("Lỗi khi lấy Novita API Key:", error);
            }
        };

        fetchApiKey();
    }, []);

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

    const handleModelChange = (newModel: HumanModel) => {
        setSelectedModel(newModel);
    };

    const handleUseDefaultPrompt = () => {
        setPrompt(selectedModel.defaultPrompt);
    };

    const handleUseDefaultNegativePrompt = () => {
        setNegativePrompt(selectedModel.defaultNegativePrompt);
    };

    const handleGenerateImage = async () => {
        if (!novitaApiKey) {
            console.error("Novita API Key chưa được tải");
            return;
        }

        setIsLoading(true);
        try {
            const sdk = new NovitaSDK(novitaApiKey);

            const params = {
                request: {
                    model_name: selectedModel.modelName,
                    prompt: prompt,
                    negative_prompt: negativePrompt,
                    width: settings.width,
                    height: settings.height,
                    image_num: settings.image_num,
                    steps: 20, // Tăng số bước để có chất lượng tốt hơn cho ảnh người
                    seed: -1,
                    clip_skip: 1,
                    sampler_name: "DPM++ SDE Karras",
                    guidance_scale: 7.0,
                    loras: [],
                },
            };

            const response = await sdk.txt2Img(params);

            if (response && response.task_id) {
                const checkProgress = () => {
                    return new Promise((resolve, reject) => {
                        const timer = setInterval(async () => {
                            try {
                                const progressRes = await sdk.progress({
                                    task_id: response.task_id,
                                });
                                if (progressRes.task.status === TaskStatus.SUCCEED) {
                                    clearInterval(timer);
                                    resolve(progressRes.images);
                                }
                                if (progressRes.task.status === TaskStatus.FAILED) {
                                    clearInterval(timer);
                                    reject(new Error(progressRes.task.reason));
                                }
                            } catch (err) {
                                clearInterval(timer);
                                reject(err);
                            }
                        }, 1000);
                    });
                };

                const images = await checkProgress() as any[];
                const newImages = images.map(image => ({
                    id: uuidv4(),
                    url: image.image_url
                }));
                setGeneratedImages(prevImages => [...newImages, ...prevImages]);
            }
        } catch (error) {
            console.error("Lỗi khi tạo hình ảnh:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: parseFloat(value) }));
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
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-[#0F172A] rounded-xl shadow-2xl p-4 sm:p-6 flex flex-col border border-[#3E52E8]/20 transition-all duration-300 ${isExpanded ? 'w-full h-full' : 'w-full max-w-3xl h-[90vh] sm:h-4/5'
                            }`}
                    >
                        <div className="flex justify-between items-center mb-4 px-2">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                                Tạo ảnh người AI
                            </h2>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={toggleExpand}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                                >
                                    {isExpanded ?
                                        <IoContract className="h-5 w-5 text-white/70 hover:text-white" /> :
                                        <IoExpand className="h-5 w-5 text-white/70 hover:text-white" />
                                    }
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                                >
                                    <IoClose className="h-5 w-5 text-white/70 hover:text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-grow overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#1E293B] rounded-lg">
                            <div className="flex flex-col h-full">
                                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                                    {/* Chọn mô hình */}
                                    <div className="space-y-2">
                                        <label className="text-white text-sm">Mô hình đã chọn</label>
                                        <button
                                            onClick={() => setIsModelSelectorOpen(true)}
                                            className="w-full p-3 rounded-xl bg-[#1E293B] text-white border border-white/10 
                                                       hover:bg-[#2E3B52] transition-colors duration-200 text-left"
                                        >
                                            {selectedModel.name}
                                        </button>
                                    </div>

                                    {/* Prompt textarea */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-white text-sm">Prompt</label>
                                            <button
                                                onClick={handleUseDefaultPrompt}
                                                className="text-xs text-[#3E52E8] hover:text-[#2E42D8]"
                                            >
                                                Sử dụng mẫu
                                            </button>
                                        </div>
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="Nhập mô tả hình ảnh người bạn muốn tạo..."
                                            className="w-full p-3 rounded-xl bg-[#1E293B] text-white border border-white/10 
                                                       focus:border-[#3E52E8] focus:ring-1 focus:ring-[#3E52E8] 
                                                       transition-all duration-200 resize-none h-32"
                                        />
                                    </div>

                                    {/* Negative Prompt textarea */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-white text-sm">Negative Prompt</label>
                                            <button
                                                onClick={handleUseDefaultNegativePrompt}
                                                className="text-xs text-[#3E52E8] hover:text-[#2E42D8]"
                                            >
                                                Sử dụng mẫu
                                            </button>
                                        </div>
                                        <textarea
                                            value={negativePrompt}
                                            onChange={(e) => setNegativePrompt(e.target.value)}
                                            placeholder="Nhập mô tả những gì bạn không muốn xuất hiện trong hình..."
                                            className="w-full p-3 rounded-xl bg-[#1E293B] text-white border border-white/10 
                                                       focus:border-[#3E52E8] focus:ring-1 focus:ring-[#3E52E8] 
                                                       transition-all duration-200 resize-none h-32"
                                        />
                                    </div>

                                    <button
                                        onClick={() => setShowSettings(!showSettings)}
                                        className="flex items-center justify-center w-full p-3 rounded-xl 
                                                 bg-[#1E293B] text-white border border-white/10 hover:bg-[#2E3B52] 
                                                 transition-colors duration-200"
                                    >
                                        <IoSettings className="mr-2" />
                                        {showSettings ? 'Ẩn cài đặt' : 'Hiện cài đặt'}
                                    </button>

                                    {showSettings && (
                                        <div className="space-y-4 p-4 bg-[#1E293B]/50 rounded-xl border border-white/10">
                                            {/* Width Setting */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-white text-sm">Chiều rộng</label>
                                                    <span className="text-white/70 text-sm">{settings.width}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    name="width"
                                                    value={settings.width}
                                                    onChange={handleSettingChange}
                                                    className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer
                                                             [&::-webkit-slider-thumb]:appearance-none
                                                             [&::-webkit-slider-thumb]:w-4
                                                             [&::-webkit-slider-thumb]:h-4
                                                             [&::-webkit-slider-thumb]:rounded-full
                                                             [&::-webkit-slider-thumb]:bg-[#3E52E8]
                                                             [&::-webkit-slider-thumb]:hover:bg-[#2E42D8]
                                                             [&::-webkit-slider-thumb]:transition-colors
                                                             [&::-webkit-slider-thumb]:duration-200"
                                                    min="384"
                                                    max="768"
                                                    step="128"
                                                />
                                            </div>

                                            {/* Height Setting */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-white text-sm">Chiều cao</label>
                                                    <span className="text-white/70 text-sm">{settings.height}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    name="height"
                                                    value={settings.height}
                                                    onChange={handleSettingChange}
                                                    className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer
                                                             [&::-webkit-slider-thumb]:appearance-none
                                                             [&::-webkit-slider-thumb]:w-4
                                                             [&::-webkit-slider-thumb]:h-4
                                                             [&::-webkit-slider-thumb]:rounded-full
                                                             [&::-webkit-slider-thumb]:bg-[#3E52E8]
                                                             [&::-webkit-slider-thumb]:hover:bg-[#2E42D8]
                                                             [&::-webkit-slider-thumb]:transition-colors
                                                             [&::-webkit-slider-thumb]:duration-200"
                                                    min="384"
                                                    max="768"
                                                    step="128"
                                                />
                                            </div>

                                            {/* Image Number Setting */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-white text-sm">Số lượng ảnh</label>
                                                    <span className="text-white/70 text-sm">{settings.image_num}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    name="image_num"
                                                    value={settings.image_num}
                                                    onChange={handleSettingChange}
                                                    className="w-full h-2 bg-[#1E293B] rounded-lg appearance-none cursor-pointer
                                                             [&::-webkit-slider-thumb]:appearance-none
                                                             [&::-webkit-slider-thumb]:w-4
                                                             [&::-webkit-slider-thumb]:h-4
                                                             [&::-webkit-slider-thumb]:rounded-full
                                                             [&::-webkit-slider-thumb]:bg-[#3E52E8]
                                                             [&::-webkit-slider-thumb]:hover:bg-[#2E42D8]
                                                             [&::-webkit-slider-thumb]:transition-colors
                                                             [&::-webkit-slider-thumb]:duration-200"
                                                    min="1"
                                                    max="4"
                                                    step="1"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Generated Images Grid */}
                                    {generatedImages.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                            {generatedImages.map((image) => (
                                                <div key={image.id}
                                                    className="relative aspect-[3/4] rounded-xl overflow-hidden 
                                                              border border-white/10 group">
                                                    <Image
                                                        src={image.url}
                                                        alt="Hình ảnh người được tạo"
                                                        layout="fill"
                                                        objectFit="cover"
                                                        className="rounded-xl"
                                                    />
                                                    {/* Thêm overlay cho desktop */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 
                                                                  transition-all duration-200 hidden sm:block" />
                                                    {/* Button cho mobile */}
                                                    <button
                                                        onClick={() => handleDownload(image.url, `human-${image.id}.png`)}
                                                        className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/50 
                                                                 text-white transition-all duration-200 
                                                                 hover:bg-black/70 block sm:hidden"
                                                    >
                                                        <IoDownload className="h-5 w-5" />
                                                    </button>
                                                    {/* Button cho desktop */}
                                                    <button
                                                        onClick={() => handleDownload(image.url, `human-${image.id}.png`)}
                                                        className="absolute bottom-2 right-2 p-2 rounded-lg bg-black/50 
                                                                 text-white opacity-0 group-hover:opacity-100
                                                                 transition-all duration-200 hover:bg-black/70 
                                                                 hidden sm:block"
                                                    >
                                                        <IoDownload className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Generate Button */}
                                <div className="p-4 border-t border-white/10">
                                    <button
                                        onClick={handleGenerateImage}
                                        disabled={isLoading}
                                        className="w-full p-3 rounded-xl bg-[#3E52E8] text-white 
                                                 hover:bg-[#2E42D8] transition-colors duration-200 
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 flex items-center justify-center"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                                        stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Đang tạo...
                                            </>
                                        ) : 'Tạo ảnh người'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            <HumanModelSelector
                isOpen={isModelSelectorOpen}
                onClose={() => setIsModelSelectorOpen(false)}
                onSelectModel={handleModelChange}
                currentModel={selectedModel}
            />
        </AnimatePresence>
    );
};

export default HumanGenModal; 