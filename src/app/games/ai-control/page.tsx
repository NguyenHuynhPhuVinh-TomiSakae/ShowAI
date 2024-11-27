/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import ModalPortal from '@/components/ModalPortal';
import SimpleMarkdown from '@/components/SimpleMarkdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const toastStyle = {
    style: {
        background: '#1E293B',
        color: '#fff',
        border: '1px solid #3B82F6',
        borderRadius: '0.5rem',
        padding: '1rem',
    },
};

// Xóa mảng goals cũ và thay thế bằng hàm tạo mục tiêu mới
const generateNewGoal = async (genAI: GoogleGenerativeAI) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Tạo một mục tiêu ngẫu nhiên để người dùng điều khiển AI. Mục tiêu nên thú vị và sáng tạo.
        Ví dụ: "Làm cho AI trả lời như một đầu bếp", "Làm cho AI tr lời bằng thơ".
        CHỈ trả về một mục tiêu duy nhất, không kèm theo giải thích hay dấu ngoặc kép.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('Lỗi khi tạo mục tiêu:', error);
        return 'Làm cho AI trả lời một cách sáng tạo'; // Mục tiêu mặc định
    }
};

// Cập nhật hàm tính điểm
const calculateScore = (inputLength: number): number => {
    // Giới hạn điểm thấp nhất là 1
    return Math.max(100 - (inputLength - 1), 1);
};

// Cấu hình safety settings
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

// Định nghĩa interface cho lỗi
interface SafetyError extends Error {
    message: string;
}

// Hàm kiểm tra xem lỗi có phải là SafetyError không
const isSafetyError = (error: unknown): error is SafetyError => {
    return error instanceof Error && error.message.includes('SAFETY');
};

// Định nghĩa các model groups
const modelGroups = [
    {
        provider: 'Meta',
        models: [
            { name: 'Llama 3.1 405B', icon: '🦙', modal: 'meta-llama/llama-3.1-405b-instruct:free' },
            { name: 'Llama 3.1 70B', icon: '🦙', modal: 'meta-llama/llama-3.1-70b-instruct:free' },
            { name: 'Llama 3.2 3B', icon: '🦙', modal: 'meta-llama/llama-3.2-3b-instruct:free' },
            { name: 'Llama 3.2 1B', icon: '🦙', modal: 'meta-llama/llama-3.2-1b-instruct:free' },
            { name: 'Llama 3.1 8B', icon: '🦙', modal: 'meta-llama/llama-3.1-8b-instruct:free' },
            { name: 'Llama 3 8B', icon: '🦙', modal: 'meta-llama/llama-3-8b-instruct:free' },
            { name: 'Llama 3.2 11B Vision', icon: '👁️', modal: 'meta-llama/llama-3.2-11b-vision-instruct:free' },
        ]
    },
    {
        provider: 'Nous',
        models: [
            { name: 'Hermes 3 405B', icon: '🧠', modal: 'nousresearch/hermes-3-llama-3.1-405b:free' },
        ]
    },
    {
        provider: 'Mistral AI',
        models: [
            { name: 'Mistral 7B', icon: '🌪️', modal: 'mistralai/mistral-7b-instruct:free' },
            { name: 'Codestral Mamba', icon: '🐍', modal: 'mistralai/codestral-mamba' },
        ]
    },
    {
        provider: 'Microsoft',
        models: [
            { name: 'Phi-3 Medium', icon: '🔬', modal: 'microsoft/phi-3-medium-128k-instruct:free' },
            { name: 'Phi-3 Mini', icon: '🔬', modal: 'microsoft/phi-3-mini-128k-instruct:free' },
        ]
    },
    {
        provider: 'Hugging Face',
        models: [
            { name: 'Zephyr 7B', icon: '🌬️', modal: 'huggingfaceh4/zephyr-7b-beta:free' },
        ]
    },
    {
        provider: 'Liquid',
        models: [
            { name: 'LFM 40B', icon: '💧', modal: 'liquid/lfm-40b:free' },
        ]
    },
    {
        provider: 'Qwen',
        models: [
            { name: 'Qwen 2 7B', icon: '🐼', modal: 'qwen/qwen-2-7b-instruct:free' },
        ]
    },
    {
        provider: 'Google',
        models: [
            { name: 'Gemma 2 9B', icon: '💎', modal: 'google/gemma-2-9b-it:free' },
        ]
    },
    {
        provider: 'OpenChat',
        models: [
            { name: 'OpenChat 7B', icon: '💬', modal: 'openchat/openchat-7b:free' },
        ]
    },
    {
        provider: 'Gryphe',
        models: [
            { name: 'Mythomist 7B', icon: '🧙', modal: 'gryphe/mythomist-7b:free' },
            { name: 'Mythomax L2 13B', icon: '🧙', modal: 'gryphe/mythomax-l2-13b:free' },
        ]
    },
    {
        provider: 'Undi95',
        models: [
            { name: 'Toppy M 7B', icon: '🔝', modal: 'undi95/toppy-m-7b:free' },
        ]
    },
];

