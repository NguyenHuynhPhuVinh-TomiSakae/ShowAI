'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Together } from 'together-ai';
import ModalPortal from '@/components/ModalPortal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { getStorage, ref as storageRef, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';

// Cấu hình toast
const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

enum GamePhase {
    TOPIC_GENERATION = 1,
    PROMPT_WRITING = 2,
    IMAGE_GENERATION = 3,
    SCORING = 4
}

export default function DrawingArena() {
    const [phase, setPhase] = useState<GamePhase>(GamePhase.TOPIC_GENERATION);
    const [topic, setTopic] = useState<string>('');
    const [playerPrompt, setPlayerPrompt] = useState<string>('');
    const [playerImage, setPlayerImage] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    // Hàm tạo chủ đề từ Gemini
    const generateTopic = async () => {
        try {
            const apiKeyResponse = await fetch('/api/Gemini3');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được API key');
            }

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-exp-1121" });

            const prompt = `Tạo một chủ đề thú vị để vẽ tranh. CHỈ trả về ch đề, không kèm theo giải thích hay định dạng.`;
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error('Lỗi khi tạo chủ đề:', error);
            throw error;
        }
    };

    // Sửa lại hàm generateImages để chỉ tạo 1 ảnh
    const generateImage = async (prompt: string) => {
        try {
            const apiKeyResponse = await fetch('/api/together-api-key');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.apiKey) {
                throw new Error('Không lấy được Together API key');
            }

            const together = new Together({ apiKey: apiKeyData.apiKey });

            const response = await together.images.create({
                model: "black-forest-labs/FLUX.1-schnell-Free",
                prompt: prompt,
                width: 1024,
                height: 768,
                steps: 1,
                n: 1,
                response_format: "b64_json"
            } as any);

            return `data:image/png;base64,${response.data[0].b64_json}`;
        } catch (error) {
            console.error('Lỗi khi tạo hình ảnh:', error);
            throw error;
        }
    };

    const scoreImage = async (imageUrl: string) => {
        let firebaseUrl = '';
        const isBase64Image = imageUrl.startsWith('data:image');
        let imageDeleted = false;

        try {
            // Upload ảnh lên Firebase nếu cần
            if (isBase64Image) {
                const storage = getStorage();
                const tempImageRef = storageRef(storage, `temp-scores/${Date.now()}.jpg`);
                await uploadString(tempImageRef, imageUrl, 'data_url');
                firebaseUrl = await getDownloadURL(tempImageRef);
            }

            // Lấy API key từ OpenRouter
            const openRouterKeyResponse = await fetch('/api/openrouter-key');
            const openRouterKeyData = await openRouterKeyResponse.json();

            if (!openRouterKeyData.key) {
                throw new Error('Không lấy được OpenRouter API key');
            }

            // Sử dụng URL Firebase nếu đã upload, không thì dùng URL gốc
            const urlToScore = firebaseUrl || imageUrl;

            // Dùng Gemini Flash để chấm điểm trực tiếp
            const scoringResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKeyData.key}`,
                    "HTTP-Referer": `${process.env.NEXT_PUBLIC_SITE_URL}`,
                    "X-Title": `${process.env.NEXT_PUBLIC_SITE_NAME}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemini-flash-1.5-8b",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": `Với vai trò là một giám khảo nghệ thuật, hãy chấm điểm cho tác phẩm này dựa trên chủ đề: "${topic}". Tiêu chí chấm điểm (thang điểm 0-10): 1. Mức độ phù hợp với chủ đề (50%) 2. Tính sáng tạo và thẩm mỹ (50%). CHỈ TRẢ VỀ MỘT CON SỐ DUY NHẤT từ 0 đến 10, không kèm giải thích.`
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": urlToScore
                                    }
                                }
                            ]
                        }
                    ]
                })
            });

            const scoringData = await scoringResponse.json();
            const scoreResponse = scoringData.choices[0]?.message?.content || '';

            if (firebaseUrl && !imageDeleted) {
                try {
                    const storage = getStorage();
                    const fullPath = decodeURIComponent(firebaseUrl.split('/o/')[1].split('?')[0]);
                    const imageRef = storageRef(storage, fullPath);
                    await deleteObject(imageRef);
                    imageDeleted = true;
                } catch (deleteError) {
                    console.error('Không thể xóa ảnh:', deleteError);
                }
            }

            const score = Number(scoreResponse);
            if (isNaN(score) || score < 0 || score > 10) {
                throw new Error('Điểm số không hợp lệ');
            }

            return score;
        } catch (error) {
            // Nếu có lỗi và ảnh chưa được xóa, thử xóa một lần nữa
            if (firebaseUrl && !imageDeleted) {
                try {
                    const storage = getStorage();
                    const fullPath = decodeURIComponent(firebaseUrl.split('/o/')[1].split('?')[0]);
                    const imageRef = storageRef(storage, fullPath);
                    await deleteObject(imageRef);
                    imageDeleted = true;
                } catch (deleteError) {
                    console.error('Không thể xóa ảnh:', deleteError);
                }
            }
            console.error('Lỗi khi chấm điểm:', error);
            return 5;
        }
    };

    // Sửa lại hàm xử lý chuyển phase
    const handleNextPhase = async () => {
        setLoading(true);
        try {
            switch (phase) {
                case GamePhase.TOPIC_GENERATION:
                    const newTopic = await generateTopic();
                    setTopic(newTopic);
                    setPhase(GamePhase.PROMPT_WRITING);
                    break;

                case GamePhase.PROMPT_WRITING:
                    const generatedImage = await generateImage(playerPrompt);
                    setPlayerImage(generatedImage);
                    setPhase(GamePhase.IMAGE_GENERATION);
                    break;

                case GamePhase.IMAGE_GENERATION:
                    const finalScore = await scoreImage(playerImage);
                    setScore(finalScore);
                    setPhase(GamePhase.SCORING);
                    break;

                case GamePhase.SCORING:
                    setPhase(GamePhase.TOPIC_GENERATION);
                    resetGame();
                    break;
            }
        } catch (error) {
            console.error('Lỗi:', error);
            toast.error('Có lỗi xảy ra, vui lòng thử lại!', toastStyle);
        } finally {
            setLoading(false);
        }
    };

    // Sửa lại hàm reset
    const resetGame = () => {
        setTopic('');
        setPlayerPrompt('');
        setPlayerImage('');
        setScore(0);
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Đấu Trường Vẽ Tranh</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Thử thách khả năng viết prompt và tạo hình ảnh với AI.
                </p>
            </div>

            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton height={60} baseColor="#1F2937" highlightColor="#374151" />
                        <Skeleton height={200} baseColor="#1F2937" highlightColor="#374151" />
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto">
                        {phase === GamePhase.TOPIC_GENERATION && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center"
                            >
                                <h2 className="text-xl mb-4">Sẵn sàng cho thử thách mới?</h2>
                                <button
                                    onClick={handleNextPhase}
                                    className="bg-[#3E52E8] hover:bg-[#2E42D8] px-6 py-3 rounded-lg font-bold"
                                >
                                    Bắt đầu
                                </button>
                            </motion.div>
                        )}

                        {phase === GamePhase.PROMPT_WRITING && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h2 className="text-xl mb-4">Chủ đề: {topic}</h2>
                                <textarea
                                    value={playerPrompt}
                                    onChange={(e) => setPlayerPrompt(e.target.value)}
                                    className="w-full p-4 bg-[#1E293B] rounded-lg resize-none h-32 mb-4"
                                    placeholder="Viết prompt của bạn..."
                                />
                                <button
                                    onClick={handleNextPhase}
                                    disabled={!playerPrompt.trim()}
                                    className="w-full bg-[#3E52E8] hover:bg-[#2E42D8] px-6 py-3 rounded-lg font-bold disabled:opacity-50"
                                >
                                    Tiếp tục
                                </button>
                            </motion.div>
                        )}

                        {phase === GamePhase.IMAGE_GENERATION && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center"
                            >
                                <h2 className="text-xl mb-4">Hình ảnh của bạn đã được tạo:</h2>
                                <div className="mb-4">
                                    <img src={playerImage} alt="Your creation" className="w-full rounded-lg" />
                                </div>
                                <button
                                    onClick={handleNextPhase}
                                    className="bg-[#3E52E8] hover:bg-[#2E42D8] px-6 py-3 rounded-lg font-bold"
                                >
                                    Chấm điểm
                                </button>
                            </motion.div>
                        )}

                        {phase === GamePhase.SCORING && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h2 className="text-xl mb-4">Kết quả của bạn</h2>
                                <div className="mb-4">
                                    <img src={playerImage} alt="Your creation" className="w-full rounded-lg" />
                                    <p className="mt-2 text-xl">Điểm số: {score}/10</p>
                                </div>
                                <div className="text-center text-xl font-bold mb-4">
                                    {score >= 8 ? 'Tuyệt vời! 🎉' :
                                        score >= 6 ? 'Khá tốt! 👍' :
                                            'Hãy thử lại! 💪'}
                                </div>
                                <button
                                    onClick={() => {
                                        setPhase(GamePhase.TOPIC_GENERATION);
                                        resetGame();
                                    }}
                                    className="w-full bg-[#3E52E8] hover:bg-[#2E42D8] px-6 py-3 rounded-lg font-bold"
                                >
                                    Chơi lại
                                </button>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
