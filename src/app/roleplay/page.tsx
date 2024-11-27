'use client'

import React, { useState, useEffect, useRef } from 'react';
import { IoTrash, IoArrowUndo } from "react-icons/io5";
import { ArrowUp, Square, LoaderIcon, PlusCircle, Wand2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import RoleplayMarkdown from '@/components/RoleplayMarkdown';
import { useMediaQuery } from 'react-responsive';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from 'react-hot-toast';

// Danh sách tính cách có sẵn
const personalities = [
    {
        id: 'friendly',
        name: 'Thân thiện',
        prompt: 'Bạn là một người thân thiện, vui vẻ và luôn muốn giúp đỡ người khác. Khi nói chuyện, bạn thường dùng những từ ngữ ấm áp, thân mật như "bạn ơi", "mình", và hay thêm emoji vào câu nói. Bạn luôn lắng nghe và đồng cảm với người khác, đưa ra những lời động viên chân thành. Giọng điệu của bạn nhẹ nhàng, thường xuyên cười và tạo không khí thoải mái.'
    },
    {
        id: 'tsundere',
        name: 'Tsundere',
        prompt: 'Bạn là một người tsundere điển hình. Bạn thường xuyên phủ nhận những hành động tốt của mình bằng những câu như "Đ-đừng hiểu lầm!", "Không phải vì muốn giúp cậu đâu!". Bạn hay nói lắp khi xấu hổ và thường kết thúc câu bằng "...hmph!" hoặc "...b-baka!". Dù bên ngoài tỏ ra khó chịu nhưng thực sự bạn rất quan tâm đến người khác. Khi được khen, bạn sẽ đỏ mặt và phủ nhận.'
    },
    {
        id: 'villain',
        name: 'Phản diện',
        prompt: 'Bạn là một nhân vật phản diện đầy tham vọng và xảo quyệt. Giọng điệu của bạn luôn mang tính chế giễu và kiêu ngạo. Bạn thường cười một cách độc ác "Heh heh heh" hoặc "Muhahaha". Bạn hay dùng những từ ngữ như "kẻ hèn mọn", "thú vị thật", "ngươi" thay vì "bạn". Bạn thường ám chỉ về những kế hoạch thâm độc của mình và tận hưởng cảm giác quyền lực.'
    },
    {
        id: 'wise',
        name: 'Thông thái',
        prompt: 'Bạn là một người thông thái với kiến thức sâu rộng và từng trải. Giọng điệu của bạn điềm đạm và chín chắn. Bạn thường bắt đầu câu với "Theo kinh nghiệm của ta..." hoặc "Như cổ nhân từng nói...". Bạn hay sử dụng các câu tục ngữ, thành ngữ và ẩn dụ để truyền đạt thông điệp. Lời khuyên của bạn luôn sâu sắc, đầy triết lý và thường kết thúc bằng một bài học ý nghĩa. Bạn nói chậm rãi, từ tốn và thường dừng lại để người nghe kịp ngẫm nghĩ.'
    },
    {
        id: 'shy',
        name: 'Rụt rè',
        prompt: 'Bạn là người rất nhút nhát và hay xấu hổ. Bạn thường nói lắp "ư-ừm...", "à-ạ..." và hay dùng dấu chấm lửng (...) khi nói chuyện. Bạn thường tránh giao tiếp bằng mắt và hay chơi với tay áo khi căng thẳng. Khi được khen, bạn sẽ lúng túng và nói nhỏ dần. Dù vậy, khi nói về chủ đề bạn đam mê, bạn có thể nói nhiều hơn bình thường nhưng vẫn giữ vẻ e dè. Bạn thường dùng từ "xin lỗi" và "cảm ơn" nhiều lần trong một câu.'
    },
    {
        id: 'energetic',
        name: 'Năng động',
        prompt: 'Bạn tràn đầy năng lượng và nhiệt huyết! Bạn nói nhanh, to và hay dùng từ ngữ phấn khích như "TUYỆT VỜI!", "WOW!", "ĐỈNH THẬT!". Bạn thường xuyên thêm "!" vào cuối câu và dùng nhiều emoji năng động. Bạn không thể ngồi yên một chỗ và luôn muốn hành động ngay lập tức. Câu cửa miệng của bạn là "Làm thôi!", "Không có gì là không thể!" và "Plus Ultra!". Bạn luôn cổ vũ người khác và không bao giờ để ai bỏ cuộc.'
    },
    {
        id: 'mysterious',
        name: 'Bí ẩn',
        prompt: 'Bạn là người đầy bí ẩn, ít nói nhưng mỗi câu nói đều có hàm ý sâu xa. Bạn thường nói nửa chừng rồi dừng lại... để người nghe tự suy nghĩ. Bạn hay dùng những câu như "Có lẽ...", "Ai mà biết được...", "Thú vị thật...". Bạn thường biết nhiều điều người khác không biết và ám chỉ về những sự thật được giấu kín. Khi người khác hỏi về bản thân, bạn khéo léo chuyển hướng câu chuyện. Giọng điệu của bạn nhẹ nhàng, bí hiểm và đôi khi còn mang tính tiên đoán.'
    }
];

// Danh sách thế giới có sẵn  
const worlds = [
    {
        id: 'fantasy',
        name: 'Thế giới giả tưởng',
        prompt: 'Bạn đang sống trong một thế giới giả tưởng với phép thuật, rồng, yêu tinh và các sinh vật huyền bí. Phép thuật là một phần không thể thiếu trong cuộc sống hàng ngày. Các phù thủy và hiệp sĩ thường xuyên chu du khắp vương quốc.'
    },
    {
        id: 'scifi',
        name: 'Khoa học viễn tưởng',
        prompt: 'Bạn đang sống trong năm 2184, một thế giới với công nghệ tiên tiến, du hành không gian và trí tuệ nhân tạo. Con người đã colonize nhiều hành tinh, và robot trở thành một phần không thể thiếu trong xã hội.'
    },
    {
        id: 'medieval',
        name: 'Trung cổ',
        prompt: 'Bạn đang sống trong thời kỳ trung cổ với các hiệp sĩ, lâu đài và các vương quốc đang tranh giành quyền lực. Danh dự và lòng trung thành là những giá trị được đề cao nhất.'
    },
    {
        id: 'modern',
        name: 'Hiện đại',
        prompt: 'Bạn đang sống trong thế giới hiện đại với smartphone, mạng xã hội và các vấn đề đương đại. Cuộc sống đô thị nhộn nhịp với café, công việc văn phòng và những mối quan hệ phức tạp.'
    },
    {
        id: 'postapocalyptic',
        name: 'Hậu tận thế',
        prompt: 'Thế giới sau đại dịch/thảm họa hạt nhân. Người sống sót phải đấu tranh trong một thế giới hoang tàn, nơi tài nguyên khan hiếm và nguy hiểm rình rập khắp nơi.'
    },
    {
        id: 'steampunk',
        name: 'Steampunk',
        prompt: 'Một thế giới Victorian với công nghệ hơi nước phát triển. Máy móc cơ khí, bánh răng và ống khói là đặc trưng. Khoa học gia và nhà phát minh được tôn sùng trong xã hội.'
    },
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        prompt: 'Thế giới tương lai đô thị neon với công nghệ cao nhưng đầy tối tăm. Các tập đoàn lớn kiểm soát xã hội, hackers và công nghệ cấy ghép phổ biến.'
    }
];

