'use client';

import { motion } from 'framer-motion';
import { FaRobot, FaCode, FaComments, FaTheaterMasks } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';

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
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const isMobileOrTablet = useMediaQuery({ maxWidth: 1023 });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    const getAnimationConfig = (index: number) => {
        if (!isDesktop) {
            return {
                initial: { opacity: 0 },
                whileInView: { opacity: 1 },
                transition: { duration: 0.3 }
            };
        }

        return {
            initial: { opacity: 0, y: 50 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.3 },
            transition: {
                duration: 0.5,
                delay: index * 0.1
            }
        };
    };

    return (
        <div className="relative bg-[#0F172A] py-24 min-h-screen">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-full h-full bg-circuit-pattern"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: isDesktop ? 20 : 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: isDesktop ? 0.5 : 0.3 }}
                    className="text-center mb-16"
                >
                    <div className="relative inline-block">
                        {!isMobileOrTablet && (
                            <>
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                        scale: [1, 1.2, 1],
                                        borderWidth: ["2px", "3px", "2px"]
                                    }}
                                    transition={{
                                        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 2, repeat: Infinity },
                                        borderWidth: { duration: 2, repeat: Infinity }
                                    }}
                                    className="absolute -left-8 -top-8 w-6 h-6 border-l-2 border-t-2 border-indigo-400/50"
                                ></motion.div>
                                <motion.div
                                    animate={{
                                        rotate: -360,
                                        scale: [1, 1.2, 1],
                                        borderWidth: ["2px", "3px", "2px"]
                                    }}
                                    transition={{
                                        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 2, repeat: Infinity, delay: 0.5 },
                                        borderWidth: { duration: 2, repeat: Infinity, delay: 0.5 }
                                    }}
                                    className="absolute -right-8 -top-8 w-6 h-6 border-r-2 border-t-2 border-indigo-400/50"
                                ></motion.div>
                                <motion.div
                                    animate={{
                                        rotate: -360,
                                        scale: [1, 1.2, 1],
                                        borderWidth: ["2px", "3px", "2px"]
                                    }}
                                    transition={{
                                        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 2, repeat: Infinity, delay: 1 },
                                        borderWidth: { duration: 2, repeat: Infinity, delay: 1 }
                                    }}
                                    className="absolute -left-8 -bottom-8 w-6 h-6 border-l-2 border-b-2 border-indigo-400/50"
                                ></motion.div>
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                        scale: [1, 1.2, 1],
                                        borderWidth: ["2px", "3px", "2px"]
                                    }}
                                    transition={{
                                        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 2, repeat: Infinity, delay: 1.5 },
                                        borderWidth: { duration: 2, repeat: Infinity, delay: 1.5 }
                                    }}
                                    className="absolute -right-8 -bottom-8 w-6 h-6 border-r-2 border-b-2 border-indigo-400/50"
                                ></motion.div>
                            </>
                        )}

                        <h2 className="text-4xl sm:text-6xl font-bold text-transparent 
                            bg-gradient-to-r from-indigo-300 via-blue-400 to-indigo-300 bg-clip-text
                            leading-relaxed pb-4 relative z-10
                            [text-shadow:0_0_30px_rgba(99,102,241,0.2)]"
                        >
                            Khám Phá Các Tính Năng AI
                        </h2>

                        {!isMobileOrTablet && (
                            <>
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                        boxShadow: [
                                            "0 0 0 rgba(99,102,241,0.2)",
                                            "0 0 15px rgba(99,102,241,0.4)",
                                            "0 0 0 rgba(99,102,241,0.2)"
                                        ]
                                    }}
                                    transition={{
                                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                                        boxShadow: { duration: 2, repeat: Infinity }
                                    }}
                                    className="absolute -left-12 top-1/2 w-8 h-8 border-2 border-indigo-400/50 rounded-full
                                        before:content-[''] before:absolute before:inset-1 before:border-2 before:border-indigo-400/50 before:rounded-full"
                                ></motion.div>
                                <motion.div
                                    animate={{
                                        rotate: -360,
                                        boxShadow: [
                                            "0 0 0 rgba(99,102,241,0.2)",
                                            "0 0 15px rgba(99,102,241,0.4)",
                                            "0 0 0 rgba(99,102,241,0.2)"
                                        ]
                                    }}
                                    transition={{
                                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                                        boxShadow: { duration: 2, repeat: Infinity, delay: 1 }
                                    }}
                                    className="absolute -right-12 top-1/2 w-8 h-8 border-2 border-indigo-400/50 rounded-full
                                        before:content-[''] before:absolute before:inset-1 before:border-2 before:border-indigo-400/50 before:rounded-full"
                                ></motion.div>
                            </>
                        )}

                        <motion.div
                            animate={{
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute -inset-1 bg-gradient-to-r from-indigo-900/10 via-blue-800/10 to-indigo-900/10 
                                rounded-lg"
                        ></motion.div>
                        <div className="absolute -inset-1 border border-indigo-700/20 rounded-lg"></div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 text-xl text-indigo-200/70 max-w-2xl mx-auto
                            hover:text-indigo-100 transition-all duration-300
                            border-t border-b border-indigo-900/30 py-4
                            relative"
                    >
                        Trải nghiệm sức mạnh của AI trong nhiều lĩnh vực khác nhau
                        <motion.div
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute left-0 top-0 w-12 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
                        ></motion.div>
                        <motion.div
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                            className="absolute right-0 bottom-0 w-12 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"
                        ></motion.div>
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {pages.map((page, index) => (
                        <motion.div
                            key={page.title}
                            {...getAnimationConfig(index)}
                        >
                            <div
                                onClick={() => handleNavigate(page.path)}
                                className={`group relative overflow-hidden rounded-2xl 
                                    bg-[#0F172A]
                                    border-2 border-gray-800/80 hover:border-gray-700
                                    transition-all duration-300 p-8 sm:p-12
                                    cursor-pointer
                                    hover:shadow-[0_0_30px_rgba(62,82,232,0.1)]`}
                            >
                                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#3E52E8]/50
                                    group-hover:border-[#3E52E8] group-hover:animate-pulse"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#3E52E8]/50
                                    group-hover:border-[#3E52E8] group-hover:animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#3E52E8]/50
                                    group-hover:border-[#3E52E8] group-hover:animate-pulse"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#3E52E8]/50
                                    group-hover:border-[#3E52E8] group-hover:animate-pulse"></div>

                                <div className="absolute top-0 left-8 right-8 h-[1px]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3E52E8] to-transparent 
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute h-full w-20 bg-gradient-to-r from-transparent via-white to-transparent 
                                        -left-20 group-hover:left-full transition-all duration-1000 ease-in-out"></div>
                                </div>
                                <div className="absolute bottom-0 left-8 right-8 h-[1px]">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3E52E8] to-transparent 
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute h-full w-20 bg-gradient-to-r from-transparent via-white to-transparent 
                                        -right-20 group-hover:right-full transition-all duration-1000 ease-in-out"></div>
                                </div>

                                <div className="absolute inset-0">
                                    <div className="absolute inset-0 bg-circuit-pattern opacity-10
                                        group-hover:animate-circuit-flow"></div>
                                    <div className="absolute inset-0 bg-grid-pattern opacity-5
                                        group-hover:animate-grid-flow"></div>
                                </div>

                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute h-[200%] w-[50%] bg-gradient-to-b from-transparent via-[#3E52E8]/10 to-transparent
                                        -top-full -left-full rotate-45 group-hover:left-full group-hover:top-full
                                        transition-all duration-1000 ease-in-out"></div>
                                </div>

                                <div className="relative z-10">
                                    <div className={`relative ${page.color} mb-8 p-4
                                        border-2 border-current rounded-full
                                        group-hover:animate-icon-pulse
                                        transition-all duration-300 ease-out
                                        before:absolute before:inset-0 before:rounded-full
                                        ${page.title === "Trò Chuyện" ? `
                                            after:absolute after:w-2 after:h-2 after:rounded-full 
                                            after:bg-current after:top-0 after:right-0
                                            after:animate-ping-slow
                                            before:content-[''] before:absolute before:-inset-4
                                            before:bg-gradient-radial before:from-blue-500/20 before:to-transparent
                                            before:opacity-0 before:group-hover:opacity-100
                                        ` : page.title === "Tạo Mã" ? `
                                            after:absolute after:inset-0 after:rounded-full
                                            after:border-2 after:border-dashed after:border-current
                                            after:animate-spin-slow
                                            before:content-['</>'] before:absolute before:-top-2 before:-right-2
                                            before:text-xs before:opacity-50
                                        ` : page.title === "Nhập Vai" ? `
                                            after:absolute after:inset-0 after:rounded-full
                                            after:border-2 after:border-dashed after:border-current
                                            after:animate-spin-slow
                                            before:content-['🎭'] before:absolute before:-top-2 before:-right-2
                                            before:text-sm before:opacity-70
                                            before:border-2 before:border-dotted before:border-purple-400/30
                                            before:rounded-full
                                            after:content-['</>'] after:absolute after:-bottom-2 after:-left-2
                                            after:text-xs after:opacity-50
                                        ` : page.title === "Học Tập" ? `
                                            after:absolute after:inset-0 after:rounded-full
                                            after:border-2 after:border-double after:border-current
                                            after:animate-pulse
                                            before:content-['✨'] before:absolute before:-top-2 before:-right-2
                                            before:text-sm before:opacity-70
                                            before:border-2 before:border-dashed before:border-rose-400/30
                                            before:rounded-full
                                            after:content-['A+'] after:absolute after:-bottom-2 after:-left-2
                                            after:text-xs after:opacity-50
                                            before:content-[''] before:absolute before:-inset-4
                                            before:bg-gradient-radial before:from-rose-500/20 before:to-transparent
                                            before:opacity-0 before:group-hover:opacity-100
                                            after:content-['📚'] after:absolute after:-top-2 after:-left-2
                                            after:text-sm after:opacity-70
                                            before:border-2 before:border-dotted before:border-rose-400/30
                                            before:rounded-full before:animate-pulse
                                            after:content-['✏️'] after:absolute after:-bottom-2 after:-right-2
                                            after:text-xs after:opacity-50
                                            before:content-[''] before:absolute before:-inset-2
                                            before:border-2 before:border-dashed before:border-rose-400/20
                                            before:rounded-full before:animate-spin-slow
                                            after:content-[''] after:absolute after:-inset-3
                                            after:border-2 after:border-dotted after:border-rose-400/30
                                            after:rounded-full after:animate-reverse-spin
                                        ` : `
                                            after:absolute after:inset-0 after:rounded-full
                                            after:bg-rose-500/20 after:animate-pulse
                                            before:content-['✨'] before:absolute before:-top-2 before:-left-2
                                            before:text-sm before:opacity-70
                                            before:border-2 before:border-dotted before:border-rose-400/30
                                            before:rounded-full before:animate-pulse
                                        `}`}
                                    >
                                        <div className="relative">
                                            {page.icon}
                                        </div>
                                        <div className="absolute top-0 right-0 w-2 h-2 rounded-full 
                                            bg-current opacity-50 group-hover:animate-blink"></div>
                                    </div>

                                    {page.title === "Trò Chuyện" && (
                                        <>
                                            {/* Bong bóng chat nhỏ bay lên */}
                                            {[...Array(3)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ y: 0, opacity: 0 }}
                                                    animate={{
                                                        y: -50,
                                                        opacity: [0, 1, 0],
                                                        scale: [0.8, 1, 0.8]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        delay: i * 0.7,
                                                        repeat: Infinity,
                                                        ease: "easeOut"
                                                    }}
                                                    className={`absolute ${i % 2 === 0 ? 'left-8' : 'right-8'} bottom-12
                                                        w-4 h-4 rounded-tl-lg rounded-tr-lg rounded-br-lg
                                                        ${i % 2 === 0 ? 'bg-blue-400/20' : 'bg-indigo-400/20'}`}
                                                />
                                            ))}

                                            {/* Vòng tròn sóng lan tỏa */}
                                            {[...Array(2)].map((_, i) => (
                                                <motion.div
                                                    key={`ring-${i}`}
                                                    animate={{
                                                        scale: [1, 1.5],
                                                        opacity: [0.5, 0]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        delay: i * 1,
                                                        repeat: Infinity,
                                                        ease: "easeOut"
                                                    }}
                                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                                        w-16 h-16 border-2 border-blue-400/20 rounded-full"
                                                />
                                            ))}

                                            {/* Các dấu ... đang nhập */}
                                            <div className="absolute bottom-8 left-8 flex space-x-1">
                                                {[...Array(3)].map((_, i) => (
                                                    <motion.div
                                                        key={`dot-${i}`}
                                                        animate={{
                                                            y: [-2, 2, -2],
                                                            opacity: [0.3, 1, 0.3]
                                                        }}
                                                        transition={{
                                                            duration: 0.8,
                                                            delay: i * 0.2,
                                                            repeat: Infinity
                                                        }}
                                                        className="w-1.5 h-1.5 bg-blue-400/50 rounded-full"
                                                    />
                                                ))}
                                            </div>

                                            {/* Đường kết nối */}
                                            {[...Array(4)].map((_, i) => (
                                                <motion.div
                                                    key={`line-${i}`}
                                                    animate={{
                                                        opacity: [0.1, 0.3, 0.1],
                                                        pathLength: [0, 1, 0]
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        delay: i * 0.75,
                                                        repeat: Infinity,
                                                        ease: "linear"
                                                    }}
                                                    className={`absolute h-px w-16 bg-gradient-to-r from-blue-400/30 to-indigo-400/30`}
                                                    style={{
                                                        top: `${30 + i * 15}%`,
                                                        left: `${20 + i * 15}%`,
                                                        transform: `rotate(${45 + i * 30}deg)`
                                                    }}
                                                />
                                            ))}

                                            {/* Icon AI và User nhỏ */}
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                    rotate: [0, 5, -5, 0]
                                                }}
                                                transition={{
                                                    duration: 4,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="absolute top-8 right-8 w-8 h-8 rounded-full bg-gradient-to-r 
                                                    from-blue-400/20 to-indigo-400/20 flex items-center justify-center"
                                            >
                                                <FaRobot className="w-4 h-4 text-blue-400/60" />
                                            </motion.div>

                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                    rotate: [0, -5, 5, 0]
                                                }}
                                                transition={{
                                                    duration: 4,
                                                    delay: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="absolute top-20 right-20 w-6 h-6 rounded-full bg-gradient-to-r 
                                                    from-indigo-400/20 to-blue-400/20 flex items-center justify-center"
                                            >
                                                <span className="text-xs text-blue-400/60">👤</span>
                                            </motion.div>
                                        </>
                                    )}
                                    {page.title === "Tạo Mã" && (
                                        <>
                                            {/* Code editor lines */}
                                            {[...Array(4)].map((_, i) => (
                                                <motion.div
                                                    key={`editor-line-${i}`}
                                                    animate={{
                                                        width: ["60%", "80%", "60%"],
                                                        opacity: [0.3, 0.5, 0.3]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        delay: i * 0.5,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="absolute h-px bg-gradient-to-r from-emerald-500/30 to-transparent"
                                                    style={{
                                                        left: '35%',
                                                        top: `${25 + i * 15}%`,
                                                    }}
                                                />
                                            ))}

                                            {/* Code snippets floating */}
                                            {['<div>', 'function()', '{ }', '=> {}'].map((code, i) => (
                                                <motion.div
                                                    key={`snippet-${i}`}
                                                    animate={{
                                                        y: [-5, 5, -5],
                                                        x: [-3, 3, -3],
                                                        opacity: [0.4, 0.7, 0.4]
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        delay: i * 0.8,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="absolute text-xs font-mono text-emerald-400/60"
                                                    style={{
                                                        left: `${35 + i * 20}%`,
                                                        top: `${20 + i * 15}%`,
                                                    }}
                                                >
                                                    {code}
                                                </motion.div>
                                            ))}

                                            {/* IDE-like tab bar */}
                                            <motion.div
                                                className="absolute top-8 right-8 flex space-x-2 overflow-hidden max-w-[150px] sm:max-w-none"
                                                animate={{ opacity: [0.5, 0.8, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <motion.div
                                                    className="flex space-x-2"
                                                    animate={{
                                                        x: isMobileOrTablet ? [-200, 0] : 0
                                                    }}
                                                    transition={{
                                                        x: isMobileOrTablet ? {
                                                            duration: 8,
                                                            repeat: Infinity,
                                                            repeatType: "reverse",
                                                            ease: "linear"
                                                        } : {
                                                            duration: 0
                                                        }
                                                    }}
                                                >
                                                    {['index.tsx', 'styles.css', 'utils.ts'].map((file, i) => (
                                                        <div
                                                            key={file}
                                                            className={`text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-t-md font-mono whitespace-nowrap
                                                                ${i === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/10 text-emerald-400/50'}`}
                                                        >
                                                            {file}
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            </motion.div>

                                            {/* Terminal window */}
                                            <motion.div
                                                className="absolute bottom-8 right-8 w-48 h-20 bg-emerald-950/30 
                                                    rounded-md border border-emerald-500/20 overflow-hidden"
                                                animate={{ opacity: [0.7, 0.9, 0.7] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <div className="h-4 bg-emerald-500/10 flex items-center px-2 space-x-1">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400/40" />
                                                    ))}
                                                </div>
                                                <div className="p-2 font-mono text-[10px] text-emerald-400/70">
                                                    <motion.div
                                                        animate={{ opacity: [0, 1] }}
                                                        transition={{ duration: 0.8, repeat: Infinity }}
                                                    >
                                                        $ npm run dev_
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            {/* Code completion popup */}
                                            <motion.div
                                                className="absolute left-1/2 top-1/3 w-32 bg-emerald-950/40 
                                                    rounded-md border border-emerald-500/30 overflow-hidden"
                                                animate={{
                                                    opacity: [0, 1, 0],
                                                    y: [5, 0, 5]
                                                }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                            >
                                                {['useState()', 'useEffect()', 'useMemo()'].map((hint, i) => (
                                                    <div
                                                        key={hint}
                                                        className={`px-2 py-1 text-xs font-mono
                                                            ${i === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'text-emerald-400/50'}`}
                                                    >
                                                        {hint}
                                                    </div>
                                                ))}
                                            </motion.div>

                                            {/* Git diff indicators */}
                                            <div className="absolute right-4 top-1/4 space-y-2">
                                                {['+', '-', '+'].map((symbol, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                        transition={{ duration: 1.5, delay: i * 0.5, repeat: Infinity }}
                                                        className={`text-xs ${symbol === '+' ? 'text-emerald-400' : 'text-rose-400'}`}
                                                    >
                                                        {symbol}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {page.title === "Nhập Vai" && (
                                        <>
                                            {/* Các nhân vật nhỏ di chuyển */}
                                            {[...Array(3)].map((_, i) => (
                                                <motion.div
                                                    key={`character-${i}`}
                                                    animate={{
                                                        x: [0, 20, 0],
                                                        y: [0, -10, 0],
                                                        rotate: [0, 10, -10, 0],
                                                        scale: [1, 1.1, 1]
                                                    }}
                                                    transition={{
                                                        duration: 4,
                                                        delay: i * 1.3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="absolute text-lg"
                                                    style={{
                                                        top: `${20 + i * 25}%`,
                                                        left: `${15 + i * 30}%`
                                                    }}
                                                >
                                                    {['🧙‍♂️', '🦸‍♂️', '🥷'][i]}
                                                </motion.div>
                                            ))}

                                            {/* Hiệu ứng đổi vai */}
                                            <motion.div
                                                animate={{
                                                    opacity: [0, 1, 0],
                                                    scale: [0.8, 1, 0.8],
                                                    rotateY: [0, 180]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="absolute top-1/3 right-12 flex items-center justify-center
                                                    w-12 h-12 rounded-full bg-purple-500/10"
                                            >
                                                <div className="text-purple-400 text-xl">🎭</div>
                                            </motion.div>

                                            {/* Hiệu ứng bong bóng thoại */}
                                            {[...Array(2)].map((_, i) => (
                                                <motion.div
                                                    key={`speech-${i}`}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{
                                                        opacity: [0, 1, 0],
                                                        scale: [0.5, 1, 0.5],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        delay: i * 1,
                                                        repeat: Infinity,
                                                    }}
                                                    className="absolute flex items-center justify-center
                                                        w-16 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20"
                                                    style={{
                                                        top: `${40 + i * 20}%`,
                                                        right: `${20 + i * 15}%`,
                                                    }}
                                                >
                                                    <span className="text-xs text-purple-400">
                                                        {i === 0 ? '✨RP✨' : '🎬'}
                                                    </span>
                                                </motion.div>
                                            ))}

                                            {/* Đường kết nối giữa các nhân vật */}
                                            {[...Array(2)].map((_, i) => (
                                                <motion.div
                                                    key={`connection-${i}`}
                                                    animate={{
                                                        opacity: [0.1, 0.3, 0.1],
                                                        height: ['0%', '100%', '0%'],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        delay: i * 1.5,
                                                        repeat: Infinity,
                                                    }}
                                                    className="absolute w-px bg-gradient-to-b from-purple-500/30 via-purple-400/30 to-purple-500/30"
                                                    style={{
                                                        left: `${30 + i * 25}%`,
                                                        top: '20%',
                                                        height: '60%',
                                                    }}
                                                />
                                            ))}

                                            {/* Hiệu ứng sparkles */}
                                            {[...Array(4)].map((_, i) => (
                                                <motion.div
                                                    key={`sparkle-${i}`}
                                                    animate={{
                                                        scale: [0, 1, 0],
                                                        opacity: [0, 1, 0],
                                                        rotate: [0, 180],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        delay: i * 0.5,
                                                        repeat: Infinity,
                                                    }}
                                                    className="absolute w-2 h-2 text-purple-400"
                                                    style={{
                                                        top: `${20 + i * 20}%`,
                                                        left: `${20 + i * 20}%`,
                                                    }}
                                                >
                                                    ✨
                                                </motion.div>
                                            ))}

                                            {/* Điều chỉnh vị trí hiệu ứng chuyển đổi nhân vật sang bên phải trong khung */}
                                            <motion.div
                                                animate={{
                                                    opacity: [0.4, 0.8, 0.4],
                                                    scale: [0.95, 1.05, 0.95]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="absolute top-4 right-4 flex flex-col items-center
                                                    text-xs text-purple-400/70 bg-purple-500/5 rounded-lg p-1"
                                            >
                                                <motion.div
                                                    animate={{
                                                        rotateY: [0, 360]
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="flex space-x-1"
                                                >
                                                    {['🧙‍♂️', '🦸‍♂️', '🥷'].map((emoji, i) => (
                                                        <motion.span
                                                            key={i}
                                                            initial={{ opacity: 0 }}
                                                            animate={{
                                                                opacity: [0, 1, 0],
                                                            }}
                                                            transition={{
                                                                duration: 3,
                                                                delay: i,
                                                                repeat: Infinity,
                                                            }}
                                                        >
                                                            {emoji}
                                                        </motion.span>
                                                    ))}
                                                </motion.div>
                                                <motion.div
                                                    animate={{
                                                        opacity: [0.5, 1, 0.5]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity
                                                    }}
                                                    className="mt-1 whitespace-nowrap"
                                                >
                                                    Đổi vai
                                                </motion.div>
                                            </motion.div>
                                        </>
                                    )}
                                    {page.title === "Học Tập" && (
                                        <>
                                            {/* Biểu tượng sách bay lơ lửng */}
                                            {[...Array(2)].map((_, i) => (
                                                <motion.div
                                                    key={`book-${i}`}
                                                    animate={{
                                                        y: [-10, 0, -10],
                                                        rotate: [0, 5, -5, 0],
                                                        scale: [1, 1.1, 1]
                                                    }}
                                                    transition={{
                                                        duration: 4,
                                                        delay: i * 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }}
                                                    className="absolute text-xl"
                                                    style={{
                                                        top: `${30 + i * 20}%`,
                                                        left: `${20 + i * 25}%`
                                                    }}
                                                >
                                                    {['📚', '📖'][i]}
                                                </motion.div>
                                            ))}

                                            {/* Hiệu ứng bóng đèn ý tưởng */}
                                            <motion.div
                                                animate={{
                                                    opacity: [0.3, 1, 0.3],
                                                    scale: [0.9, 1.1, 0.9],
                                                    rotate: [-5, 5, -5]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="absolute top-1/4 right-12 text-2xl"
                                            >
                                                💡
                                            </motion.div>

                                            {/* Hiệu ứng câu hỏi và đáp án */}
                                            {['❓', '✅'].map((symbol, i) => (
                                                <motion.div
                                                    key={`qa-${i}`}
                                                    animate={{
                                                        opacity: [0, 1, 0],
                                                        y: [-10, 0, 10],
                                                        x: i === 0 ? [-10, 0, -10] : [10, 0, 10]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        delay: i * 1,
                                                        repeat: Infinity
                                                    }}
                                                    className="absolute text-lg"
                                                    style={{
                                                        top: '45%',
                                                        [i === 0 ? 'left' : 'right']: '25%'
                                                    }}
                                                >
                                                    {symbol}
                                                </motion.div>
                                            ))}

                                            {/* Hiệu ứng công thức toán học */}
                                            <motion.div
                                                animate={{
                                                    opacity: [0.3, 0.7, 0.3],
                                                    scale: [0.95, 1.05, 0.95]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity
                                                }}
                                                className="absolute bottom-1/3 left-12 text-rose-400/60 text-sm font-mono"
                                            >
                                                E = mc²
                                            </motion.div>

                                            {/* Hiệu ứng tiến trình học tập */}
                                            <div className="absolute bottom-1/4 right-12 w-20">
                                                {[...Array(3)].map((_, i) => (
                                                    <motion.div
                                                        key={`progress-${i}`}
                                                        animate={{
                                                            width: ['30%', '100%', '30%'],
                                                            opacity: [0.3, 0.7, 0.3]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            delay: i * 0.7,
                                                            repeat: Infinity
                                                        }}
                                                        className="h-1 mb-1 bg-rose-400/40 rounded-full"
                                                    />
                                                ))}
                                            </div>

                                            {/* Hiệu ứng sparkles học tập */}
                                            {[...Array(4)].map((_, i) => (
                                                <motion.div
                                                    key={`study-sparkle-${i}`}
                                                    animate={{
                                                        scale: [0, 1, 0],
                                                        opacity: [0, 1, 0],
                                                        rotate: [0, 180]
                                                    }}
                                                    transition={{
                                                        duration: 1.5,
                                                        delay: i * 0.4,
                                                        repeat: Infinity
                                                    }}
                                                    className="absolute w-2 h-2 text-rose-400"
                                                    style={{
                                                        top: `${25 + i * 15}%`,
                                                        right: `${20 + i * 15}%`
                                                    }}
                                                >
                                                    ✨
                                                </motion.div>
                                            ))}

                                            {/* Thêm hiệu ứng bảng điểm và tiến độ học tập */}
                                            <motion.div
                                                animate={{
                                                    opacity: [0.4, 0.8, 0.4],
                                                    scale: [0.95, 1.05, 0.95]
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                                className="absolute top-4 right-4 flex flex-col items-center
                                                    bg-rose-500/5 rounded-lg p-2 border border-rose-500/20"
                                            >
                                                <div className="text-rose-400/70 text-xs mb-1">Tiến độ</div>
                                                {/* Thanh tiến độ động */}
                                                {['Toán', 'Văn', 'Anh'].map((subject, i) => (
                                                    <motion.div
                                                        key={subject}
                                                        className="flex items-center space-x-2 mb-1"
                                                    >
                                                        <span className="text-[10px] text-rose-400/60 w-8">{subject}</span>
                                                        <motion.div
                                                            animate={{
                                                                width: ['30%', '100%', '30%'],
                                                                backgroundColor: [
                                                                    'rgba(244,63,94,0.2)',
                                                                    'rgba(244,63,94,0.4)',
                                                                    'rgba(244,63,94,0.2)'
                                                                ]
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                delay: i * 0.7,
                                                                repeat: Infinity
                                                            }}
                                                            className="h-1 w-16 rounded-full"
                                                        />
                                                    </motion.div>
                                                ))}

                                                {/* Biểu tượng thành tích */}
                                                <div className="flex space-x-1 mt-1">
                                                    {['🏆', '⭐', '📈'].map((icon, i) => (
                                                        <motion.span
                                                            key={i}
                                                            animate={{
                                                                scale: [1, 1.2, 1],
                                                                opacity: [0.5, 1, 0.5]
                                                            }}
                                                            transition={{
                                                                duration: 1.5,
                                                                delay: i * 0.5,
                                                                repeat: Infinity
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            {icon}
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}

                                    <h3 className={`text-2xl font-bold mb-4 ${page.color} 
                                        group-hover:scale-105 transition-transform duration-300
                                        [text-shadow:0_0_1px_currentColor]
                                        group-hover:[text-shadow:0_0_2px_currentColor]`}>
                                        {page.title}
                                    </h3>

                                    <p className="text-gray-300 text-lg mb-8">
                                        {page.description}
                                    </p>

                                    <div className="space-y-3">
                                        {page.features.map((feature, idx) => (
                                            <div key={feature}
                                                className={`relative flex items-center text-gray-400
                                                    group-hover:text-gray-300 transition-colors duration-300
                                                    border border-gray-800/50 rounded-lg p-3
                                                    hover:border-[#3E52E8]/50
                                                    ${page.title === "Trò Chuyện" ?
                                                        "hover:bg-blue-500/5" :
                                                        page.title === "Tạo Mã" ?
                                                            "hover:bg-emerald-500/5" :
                                                            page.title === "Nhập Vai" ?
                                                                "hover:bg-purple-500/5" :
                                                                "hover:bg-rose-500/5"}`}
                                                style={{
                                                    transitionDelay: `${idx * 100}ms`
                                                }}
                                            >
                                                <motion.div
                                                    whileHover={{ scale: 1.2, rotate: 360 }}
                                                    className={`w-2 h-2 mr-3 rounded-full
                                                        ${page.title === "Trò Chuyện" ? "bg-blue-500" :
                                                            page.title === "Tạo Mã" ? "bg-emerald-500" :
                                                                page.title === "Nhập Vai" ? "bg-purple-500" :
                                                                    "bg-rose-500"}`}
                                                />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={`mt-8 inline-flex items-center ${page.color} 
                                        relative group-hover:translate-x-2 transition-all duration-300
                                        border-2 border-current px-4 py-2 rounded-lg
                                        group-hover:animate-button-pulse
                                        before:absolute before:inset-0 before:bg-current before:opacity-5`}>
                                        <span className="font-semibold">Khám phá ngay</span>
                                        <svg className="w-5 h-5 ml-2 group-hover:animate-arrow-pulse"
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <div className="absolute top-0 right-0 w-1 h-1 rounded-full 
                                            bg-current opacity-50 group-hover:animate-blink"></div>
                                    </div>
                                </div>

                                <div className={`absolute inset-0 border-2 border-current opacity-0 
                                    group-hover:opacity-20 transition-opacity duration-300 rounded-2xl 
                                    ${page.color}`} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}