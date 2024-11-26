import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { useMediaQuery } from 'react-responsive';

const AIPowered = () => {
    const [activeImage, setActiveImage] = useState<number | null>(null);
    const isDesktop = useMediaQuery({ minWidth: 1024 });

    return (
        <div className="relative bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] py-20 overflow-hidden">
            {/* Background decoration - chỉ hiển thị trên desktop */}
            {isDesktop && (
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute left-0 top-0 w-full h-full bg-[url('/grid.svg')] opacity-5" />
                    <div className="absolute left-0 top-0 w-full h-full">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#3E52E8]/20 to-transparent" />
                        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
                        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#3E52E8]/20 to-transparent" />
                    </div>
                    <div className="absolute -left-1/4 top-1/4 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
                </div>
            )}

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Nội dung bên trái */}
                    <motion.div
                        initial={isDesktop ? { opacity: 0, x: -50 } : { opacity: 0 }}
                        whileInView={isDesktop ? { opacity: 1, x: 0 } : { opacity: 1 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: isDesktop ? 0.5 : 0.3 }}
                        className="lg:w-1/2 space-y-6"
                    >
                        <div className="relative">
                            <div className="absolute -left-4 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#3E52E8] to-transparent" />
                            <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                                Dự Án Được Tạo Bởi{' '}
                                <span className="relative">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                        AI & Cursor
                                    </span>
                                    <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg"></span>
                                </span>
                            </h2>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-4 h-full w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
                            <p className="text-gray-300 text-lg pl-2 border-l-2 border-purple-500/50
                                          shadow-[0_0_15px_rgba(168,85,247,0.1)] backdrop-blur-sm">
                                ShowAI là một dự án độc đáo được phát triển với sự hỗ trợ của công nghệ AI tiên tiến,
                                sử dụng Cursor - IDE thông minh tích hợp AI để tối ưu hóa quá trình phát triển.
                            </p>
                        </div>

                        <div className="space-y-4 relative">
                            {[
                                {
                                    icon: "🤖",
                                    title: "98% Code Được Tạo bởi AI",
                                    description: "Tận dụng sức mạnh của AI để tự động hóa quá trình viết code, tối ưu hóa hiệu suất và giảm thiểu lỗi.",
                                    codeSnippet: "Ctrl + L để mở thanh bên",
                                    video: "/cursor1.mp4"
                                },
                                {
                                    icon: "⚡",
                                    title: "Phát Triển Nhanh Chóng",
                                    description: "Rút ngắn thời gian phát triển đáng kể nhờ khả năng tự động hoàn thiện và gợi ý code thông minh của Cursor.",
                                    codeSnippet: "Ctrl + K để chỉnh sửa 1 phần code",
                                    video: "/cursor2.mp4"
                                },
                                {
                                    icon: "✨",
                                    title: "Chất Lượng Đảm Bảo",
                                    description: "AI giúp đảm bảo code tuân thủ các tiêu chuẩn chất lượng cao và best practices trong phát triển web.",
                                    codeSnippet: "Ctrl + I để mở hộp thoại làm việc trên dự án",
                                    video: "/cursor3.mp4"
                                }
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={isDesktop ? { opacity: 0, x: -20 } : { opacity: 0 }}
                                    whileInView={isDesktop ? { opacity: 1, x: 0 } : { opacity: 1 }}
                                    transition={{ delay: isDesktop ? index * 0.2 : 0.1 }}
                                    className="group relative"
                                    onMouseEnter={() => {
                                        if (isDesktop) {
                                            setActiveImage(index);
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        if (isDesktop) {
                                            setActiveImage(null);
                                        }
                                    }}
                                >
                                    {/* Đường kẻ dẫn - chỉ hiển thị trên desktop */}
                                    {isDesktop && activeImage === index && (
                                        <div className="absolute right-0 top-1/2 w-24 h-px bg-gradient-to-r from-[#3E52E8] to-purple-500" />
                                    )}

                                    <div className={`bg-gradient-to-r from-[#1E293B]/90 to-[#0F172A]/90 
                                             rounded-lg p-4 border border-[#3E52E8]/30 
                                             ${isDesktop ? 'hover:border-[#3E52E8]/70 hover:bg-[#1E293B] transition-all duration-300' : ''}
                                             shadow-lg shadow-[#0F172A]/50`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-12 h-12 rounded-lg bg-[#3E52E8]/20 flex items-center justify-center flex-shrink-0
                                                          border border-[#3E52E8]/30 
                                                          ${isDesktop ? 'group-hover:bg-[#3E52E8]/30 group-hover:border-[#3E52E8]/50 transition-colors duration-300' : ''}`}>
                                                <span className="text-2xl">{item.icon}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                                                <p className="text-gray-300">{item.description}</p>
                                                <div className="font-mono text-sm bg-[#0F172A] p-2 rounded
                                                              border border-[#3E52E8]/30 group-hover:border-[#3E52E8]/70
                                                              transition-all duration-300 shadow-inner">
                                                    <kbd className="px-2 py-1 bg-[#3E52E8]/20 rounded text-white mr-2
                                                                  border border-[#3E52E8]/30">
                                                        {item.codeSnippet.split(' ')[0]}
                                                    </kbd>
                                                    <span className="text-gray-300">
                                                        {item.codeSnippet.split(' ').slice(1).join(' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Video preview - chỉ hiển thị trên desktop */}
                                    {isDesktop && activeImage === index && (
                                        <div className="absolute left-[calc(100%+6rem)] top-1/2 -translate-y-1/2 z-50 hidden lg:block">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="w-[400px] h-[250px] rounded-lg overflow-hidden border border-[#3E52E8]/50 shadow-lg"
                                            >
                                                <video
                                                    src={item.video}
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    className="w-full h-full object-cover"
                                                />
                                            </motion.div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Phần hình ảnh bên phải */}
                    <motion.div
                        initial={isDesktop ? { opacity: 0, x: 50 } : { opacity: 0 }}
                        whileInView={isDesktop ? { opacity: 1, x: 0 } : { opacity: 1 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: isDesktop ? 0.5 : 0.3 }}
                        className="lg:w-1/2"
                    >
                        <div className={`relative group transition-opacity duration-300 ${activeImage !== null ? 'opacity-0' : 'opacity-100'}`}>
                            {/* Code editor header */}
                            <div className="absolute top-0 left-0 right-0 h-8 bg-[#1E293B] rounded-t-lg
                                          flex items-center px-4 gap-2 border-b border-[#2A3284]">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                </div>
                                <span className="text-xs text-gray-400 ml-2">cursor.ai</span>
                            </div>

                            {/* Hiệu ứng glow - chỉ hiển thị trên desktop */}
                            {isDesktop && (
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 
                                          rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                            )}

                            {/* Khung chứa ảnh */}
                            <div className={`relative bg-[#1E293B] rounded-lg shadow-xl mt-8 
                                            border border-[#3E52E8]/30 
                                            ${isDesktop ? 'group-hover:border-[#3E52E8]/70 transition-all duration-300' : ''}`}>
                                <Image
                                    src="/cursor.png"
                                    alt="Cursor IDE Demo"
                                    width={800}
                                    height={500}
                                    className={`rounded-lg ${isDesktop ? 'opacity-90 group-hover:opacity-100 transition-opacity duration-300' : ''}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A]/60 via-transparent to-transparent rounded-lg"></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AIPowered;