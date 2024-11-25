import { motion } from 'framer-motion';
import { FaRobot, FaBrain, FaCode, FaImage } from 'react-icons/fa';

const AIIntegration = () => {
    const aiServices = [
        {
            icon: <FaBrain className="w-8 h-8" />,
            name: 'Google Gemini API',
            description: 'Mô hình ngôn ngữ tiên tiến cho phân tích và tạo nội dung thông minh',
            features: ['Phân tích dữ liệu', 'Tạo nội dung', 'Trả lời câu hỏi']
        },
        {
            icon: <FaCode className="w-8 h-8" />,
            name: 'Groq',
            description: 'API AI với tốc độ phản hồi cực nhanh và độ chính xác cao',
            features: ['Phản hồi tức thì', 'Xử lý ngôn ngữ tự nhiên', 'Tối ưu hiệu năng']
        },
        {
            icon: <FaImage className="w-8 h-8" />,
            name: 'Flux',
            description: 'Công nghệ tạo ảnh AI thông minh và dễ sử dụng',
            features: ['Tạo ảnh từ văn bản', 'Chỉnh sửa ảnh AI', 'Tạo biến thể ảnh']
        },
        {
            icon: <FaRobot className="w-8 h-8" />,
            name: 'OpenRouter',
            description: 'Tích hợp đa dạng các mô hình AI hàng đầu trong một API duy nhất',
            features: ['Nhiều mô hình AI', 'Dễ dàng tích hợp', 'Chi phí tối ưu']
        }
    ];

    return (
        <div className="relative bg-gradient-to-b from-[#1E293B] to-[#0F172A] py-20 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-[#3E52E8]/10 rounded-full blur-3xl" />
                <div className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-[#2A3284]/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{
                        once: false,
                        amount: 0.3
                    }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Tích Hợp Đa Dạng API AI
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        ShowAI tận dụng sức mạnh của nhiều API AI hàng đầu để mang đến trải nghiệm toàn diện và đa dạng cho người dùng
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {aiServices.map((service, index) => (
                        <motion.div
                            key={service.name}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{
                                once: false,
                                amount: 0.3
                            }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 50
                            }}
                            className="group relative bg-gradient-to-br from-[#1E293B]/95 to-[#0F172A]/95 
                                       backdrop-blur-sm rounded-xl p-6 border border-[#2A3284]/50
                                       hover:border-[#3E52E8]/50 transition-all duration-300
                                       hover:shadow-lg hover:shadow-[#3E52E8]/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#3E52E8]/5 to-transparent 
                                          opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                            <div className="relative">
                                <div className="text-[#3E52E8] mb-4 transform group-hover:scale-110 transition-transform duration-300">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400">{service.name}</h3>
                                <p className="text-gray-300 mb-4">{service.description}</p>
                                <ul className="space-y-2">
                                    {service.features.map((feature) => (
                                        <li key={feature} className="text-gray-200 flex items-center">
                                            <FaRobot className="w-4 h-4 mr-2 text-[#3E52E8]" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AIIntegration;