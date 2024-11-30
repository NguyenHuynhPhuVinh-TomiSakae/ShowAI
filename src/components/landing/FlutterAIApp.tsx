import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaMobileAlt, FaRocket, FaBrain, FaCode, FaGithub, FaAndroid, FaVolumeMute, FaVolumeDown, FaVolumeUp } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const FlutterAIApp = () => {
    const [isPowerOn, setIsPowerOn] = useState(true);
    const [volume, setVolume] = useState(50);
    const [lastVolume, setLastVolume] = useState(50);
    const [isScreenPressed, setIsScreenPressed] = useState(false);
    const [isShuttingDown, setIsShuttingDown] = useState(false);
    const [isPoweringOn, setIsPoweringOn] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLastVolume(volume), 1000);
        return () => clearTimeout(timer);
    }, [volume]);

    const handlePowerOff = () => {
        if (isPowerOn) {
            setIsShuttingDown(true);
            setTimeout(() => {
                setIsPowerOn(false);
                setIsShuttingDown(false);
            }, 1000);
        } else {
            setIsPoweringOn(true);
            setIsPowerOn(true);
            setTimeout(() => {
                setIsPoweringOn(false);
            }, 1000);
        }
    };

    return (
        <div className="relative bg-[#070B14] py-20 overflow-hidden">
            {/* Nền Cyberpunk AI */}
            <div className="absolute inset-0">
                {/* Matrix rain effect - lưới số */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00FF9580_0.5px,transparent_1px),linear-gradient(to_bottom,#00FF9580_0.5px,transparent_1px)] 
                    bg-[size:50px_50px] opacity-10" />

                {/* Thêm viền rìa di chuyển */}
                <div className="absolute inset-0">
                    {/* Viền ngang */}
                    <div className="absolute h-[2px] bg-gradient-to-r from-transparent via-[#00FF95]/50 to-transparent w-[200px]
                        animate-[moveLeftRight_8s_linear_infinite] top-[20%]" />
                    <div className="absolute h-[2px] bg-gradient-to-r from-transparent via-[#00FF95]/50 to-transparent w-[300px]
                        animate-[moveRightLeft_12s_linear_infinite] top-[40%]" />

                    {/* Viền dọc */}
                    <div className="absolute w-[2px] bg-gradient-to-b from-transparent via-[#00FF95]/50 to-transparent h-[200px]
                        animate-[moveTopBottom_10s_linear_infinite] left-[15%]" />
                    <div className="absolute w-[2px] bg-gradient-to-b from-transparent via-[#00FF95]/50 to-transparent h-[300px]
                        animate-[moveBottomTop_15s_linear_infinite] right-[15%]" />
                </div>

                {/* Circuit paths - đường mạch */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF95] to-transparent opacity-30 animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF95] to-transparent opacity-30 animate-pulse" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#00FF95] to-transparent opacity-30 animate-pulse" />
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-[#00FF95] to-transparent opacity-30 animate-pulse" />
                </div>

                {/* Holographic circles */}
                <div className="absolute inset-0">
                    <div className="absolute h-[60rem] w-[60rem] -top-[30rem] -left-[30rem] 
                        bg-[radial-gradient(circle,#00FF9510_0%,transparent_70%)] animate-pulse [animation-duration:4s]" />
                    <div className="absolute h-[60rem] w-[60rem] -bottom-[30rem] -right-[30rem] 
                        bg-[radial-gradient(circle,#FF2D9510_0%,transparent_70%)] animate-pulse [animation-duration:6s]" />
                </div>

                {/* Neural network nodes */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_300px_at_50%_50%,#00FF9505,transparent)]" />

                {/* Cyber fog */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#070B14] via-transparent to-[#070B14] opacity-80" />

                {/* Thêm các đường viền cyber mới */}
                <div className="absolute inset-0">
                    {/* Đường viền góc */}
                    {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((position, i) => (
                        <div key={i} className={`absolute ${position} w-32 h-32
                            before:absolute before:content-[''] 
                            ${i === 0 || i === 1 ? 'before:top-0' : 'before:bottom-0'}
                            ${i === 0 || i === 2 ? 'before:left-0' : 'before:right-0'}
                            before:w-16 before:h-16
                            before:border-[#00FF95]/20
                            ${i === 0 && 'before:border-t before:border-l'}
                            ${i === 1 && 'before:border-t before:border-r'}
                            ${i === 2 && 'before:border-b before:border-l'}
                            ${i === 3 && 'before:border-b before:border-r'}
                            before:transition-all before:duration-500
                            hover:before:border-[#00FF95]/40
                            hover:before:w-20 hover:before:h-20`} />
                    ))}

                    {/* Đưng quét laser */}
                    <div className="absolute inset-0">
                        <div className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[#00FF95]/30 to-transparent
                            top-[30%] animate-[moveLeftRight_8s_linear_infinite]" />
                        <div className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-[#00FF95]/30 to-transparent
                            top-[70%] animate-[moveRightLeft_12s_linear_infinite]" />
                        <div className="absolute w-[1px] h-full bg-gradient-to-b from-transparent via-[#00FF95]/30 to-transparent
                            left-[20%] animate-[moveTopBottom_10s_linear_infinite]" />
                        <div className="absolute w-[1px] h-full bg-gradient-to-b from-transparent via-[#00FF95]/30 to-transparent
                            right-[20%] animate-[moveBottomTop_15s_linear_infinite]" />
                    </div>

                    {/* Vòng tròn năng lượng */}
                    <div className="absolute inset-0">
                        <div className="absolute w-[500px] h-[500px] -top-[250px] -left-[250px]
                            rounded-full bg-[radial-gradient(circle,#00FF95/5_0%,transparent_70%)]
                            animate-pulse [animation-duration:4s]" />
                        <div className="absolute w-[500px] h-[500px] -bottom-[250px] -right-[250px]
                            rounded-full bg-[radial-gradient(circle,#FF2D95/5_0%,transparent_70%)]
                            animate-pulse [animation-duration:6s]" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="text-center mb-8 sm:mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent 
                        bg-gradient-to-r from-[#00FF95] to-[#FF2D95] mb-4 sm:mb-6
                        leading-relaxed pb-2 sm:pb-4 [text-shadow:0_0_30px_#00FF9540]">
                        Ứng Dụng Android Được Tạo Bởi AI
                    </h2>
                    <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto px-4 sm:px-0">
                        Trải nghiệm ShowAI trên điện thoại Android của bạn với ứng dụng được phát triển hoàn toàn bằng Flutter
                        và sự hỗ trợ của AI, d cha có kinh nghiệm lập trình mobile trước đây.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
                    {/* Left side - Features */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        className="space-y-4 sm:space-y-8 px-2 sm:px-0"
                    >
                        {[
                            {
                                icon: <FaMobileAlt className="w-6 h-6" />,
                                title: "Giao Diện Thân Thiện",
                                description: "UI/UX được thiết kế bi AI để tối ưu trải nghiệm người dùng trên mobile"
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
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-4 p-6 rounded-xl bg-[#0C1221]/80
                                    border border-[#00FF95]/20 hover:border-[#00FF95]/40 transition-all duration-300
                                    group hover:shadow-lg hover:shadow-[#00FF95]/20
                                    relative overflow-hidden"
                            >
                                {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((position, i) => (
                                    <div key={i} className={`absolute ${position} w-3 h-3
                                        border-[#00FF95]/30 ${i === 0 || i === 1 ? 'border-t' : 'border-b'} 
                                        ${i === 0 || i === 2 ? 'border-l' : 'border-r'}`} />
                                ))}

                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF95]/5 to-transparent 
                                    translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <div className="relative flex-shrink-0 w-12 h-12 rounded-lg bg-[#00FF95]/10 
                                    flex items-center justify-center text-[#00FF95]
                                    group-hover:bg-[#00FF95]/20 transition-colors duration-300
                                    before:absolute before:inset-0 before:border before:border-[#00FF95]/30
                                    before:rounded-lg before:scale-90 before:opacity-0
                                    group-hover:before:scale-100 group-hover:before:opacity-100
                                    before:transition-all before:duration-300">
                                    {feature.icon}
                                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00FF95]/50
                                        group-hover:animate-pulse" />
                                </div>

                                <div className="relative">
                                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#00FF95] transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-300">{feature.description}</p>
                                    <div className="absolute -bottom-2 left-0 w-0 h-[1px] bg-gradient-to-r from-[#00FF95]/50 to-transparent
                                        group-hover:w-full transition-all duration-500" />
                                </div>
                            </motion.div>
                        ))}

                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 sm:mt-8">
                            {/* Nút Tải Ứng Dụng */}
                            <a
                                href="/android/ShowAI-v1.1.1.apk"
                                download
                                className="flex-1 flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 
                                    bg-gradient-to-r from-blue-600/80 to-blue-700/80
                                    hover:from-blue-500/80 hover:to-blue-600/80
                                    rounded-xl transition-all duration-300 group
                                    relative overflow-hidden"
                            >
                                {/* Hiệu ứng nền */}
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,0.2)_50%,transparent_75%)] 
                                    bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />

                                {/* Hiệu ứng quét */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,#00FF95/10,transparent)] 
                                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent,#00FF95/10,transparent)] 
                                        translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 delay-100" />
                                </div>

                                {/* Viền phát sáng với animation */}
                                <div className="absolute inset-[1px] rounded-xl bg-gradient-to-r from-[#00FF95]/20 to-[#0066FF]/20
                                    before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r 
                                    before:from-transparent before:via-[#00FF95]/40 before:to-transparent
                                    before:translate-x-[-200%] group-hover:before:translate-x-[200%]
                                    before:transition-transform before:duration-1000" />

                                {/* Icon container với hiệu ứng mới */}
                                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg
                                    bg-gradient-to-br from-[#00FF95]/20 to-[#0066FF]/20
                                    before:absolute before:inset-0 before:rounded-lg before:border
                                    before:border-[#00FF95]/30 before:animate-pulse
                                    after:absolute after:inset-0 after:rounded-lg after:border
                                    after:border-[#00FF95]/50 after:scale-0 group-hover:after:scale-100
                                    after:transition-transform after:duration-500">
                                    <FaAndroid size={24} className="text-[#00FF95] relative z-10 
                                        group-hover:scale-110 transition-transform duration-300" />
                                    <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-[#00FF95]">
                                        <div className="absolute inset-0 rounded-full bg-[#00FF95] animate-ping opacity-50" />
                                    </div>
                                </div>

                                {/* Text content với animation */}
                                <div className="relative flex flex-col items-start">
                                    <span className="text-sm text-[#00FF95] transform group-hover:translate-y-[-2px] 
                                        transition-transform duration-300">Android v1.1.1</span>
                                    <span className="text-lg font-bold text-white transform group-hover:translate-y-[-2px]
                                        transition-transform duration-300 delay-75">Tải Ứng Dụng</span>
                                </div>

                                {/* Góc trang trí với animation */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00FF95]
                                    group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00FF95]
                                    group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                            </a>

                            {/* Nút GitHub với hiệu ứng tương tự */}
                            <a
                                href="https://github.com/NguyenHuynhPhuVinh-TomiSakae/ShowAIApp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4
                                    bg-gradient-to-r from-gray-800/80 to-gray-900/80
                                    hover:from-gray-700/80 hover:to-gray-800/80
                                    rounded-xl transition-all duration-300 group
                                    relative overflow-hidden"
                            >
                                {/* Hiệu ứng nền */}
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,0.2)_50%,transparent_75%)] 
                                    bg-[length:250%_250%] animate-[shimmer_3s_linear_infinite]" />

                                {/* Hiệu ứng quét */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,#FF2D95/10,transparent)] 
                                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent,#FF2D95/10,transparent)] 
                                        translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 delay-100" />
                                </div>

                                {/* Viền phát sáng với animation */}
                                <div className="absolute inset-[1px] rounded-xl bg-gradient-to-r from-[#FF2D95]/20 to-[#FF2D95]/20
                                    before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r 
                                    before:from-transparent before:via-[#FF2D95]/40 before:to-transparent
                                    before:translate-x-[-200%] group-hover:before:translate-x-[200%]
                                    before:transition-transform before:duration-1000" />

                                {/* Icon container với hiệu ứng mới */}
                                <div className="relative flex items-center justify-center w-10 h-10 rounded-lg
                                    bg-gradient-to-br from-[#FF2D95]/20 to-[#FF2D95]/20
                                    before:absolute before:inset-0 before:rounded-lg before:border
                                    before:border-[#FF2D95]/30 before:animate-pulse
                                    after:absolute after:inset-0 after:rounded-lg after:border
                                    after:border-[#FF2D95]/50 after:scale-0 group-hover:after:scale-100
                                    after:transition-transform after:duration-500">
                                    <FaGithub size={24} className="text-[#FF2D95] relative z-10 
                                        group-hover:scale-110 transition-transform duration-300" />
                                    <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-[#FF2D95]">
                                        <div className="absolute inset-0 rounded-full bg-[#FF2D95] animate-ping opacity-50" />
                                    </div>
                                </div>

                                {/* Text content với animation */}
                                <div className="relative flex flex-col items-start">
                                    <span className="text-sm text-[#FF2D95] transform group-hover:translate-y-[-2px] 
                                        transition-transform duration-300">Source Code</span>
                                    <span className="text-lg font-bold text-white transform group-hover:translate-y-[-2px]
                                        transition-transform duration-300 delay-75">GitHub</span>
                                </div>

                                {/* Góc trang trí với animation */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FF2D95]
                                    group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FF2D95]
                                    group-hover:w-6 group-hover:h-6 transition-all duration-300" />
                            </a>
                        </div>
                    </motion.div>

                    {/* Right side - Phone Device */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        className="relative mt-8 lg:mt-0"
                    >
                        <div className="relative w-[280px] sm:w-[350px] h-[560px] sm:h-[700px] mx-auto">
                            {/* Advanced AI-Quantum Device 2099 */}
                            <div className={`absolute inset-0 bg-[#1A1F35] rounded-[45px] shadow-xl
                                ${!isPowerOn ? '[&_*]:!animate-none' : ''}`}>
                                {/* Holographic Neural Core - Status bar */}
                                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[35px] 
                                    bg-black/90 rounded-b-3xl flex items-center justify-between px-4
                                    border-b transition-all duration-500
                                    ${isPowerOn
                                        ? 'border-[#00FF95]/20 bg-black/90'
                                        : 'border-red-500/20 bg-black/70'}`}>
                                    {/* Quantum Scanner */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-4 h-4 rounded-full relative transition-colors duration-500
                                            ${isPowerOn ? 'bg-[#00FF95]' : 'bg-red-500/50'}`}>
                                            <div className={`absolute inset-0 rounded-full animate-ping opacity-50
                                                ${isPowerOn ? 'bg-[#00FF95]' : 'bg-red-500'}`} />
                                            <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-500
                                                ${isPowerOn
                                                    ? 'border-[#00FF95]/50 animate-[spin_4s_linear_infinite]'
                                                    : 'border-red-500/30 animate-none'}`} />
                                        </div>
                                        <div className={`w-6 h-[2px] transition-colors duration-500
                                            ${isPowerOn
                                                ? 'bg-gradient-to-r from-transparent via-[#00FF95] to-transparent'
                                                : 'bg-gradient-to-r from-transparent via-red-500 to-transparent'}`} />
                                    </div>

                                    {/* Neural Processor */}
                                    <div className={`h-6 w-24 rounded-xl bg-black/80 relative overflow-hidden p-[2px]
                                        border transition-colors duration-500
                                        ${isPowerOn ? 'border-[#00FF95]/20' : 'border-red-500/20'}`}>
                                        <div className={`absolute inset-0 transition-colors duration-500
                                            ${isPowerOn
                                                ? 'bg-[linear-gradient(90deg,transparent,#00FF95/10,transparent)]'
                                                : 'bg-[linear-gradient(90deg,transparent,#FF0000/10,transparent)]'}`} />
                                    </div>

                                    {/* Bio Metrics */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`w-4 h-4 rounded-full relative transition-colors duration-500
                                            ${isPowerOn ? 'bg-[#FF2D95]' : 'bg-red-500/50'}`}>
                                            <div className={`absolute inset-0 rounded-full animate-ping opacity-50
                                                ${isPowerOn ? 'bg-[#FF2D95]' : 'bg-red-500'}`} />
                                            <div className={`absolute inset-0 rounded-full border-2 transition-colors duration-500
                                                ${isPowerOn
                                                    ? 'border-[#FF2D95]/50 animate-[spin_4s_linear_infinite_reverse]'
                                                    : 'border-red-500/30 animate-none'}`} />
                                        </div>
                                        <div className={`w-6 h-[2px] transition-colors duration-500
                                            ${isPowerOn
                                                ? 'bg-gradient-to-r from-transparent via-[#FF2D95] to-transparent'
                                                : 'bg-gradient-to-r from-transparent via-red-500 to-transparent'}`} />
                                    </div>
                                </div>

                                {/* Main Screen Area - Chỉ phần này bị tắt */}
                                <div className="absolute top-[35px] left-2 right-2 bottom-[65px] rounded-[40px] overflow-hidden">
                                    <div className={`absolute inset-0 bg-black border border-[#00FF95]/20
                                        before:absolute before:inset-0 
                                        before:bg-[linear-gradient(90deg,transparent_49%,#00FF95/5_50%,transparent_51%)] 
                                        before:bg-[length:20px_100%]
                                        after:absolute after:inset-0 
                                        after:bg-[linear-gradient(0deg,transparent_49%,#00FF95/5_50%,transparent_51%)] 
                                        after:bg-[length:100%_20px]
                                        ${!isPowerOn ? 'before:animate-none after:animate-none' : ''}`} />

                                    <div className={`relative w-full h-full
                                        ${isShuttingDown ? 'animate-powerOff' : ''}
                                        ${isPoweringOn ? 'animate-powerOn' : ''}
                                        ${!isPowerOn ? 'opacity-0 [&_*]:animation-play-state-paused' : 'opacity-100'}`}
                                        onMouseDown={() => isPowerOn && setIsScreenPressed(true)}
                                        onMouseUp={() => isPowerOn && setIsScreenPressed(false)}
                                        onMouseLeave={() => isPowerOn && setIsScreenPressed(false)}
                                        style={{
                                            transform: isScreenPressed ? 'scale(0.995)' : 'scale(1)',
                                            transition: 'transform 0.2s ease-out'
                                        }}
                                    >
                                        <Image
                                            src="/showai.jpg"
                                            alt="ShowAI Android App"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            className="w-full h-full"
                                        />

                                        {/* Volume Indicator */}
                                        {isPowerOn && volume !== lastVolume && (
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 
                                                bg-black/80 rounded-full px-3 py-1.5
                                                transition-all duration-300">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4">
                                                        {volume === 0 ? (
                                                            <FaVolumeMute className="text-[#00FF95]" />
                                                        ) : volume < 50 ? (
                                                            <FaVolumeDown className="text-[#00FF95]" />
                                                        ) : (
                                                            <FaVolumeUp className="text-[#00FF95]" />
                                                        )}
                                                    </div>
                                                    <div className="w-24 h-1 bg-[#00FF95]/20 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#00FF95] transition-all duration-300"
                                                            style={{ width: `${volume}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Navigation - Luôn hiển thị */}
                                <div className="absolute bottom-2 left-2 right-2 h-14 
                                    bg-black/90 rounded-b-[35px] border-t border-[#00FF95]/20
                                    flex items-center justify-between px-6">
                                    {/* Neural Return */}
                                    <div className="w-12 h-12 rounded-xl bg-black/80 
                                        flex items-center justify-center group relative
                                        before:absolute before:inset-0 before:rounded-xl
                                        before:border before:border-[#00FF95]/20 before:scale-90
                                        before:transition-transform before:duration-300
                                        hover:before:scale-100">
                                        <div className="w-6 h-6 border-2 border-[#00FF95]/50 rounded-lg
                                            group-hover:border-[#00FF95] transition-colors" />
                                    </div>

                                    {/* Bio-Neural Link */}
                                    <div className={`flex flex-col items-center gap-2
                                        ${!isPowerOn ? 'opacity-50' : ''}`}>
                                        <div className="w-32 h-1 bg-gradient-to-r from-[#00FF95] via-[#00FF95]/50 to-[#FF2D95]
                                            rounded-full relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,white,transparent)] 
                                                animate-[moveLeftRight_2s_linear_infinite] opacity-50" />
                                        </div>
                                        <div className="flex gap-3">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="w-1 h-1 rounded-full bg-[#00FF95]
                                                    animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quantum Menu */}
                                    <div className="w-12 h-12 rounded-xl bg-black/80 
                                        flex items-center justify-center group relative
                                        before:absolute before:inset-0 before:rounded-xl
                                        before:border before:border-[#FF2D95]/20 before:scale-90
                                        before:transition-transform before:duration-300
                                        hover:before:scale-100">
                                        <div className="w-6 h-6 border-2 border-[#FF2D95]/50 rounded-full
                                            group-hover:border-[#FF2D95] transition-colors" />
                                    </div>
                                </div>

                                {/* Side Controls - Luôn hiển thị */}
                                <div className={`absolute -left-[3px] top-[100px] space-y-8
                                    ${!isPowerOn ? 'opacity-50' : ''}`}>
                                    {/* Nút tăng âm lượng */}
                                    <button
                                        onClick={() => setVolume(prev => Math.min(prev + 10, 100))}
                                        className="w-[4px] h-14 bg-black rounded-l-xl 
                                            flex items-center justify-center relative overflow-hidden
                                            cursor-pointer group hover:bg-[#00FF95]/20"
                                    >
                                        <div className="w-[2px] h-10 bg-[#00FF95]/30 rounded-full
                                            group-hover:bg-[#00FF95] transition-colors" />
                                        {volume >= 90 && (
                                            <div className="absolute right-2 px-2 py-1 bg-black/80 rounded text-xs text-[#00FF95]
                                                translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-4
                                                transition-all duration-300">
                                                Max
                                            </div>
                                        )}
                                    </button>

                                    {/* Nút giảm âm lượng */}
                                    <button
                                        onClick={() => setVolume(prev => Math.max(prev - 10, 0))}
                                        className="w-[4px] h-14 bg-black rounded-l-xl 
                                            flex items-center justify-center relative overflow-hidden
                                            cursor-pointer group hover:bg-[#00FF95]/20"
                                    >
                                        <div className="w-[2px] h-10 bg-[#00FF95]/30 rounded-full
                                            group-hover:bg-[#00FF95] transition-colors" />
                                        {volume <= 0 && (
                                            <div className="absolute right-2 px-2 py-1 bg-black/80 rounded text-xs text-[#00FF95]
                                                translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-4
                                                transition-all duration-300">
                                                Mute
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Power Button - Luôn hiển thị */}
                                <div className="absolute -right-[3px] top-[130px]">
                                    <button
                                        onClick={handlePowerOff}
                                        className="w-[4px] h-16 bg-black rounded-r-xl relative overflow-hidden
                                            cursor-pointer group hover:bg-[#FF2D95]/20 transition-colors duration-300"
                                    >
                                        <div className={`absolute inset-0 rounded-r-xl overflow-hidden
                                            transition-all duration-500
                                            ${isPowerOn ?
                                                'bg-gradient-to-b from-[#00FF95]/50 via-transparent to-[#00FF95]/50' :
                                                'bg-gradient-to-b from-[#FF2D95]/50 via-transparent to-[#FF2D95]/50'}`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/20 
                                                translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default FlutterAIApp;

<style jsx>{`
    @keyframes scanlines {
        0% { background-position: 0 0; }
        100% { background-position: 0 100%; }
    }
    @keyframes height {
        0%, 100% { height: 8px; }
        50% { height: 15px; }
    }
    @keyframes moveLeftRight {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100vw); }
    }
    @keyframes moveRightLeft {
        0% { transform: translateX(100vw); }
        100% { transform: translateX(-100%); }
    }
    @keyframes moveTopBottom {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
    }
    @keyframes moveBottomTop {
        0% { transform: translateY(100vh); }
        100% { transform: translateY(-100%); }
    }
    @keyframes shimmer {
        0% { background-position: -100% -100%; }
        100% { background-position: 100% 100%; }
    }
    @keyframes powerOff {
        0% { 
            opacity: 1;
            transform: scale(1);
            filter: brightness(1);
        }
        50% {
            opacity: 0.5;
            transform: scale(0.99);
            filter: brightness(0.5);
        }
        100% { 
            opacity: 0;
            transform: scale(0.98);
            filter: brightness(0);
        }
    }
`}</style>