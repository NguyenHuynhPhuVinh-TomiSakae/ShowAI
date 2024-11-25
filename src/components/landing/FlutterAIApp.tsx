import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaMobileAlt, FaRocket, FaBrain, FaCode, FaGithub, FaAndroid } from 'react-icons/fa';

const FlutterAIApp = () => {
    return (
        <div className="relative bg-gradient-to-b from-[#0B1120] via-[#131B2E] to-[#0B1120] py-20 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                {/* Lưới nền */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* Các vòng tròn gradient */}
                <div className="absolute top-0 -left-1/4 w-1/2 h-1/2">
                    <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent blur-2xl" />
                </div>
                <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2">
                    <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent blur-2xl" />
                </div>

                {/* Các đường kẻ ngang */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -100 }}
                        animate={{
                            opacity: [0.1, 0.3, 0.1],
                            x: ['-100%', '100%']
                        }}
                        transition={{
                            duration: 15,
                            delay: i * 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute h-[1px] w-[200px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
                        style={{ top: `${20 + i * 15}%` }}
                    />
                ))}

                {/* Các điểm sáng */}
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            opacity: 0,
                            scale: 0,
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight
                        }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                    />
                ))}

                {/* Hiệu ứng quét */}
                <motion.div
                    animate={{
                        opacity: [0, 0.5, 0],
                        height: ['0%', '100%'],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent 
                        bg-gradient-to-r from-blue-400 to-purple-400 mb-6
                        leading-relaxed pb-4">
                        Ứng Dụng Android Được Tạo Bởi AI
                    </h2>
                    <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                        Trải nghiệm ShowAI trên điện thoại Android của bạn với ứng dụng được phát triển hoàn toàn bằng Flutter
                        và sự hỗ trợ của AI, dù chưa có kinh nghiệm lập trình mobile trước đây.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Features */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        className="space-y-8"
                    >
                        {[
                            {
                                icon: <FaMobileAlt className="w-6 h-6" />,
                                title: "Giao Diện Thân Thiện",
                                description: "UI/UX được thiết kế bởi AI để tối ưu trải nghiệm người dùng trên mobile"
                            },
                            {
                                icon: <FaRocket className="w-6 h-6" />,
                                title: "Hiệu Năng Tối Ưu",
                                description: "Được phát triển với Flutter để đảm bảo ứng dụng chạy mượt mà và nhanh chóng"
                            },
                            {
                                icon: <FaBrain className="w-6 h-6" />,
                                title: "100% Code Từ AI",
                                description: "Toàn bộ code được tạo bởi AI, từ layout đến logic xử lý"
                            },
                            {
                                icon: <FaCode className="w-6 h-6" />,
                                title: "Mã Nguồn Mở",
                                description: "Dự án được chia sẻ công khai trên GitHub để cộng đồng có thể tham khảo"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.3 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-4 p-6 rounded-xl bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 
                                    border border-[#3E52E8]/30 hover:border-[#3E52E8]/50 transition-all duration-300
                                    group hover:shadow-lg hover:shadow-blue-500/10"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#3E52E8]/20 
                                    flex items-center justify-center text-blue-400
                                    group-hover:bg-[#3E52E8]/30 transition-colors duration-300">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-gray-300">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}

                        <div className="flex gap-4 mt-8">
                            <a
                                href="/android/ShowAI-v1.1.1.apk"
                                download
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 
                                    text-white px-6 py-3 rounded-lg transition duration-300"
                            >
                                <FaAndroid size={24} />
                                <span>Tải Ứng Dụng</span>
                            </a>
                            <a
                                href="https://github.com/NguyenHuynhPhuVinh-TomiSakae/ShowAIApp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 
                                    text-white px-6 py-3 rounded-lg transition duration-300"
                            >
                                <FaGithub size={24} />
                                <span>GitHub</span>
                            </a>
                        </div>
                    </motion.div>

                    {/* Right side - Phone mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                            rounded-full blur-3xl opacity-30 animate-pulse" />
                        <div className="relative">
                            <Image
                                src="/showai.jpg"
                                alt="ShowAI Android App"
                                width={400}
                                height={800}
                                className="mx-auto"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default FlutterAIApp;