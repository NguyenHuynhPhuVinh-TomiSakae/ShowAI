import { motion } from 'framer-motion';
import { FaSearch, FaStar, FaUsers, FaRobot } from 'react-icons/fa';

const features = [
    {
        icon: <FaSearch className="h-6 w-6" />,
        title: 'Tìm Kiếm Thông Minh',
        description: 'Dễ dàng tìm kiếm công cụ AI phù hợp với nhu cầu của bạn thông qua hệ thống phân loại thông minh.'
    },
    {
        icon: <FaStar className="h-6 w-6" />,
        title: 'Đánh Giá Chi Tiết',
        description: 'Xem đánh giá và nhận xét từ cộng đồng người dùng về các công cụ AI.'
    },
    {
        icon: <FaUsers className="h-6 w-6" />,
        title: 'Cộng Đồng Năng Động',
        description: 'Tham gia thảo luận, chia sẻ kinh nghiệm và học hỏi từ cộng đồng người dùng AI.'
    },
    {
        icon: <FaRobot className="h-6 w-6" />,
        title: 'Cập Nhật Liên Tục',
        description: 'Luôn cập nhật những công cụ AI mới nhất và xu hướng công nghệ hiện đại.'
    }
];

export default function Features() {
    return (
        <div className="relative bg-gradient-to-b from-[#0F172A] to-[#1E293B] py-20 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-0 w-1/2 h-1/2 bg-[#3E52E8]/5 rounded-full blur-3xl" />
                <div className="absolute -right-1/4 bottom-0 w-1/2 h-1/2 bg-[#2A3284]/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent 
                        bg-gradient-to-r from-blue-300 to-purple-400 leading-relaxed py-1">
                        Tính Năng Nổi Bật
                    </h2>
                    <p className="mt-4 text-lg text-gray-300">
                        Khám phá những tính năng giúp bạn tối ưu trải nghiệm với AI
                    </p>
                </motion.div>

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
                                <p className="text-gray-300">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}