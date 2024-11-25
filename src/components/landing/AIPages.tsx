'use client';

import { motion } from 'framer-motion';
import { FaRobot, FaCode, FaComments, FaTheaterMasks } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const pages = [
    {
        icon: <FaComments className="w-12 h-12" />,
        title: "Trò Chuyện",
        description: "Chat với AI đa dạng mô hình, hỗ trợ hình ảnh và tối ưu cho tiếng Việt.",
        features: ["Nhiều mô hình AI", "Hỗ trợ hình ảnh", "Tối ưu tiếng Việt"],
        path: "/chatbox",
        color: "text-blue-400",
        bgGlow: "before:bg-blue-500/10"
    },
    {
        icon: <FaCode className="w-12 h-12" />,
        title: "Tạo Mã",
        description: "Tạo và chỉnh sửa code thông minh với AI, tích hợp preview trực tiếp.",
        features: ["Tạo code tự động", "Preview trực tiếp", "Nhiều template"],
        path: "/codebox",
        color: "text-emerald-400",
        bgGlow: "before:bg-emerald-500/10"
    },
    {
        icon: <FaTheaterMasks className="w-12 h-12" />,
        title: "Nhập Vai",
        description: "Trò chuyện với AI trong các vai diễn và thế giới khác nhau.",
        features: ["Đa dạng tính cách", "Thế giới phong phú", "Tương tác thú vị"],
        path: "/roleplay",
        color: "text-purple-400",
        bgGlow: "before:bg-purple-500/10"
    },
    {
        icon: <FaRobot className="w-12 h-12" />,
        title: "Học Tập",
        description: "Tạo câu hỏi và bài tập với AI để học tập hiệu quả hơn.",
        features: ["Nhiều loại câu hỏi", "Giải thích chi tiết", "Tùy chỉnh chủ đề"],
        path: "/study",
        color: "text-rose-400",
        bgGlow: "before:bg-rose-500/10"
    }
];

export default function AIPages() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    return (
        <div className="relative bg-[#0F172A] py-24 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent 
                        bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        Khám Phá Các Tính Năng AI
                    </h2>
                    <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
                        Trải nghiệm sức mạnh của AI trong nhiều lĩnh vực khác nhau
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {pages.map((page, index) => (
                        <motion.div
                            key={page.title}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1
                            }}
                        >
                            <div
                                onClick={() => handleNavigate(page.path)}
                                className={`group relative overflow-hidden rounded-2xl 
                                    before:absolute before:inset-0 
                                    before:transition-all before:duration-500
                                    before:blur-3xl before:opacity-0 before:-z-10
                                    hover:before:opacity-100 ${page.bgGlow}
                                    bg-gradient-to-br from-gray-900 to-gray-800
                                    border border-gray-800 hover:border-gray-700
                                    transition-all duration-300 p-12
                                    cursor-pointer`}
                            >
                                <div className="flex flex-col h-full">
                                    <div className={`${page.color} mb-8 transform group-hover:scale-110 
                                        transition-transform duration-300 p-4`}>
                                        {page.icon}
                                    </div>

                                    <h3 className={`text-2xl font-bold mb-4 ${page.color}`}>
                                        {page.title}
                                    </h3>

                                    <p className="text-gray-300 text-lg mb-8 flex-grow">
                                        {page.description}
                                    </p>

                                    <div className="space-y-3">
                                        {page.features.map((feature) => (
                                            <div key={feature}
                                                className="flex items-center space-x-3 text-gray-400
                                                group-hover:text-gray-300 transition-colors duration-300"
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${page.color.replace('text', 'bg')}`} />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`mt-8 inline-flex items-center ${page.color} 
                                        group-hover:translate-x-2 transition-transform duration-300`}
                                    >
                                        <span className="font-semibold">Khám phá ngay</span>
                                        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}