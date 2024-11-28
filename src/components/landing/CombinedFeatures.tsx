import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { FaSearch, FaStar, FaUsers, FaRobot, FaBrain, FaCode, FaImage, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';

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
        features: ['Xử lý ngôn ngữ tự nhiên', 'Hỗ trợ đa ngôn ngữ', 'Ngữ cảnh dài 128k']
    }
];

const LightningEffect = ({ direction, style }: {
    direction: 'horizontal' | 'vertical';
    style?: React.CSSProperties;
}) => (
    <div style={style} className="relative">
        <div className={`absolute ${direction === 'horizontal' ? 'h-[1px] w-full' : 'w-[1px] h-full'} bg-[#3E52E8]/10`} />
        <motion.div
            className={`absolute ${direction === 'horizontal' ? 'h-[1px] w-[20%]' : 'w-[1px] h-[20%]'} bg-[#3E52E8]/40`}
            animate={{
                [direction === 'horizontal' ? 'x' : 'y']: ['0%', '400%'],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 5
            }}
        />
    </div>
);

const CardWrapper = React.memo(({ children, index }: { children: React.ReactNode, index: number }) => {
    const animationConfig = useMemo(() => ({
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: {
            duration: 0.5,
            delay: index * 0.1,
            type: "tween"
        }
    }), [index]);

    return (
        <motion.div
            {...animationConfig}
            className="group relative bg-gradient-to-br from-[#2A3284]/10 to-[#3E52E8]/10 
                       backdrop-blur-md rounded-2xl p-6 border border-[#3E52E8]/20
                       hover:border-[#3E52E8]/50 transition-all duration-300
                       hover:shadow-lg hover:shadow-[#3E52E8]/20
                       will-change-transform"
        >
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
});
CardWrapper.displayName = 'CardWrapper';

const BackgroundEffects = React.memo(() => {
    return (
        <div className="absolute inset-0">
            {/* Grid Lines */}
            {[...Array(20)].map((_, i) => (
                <React.Fragment key={i}>
                    <LightningEffect
                        direction="horizontal"
                        style={{ top: `${(i + 1) * 5}%` }}
                    />
                    <LightningEffect
                        direction="vertical"
                        style={{ left: `${(i + 1) * 5}%` }}
                    />
                </React.Fragment>
            ))}

            {/* Corner Spotlights */}
            <div className="absolute -top-[40px] -left-[40px] w-[20rem] h-[20rem]">
                <motion.div
                    className="absolute top-0 left-0 w-12 h-full bg-gradient-to-b from-white/70 via-white/30 to-transparent transform origin-top-left blur-[2px]"
                    animate={{ rotate: [25, 35, 25] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-0 left-0 w-full h-12 bg-gradient-to-r from-white/70 via-white/30 to-transparent transform origin-top-left blur-[2px]"
                    animate={{ rotate: [25, 35, 25] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            <div className="absolute -top-[40px] -right-[40px] w-[20rem] h-[20rem]">
                <motion.div
                    className="absolute top-0 right-0 w-12 h-full bg-gradient-to-b from-white/70 via-white/30 to-transparent transform origin-top-right blur-[2px]"
                    animate={{ rotate: [-25, -35, -25] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-0 right-0 w-full h-12 bg-gradient-to-l from-white/70 via-white/30 to-transparent transform origin-top-right blur-[2px]"
                    animate={{ rotate: [-25, -35, -25] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Moving Points */}
            <div className="absolute inset-0">
                {/* Thêm các điểm chuyển động */}
                {[
                    { color: 'blue-400/50', shadow: 'rgba(96, 165, 250, 0.3)', top: '15%', left: '20%' },
                    { color: 'purple-400/50', shadow: 'rgba(168, 85, 247, 0.3)', top: '10%', right: '25%' },
                    { color: 'cyan-400/50', shadow: 'rgba(34, 211, 238, 0.3)', top: '25%', left: '40%' },
                    { color: 'indigo-400/50', shadow: 'rgba(129, 140, 248, 0.3)', top: '20%', right: '35%' },
                    { color: 'pink-400/50', shadow: 'rgba(244, 114, 182, 0.3)', top: '15%', left: '65%' }
                ].map((point, index) => (
                    <motion.div
                        key={index}
                        className={`absolute h-2 w-2 rounded-full bg-${point.color}`}
                        style={{
                            boxShadow: `0 0 10px 2px ${point.shadow}`,
                            top: point.top,
                            left: point.left,
                            right: point.right
                        }}
                        animate={{
                            x: [10, -10, 10],
                            y: [5, -5, 5],
                        }}
                        transition={{
                            duration: 4 + index,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: index * 0.5
                        }}
                    />
                ))}
            </div>
        </div>
    );
});
BackgroundEffects.displayName = 'BackgroundEffects';

const IconWrapper = ({ icon }: { icon: React.ReactNode }) => (
    <div className="text-[#3E52E8] mb-4 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
    </div>
);

const FeaturesContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
            <CardWrapper key={index} index={index}>
                <div className="relative">
                    <IconWrapper icon={feature.icon} />
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
            </CardWrapper>
        ))}
    </div>
);

const IntegrationContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiServices.map((service, index) => (
            <CardWrapper key={service.name} index={index}>
                <div className="relative">
                    <IconWrapper icon={service.icon} />
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
            </CardWrapper>
        ))}
    </div>
);

const ModelsContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiModels.map((model, index) => (
            <CardWrapper key={model.name} index={index}>
                <div className="relative">
                    <IconWrapper icon={model.icon} />
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400">{model.name}</h3>
                    <p className="text-gray-300 mb-4">{model.description}</p>
                    <ul className="space-y-2">
                        {model.features.map((feature) => (
                            <li key={feature} className="text-gray-200 flex items-center">
                                <FaRobot className="w-4 h-4 mr-2 text-[#3E52E8]" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </CardWrapper>
        ))}
    </div>
);

export default function CombinedFeatures() {
    const [activeSection, setActiveSection] = useState<'features' | 'integration' | 'models'>('features');
    const isDesktop = useMediaQuery({ minWidth: 1024 });

    const contentSections = useMemo(() => ({
        features: <FeaturesContent />,
        integration: <IntegrationContent />,
        models: <ModelsContent />
    }), []);

    return (
        <LazyMotion features={domAnimation}>
            <div className="relative bg-[#0F172A] py-16 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="relative bg-gradient-to-br from-[#1E293B]/50 to-[#0F172A]/50 rounded-3xl p-8 
                                  backdrop-blur-lg border border-[#3E52E8]/20 overflow-hidden
                                  shadow-lg hover:shadow-xl transition-all duration-500">
                        <BackgroundEffects />

                        <div className="relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="text-center mb-12"
                            >
                                <h2 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent 
                                    bg-gradient-to-r from-blue-400 to-purple-500 leading-tight py-2">
                                    {activeSection === 'features'
                                        ? 'Tính Năng Nổi Bật'
                                        : activeSection === 'integration'
                                            ? 'Tích Hợp Đa Dạng API AI'
                                            : 'Mô Hình AI Hàng Đầu'}
                                </h2>
                                <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
                                    {activeSection === 'features'
                                        ? 'Khám phá những tính năng giúp bạn tối ưu trải nghiệm với AI'
                                        : activeSection === 'integration'
                                            ? 'ShowAI tận dụng sức mạnh của nhiều API AI hàng đầu để mang đến trải nghiệm toàn diện'
                                            : 'Khám phá các mô hình AI tiên tiến nhất hiện nay'}
                                </p>
                            </motion.div>

                            <div className="relative w-full">
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={activeSection}
                                        initial={{ x: isDesktop ? 100 : 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: isDesktop ? -100 : -50, opacity: 0 }}
                                        transition={{ duration: 0.3, type: "tween" }}
                                        className="w-full"
                                    >
                                        {contentSections[activeSection]}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="flex justify-center gap-6 mt-12">
                                <button
                                    onClick={() => {
                                        if (activeSection === 'integration') setActiveSection('features');
                                        if (activeSection === 'models') setActiveSection('integration');
                                    }}
                                    className={`p-4 rounded-full bg-[#3E52E8]/20 text-white 
                                        ${activeSection !== 'features' ? 'opacity-100' : 'opacity-0'}
                                        transition-all hover:bg-[#3E52E8]/50`}
                                >
                                    <FaChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (activeSection === 'features') setActiveSection('integration');
                                        if (activeSection === 'integration') setActiveSection('models');
                                    }}
                                    className={`p-4 rounded-full bg-[#3E52E8]/20 text-white 
                                        ${activeSection !== 'models' ? 'opacity-100' : 'opacity-0'}
                                        transition-all hover:bg-[#3E52E8]/50`}
                                >
                                    <FaChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </LazyMotion>
    );
}