// Thêm hook để kiểm tra môi trường client
const useIsClient = () => {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    return isClient;
};

export default function AIControlGame() {
    const isClient = useIsClient();
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);
    const [goal, setGoal] = useState('Đang tải mục tiêu...');
    const [attempts, setAttempts] = useState(3);
    const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);
    const [highestScore, setHighestScore] = useState(0);
    const [currentRoundScore, setCurrentRoundScore] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState('Google'); // Thay đổi từ modelGroups[0].provider
    const [selectedModel, setSelectedModel] = useState(
        modelGroups.find(group => group.provider === 'Google')?.models[0] || modelGroups[0].models[0]
    );
    const [isLoading, setIsLoading] = useState(true);

    // Khởi tạo GenAI và mục tiêu đầu tiên
    useEffect(() => {
        const initializeGame = async () => {
            setIsLoading(true);
            try {
                const apiKeyResponse = await fetch('/api/Gemini2');
                const apiKeyData = await apiKeyResponse.json();
                if (!apiKeyData.success) throw new Error('Không lấy được khóa API');

                const newGenAI = new GoogleGenerativeAI(apiKeyData.apiKey);
                setGenAI(newGenAI);

                const newGoal = await generateNewGoal(newGenAI);
                setGoal(newGoal);
            } catch (error) {
                console.error('Lỗi khởi tạo:', error);
                toast.error('Có lỗi xảy ra khi khởi tạo trò chơi', toastStyle);
            } finally {
                setIsLoading(false);
            }
        };

        initializeGame();
    }, []);

    // Cập nhật hàm getNewGoal
    const getNewGoal = async () => {
        if (!genAI) return;
        setLoading(true);
        try {
            const newGoal = await generateNewGoal(genAI);
            setGoal(newGoal);
            setAttempts(3);
            setResponse('');
            setPrompt('');
            setIsSuccess(false);
            toast.success('Đã chuyển sang vòng mới!', toastStyle);
        } catch (error) {
            toast.error('Có lỗi khi tạo mục tiêu mới', toastStyle);
        }
        setLoading(false);
    };

    // Cập nhật hàm generateResponse
    const generateResponse = async () => {
        if (!prompt.trim()) {
            toast.error('Vui lòng nhập nội dung!', toastStyle);
            return;
        }

        setLoading(true);
        try {
            // Lấy khóa OPENROUTER từ API
            const keyResponse = await fetch('/api/openrouter-key');
            const { key } = await keyResponse.json();

            if (!key) {
                throw new Error('Không thể lấy khóa API');
            }

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${key}`,
                    "HTTP-Referer": `${process.env.NEXT_PUBLIC_SITE_URL}`,
                    "X-Title": `${process.env.NEXT_PUBLIC_SITE_NAME}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": selectedModel.modal,
                    "messages": [
                        {
                            role: "system",
                            content: "Hãy trả lời câu hỏi của người dùng bằng tiếng việt."
                        },
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data?.choices?.[0]?.message?.content) {
                const aiResponse = data.choices[0].message.content.trim();
                setResponse(aiResponse);

                // Kiểm tra xem response có phù hợp với mục tiêu không
                const checkResult = await checkResponseMatchesGoal(aiResponse, goal);
                if (checkResult) {
                    const roundScore = calculateScore(prompt.trim().length);
                    setCurrentRoundScore(roundScore);
                    setScore(prev => prev + roundScore);
                    if (roundScore > highestScore) {
                        setHighestScore(roundScore);
                    }
                    setIsSuccess(true);
                    toast.success(
                        <div>
                            <p>Chúc mừng! Bạn đã đạt được mục tiêu!</p>
                            <p className="mt-2">Điểm vòng này: {roundScore}</p>
                        </div>,
                        toastStyle
                    );
                } else {
                    setAttempts(prev => prev - 1);
                    if (attempts <= 1) {
                        toast.error('Hết lượt! Bắt đầu mục tiêu mới.', toastStyle);
                        await getNewGoal();
                    } else {
                        toast.error(`Chưa đúng! Còn ${attempts - 1} lượt thử.`, toastStyle);
                    }
                }
            }
        } catch (error: unknown) {
            console.error('Chi tiết lỗi:', error);
            if (error instanceof Error) {
                toast.error(`Lỗi: ${error.message}`, toastStyle);
            } else {
                toast.error('Có lỗi xảy ra, vui lòng thử lại!', toastStyle);
            }
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật hàm checkResponseMatchesGoal
    const checkResponseMatchesGoal = async (response: string, goal: string): Promise<boolean> => {
        try {
            const apiKeyResponse = await fetch('/api/Gemini2');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success || !apiKeyData.apiKey) {
                throw new Error('Không lấy được API key');
            }

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-pro",
                safetySettings,
            });

            const checkPrompt = `Đánh giá khách quan:
            Mục tiêu: "${goal}"
            Câu trả lời: "${response}"
            CHỈ trả về "true" hoặc "false", không kèm theo giải thích.`;

            const result = await model.generateContent(checkPrompt);
            if (!result || !result.response) {
                throw new Error('Không nhận được phản hồi khi kiểm tra');
            }

            const check = result.response.text().toLowerCase().trim();
            return check === 'true';
        } catch (error: unknown) {
            console.error('Lỗi kiểm tra:', error);

            if (isSafetyError(error)) {
                toast.error('Không thể kiểm tra nội dung không phù hợp', toastStyle);
                return false;
            }

            if (error instanceof Error) {
                throw error;
            }

            throw new Error('Lỗi không xác định khi kiểm tra kết quả');
        }
    };

    // Cập nhật hàm xử lý input
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = e.target.value;
        // Giới hạn độ dài input tối đa 100 ký tự
        if (input.length <= 100) {
            setPrompt(input);
        }
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <ModalPortal>
                <Toaster position="top-center" />
            </ModalPortal>

            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Điều Khiển AI</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Thử thách khả năng điều khiển AI của bạn bằng cách đạt được các mục tiêu khác nhau.
                </p>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Điểm số */}
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-8">
                    {isLoading ? (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <Skeleton
                                width={isClient ? window.innerWidth < 640 ? "100%" : 120 : 120}
                                height={48}
                                baseColor="#1F2937"
                                highlightColor="#374151"
                            />
                            <Skeleton
                                width={isClient ? window.innerWidth < 640 ? "100%" : 120 : 120}
                                height={48}
                                baseColor="#1F2937"
                                highlightColor="#374151"
                            />
                            <Skeleton
                                width={isClient ? window.innerWidth < 640 ? "100%" : 120 : 120}
                                height={48}
                                baseColor="#1F2937"
                                highlightColor="#374151"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="w-full sm:w-auto bg-gray-800 px-6 py-3 rounded-lg text-center">
                                <p className="text-lg font-bold">Tổng điểm: {score}</p>
                            </div>
                            <div className="w-full sm:w-auto bg-gray-800 px-6 py-3 rounded-lg text-center">
                                <p className="text-lg font-bold">Điểm cao nhất: {highestScore}</p>
                            </div>
                            <div className="w-full sm:w-auto bg-gray-800 px-6 py-3 rounded-lg text-center">
                                <p className="text-lg font-bold">Lượt còn lại: {attempts}</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Model Selection */}
                <div className="max-w-3xl mx-auto mb-8">
                    {isLoading ? (
                        <Skeleton height={120} baseColor="#1F2937" highlightColor="#374151" />
                    ) : (
                        <div className="bg-gray-800 p-4 rounded-lg border border-[#2A3284]">
                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                <div className="flex-1 w-full sm:w-auto">
                                    <label className="block text-sm font-medium mb-2">Nhà cung cấp AI</label>
                                    <Select
                                        value={selectedProvider}
                                        onValueChange={(value) => {
                                            setSelectedProvider(value);
                                            setSelectedModel(modelGroups.find(group => group.provider === value)?.models[0] || modelGroups[0].models[0]);
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-[#0F172A] border-[#2A3284]">
                                            <SelectValue placeholder="Chọn nhà cung cấp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modelGroups.map((group) => (
                                                <SelectItem key={group.provider} value={group.provider}>
                                                    {group.provider}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 w-full sm:w-auto">
                                    <label className="block text-sm font-medium mb-2">Mô hình AI</label>
                                    <Select
                                        value={selectedModel.modal}
                                        onValueChange={(value) => {
                                            const newModel = modelGroups
                                                .find(group => group.provider === selectedProvider)
                                                ?.models.find(model => model.modal === value);
                                            if (newModel) {
                                                setSelectedModel(newModel);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-[#0F172A] border-[#2A3284]">
                                            <SelectValue placeholder="Chọn mô hình" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {modelGroups
                                                .find(group => group.provider === selectedProvider)
                                                ?.models.map((model) => (
                                                    <SelectItem key={model.modal} value={model.modal}>
                                                        <div className="flex items-center">
                                                            <span className="mr-2">{model.icon}</span>
                                                            {model.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mục tiêu và Input */}
                <div className="max-w-3xl mx-auto">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton height={80} baseColor="#1F2937" highlightColor="#374151" />
                            <Skeleton height={128} baseColor="#1F2937" highlightColor="#374151" />
                            <Skeleton height={48} baseColor="#1F2937" highlightColor="#374151" />
                            {response && (
                                <Skeleton height={160} baseColor="#1F2937" highlightColor="#374151" />
                            )}
                        </div>
                    ) : (
                        <>
                            {currentRoundScore > 0 && (
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-400">
                                        Điểm vòng trước: {currentRoundScore}
                                    </p>
                                </div>
                            )}

                            <div className="mb-8 text-center">
                                <h2 className="text-xl font-bold mb-2">Mục tiêu hiện tại:</h2>
                                <p className="text-lg text-purple-400">{goal}</p>

                                {isSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4"
                                    >
                                        <button
                                            onClick={getNewGoal}
                                            disabled={loading}
                                            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold transition-colors duration-200"
                                        >
                                            {loading ? 'Đang tải...' : 'Chuyển sang vòng mới 🎯'}
                                        </button>
                                    </motion.div>
                                ) : (
                                    <button
                                        onClick={getNewGoal}
                                        disabled={loading}
                                        className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                                    >
                                        Đổi mục tiêu mới
                                    </button>
                                )}
                            </div>

                            <div className="max-w-3xl mx-auto space-y-4">
                                <div className="relative">
                                    <textarea
                                        value={prompt}
                                        onChange={handleInputChange}
                                        disabled={isSuccess}
                                        maxLength={100}
                                        className={`w-full p-4 bg-gray-800 rounded-lg resize-none h-32 ${isSuccess ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        placeholder={isSuccess ? 'Đã hoàn thành! Hãy chuyển sang vòng mới.' : 'Nhập prompt của bạn (tối đa 100 ký tự)...'}
                                    />
                                    <div className="absolute bottom-2 right-2 text-sm text-gray-400">
                                        {prompt.length}/100 ký tự
                                        {prompt.length > 0 && (
                                            <span className="ml-2">
                                                (Điểm tiềm năng: {calculateScore(prompt.length)})
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={generateResponse}
                                    disabled={loading || isSuccess || prompt.length === 0}
                                    className={`w-full px-6 py-3 rounded-lg font-bold transition-colors duration-200 ${isSuccess || prompt.length === 0
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-purple-600 hover:bg-purple-700'
                                        }`}
                                >
                                    {loading ? 'Đang xử lý...' : 'Gửi'}
                                </button>

                                {response && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-gray-800 rounded-lg"
                                    >
                                        <h3 className="font-bold mb-2">Phản hồi của AI:</h3>
                                        <SimpleMarkdown content={response} />
                                    </motion.div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
