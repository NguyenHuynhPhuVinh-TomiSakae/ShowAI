import React, { useState } from 'react';
import { FaSearch, FaStar, FaUsers, FaRobot, FaBrain, FaCode, FaImage } from 'react-icons/fa';
import { motion } from 'framer-motion';

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
        name: 'Novita',
        description: 'Nền tảng tạo ảnh AI tiên tiến với đa dạng mô hình từ Stable Diffusion, hỗ trợ nhiều phong cách và tính năng độc đo',
        features: ['Đa dạng mô hình AI', 'Tối ưu cho anime/manga', 'Tạo ảnh chất lượng cao']
    },
    {
        icon: <FaRobot className="w-8 h-8" />,
        name: 'OpenRouter',
        description: 'Tích hợp đa dạng các mô hình AI hàng đầu trong một API duy nhất',
        features: ['Nhiều mô hình AI', 'Dễ dàng tích hợp', 'Chi phí tối ưu']
    }
];

const aiModels = [
    {
        icon: <FaBrain className="w-8 h-8" />,
        name: 'Gemini Exp 1121',
        description: 'Mô hình ngôn ngữ tiên tiến nhất từ Google với khả năng xử lý đa nhiệm vụ',
        features: ['Đa phương thức', 'Tốc độ xử lý nhanh', 'Độ chính xác cao']
    },
    {
        icon: <FaRobot className="w-8 h-8" />,
        name: 'Llama 3.2 90B Text',
        description: 'Mô hình ngôn ngữ lớn với 90 tỷ tham số từ Meta AI',
        features: ['Hiểu ngữ cảnh sâu', 'Đa ngôn ngữ', 'Tối ưu cho văn bản']
    },
    {
        icon: <FaCode className="w-8 h-8" />,
        name: 'Marco-o1',
        description: 'Mô hình chuyên biệt cho lập trình và phân tích mã nguồn',
        features: ['Phân tích mã nguồn', 'Gợi ý code', 'Debug thông minh']
    },
    {
        icon: <FaBrain className="w-8 h-8" />,
        name: 'Qwen 2 72B',
        description: 'Mô hình lớn nhất từ Alibaba, ngang tầm với Meta Llama 3 và tốt nhất cho tiếng Trung. Hỗ trợ 128k token.',
        features: ['Xử l ngôn ngữ tự nhiên', 'Hỗ trợ đa ngôn ngữ', 'Ngữ cảnh dài 128k']
    }
];

const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-gray-800 rounded-lg p-4 sm:p-6 relative group hover:bg-gray-800/80 
                    transition-all duration-300 overflow-hidden
                    border border-gray-700/50 hover:border-blue-500/50
                    shadow-lg hover:shadow-blue-500/20">
        <div className="absolute -top-2 -left-2 w-4 h-4">
            <div className="absolute w-full h-[1px] bg-blue-500/50 transform rotate-45" />
            <div className="absolute h-full w-[1px] bg-blue-500/50" />
        </div>
        <div className="absolute -top-2 -right-2 w-4 h-4">
            <div className="absolute w-full h-[1px] bg-blue-500/50 transform -rotate-45" />
            <div className="absolute h-full w-[1px] bg-blue-500/50 right-0" />
        </div>

        <motion.div
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="absolute inset-x-8 top-0">
            <motion.div
                className="h-[1px] w-full"
                animate={{
                    background: ['linear-gradient(90deg, transparent, #3B82F6, transparent)',
                        'linear-gradient(90deg, transparent, transparent, transparent)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </div>

        <div className="absolute inset-0 opacity-5 bg-circuit-pattern" />

        {children}
    </div>
);

const FeaturesContent = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {features.map((feature, index) => (
            <Card key={index}>
                <div className="text-blue-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                    {feature.features.map((item) => (
                        <li key={item} className="text-gray-200">{item}</li>
                    ))}
                </ul>
            </Card>
        ))}
    </div>
);

const IntegrationContent = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {aiServices.map((service) => (
            <Card key={service.name}>
                <div className="text-blue-500 mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{service.name}</h3>
                <p className="text-gray-300 mb-4">{service.description}</p>
                <ul className="space-y-2">
                    {service.features.map((feature) => (
                        <li key={feature} className="text-gray-200">{feature}</li>
                    ))}
                </ul>
            </Card>
        ))}
    </div>
);

const ModelsContent = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {aiModels.map((model) => (
            <Card key={model.name}>
                <div className="text-blue-500 mb-4">{model.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{model.name}</h3>
                <p className="text-gray-300 mb-4">{model.description}</p>
                <ul className="space-y-2">
                    {model.features.map((feature) => (
                        <li key={feature} className="text-gray-200">{feature}</li>
                    ))}
                </ul>
            </Card>
        ))}
    </div>
);

