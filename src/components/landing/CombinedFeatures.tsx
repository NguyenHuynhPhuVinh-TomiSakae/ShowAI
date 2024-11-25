import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FaSearch, FaStar, FaUsers, FaRobot, FaBrain, FaCode, FaImage, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const features = [
    {
        icon: <FaSearch className="h-6 w-6" />,
        title: 'Tìm Kiếm Thông Minh',
        description: 'Dễ dàng tìm kiếm công cụ AI phù hợp với nhu cầu của bạn thông qua hệ thống phân loại thông minh.',
        features: ['Tìm kiếm theo danh mục', 'Lọc theo đánh giá', 'Gợi ý thông minh']
    },
    {
        icon: <FaStar className="h-6 w-6" />,
        title: 'Đánh Giá Chi Tiết',
        description: 'Xem đánh giá và nhận xét từ cộng đồng người dùng về các công cụ AI.',
        features: ['Đánh giá có xác thực', 'So sánh công cụ', 'Thống kê chi tiết']
    },
    {
        icon: <FaUsers className="h-6 w-6" />,
        title: 'Cộng Đồng Năng Động',
        description: 'Tham gia thảo luận, chia sẻ kinh nghiệm và học hỏi từ cộng đồng người dùng AI.',
        features: ['Diễn đàn trao đổi', 'Chia sẻ kinh nghiệm', 'Hỗ trợ kỹ thuật']
    },
    {
        icon: <FaRobot className="h-6 w-6" />,
        title: 'Cập Nhật Liên Tục',
        description: 'Luôn cập nhật những công cụ AI mới nhất và xu hướng công nghệ hiện đại.',
        features: ['Thông báo cập nhật', 'Tin tức AI mới nhất', 'Phân tích xu hướng']
    }
];

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

export default function CombinedFeatures() {
    const [activeSection, setActiveSection] = useState<'features' | 'integration'>('features');

    const FeaturesContent = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 50
                    }}
                    className="group relative bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 
                             backdrop-blur-sm rounded-xl p-6 border border-[#2A3284]/50
                             hover:border-[#3E52E8]/50 transition-all duration-300
                             hover:shadow-lg hover:shadow-[#3E52E8]/20"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3E52E8]/5 to-transparent 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    <div className="relative">
                        <div className="text-[#3E52E8] mb-4 transform group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-100 mb-2">
                            {feature.title}
                        </h3>
                        <p className="text-gray-300 mb-4">{feature.description}</p>
                        <ul className="space-y-2">
                            {feature.features.map((item) => (
                                <li key={item} className="text-gray-200 flex items-center">
                                    <FaRobot className="w-4 h-4 mr-2 text-[#3E52E8]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const IntegrationContent = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiServices.map((service, index) => (
                <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
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
    );

    return (
        <div className="relative bg-transparent py-12 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="relative bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/90 rounded-2xl p-8 backdrop-blur-sm border border-[#2A3284]/30 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute left-1/4 top-0 w-1/2 h-1/2 bg-[#3E52E8]/5 rounded-full blur-3xl" />
                        <div className="absolute -right-1/4 bottom-0 w-1/2 h-1/2 bg-[#2A3284]/5 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 0.5 }}
                            className="text-center mb-8"
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent 
                                bg-gradient-to-r from-blue-300 to-purple-400 leading-relaxed py-1">
                                {activeSection === 'features' ? 'Tính Năng Nổi Bật' : 'Tích Hợp Đa Dạng API AI'}
                            </h2>
                            <p className="mt-4 text-lg text-gray-300">
                                {activeSection === 'features'
                                    ? 'Khám phá những tính năng giúp bạn tối ưu trải nghiệm với AI'
                                    : 'ShowAI tận dụng sức mạnh của nhiều API AI hàng đầu để mang đến trải nghiệm toàn diện'}
                            </p>
                        </motion.div>

                        <div className="relative w-full">
                            <AnimatePresence mode="wait">
                                {activeSection === 'features' && (
                                    <motion.div
                                        key="features"
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -100, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full"
                                    >
                                        <FeaturesContent />
                                    </motion.div>
                                )}

                                {activeSection === 'integration' && (
                                    <motion.div
                                        key="integration"
                                        initial={{ x: 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 100, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full"
                                    >
                                        <IntegrationContent />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex justify-center gap-4 mt-8">
                            <button
                                onClick={() => setActiveSection('features')}
                                className={`p-3 rounded-full bg-[#1E293B]/50 text-white ${activeSection === 'integration' ? 'opacity-100' : 'opacity-0'
                                    } transition-opacity hover:bg-[#3E52E8]/50`}
                            >
                                <FaChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setActiveSection('integration')}
                                className={`p-3 rounded-full bg-[#1E293B]/50 text-white ${activeSection === 'features' ? 'opacity-100' : 'opacity-0'
                                    } transition-opacity hover:bg-[#3E52E8]/50`}
                            >
                                <FaChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}