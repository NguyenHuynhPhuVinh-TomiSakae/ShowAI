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
        icon: <FaNewspaper className="w-8 h-8" />,
        metrics: {
            status: ["Crawling", "Processing", "Indexing"],
            indicators: ["New", "Updated", "Trending"]
        }
    },
    {
        title: "Website AI",
        subtitle: "Khám phá công cụ AI hữu ích",
        path: "/ai-websites",
        color: "from-blue-400 via-indigo-500 to-indigo-600",
        icon: <FaRobot className="w-8 h-8" />,
        metrics: {
            status: ["Scanning", "Analyzing", "Ranking"],
            indicators: ["Active", "Popular", "Featured"]
        }
    }
];

const features = [
    {
        icon: <FaServer className="w-8 h-8" />,
        title: "Spring Boot API",
        description: "API tự động thu thập và xử lý dữ liệu",
        color: "from-cyan-500 to-blue-500",
        details: {
            ports: ["8080", "3306", "6379", "27017", "5432"],
            metrics: ["CPU", "Memory", "Threads", "DB Conn", "Cache Hit"],
            services: ["MySQL", "Redis", "MongoDB", "PostgreSQL"],
            endpoints: ["/api/v1", "/actuator", "/metrics", "/health"],
            status: {
                uptime: "99.9%",
                latency: "45ms",
                requests: "2.5k/s",
                errors: "0.01%"
            }
        }
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
                    className="absolute top-20 -left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-[120px] hidden md:block"
                />
                <motion.div
                    className="absolute top-40 -right-20 w-72 h-72 bg-purple-500/30 rounded-full blur-[120px] hidden md:block"
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
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-24"
                    >
                        <div className="relative space-y-4 mb-16">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32">
                                    {[...Array(4)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-full h-full border border-blue-500/20 rounded-full"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.1, 0.2, 0.1],
                                                rotate: 360
                                            }}
                                            transition={{
                                                duration: 8,
                                                delay: i * 0.5,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="absolute left-1/2 top-full mt-8">
                                <div className="relative -translate-x-1/2">
                                    <motion.div
                                        className="w-[2px] h-32 bg-gradient-to-b from-blue-500/50 to-transparent"
                                        animate={{
                                            scaleY: [0, 1, 0.8],
                                            opacity: [0, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity
                                        }}
                                    />

                                    {/* Tech Branches */}
                                    {[-30, 0, 30].map((angle, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute top-1/2 left-1/2 w-16 h-[2px]"
                                            style={{
                                                transform: `rotate(${angle}deg)`,
                                                transformOrigin: "left center"
                                            }}
                                            initial={{ scaleX: 0 }}
                                            animate={{
                                                scaleX: [0, 1, 0.8],
                                                opacity: [0, 1, 0.5]
                                            }}
                                            transition={{
                                                duration: 2,
                                                delay: i * 0.2,
                                                repeat: Infinity
                                            }}
                                        >
                                            <div className="w-full h-full bg-gradient-to-r from-blue-500/50 to-transparent" />

                                            {/* Tech Nodes */}
                                            <motion.div
                                                className="absolute right-0 w-2 h-2 rounded-full bg-blue-500"
                                                animate={{
                                                    scale: [0.8, 1.2, 0.8],
                                                    opacity: [0.5, 1, 0.5]
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    delay: i * 0.3,
                                                    repeat: Infinity
                                                }}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <h2 className="relative text-4xl sm:text-5xl font-bold text-white">
                                <span className="relative">
                                    Hệ Thống Tự Động AI
                                    {/* Glowing underline */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 w-full h-[2px]"
                                        animate={{
                                            opacity: [0.3, 1, 0.3],
                                            scaleX: [0.8, 1, 0.8]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity
                                        }}
                                    >
                                        <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                                    </motion.div>
                                </span>
                            </h2>

                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                Hệ thống tự động xử lý và cập nhật thông tin AI 24/7
                                {/* Tech particles */}
                                <motion.div className="absolute inset-0 -z-10">
                                    {[...Array(10)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
                                            initial={{
                                                x: Math.random() * 100 - 50,
                                                y: Math.random() * 100 - 50,
                                            }}
                                            animate={{
                                                x: Math.random() * 100 - 50,
                                                y: Math.random() * 100 - 50,
                                                opacity: [0, 1, 0],
                                                scale: [0, 1, 0]
                                            }}
                                            transition={{
                                                duration: 2,
                                                delay: i * 0.2,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                        />
                                    ))}
                                </motion.div>
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
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{
                                        duration: 0.5,
                                        delay: index * 0.1
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    className="relative mb-12 last:mb-0"
                                >
                                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-[2px]">
                                        <motion.div
                                            className="h-full bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-transparent"
                                            initial={{ scaleY: 0 }}
                                            animate={{ scaleY: 1 }}
                                            transition={{ duration: 1, delay: index * 0.2 }}
                                        />

                                        <motion.div
                                            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2
                                               w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: [0.8, 1.2, 0.8] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />

                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-8 h-[1px] left-1/2 transform -translate-x-1/2"
                                                style={{ top: `${30 + i * 20}%` }}
                                                initial={{ scaleX: 0, opacity: 0 }}
                                                animate={{
                                                    scaleX: [0, 1, 0],
                                                    opacity: [0, 0.5, 0]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    delay: i * 0.3,
                                                    repeat: Infinity
                                                }}
                                            >
                                                <div className="h-full bg-gradient-to-r from-blue-500/30 to-purple-500/30" />
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className={`
                                        flex flex-col md:flex-row items-center gap-4
                                        ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}
                                    `}>
                                        <div className="w-full md:w-1/2 flex justify-center">
                                            <div className={`
                                                bg-gradient-to-br ${feature.color}
                                                p-[1px] rounded-2xl w-full max-w-sm
                                                hover:shadow-lg hover:shadow-blue-500/20
                                                transition-all duration-300
                                            `}>
                                                <div className="relative bg-[#1E293B] p-6 rounded-2xl h-full">
                                                    {/* Ống dẫn trái */}
                                                    <div className="absolute -left-4 top-1/3 h-24 w-3 bg-gray-800 rounded-l-md border-l border-t border-b border-gray-700">
                                                        {[...Array(3)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="w-1 h-1 bg-blue-400 rounded-full mx-auto my-2"
                                                                animate={{ opacity: [0.3, 1, 0.3] }}
                                                                transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Ống dẫn phải */}
                                                    <div className="absolute -right-4 top-1/4 h-32 w-3 bg-gray-800 rounded-r-md border-r border-t border-b border-gray-700">
                                                        <motion.div
                                                            className="h-full w-0.5 mx-auto bg-gradient-to-b from-cyan-500/30 via-purple-500/30 to-transparent"
                                                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        />
                                                    </div>

                                                    {/* Đèn báo trên */}
                                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                                                        <div className="flex space-x-2">
                                                            {['bg-red-500', 'bg-yellow-500', 'bg-green-500'].map((color, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className={`w-2 h-2 rounded-full ${color}`}
                                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                                    transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Cổng kết nối dưới */}
                                                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                                                        <div className="bg-gray-800 px-4 py-1 rounded-b-lg border border-gray-700 flex space-x-3">
                                                            {[...Array(4)].map((_, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className="w-1 h-4 bg-gray-600 rounded-full"
                                                                    animate={{ height: ['16px', '10px', '16px'] }}
                                                                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Đường dẫn năng lượng */}
                                                    <div className="absolute inset-x-8 top-0 h-full">
                                                        {[...Array(3)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="absolute w-full h-[1px]"
                                                                style={{ top: `${25 + i * 25}%` }}
                                                                animate={{ opacity: [0, 0.5, 0], x: ['-100%', '100%'] }}
                                                                transition={{ duration: 2, delay: i * 0.7, repeat: Infinity }}
                                                            >
                                                                <div className="h-full bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                                                            </motion.div>
                                                        ))}
                                                    </div>

                                                    {/* Thêm các đường kết nối dữ liệu */}
                                                    <div className="absolute inset-x-8 -top-2 h-full">
                                                        {[...Array(5)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="absolute w-full h-[1px]"
                                                                style={{ top: `${15 + i * 20}%` }}
                                                                animate={{
                                                                    opacity: [0, 0.5, 0],
                                                                    x: ['-100%', '100%'],
                                                                    scale: [1, 1.2, 1]
                                                                }}
                                                                transition={{
                                                                    duration: 3,
                                                                    delay: i * 0.4,
                                                                    repeat: Infinity
                                                                }}
                                                            >
                                                                <div className="h-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                                                            </motion.div>
                                                        ))}
                                                    </div>

                                                    {/* Thêm các đèn LED trạng thái */}
                                                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 space-y-2">
                                                        {[...Array(4)].map((_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="w-2 h-2 rounded-full bg-cyan-500"
                                                                animate={{
                                                                    opacity: [0.3, 1, 0.3],
                                                                    boxShadow: [
                                                                        '0 0 0 0 rgba(34,211,238,0.4)',
                                                                        '0 0 0 8px rgba(34,211,238,0)',
                                                                    ]
                                                                }}
                                                                transition={{
                                                                    duration: 2,
                                                                    delay: i * 0.3,
                                                                    repeat: Infinity
                                                                }}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Thêm hiệu ứng xử lý dữ liệu */}
                                                    <div className="absolute right-4 top-4">
                                                        <div className="flex items-center space-x-1">
                                                            <motion.div
                                                                className="w-1 h-4 bg-emerald-500/50 rounded-full"
                                                                animate={{ height: ['16px', '8px', '16px'] }}
                                                                transition={{ duration: 1, repeat: Infinity }}
                                                            />
                                                            <motion.div
                                                                className="w-1 h-4 bg-blue-500/50 rounded-full"
                                                                animate={{ height: ['8px', '16px', '8px'] }}
                                                                transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
                                                            />
                                                            <motion.div
                                                                className="w-1 h-4 bg-purple-500/50 rounded-full"
                                                                animate={{ height: ['16px', '8px', '16px'] }}
                                                                transition={{ duration: 1, delay: 0.4, repeat: Infinity }}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Nội dung chính */}
                                                    <div className="relative z-10">
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="relative bg-gradient-to-br from-white/10 to-white/5 p-3 rounded-xl">
                                                                {feature.icon}
                                                                {/* Server Processing Animation */}
                                                                <motion.div
                                                                    animate={{
                                                                        scale: [1, 1.2, 1],
                                                                        opacity: [0.5, 1, 0.5]
                                                                    }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                    className="absolute inset-0 rounded-xl border border-cyan-500/30"
                                                                />
                                                            </div>
                                                            <h3 className="text-lg font-semibold text-white">
                                                                {feature.title}
                                                            </h3>
                                                        </div>

                                                        {/* Metrics Display */}
                                                        <div className="space-y-2">
                                                            <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {feature.details?.metrics.map((metric, idx) => (
                                                                    <motion.div
                                                                        key={metric}
                                                                        initial={{ opacity: 0, y: 10 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ delay: idx * 0.1 }}
                                                                        className="bg-gray-800/50 rounded-lg p-2"
                                                                    >
                                                                        <div className="text-xs text-gray-400">{metric}</div>
                                                                        <motion.div
                                                                            animate={{
                                                                                width: ["40%", "80%", "60%"]
                                                                            }}
                                                                            transition={{
                                                                                duration: 3,
                                                                                repeat: Infinity,
                                                                                ease: "easeInOut"
                                                                            }}
                                                                            className="h-1 bg-cyan-500/50 rounded-full mt-1"
                                                                        />
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Connection Lines */}
                                                        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 h-full">
                                                            <motion.div
                                                                animate={{
                                                                    opacity: [0.3, 0.6, 0.3]
                                                                }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                                className="h-full w-[2px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"
                                                            />
                                                        </div>

                                                        {/* Processing Indicators */}
                                                        <div className="absolute bottom-4 right-4 flex space-x-2">
                                                            <motion.div
                                                                className="w-1.5 h-1.5 rounded-full bg-green-500"
                                                                animate={{ scale: [1, 1.2, 1] }}
                                                                transition={{ duration: 1, repeat: Infinity }}
                                                            />
                                                            <motion.div
                                                                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                                                animate={{ scale: [1, 1.2, 1] }}
                                                                transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
                                                            />
                                                            <motion.div
                                                                className="w-1.5 h-1.5 rounded-full bg-purple-500"
                                                                animate={{ scale: [1, 1.2, 1] }}
                                                                transition={{ duration: 1, delay: 0.4, repeat: Infinity }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-1/2 relative hidden md:block">
                                            {/* Đường kết nối chính */}
                                            <div className="absolute top-1/2 left-0 right-0 flex items-center justify-center">
                                                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                                                <div className={`h-[2px] flex-1 bg-gradient-to-r from-blue-500 to-purple-500
                                                    ${index % 2 === 0 ? 'order-first' : 'order-last'}`}
                                                />
                                            </div>

                                            {/* Thành phần hệ thống tùy chỉnh theo feature */}
                                            <div className={`absolute top-1/2 ${index % 2 === 0 ? 'left-8' : 'right-8'} -translate-y-1/2`}>
                                                {feature.title === "Spring Boot API" && (
                                                    <div className="space-y-4">
                                                        {/* API Endpoints */}
                                                        <motion.div
                                                            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50"
                                                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <motion.div
                                                                    className="w-2 h-2 rounded-full bg-green-500"
                                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                                <span className="text-xs text-gray-400">API Gateway</span>
                                                            </div>
                                                            {feature.details?.endpoints.map((endpoint, i) => (
                                                                <div key={i} className="text-xs text-gray-500 mb-1">
                                                                    {endpoint}
                                                                    <motion.div
                                                                        className="h-1 bg-green-500/20 rounded-full mt-1"
                                                                        animate={{ width: ['40%', '80%', '60%'] }}
                                                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </motion.div>

                                                        {/* Database Connections */}
                                                        <motion.div
                                                            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50"
                                                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <motion.div
                                                                    className="w-2 h-2 rounded-full bg-blue-500"
                                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                                <span className="text-xs text-gray-400">Database Status</span>
                                                            </div>
                                                            {feature.details?.services.map((service, i) => (
                                                                <div key={i} className="text-xs text-gray-500 mb-1">
                                                                    {service}
                                                                    <motion.div
                                                                        className="h-1 bg-blue-500/20 rounded-full mt-1"
                                                                        animate={{ width: ['60%', '90%', '75%'] }}
                                                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    </div>
                                                )}

                                                {feature.title === "AgentQL Query" && (
                                                    <div className="space-y-4">
                                                        {/* Query Processing */}
                                                        <motion.div
                                                            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50"
                                                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <motion.div
                                                                    className="w-2 h-2 rounded-full bg-purple-500"
                                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                                <span className="text-xs text-gray-400">Query Engine</span>
                                                            </div>
                                                            {['Parse', 'Optimize', 'Execute'].map((step, i) => (
                                                                <div key={i} className="text-xs text-gray-500 mb-1">
                                                                    {step}
                                                                    <motion.div
                                                                        className="h-1 bg-purple-500/20 rounded-full mt-1"
                                                                        animate={{ width: ['30%', '100%', '30%'] }}
                                                                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </motion.div>

                                                        {/* Memory Usage */}
                                                        <motion.div
                                                            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50"
                                                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <motion.div
                                                                    className="w-2 h-2 rounded-full bg-indigo-500"
                                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                                <span className="text-xs text-gray-400">Memory Stats</span>
                                                            </div>
                                                            {['Cache', 'Heap', 'Stack'].map((mem, i) => (
                                                                <div key={i} className="text-xs text-gray-500 mb-1">
                                                                    {mem}
                                                                    <motion.div
                                                                        className="h-1 bg-indigo-500/20 rounded-full mt-1"
                                                                        animate={{ width: ['50%', '85%', '65%'] }}
                                                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    </div>
                                                )}

                                                {feature.title === "UptimeRobot Monitor" && (
                                                    <div className="space-y-4">
                                                        {/* Server Status */}
                                                        <motion.div
                                                            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50"
                                                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <motion.div
                                                                    className="w-2 h-2 rounded-full bg-emerald-500"
                                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                                <span className="text-xs text-gray-400">Server Health</span>
                                                            </div>
                                                            {['Response Time', 'Uptime', 'SSL Status'].map((metric, i) => (
                                                                <div key={i} className="text-xs text-gray-500 mb-1">
                                                                    {metric}
                                                                    <motion.div
                                                                        className="h-1 bg-emerald-500/20 rounded-full mt-1"
                                                                        animate={{ width: ['90%', '100%', '95%'] }}
                                                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </motion.div>

                                                        {/* Alert System */}
                                                        <motion.div
                                                            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50"
                                                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <motion.div
                                                                    className="w-2 h-2 rounded-full bg-yellow-500"
                                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                                <span className="text-xs text-gray-400">Alert System</span>
                                                            </div>
                                                            {['Email', 'Webhook', 'Push'].map((alert, i) => (
                                                                <div key={i} className="text-xs text-gray-500 mb-1">
                                                                    {alert}
                                                                    <motion.div
                                                                        className="h-1 bg-yellow-500/20 rounded-full mt-1"
                                                                        animate={{ width: ['40%', '70%', '55%'] }}
                                                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    </div>
                                                )}

                                                {feature.title === "Phân Tích Realtime" && (
                                                    <div className="space-y-4">
                                                        {/* Data Processing */}
                                                        <motion.div
                                                            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50"
                                                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <motion.div
                                                                    className="w-2 h-2 rounded-full bg-orange-500"
                                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                                <span className="text-xs text-gray-400">Processing Stats</span>
                                                            </div>
                                                            {['Input Rate', 'Processing', 'Output'].map((stat, i) => (
                                                                <div key={i} className="text-xs text-gray-500 mb-1">
                                                                    {stat}
                                                                    <motion.div
                                                                        className="h-1 bg-orange-500/20 rounded-full mt-1"
                                                                        animate={{ width: ['70%', '95%', '85%'] }}
                                                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </motion.div>

                                                        {/* Analytics */}
                                                        <motion.div
                                                            className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-2 border border-gray-700/50"
                                                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <motion.div
                                                                    className="w-2 h-2 rounded-full bg-red-500"
                                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                />
                                                                <span className="text-xs text-gray-400">Analytics</span>
                                                            </div>
                                                            {['Trends', 'Patterns', 'Anomalies'].map((metric, i) => (
                                                                <div key={i} className="text-xs text-gray-500 mb-1">
                                                                    {metric}
                                                                    <motion.div
                                                                        className="h-1 bg-red-500/20 rounded-full mt-1"
                                                                        animate={{ width: ['45%', '90%', '70%'] }}
                                                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    </div>
                                                )}

                                                {/* Hiệu ứng dữ liệu chạy */}
                                                {[...Array(3)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="absolute w-full h-[1px]"
                                                        style={{ top: `${30 + i * 20}%` }}
                                                        animate={{
                                                            opacity: [0, 1, 0],
                                                            x: index % 2 === 0 ? ['-100%', '100%'] : ['100%', '-100%']
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            delay: i * 0.3,
                                                            repeat: Infinity
                                                        }}
                                                    >
                                                        <div className="h-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="max-w-5xl mx-auto px-4 mt-20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                            {sections.map((section, index) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
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
                                        opacity-10 md:opacity-20 group-hover:opacity-20 md:group-hover:opacity-30 rounded-2xl
                                        transition-all duration-500 blur-md md:blur-xl group-hover:blur-lg md:group-hover:blur-2xl
                                    `} />

                                    <div className={`
                                        relative overflow-hidden rounded-2xl
                                        bg-[#1E293B]/80 backdrop-blur-sm
                                        border border-white/5 md:border-white/10
                                        hover:border-white/10 md:hover:border-white/20
                                        transition-all duration-500
                                        group-hover:translate-y-[-1px] md:group-hover:translate-y-[-2px]
                                        group-hover:shadow-lg md:group-hover:shadow-2xl
                                        group-hover:shadow-${section.color.split('-')[1]}-500/10 md:group-hover:shadow-${section.color.split('-')[1]}-500/20
                                    `}>
                                        <div className="p-4 sm:p-8 relative">
                                            {/* Thêm đường kết nối phía trên */}
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                                    animate={{
                                                        opacity: [0, 0.5, 0],
                                                        scaleX: [0, 1, 0]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity
                                                    }}
                                                />
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                                                {/* Icon wrapper với hiệu ứng */}
                                                <div className="relative">
                                                    <div className={`
                                                        p-4 rounded-xl
                                                        bg-gradient-to-br ${section.color}
                                                        shadow-lg shadow-${section.color.split('-')[1]}-500/30
                                                    `}>
                                                        {section.icon}

                                                        {/* Vòng xoay xung quanh icon */}
                                                        <motion.div
                                                            className="absolute inset-0 rounded-xl border-2 border-white/20"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                        />
                                                    </div>

                                                    {/* Đèn báo hoạt động */}
                                                    <motion.div
                                                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500"
                                                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    />
                                                </div>

                                                <div className="text-center sm:text-left space-y-4">
                                                    <div>
                                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                                            {section.title}
                                                        </h3>
                                                        <p className="text-gray-400">{section.subtitle}</p>
                                                    </div>

                                                    {/* Metrics Dashboard */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            {section.metrics.status.map((status, idx) => (
                                                                <div key={status} className="flex items-center gap-2">
                                                                    <motion.div
                                                                        className="w-1.5 h-1.5 rounded-full bg-cyan-500"
                                                                        animate={{ scale: [0.8, 1.2, 0.8] }}
                                                                        transition={{ duration: 1, delay: idx * 0.2, repeat: Infinity }}
                                                                    />
                                                                    <span className="text-xs text-gray-400">{status}</span>
                                                                    <motion.div
                                                                        className="h-1 flex-1 bg-cyan-500/20 rounded-full"
                                                                        animate={{ scaleX: [0.3, 0.7, 0.5] }}
                                                                        transition={{ duration: 2, delay: idx * 0.3, repeat: Infinity }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="space-y-2">
                                                            {section.metrics.indicators.map((indicator, idx) => (
                                                                <div key={indicator} className="flex items-center gap-2">
                                                                    <motion.div
                                                                        className="w-1.5 h-1.5 rounded-full bg-purple-500"
                                                                        animate={{ scale: [0.8, 1.2, 0.8] }}
                                                                        transition={{ duration: 1, delay: idx * 0.2, repeat: Infinity }}
                                                                    />
                                                                    <span className="text-xs text-gray-400">{indicator}</span>
                                                                    <motion.div
                                                                        className="h-1 flex-1 bg-purple-500/20 rounded-full"
                                                                        animate={{ scaleX: [0.5, 0.9, 0.7] }}
                                                                        transition={{ duration: 2, delay: idx * 0.3, repeat: Infinity }}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Processing Lines */}
                                            <div className="absolute inset-x-8 bottom-4">
                                                {[...Array(3)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="absolute w-full h-[1px]"
                                                        style={{ bottom: `${i * 8}px` }}
                                                        animate={{
                                                            opacity: [0, 0.5, 0],
                                                            x: ['-100%', '100%']
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            delay: i * 0.3,
                                                            repeat: Infinity
                                                        }}
                                                    >
                                                        <div className={`h-full bg-gradient-to-r from-transparent via-${section.color.split('-')[1]}-500/30 to-transparent`} />
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <div className="mt-8 flex justify-end relative">
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