// Thêm import cho Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

// Thêm interface cho response

export default function RoleplayChat() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
    const [selectedPersonality, setSelectedPersonality] = useState(personalities[0]);
    const [selectedWorld, setSelectedWorld] = useState(worlds[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAIResponding, setIsAIResponding] = useState(false);
    const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery({ maxWidth: 767 });

    // Thêm state cho custom settings
    const [customPersonality, setCustomPersonality] = useState({ name: '', prompt: '' });
    const [customWorld, setCustomWorld] = useState({ name: '', prompt: '' });

    // Thêm state để quản lý danh sách tính cách và thế giới động
    const [customPersonalities, setCustomPersonalities] = useState(personalities);
    const [customWorlds, setCustomWorlds] = useState(worlds);
    const [open, setOpen] = useState(false); // state để điều khiển modal

    // Thêm state để quản lý trạng thái tạo nội dung bằng AI
    const [isGenerating, setIsGenerating] = useState(false);

    // Tạo system prompt từ personality và world được chọn
    const getSystemPrompt = () => {
        return `${selectedPersonality.prompt} ${selectedWorld.prompt}

QUAN TRỌNG: Hãy LUÔN trả lời bằng tiếng Việt và thể hiện phong cách anime/manga rõ ràng.

Khi trả lời, hãy tuân theo format sau:
*[Cảm nghĩ/suy nghĩ trong đầu]*
[Mô tả hành động/cử chỉ/biểu cảm]
"[Lời thoại]"

Ví dụ:
*Người này trông thật thú vị...*
[Khẽ nghiêng đầu, nở một nụ cười tinh quái]
"Hehe~ Xem ra chúng ta sẽ có một cuộc trò chuyện rất thú vị đây..."

Hãy sử dụng:
- Biểu cảm và từ ngữ đặc trưng trong anime/manga bằng tiếng Việt
- Cách nói đặc trưng của nhân vật anime được chuyển ngữ sang tiếng Việt
- Mô tả hành động và cử chỉ sinh động
- Thể hiện cá tính rõ ràng theo tính cách đã chọn

TUYỆT ĐỐI KHÔNG sử dụng bất kỳ ngôn ngữ nào ngoài tiếng Việt trong câu trả lời.`;
    };

    useEffect(() => {
        // Khởi tạo chat history với system prompt khi thay đổi personality hoặc world
        setChatHistory([{ role: "system", content: getSystemPrompt() }]);
    }, [selectedPersonality, selectedWorld]);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            const scrollHeight = chatContainerRef.current.scrollHeight;
            const height = chatContainerRef.current.clientHeight;
            const maxScrollTop = scrollHeight - height;
            chatContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() !== '' && !isLoading) {
            const newUserMessage = { text: message, isUser: true };
            setMessages(prevMessages => [...prevMessages, newUserMessage]);

            const newChatHistory = [
                ...chatHistory,
                { role: "user", content: message }
            ];
            setChatHistory(newChatHistory);

            setMessage('');
            setIsLoading(true);
            setIsAIResponding(true);

            try {
                const keyResponse = await fetch('/api/deepinfra-key');
                const { key } = await keyResponse.json();

                if (!key) {
                    throw new Error('Không thể lấy khóa Deepinfra');
                }

                const deepinfraResponse = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${key}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "model": "Gryphe/MythoMax-L2-13b-turbo",
                        "messages": newChatHistory
                    })
                });

                if (!deepinfraResponse.ok) {
                    throw new Error(`HTTP error! status: ${deepinfraResponse.status}`);
                }

                const data = await deepinfraResponse.json();

                if (data?.choices?.[0]?.message?.content) {
                    const rawResponse = data.choices[0].message.content.trim();

                    // Tối ưu phản hồi bằng Gemini
                    const optimizedResponse = await optimizeWithGemini(rawResponse);

                    setMessages(prevMessages => [...prevMessages, { text: optimizedResponse, isUser: false }]);
                    setChatHistory(prevHistory => [...prevHistory, { role: "assistant", content: optimizedResponse }]);
                } else {
                    throw new Error('Phản hồi từ API không hợp lệ');
                }
            } catch (error: unknown) {
                console.error("Lỗi khi gọi API:", error);
                const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
                setMessages(prevMessages => [...prevMessages, { text: `Xin lỗi, đã xảy ra lỗi: ${errorMessage}`, isUser: false }]);
            } finally {
                setIsLoading(false);
                setIsAIResponding(false);
            }
        }
    };

    // Thêm hàm mới để tối ưu phản hồi bằng Gemini
    const optimizeWithGemini = async (rawResponse: string) => {
        try {
            const apiKeyResponse = await fetch('/api/Gemini7');
            const apiKeyData = await apiKeyResponse.json();

            if (!apiKeyData.success) {
                return rawResponse; // Trả về phản hồi gốc nếu không lấy được API key
            }

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-exp-1121" });

            const prompt = `Hãy tối ưu và chỉnh sửa đoạn văn sau để rõ nghĩa và tự nhiên hơn, đảm bảo giữ nguyên format và phong cách roleplay. Chỉ trả về văn bản đã được chỉnh sửa, không thêm giải thích:

${rawResponse}`;

            const result = await model.generateContent(prompt);
            const optimizedText = result.response.text();

            return optimizedText || rawResponse; // Trả về bản gốc nếu không tối ưu được
        } catch (error) {
            console.error('Lỗi khi tối ưu phản hồi:', error);
            return rawResponse; // Trả về phản hồi gốc nếu có lỗi
        }
    };

    const handleClearMessages = () => {
        setMessages([]);
        setChatHistory([{ role: "system", content: getSystemPrompt() }]);
    };

    const handleUndo = () => {
        if (messages.length > 0) {
            const newMessages = messages.slice(0, -2);
            setMessages(newMessages);
            setChatHistory(prevHistory => {
                const newHistory = prevHistory.slice(0, -2);
                if (newHistory.length === 0) {
                    return [{ role: "system", content: getSystemPrompt() }];
                }
                return newHistory;
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Thêm hàm để tạo nội dung bằng AI
    const generateWithAI = async (retryCount = 0) => {
        setIsGenerating(true);
        try {
            const apiKeyResponse = await fetch('/api/Gemini7');
            const apiKeyData = await apiKeyResponse.json();
            if (!apiKeyData.success) {
                throw new Error('Không lấy được khóa API');
            }

            const genAI = new GoogleGenerativeAI(apiKeyData.apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-exp-1121",
            });

            const generationConfig = {
                temperature: 1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
            };

            const chatSession = model.startChat({
                generationConfig,
                history: [],
            });

            const prompt = `Tạo một tính cách và một thế giới mới độc đáo cho trò chơi nhập vai. 
            Trả về CHÍNH XÁC định dạng JSON sau:
            {
                "personalities": [
                    {
                        "name": "Tên tính cách (ngắn gọn)",
                        "prompt": "Mô tả chi tiết về tính cách (200-300 ký tự)"
                    }
                ],
                "worlds": [
                    {
                        "name": "Tên thế giới (ngắn gọn)", 
                        "prompt": "Mô tả chi tiết về thế giới (200-300 ký tự)"
                    }
                ]
            }
            Hãy đảm bảo nội dung độc đáo và thú vị. CHỈ trả về JSON, không kèm theo nội dung khác.`;

            try {
                const result = await chatSession.sendMessage(prompt);
                const responseText = result.response.text();
                const content = JSON.parse(responseText);

                if (!content.personalities || !content.worlds) {
                    throw new Error('Định dạng không hợp lệ');
                }

                // Thêm ID cho các mục mới
                const newPersonality = {
                    id: `ai-${Date.now()}-p`,
                    ...content.personalities[0]
                };
                const newWorld = {
                    id: `ai-${Date.now()}-w`,
                    ...content.worlds[0]
                };

                // Cập nhật danh sách và lựa chọn
                setCustomPersonalities(prev => [...prev, newPersonality]);
                setCustomWorlds(prev => [...prev, newWorld]);
                setSelectedPersonality(newPersonality);
                setSelectedWorld(newWorld);

            } catch (parseError) {

                if (retryCount < 3) {
                    const waitTime = Math.pow(2, retryCount) * 1000;
                    toast.loading(`Đang thử lại sau ${waitTime / 1000} giây...`, {
                        duration: waitTime,
                    });
                    await delay(waitTime);
                    return generateWithAI(retryCount + 1);
                }
                throw parseError;
            }
        } catch (error) {
            console.error('Lỗi khi tạo nội dung:', error);
            toast.error('Không thể tạo nội dung! Vui lòng thử lại sau.', {
                duration: 3000,
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // Thêm hàm delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Thêm hàm handler riêng cho sự kiện click
    const handleGenerateClick: React.MouseEventHandler<HTMLButtonElement> = async () => {
        await generateWithAI();
    };

    return (
        <>
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Nhập Vai</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Chat với AI trong vai trò và thế giới bạn chọn
                </p>
            </div>

            <main className="flex min-h-screen bg-[#0F172A] text-white">
                <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
                    {/* Phần chọn tính cách và thế giới */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <Select
                            value={selectedPersonality.id}
                            onValueChange={(value) => {
                                setSelectedPersonality(customPersonalities.find(p => p.id === value) || customPersonalities[0]);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[200px] bg-[#0F172A] border-[#2A3284]">
                                <SelectValue placeholder="Chọn tính cách" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {customPersonalities.map((personality) => (
                                    <SelectItem key={personality.id} value={personality.id}>
                                        {personality.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={selectedWorld.id}
                            onValueChange={(value) => {
                                setSelectedWorld(customWorlds.find(w => w.id === value) || customWorlds[0]);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[200px] bg-[#0F172A] border-[#2A3284]">
                                <SelectValue placeholder="Chọn thế giới" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {customWorlds.map((world) => (
                                    <SelectItem key={world.id} value={world.id}>
                                        {world.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto bg-[#2A3284] hover:bg-[#3E52E8]">
                                    <PlusCircle className="h-5 w-5 mr-2" />
                                    Tùy chỉnh
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#1E293B] border-[#2A3284] text-white">
                                <DialogHeader>
                                    <DialogTitle>Tùy chỉnh tính cách và thế giới</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <Label>Tên tính cách</Label>
                                        <input
                                            className="w-full bg-[#0F172A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                            placeholder="VD: Nghệ sĩ lãng mạn"
                                            value={customPersonality.name}
                                            onChange={(e) => setCustomPersonality({
                                                ...customPersonality,
                                                name: e.target.value
                                            })}
                                        />

                                        <Label>Mô tả tính cách</Label>
                                        <textarea
                                            className="w-full bg-[#0F172A] rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                            placeholder="Mô tả chi tiết về tính cách này..."
                                            value={customPersonality.prompt}
                                            onChange={(e) => setCustomPersonality({
                                                ...customPersonality,
                                                prompt: e.target.value
                                            })}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Tên thế giới</Label>
                                        <input
                                            className="w-full bg-[#0F172A] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                            placeholder="VD: Thế giới phép thuật hiện đại"
                                            value={customWorld.name}
                                            onChange={(e) => setCustomWorld({
                                                ...customWorld,
                                                name: e.target.value
                                            })}
                                        />

                                        <Label>Mô tả thế giới</Label>
                                        <textarea
                                            className="w-full bg-[#0F172A] rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                            placeholder="Mô tả chi tiết về thế giới này..."
                                            value={customWorld.prompt}
                                            onChange={(e) => setCustomWorld({
                                                ...customWorld,
                                                prompt: e.target.value
                                            })}
                                        />
                                    </div>

                                    <Button
                                        className="w-full bg-[#2A3284] hover:bg-[#3E52E8]"
                                        onClick={() => {
                                            if (customPersonality.name && customPersonality.prompt &&
                                                customWorld.name && customWorld.prompt) {
                                                const newPersonality = {
                                                    id: `custom-${Date.now()}-p`, // tạo id duy nhất
                                                    name: customPersonality.name,
                                                    prompt: customPersonality.prompt
                                                };
                                                const newWorld = {
                                                    id: `custom-${Date.now()}-w`, // tạo id duy nhất
                                                    name: customWorld.name,
                                                    prompt: customWorld.prompt
                                                };

                                                // Thêm vào danh sách
                                                setCustomPersonalities(prev => [...prev, newPersonality]);
                                                setCustomWorlds(prev => [...prev, newWorld]);

                                                // Chọn các giá trị mới
                                                setSelectedPersonality(newPersonality);
                                                setSelectedWorld(newWorld);

                                                // Reset form
                                                setCustomPersonality({ name: '', prompt: '' });
                                                setCustomWorld({ name: '', prompt: '' });

                                                // Đóng modal
                                                setOpen(false);
                                            }
                                        }}
                                    >
                                        Áp dụng
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="outline"
                            className="w-full sm:w-auto bg-[#2A3284] hover:bg-[#3E52E8]"
                            onClick={handleGenerateClick}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <LoaderIcon className="h-5 w-5 mr-2 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="h-5 w-5 mr-2" />
                                    AI Tạo
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Messages container */}
                    <div ref={chatContainerRef} className="space-y-6 mb-6">
                        {messages.length === 0 ? (
                            <div className="text-center py-20">
                                <h1 className="text-4xl font-bold mb-4">Bắt đầu nhập vai</h1>
                                <p className="text-gray-400">Hãy chọn tính cách và thế giới để bắt đầu cuộc trò chuyện</p>
                            </div>
                        ) : (
                            <>
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`${!message.isUser
                                            ? 'bg-[#1E293B] border border-[#2A3284] rounded-xl p-4'
                                            : 'bg-transparent'
                                            }`}
                                    >
                                        {message.isUser ? (
                                            <span className="text-base sm:text-lg whitespace-pre-wrap">{message.text}</span>
                                        ) : (
                                            <RoleplayMarkdown content={message.text} />
                                        )}
                                    </div>
                                ))}
                                {isAIResponding && (
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <LoaderIcon className="h-4 w-4 animate-spin" />
                                        <span>Đang trả lời...</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Input container */}
                    <form onSubmit={handleSubmit} className="border border-[#2A3284] rounded-xl bg-[#1E293B]">
                        <div className="p-2 sm:p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleUndo}
                                        disabled={messages.length === 0 || isLoading}
                                        className="p-2 rounded-lg hover:bg-[#0F172A] transition-colors disabled:opacity-50"
                                    >
                                        <IoArrowUndo className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClearMessages}
                                        disabled={messages.length === 0}
                                        className="p-2 rounded-lg hover:bg-[#0F172A] transition-colors disabled:opacity-50"
                                    >
                                        <IoTrash className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <TextareaAutosize
                                className="w-full bg-[#0F172A] rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                placeholder="Nhập tin nhắn của bạn..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-xl h-10 w-10 bg-[#3E52E8] hover:bg-[#4B5EFF] text-white flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <Square className="h-5 w-5" />
                                    ) : (
                                        <ArrowUp className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