export default function CombinedFeatures() {
    const [activeSection, setActiveSection] = useState<'features' | 'integration' | 'models'>('features');
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleSectionChange = (section: typeof activeSection) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setActiveSection(section);
            setIsTransitioning(false);
        }, 300);
    };

    const getContent = () => {
        const content = {
            features: <FeaturesContent />,
            integration: <IntegrationContent />,
            models: <ModelsContent />
        }[activeSection] || <FeaturesContent />;

        return (
            <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="relative"
            >
                {isTransitioning && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 0.3 }}
                    />
                )}
                {content}
            </motion.div>
        );
    };

    return (
        <div className="py-8 sm:py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="relative border-2 border-gray-700/50 rounded-2xl p-4 sm:p-8 
                               bg-gradient-to-b from-gray-900 via-gray-800/50 to-gray-900">
                    {/* Góc máy */}
                    {['-top-2 -left-2', '-top-2 -right-2', '-bottom-2 -left-2', '-bottom-2 -right-2'].map((position, i) => (
                        <div key={i} className={`absolute ${position} w-6 h-6`}>
                            <motion.div
                                className="absolute inset-0 border-2 border-blue-500/30"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="absolute inset-2 bg-blue-500/10 rounded-full" />
                            <motion.div
                                className="absolute inset-[6px] bg-blue-500/30 rounded-full"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    ))}

                    {/* Đường ống dẫn điện */}
                    <div className="absolute -left-3 top-1/4 w-6 h-32">
                        <div className="absolute inset-0 border-l-2 border-blue-500/30" />
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute left-0 w-2 h-2 bg-blue-500/30"
                                style={{ top: `${i * 40}%` }}
                                animate={{
                                    opacity: [0.3, 1, 0.3],
                                    width: ['8px', '16px', '8px']
                                }}
                                transition={{
                                    duration: 2,
                                    delay: i * 0.3,
                                    repeat: Infinity
                                }}
                            />
                        ))}
                    </div>

                    {/* Điều chỉnh bảng điều khiển trên */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4
                                  bg-gray-800 px-3 sm:px-6 py-1 sm:py-2 rounded-full border border-gray-700
                                  flex items-center gap-2 sm:gap-4">
                        <motion.div
                            className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-green-500/50"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <div className="text-[10px] sm:text-xs text-gray-400 font-mono">SYSTEM ACTIVE</div>
                        <motion.div
                            className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-blue-500/50"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
                        />
                    </div>

                    {/* Thêm đường dẫn năng lượng */}
                    <div className="absolute -right-3 top-1/3 w-6 h-40">
                        <div className="absolute inset-0 border-r-2 border-blue-500/30" />
                        {[...Array(4)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute right-0 w-2 h-2 bg-blue-500/30"
                                style={{ top: `${i * 30}%` }}
                                animate={{
                                    opacity: [0.3, 1, 0.3],
                                    width: ['8px', '16px', '8px']
                                }}
                                transition={{
                                    duration: 2,
                                    delay: i * 0.3,
                                    repeat: Infinity
                                }}
                            />
                        ))}
                    </div>

                    {/* Điều chỉnh bảng điều khiển góc trên phải */}
                    <div className="hidden sm:block absolute top-4 right-4 bg-gray-800/80 rounded-lg p-3
                                  border border-gray-700/50 text-xs font-mono">
                        <div className="flex items-center gap-2 mb-2">
                            <motion.div
                                className="w-2 h-2 rounded-full bg-green-500"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span className="text-gray-400">SYSTEM READY</span>
                        </div>
                        <div className="space-y-1">
                            {['SCANNING', 'PROCESSING', 'RENDERING'].map((status, i) => (
                                <div key={status} className="flex items-center gap-2">
                                    <motion.div
                                        className="h-1 w-12 bg-blue-500/20 rounded-full overflow-hidden"
                                        animate={{
                                            backgroundColor: [
                                                'rgba(59,130,246,0.2)',
                                                'rgba(59,130,246,0.4)',
                                                'rgba(59,130,246,0.2)'
                                            ]
                                        }}
                                        transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                                    >
                                        <motion.div
                                            className="h-full bg-blue-500"
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                                        />
                                    </motion.div>
                                    <span className="text-gray-500">{status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nội dung chính */}
                    <div className="space-y-6 sm:space-y-12 mt-6 sm:mt-0">
                        {/* Tiêu đề với đèn báo */}
                        <motion.div
                            className="text-center relative pt-4 sm:pt-0"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-4">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-500/50"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            delay: i * 0.2,
                                            repeat: Infinity
                                        }}
                                    />
                                ))}
                            </div>
                            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2 px-2">
                                {activeSection === 'features'
                                    ? 'Tính Năng Nổi Bật'
                                    : activeSection === 'integration'
                                        ? 'Tích Hợp Đa Dạng API AI'
                                        : 'Mô Hình AI Hàng Đầu'}
                            </h2>

                            {/* Thanh trạng thái */}
                            <div className="max-w-[200px] sm:max-w-xs mx-auto mt-2 sm:mt-4 bg-gray-800 rounded-lg p-1.5 sm:p-2
                                          border border-gray-700/50">
                                <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400">
                                    <span>Status:</span>
                                    <motion.span
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        OPERATIONAL
                                    </motion.span>
                                </div>
                                <motion.div
                                    className="h-0.5 sm:h-1 bg-blue-500/20 rounded-full mt-1 sm:mt-2"
                                    animate={{
                                        scaleX: [0.3, 1, 0.3],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                />
                            </div>
                        </motion.div>

                        {/* Grid nội dung */}
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* Đường kết nối */}
                            <div className="absolute inset-0 grid grid-cols-4 gap-6 pointer-events-none">
                                {[...Array(3)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="col-span-1 border-t-2 border-blue-500/20"
                                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                                        transition={{
                                            duration: 2,
                                            delay: i * 0.3,
                                            repeat: Infinity
                                        }}
                                    />
                                ))}
                            </div>

                            {getContent()}
                        </motion.div>

                        {/* Nút điều khiển phân trang cải tiến */}
                        <motion.div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 sm:mt-8">
                            {['features', 'integration', 'models'].map((section) => (
                                <button
                                    key={section}
                                    onClick={() => handleSectionChange(section as any)}
                                    className={`px-3 sm:px-6 py-2 rounded-lg relative overflow-hidden text-xs sm:text-sm
                                              ${activeSection === section ? 'bg-blue-500/20' : 'bg-gray-800'}
                                              border border-gray-700 hover:border-blue-500/50
                                              transition-all duration-300 group`}
                                    disabled={isTransitioning}
                                >
                                    {/* Hiệu ứng loading khi chuyển trang */}
                                    {isTransitioning && activeSection === section && (
                                        <motion.div
                                            className="absolute inset-0 bg-blue-500/10"
                                            animate={{
                                                opacity: [0.2, 0.5, 0.2]
                                            }}
                                            transition={{ duration: 0.3, repeat: Infinity }}
                                        />
                                    )}

                                    {/* Đèn trạng thái cải tiến */}
                                    <div className="absolute top-1.5 right-1.5 w-2 h-2">
                                        <motion.div
                                            className={`absolute inset-0 rounded-full 
                                                      ${activeSection === section ? 'bg-green-500' : 'bg-gray-500'}`}
                                            animate={activeSection === section ? {
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 1, 0.5]
                                            } : {}}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                        {activeSection === section && (
                                            <motion.div
                                                className="absolute inset-0 rounded-full bg-green-500"
                                                animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            />
                                        )}
                                    </div>

                                    <span className="relative z-10 text-sm font-medium text-gray-300
                                                   group-hover:text-white transition-colors">
                                        {section === 'features' ? 'Tính năng' :
                                            section === 'integration' ? 'API' : 'Mô hình'}
                                    </span>

                                    {/* Hiệu ứng quét nâng cao */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent 
                                                 via-blue-500/10 to-transparent"
                                        animate={{ x: [-100, 200] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                </button>
                            ))}
                        </motion.div>
                    </div>

                    {/* Bảng thông số góc dưới - ẩn trên mobile */}
                    <div className="hidden sm:block absolute bottom-4 right-4 bg-gray-800/80 rounded-lg p-3
                                  border border-gray-700/50 text-xs font-mono">
                        <div className="flex items-center gap-2 text-gray-400">
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            System Load:
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {Math.floor(Math.random() * 30 + 70)}%
                            </motion.span>
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-2">
                            {['CPU', 'RAM', 'NETWORK', 'STORAGE'].map((metric) => (
                                <div key={metric} className="flex items-center gap-1">
                                    <motion.div
                                        className="h-1 w-8 bg-blue-500/20 rounded-full overflow-hidden"
                                        animate={{
                                            backgroundColor: ['rgba(59,130,246,0.2)',
                                                'rgba(59,130,246,0.4)',
                                                'rgba(59,130,246,0.2)']
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <motion.div
                                            className="h-full bg-blue-500"
                                            animate={{ width: ['30%', '70%', '30%'] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        />
                                    </motion.div>
                                    <span className="text-gray-500">{metric}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}