'use client';

import { motion } from 'framer-motion';
import { FaNewspaper, FaRobot, FaServer, FaSync, FaBrain, FaChartLine } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const sections = [
    {
        title: "Tin Tức AI",
        subtitle: "Cập nhật tin tức mới nhất về AI",
        path: "/ai-news",
        color: "from-emerald-400 via-teal-500 to-teal-600",
        icon: <FaNewspaper className="w-8 h-8" />
    },
    {
        title: "Website AI",
        subtitle: "Khám phá công cụ AI hữu ích",
        path: "/ai-websites",
        color: "from-blue-400 via-indigo-500 to-indigo-600",
        icon: <FaRobot className="w-8 h-8" />
    }
];

const features = [
    {
        icon: <FaServer className="w-8 h-8" />,
        title: "Spring Boot API",
        description: "API tự động thu thập và xử lý dữ liệu",
        color: "from-cyan-500 to-blue-500"
    },
    {
        icon: <FaBrain className="w-8 h-8" />,
        title: "AgentQL Query",
        description: "Truy xuất thông minh với AgentQL",
        color: "from-purple-500 to-indigo-500"
    },
    {
        icon: <FaSync className="w-8 h-8" />,
        title: "UptimeRobot Monitor",
        description: "Kiểm tra và cập nhật mỗi 5 phút",
        color: "from-green-500 to-emerald-500"
    },
    {
        icon: <FaChartLine className="w-8 h-8" />,
        title: "Phân Tích Realtime",
        description: "Xử lý và cập nhật dữ liệu theo thời gian thực",
        color: "from-orange-500 to-red-500"
    }
];

export default function AIUpdates() {
    const router = useRouter();

    return (
        <div className="relative bg-[#0F172A] py-16 overflow-hidden min-h-screen">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.1)_0.1em,transparent_0.1em),linear-gradient(90deg,rgba(15,23,42,0.1)_0.1em,transparent_0.1em)] bg-[size:4em_4em] opacity-20" />

                <motion.div
                    className="absolute top-20 -left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-[120px]"
                />
                <motion.div
                    className="absolute top-40 -right-20 w-72 h-72 bg-purple-500/30 rounded-full blur-[120px]"
                />

                <div className="absolute inset-0">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.1, 0.5, 0.1] }}
                            transition={{
                                duration: 5,
                                delay: i * 0.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
                            style={{ top: `${20 + i * 15}%` }}
                        />
                    ))}
                </div>

                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 0,
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                y: [0, -20, 0]
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                            className="absolute w-1 h-1 bg-white/30 rounded-full"
                        />
                    ))}
                </div>
            </div>

            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,#0066ff12,transparent)]" />
            </div>

            <div className="absolute inset-0">
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={`line-${i}`}
                        initial={{ opacity: 0, x: -100 }}
                        animate={{
                            opacity: [0.1, 0.2, 0.1],
                            x: ['-100%', '100%'],
                        }}
                        transition={{
                            duration: 10,
                            delay: i * 0.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute h-[1px] w-[200px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
                        style={{ top: `${10 + i * 10}%` }}
                    />
                ))}
            </div>

            <div className="relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-24"
                    >
                        <div className="space-y-4 mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-white">
                                Hệ Thống Tự Động AI
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                Hệ thống tự động xử lý và cập nhật thông tin AI 24/7
                            </p>
                        </div>

                        <div className="max-w-xs mx-auto mb-16">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                                className="text-center space-y-3"
                            >
                                <div className="flex justify-center items-center space-x-2 text-blue-400">
                                    <FaServer className="w-5 h-5" />
                                    <span className="text-sm">API Server</span>
                                </div>
                                <div className="h-8 w-[1px] bg-gradient-to-b from-blue-500 to-purple-500 mx-auto" />
                                <div className="flex justify-center items-center space-x-2 text-purple-400">
                                    <FaBrain className="w-5 h-5" />
                                    <span className="text-sm">AI Processing</span>
                                </div>
                                <div className="h-8 w-[1px] bg-gradient-to-b from-purple-500 to-emerald-500 mx-auto" />
                                <div className="flex justify-center items-center space-x-2 text-emerald-400">
                                    <FaSync className="w-5 h-5" />
                                    <span className="text-sm">Auto Update</span>
                                </div>
                            </motion.div>
                        </div>

                        <div className="max-w-2xl mx-auto relative">
                            <div className="absolute left-[50%] top-0 bottom-0 w-[2px]">
                                <div className="h-full bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent animate-pulse" />
                            </div>

                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative mb-12 last:mb-0"
                                >
                                    <div className={`
                                        flex items-center gap-4
                                        ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}
                                    `}>
                                        <div className="w-1/2 flex justify-center">
                                            <div className={`
                                                bg-gradient-to-br ${feature.color}
                                                p-[1px] rounded-2xl w-full max-w-sm
                                                hover:shadow-lg hover:shadow-blue-500/20
                                                transition-all duration-300
                                            `}>
                                                <div className="bg-[#1E293B] p-6 rounded-2xl h-full">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="bg-gradient-to-br from-white/10 to-white/5 p-3 rounded-xl">
                                                            {feature.icon}
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-white">
                                                            {feature.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-1/2 relative">
                                            <div className="absolute top-1/2 left-0 right-0 flex items-center justify-center">
                                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                                                <div className={`h-[2px] flex-1 bg-gradient-to-r from-blue-500 to-purple-500
                                                    ${index % 2 === 0 ? 'order-first' : 'order-last'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="max-w-5xl mx-auto px-4 mt-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {sections.map((section, index) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, amount: 0.3 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => router.push(section.path)}
                                    className="group relative"
                                >
                                    <div className={`
                                        absolute inset-0 bg-gradient-to-br ${section.color}
                                        opacity-20 group-hover:opacity-30 rounded-2xl
                                        transition-all duration-500 blur-xl group-hover:blur-2xl
                                    `} />

                                    <div className={`
                                        relative overflow-hidden rounded-2xl
                                        bg-[#1E293B]/80 backdrop-blur-sm
                                        border border-white/10
                                        hover:border-white/20
                                        transition-all duration-500
                                        group-hover:translate-y-[-2px]
                                        group-hover:shadow-2xl
                                        group-hover:shadow-${section.color.split('-')[1]}-500/20
                                    `}>
                                        <div className="p-8">
                                            <div className="flex items-center gap-6">
                                                <div className={`
                                                    p-4 rounded-xl
                                                    bg-gradient-to-br ${section.color}
                                                    shadow-lg shadow-${section.color.split('-')[1]}-500/30
                                                `}>
                                                    {section.icon}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white mb-2">
                                                        {section.title}
                                                    </h3>
                                                    <p className="text-gray-400">
                                                        {section.subtitle}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex justify-end">
                                                <motion.div
                                                    className="text-white/70 group-hover:text-white
                                                        transform group-hover:translate-x-1
                                                        transition-all duration-300"
                                                    whileHover={{ scale: 1.05 }}
                                                >
                                                    Khám phá →
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}