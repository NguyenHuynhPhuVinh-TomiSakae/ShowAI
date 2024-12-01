import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';

const AIPowered = () => {
    const [activeImage, setActiveImage] = useState<number | null>(null);
    const [videoKey, setVideoKey] = useState(0);
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        videoRefs.current = features.map(() => null);

        return () => {
            videoRefs.current.forEach(videoRef => {
                if (videoRef) {
                    videoRef.pause();
                    videoRef.currentTime = 0;
                }
            });
        };
    }, []);

    useEffect(() => {
        if (activeImage !== null) {
            setVideoKey(prev => prev + 1);
            const videoRef = videoRefs.current[activeImage];
            if (videoRef) {
                videoRef.load();
                const playPromise = videoRef.play();

                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Bỏ qua lỗi AbortError khi video bị gián đoạn
                    });
                }
            }
        }
    }, [activeImage]);

    const features = [
        {
            icon: "🤖",
            title: "98% Code Được Tạo bởi AI",
            description: "Tận dụng sức mạnh của AI để tự động hóa quá trình viết code, tối ưu hóa hiệu suất và giảm thiểu lỗi.",
            codeSnippet: "Ctrl + L để mở thanh bên",
            video: "/cursor1.mp4"
        },
        {
            icon: "⚡",
            title: "Phát Triển Nhanh Chóng",
            description: "Rút ngắn thời gian phát triển đáng kể nhờ khả năng tự động hoàn thiện và gợi ý code thông minh của Cursor.",
            codeSnippet: "Ctrl + K để chỉnh sửa 1 phần code",
            video: "/cursor2.mp4"
        },
        {
            icon: "✨",
            title: "Chất Lượng Đảm Bảo",
            description: "AI giúp đảm bảo code tuân thủ các tiêu chuẩn chất lượng cao và best practices trong phát triển web.",
            codeSnippet: "Ctrl + I để mở hộp thoại làm việc trên dự án",
            video: "/cursor3.mp4"
        }
    ];

    return (
        <div className="relative bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] py-20 overflow-hidden">
            {/* Cấu trúc bánh răng hiện đại */}
            {isDesktop && (
                <>
                    {/* Nhóm bánh răng góc trái */}
                    <div className="absolute left-0 top-1/4 opacity-20">
                        <div className="relative">
                            <Image
                                src="/gears/gear1.svg"
                                alt="Gear decoration"
                                width={100}
                                height={100}
                                className="animate-spin-slow"
                            />
                            <div className="absolute -right-8 top-1/2">
                                <Image
                                    src="/gears/gear2.svg"
                                    alt="Gear decoration"
                                    width={60}
                                    height={60}
                                    className="animate-spin-reverse-slow"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nhóm bánh răng góc phải */}
                    <div className="absolute right-0 bottom-1/4 opacity-20">
                        <div className="relative">
                            <Image
                                src="/gears/gear3.svg"
                                alt="Gear decoration"
                                width={120}
                                height={120}
                                className="animate-spin-slow"
                            />
                            <div className="absolute -left-10 -top-10">
                                <Image
                                    src="/gears/gear1.svg"
                                    alt="Gear decoration"
                                    width={80}
                                    height={80}
                                    className="animate-spin-reverse-slow"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bánh răng trang trí góc trên */}
                    <div className="absolute right-1/4 top-0 opacity-15">
                        <Image
                            src="/gears/gear2.svg"
                            alt="Gear decoration"
                            width={70}
                            height={70}
                            className="animate-spin-slow"
                        />
                    </div>

                    {/* Bánh răng trang trí góc dưới */}
                    <div className="absolute left-1/3 -bottom-5 opacity-15">
                        <Image
                            src="/gears/gear3.svg"
                            alt="Gear decoration"
                            width={50}
                            height={50}
                            className="animate-spin-reverse-slow"
                        />
                    </div>
                </>
            )}

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Nội dung bên trái */}
                    <motion.div
                        className="lg:w-1/2 space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="relative">
                            <div className="absolute -left-4 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#3E52E8] to-transparent" />
                            <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
                                Dự Án Được Tạo Bởi{' '}
                                <span className="relative">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                                        AI & Cursor
                                    </span>
                                    <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg"></span>
                                </span>
                            </h2>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-4 h-full w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
                            <p className="text-gray-300 text-lg pl-2 border-l-2 border-purple-500/50
                                          shadow-[0_0_15px_rgba(168,85,247,0.1)] backdrop-blur-sm">
                                ShowAI là một dự án độc đáo được phát triển với sự hỗ trợ ca công nghệ AI tiên tiến,
                                sử dụng Cursor - IDE thông minh tích hợp AI để tối ưu hóa quá trình phát triển.
                            </p>
                        </div>

                        <div className="space-y-4 relative">
                            {features.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={isDesktop ? { opacity: 0, x: -20 } : { opacity: 0 }}
                                    whileInView={isDesktop ? { opacity: 1, x: 0 } : { opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: isDesktop ? index * 0.2 : 0.1 }}
                                    className="group relative backdrop-blur-sm"
                                    onMouseEnter={() => setActiveImage(index)}
                                    onMouseLeave={() => setActiveImage(null)}
                                >
                                    {/* Đường kẻ kết nối */}
                                    {activeImage === index && (
                                        <>
                                            {/* Đường ngang chính với ống */}
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '150px' }}
                                                className="absolute -right-[150px] top-1/2 h-[3px] 
                                                         bg-[#3E52E8]/30 shadow-[0_0_10px_rgba(62,82,232,0.5)]
                                                         transform -translate-y-1/2 z-20 overflow-hidden"
                                            >
                                                {/* Thêm các ống nhỏ dọc theo đường dẫn */}
                                                <div className="absolute left-[30%] -top-1 w-2 h-4 
                                                              bg-[#1E293B] border border-[#3E52E8]/30 
                                                              rounded-sm shadow-[0_0_5px_rgba(62,82,232,0.3)]" />
                                                <div className="absolute left-[60%] -top-1 w-2 h-4 
                                                              bg-[#1E293B] border border-[#3E52E8]/30 
                                                              rounded-sm shadow-[0_0_5px_rgba(62,82,232,0.3)]" />
                                                <div className="absolute inset-0 animate-electric-flow-1" />
                                            </motion.div>

                                            {/* Đường dọc nối lên và đường ngang cuối chỉ cho khung thứ 3 */}
                                            {index === 2 && (
                                                <>
                                                    {/* Đường dọc nối lên với ống */}
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: '100px' }}
                                                        transition={{ delay: 0.4 }}
                                                        className="absolute -right-[150px] top-1/2 w-[3px]
                                                                 bg-[#3E52E8]/30 shadow-[0_0_10px_rgba(62,82,232,0.5)]
                                                                 transform -translate-y-full z-20 overflow-hidden"
                                                    >
                                                        {/* Thêm ống ngang cho đường dọc */}
                                                        <div className="absolute top-[40%] -left-1 h-2 w-4 
                                                                      bg-[#1E293B] border border-[#3E52E8]/30 
                                                                      rounded-sm shadow-[0_0_5px_rgba(62,82,232,0.3)]" />
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.4 }}
                                                            className="absolute inset-0 animate-electric-flow-2"
                                                        />
                                                    </motion.div>

                                                    {/* Đường ngang cuối với ống */}
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '50px' }}
                                                        transition={{ delay: 0.8 }}
                                                        className="absolute -right-[150px] top-1/2 h-[3px]
                                                                 bg-[#3E52E8]/30 shadow-[0_0_10px_rgba(62,82,232,0.5)]
                                                                 transform -translate-y-full z-20 overflow-hidden"
                                                        style={{
                                                            transformOrigin: 'right',
                                                            right: '-150px'
                                                        }}
                                                    >
                                                        {/* Thêm ống cho đường ngang cuối */}
                                                        <div className="absolute left-[50%] -top-1 w-2 h-4 
                                                                      bg-[#1E293B] border border-[#3E52E8]/30 
                                                                      rounded-sm shadow-[0_0_5px_rgba(62,82,232,0.3)]" />
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.8 }}
                                                            className="absolute inset-0 animate-electric-flow-3"
                                                        />
                                                    </motion.div>
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* Card content - Cấu trúc máy chiếu */}
                                    <div className="relative">
                                        {/* Ống kính máy chiếu bên trái */}
                                        <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-6 h-16
                                                        bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-l-lg
                                                        border-l-2 border-t-2 border-b-2 border-[#3E52E8]/30
                                                        shadow-[0_0_15px_rgba(62,82,232,0.3)]">
                                            {/* Vòng ống kính với hiệu ứng khởi động */}
                                            <div className="absolute left-1 top-1/2 transform -translate-y-1/2
                                                          w-4 h-4 rounded-full border border-[#3E52E8]/50
                                                          bg-[#0F172A] transition-all duration-500">
                                                <div className={`absolute inset-1 rounded-full 
                                                              ${activeImage === index ? 'bg-[#3E52E8]/40 animate-pulse' : 'bg-[#3E52E8]/10'}
                                                              transition-all duration-500`}></div>
                                            </div>
                                        </div>

                                        {/* Ống bên phải */}
                                        <div className="absolute -right-6 top-2/4 transform -translate-y-1/2">
                                            <div className="w-6 h-2 bg-[#1E293B] border border-[#3E52E8]/30 
                                                           rounded-r-sm shadow-[0_0_5px_rgba(62,82,232,0.3)]" />
                                        </div>

                                        {/* Nội dung card hiện tại */}
                                        <div className="relative bg-gradient-to-r from-[#1E293B]/90 to-[#0F172A]/90 
                                                        backdrop-blur-lg rounded-lg p-6 
                                                        border border-[#3E52E8]/30 group-hover:border-[#3E52E8] 
                                                        transition-all duration-300
                                                        shadow-[0_0_20px_rgba(62,82,232,0.2)]">
                                            {/* Đèn LED trạng thái - Đỏ khi không hover, Xanh khi hover */}
                                            <div className={`absolute -top-1 right-4 w-2 h-2 rounded-full 
                                                          transition-all duration-500
                                                          ${activeImage === index
                                                    ? 'bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse'
                                                    : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>

                                            {/* Hiệu ứng khởi động máy chiếu */}
                                            <div className={`absolute inset-0 bg-gradient-to-r from-[#3E52E8]/5 to-transparent
                                                          transition-opacity duration-500
                                                          ${activeImage === index ? 'opacity-100' : 'opacity-0'}`}>
                                                <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                                            </div>

                                            {/* Tia chiếu góc - sáng hơn khi hover */}
                                            <div className="absolute -top-3 -left-3 w-6 h-6">
                                                <div className={`absolute w-full h-[2px] transform -rotate-45
                                                              transition-all duration-500
                                                              ${activeImage === index ? 'bg-[#3E52E8]' : 'bg-[#3E52E8]/30'}`}></div>
                                            </div>
                                            <div className="absolute -top-3 -right-3 w-6 h-6">
                                                <div className={`absolute w-full h-[2px] transform rotate-45
                                                              transition-all duration-500
                                                              ${activeImage === index ? 'bg-[#3E52E8]' : 'bg-[#3E52E8]/30'}`}></div>
                                            </div>

                                            {/* Lỗ thông gió với hiệu ứng hoạt động */}
                                            <div className="absolute top-2 right-12 flex space-x-1">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i}
                                                        className={`w-1 h-4 rounded-full transition-all duration-500
                                                                    ${activeImage === index
                                                                ? 'bg-[#3E52E8]/40 animate-pulse'
                                                                : 'bg-[#3E52E8]/10'}`}>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Hiệu ứng tiếng ồn khởi động */}
                                            {activeImage === index && (
                                                <div className="absolute inset-0 animate-noise-effect opacity-10"></div>
                                            )}

                                            {/* Nội dung chính */}
                                            <div className="flex items-start gap-4">
                                                {/* Icon container với hiệu ứng lens flare */}
                                                <div className="relative w-12 h-12 rounded-lg bg-[#3E52E8]/20 
                                                              flex items-center justify-center
                                                              border border-[#3E52E8]/30 group-hover:border-[#3E52E8]/50 
                                                              group-hover:bg-[#3E52E8]/30 transition-all duration-300
                                                              shadow-[0_0_10px_rgba(62,82,232,0.3)]">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent 
                                                                  via-[#3E52E8]/10 to-transparent rounded-lg"></div>
                                                    <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(62,82,232,0.5)]">
                                                        {item.icon}
                                                    </span>
                                                </div>

                                                {/* Content với hiệu ứng chiếu sáng */}
                                                <div className="space-y-2 flex-1 relative">
                                                    <div className="absolute -left-2 top-0 h-full w-[2px] 
                                                                  bg-gradient-to-b from-transparent via-[#3E52E8]/30 to-transparent"></div>

                                                    <h3 className="text-white font-semibold text-lg 
                                                                  drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-gray-300 text-sm">{item.description}</p>

                                                    {/* Code snippet với hiệu ứng terminal */}
                                                    <div className="font-mono text-sm bg-[#0F172A] p-2 rounded
                                                                  border border-[#3E52E8]/30 group-hover:border-[#3E52E8]/50
                                                                  transition-all duration-300
                                                                  shadow-[0_0_15px_rgba(62,82,232,0.1)]">
                                                        <kbd className="px-2 py-1 bg-[#3E52E8]/20 rounded text-white mr-2
                                                                      border border-[#3E52E8]/30">
                                                            {item.codeSnippet.split(' ')[0]}
                                                        </kbd>
                                                        <span className="text-gray-300">
                                                            {item.codeSnippet.split(' ').slice(1).join(' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chân đế máy chiếu với hiệu ứng rung nhẹ khi hoạt động */}
                                        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2
                                                        w-20 h-1 rounded-full transition-all duration-500
                                                        ${activeImage === index
                                                ? 'bg-[#3E52E8]/50 shadow-[0_0_15px_rgba(62,82,232,0.4)] animate-slight-shake'
                                                : 'bg-[#3E52E8]/20 shadow-[0_0_10px_rgba(62,82,232,0.2)]'}`}>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Phần hình ảnh bên phải */}
                    <motion.div
                        className="lg:w-1/2 relative"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        {/* Ảnh chính */}
                        <div className={`relative transition-all duration-500 
                                     ${activeImage !== null ? 'opacity-0' : 'opacity-100'}`}>
                            {/* Code editor header */}
                            <div className="absolute top-0 left-0 right-0 h-8 bg-[#1E293B] rounded-t-lg
                                          flex items-center px-4 gap-2 border-b border-[#2A3284]">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                </div>
                                <span className="text-xs text-gray-400 ml-2">cursor.ai</span>
                            </div>

                            {/* Hiệu ứng glow */}
                            {isDesktop && (
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 
                                          rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                            )}

                            {/* Khung chứa ảnh */}
                            <div className={`relative bg-[#1E293B] rounded-lg shadow-xl mt-8 
                                            border border-[#3E52E8]/30 transition-all duration-300
                                            ${isDesktop ? 'group-hover:border-[#3E52E8]/70' : ''}`}>
                                <Image
                                    src="/cursor.png"
                                    alt="Cursor IDE Demo"
                                    width={800}
                                    height={500}
                                    className={`rounded-lg transition-opacity duration-300
                                              ${isDesktop ? 'opacity-90 group-hover:opacity-100' : ''}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#0F172A]/60 via-transparent to-transparent rounded-lg"></div>
                            </div>
                        </div>

                        {/* Video overlay */}
                        {activeImage !== null && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0 z-30"
                            >
                                <div className="relative w-full h-full">
                                    {/* Khung TV chính */}
                                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                                        {/* Video container */}
                                        <div className="absolute inset-0 z-10">
                                            {features[activeImage]?.video && (
                                                <video
                                                    key={`${activeImage}-${videoKey}`}
                                                    ref={(el) => {
                                                        if (el && activeImage !== null) {
                                                            videoRefs.current[activeImage] = el;
                                                        }
                                                    }}
                                                    src={features[activeImage].video}
                                                    autoPlay
                                                    loop
                                                    muted
                                                    playsInline
                                                    className="w-full h-full object-cover"
                                                    style={{ display: 'block' }}
                                                    onLoadedData={(e) => {
                                                        const video = e.target as HTMLVideoElement;
                                                        video.play().catch(err => {
                                                            console.error('Lỗi khi phát video:', err);
                                                        });
                                                    }}
                                                    onError={(e) => {
                                                        console.error('Lỗi khi tải video:', e);
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Hiệu ứng khởi động */}
                                        <motion.div
                                            initial={{ opacity: 1 }}
                                            animate={{ opacity: 0 }}
                                            transition={{ delay: 0.5, duration: 0.5 }}
                                            className="absolute inset-0 z-20 bg-black"
                                        >
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0, 0.5, 0] }}
                                                transition={{ delay: 0.2, duration: 1 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <span className="text-[#3E52E8]/30 text-2xl font-bold">ShowAI</span>
                                            </motion.div>
                                        </motion.div>
                                    </div>

                                    {/* Viền TV hiện đại */}
                                    <div className="absolute -inset-2 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900
                                                              shadow-[0_0_20px_rgba(0,0,0,0.3)] pointer-events-none">
                                        <div className="absolute inset-[2px] rounded-lg border border-gray-700" />
                                    </div>

                                    {/* Loa và cảm biến bên trái */}
                                    <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 space-y-4 pointer-events-none">
                                        {/* Cảm biến hồng ngoại */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="w-2 h-2 rounded-full bg-black border border-gray-700
                                                      shadow-[inset_0_0_2px_rgba(255,255,255,0.2)]"
                                        >
                                            <div className="w-1 h-1 rounded-full bg-red-900/30 absolute 
                                                          top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                        </motion.div>

                                        {/* Loa */}
                                        <div className="w-3 h-20 bg-gray-900 rounded-l-md 
                                                              border-l border-t border-b border-gray-800
                                                              flex flex-col items-center justify-center gap-1">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="w-1.5 h-0.5 bg-gray-800 rounded-full" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bảng điều khiển bên phải */}
                                    <div className="absolute -right-6 top-1/2 transform -translate-y-1/2
                                                              w-3 space-y-3 py-4 bg-gray-900 rounded-r-md
                                                              border-r border-t border-b border-gray-800 pointer-events-none">
                                        {/* Đèn nguồn */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0, 1, 0.5, 1] }}
                                            transition={{ delay: 0.2, duration: 1 }}
                                            className="w-2 h-2 mx-auto rounded-full bg-green-500 
                                                              shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                                        />
                                        {/* Các nút điều khiển */}
                                        <div className="space-y-3 flex flex-col items-center">
                                            {['M', '+', '-'].map((label, i) => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-gray-800 
                                                              text-[6px] flex items-center justify-center
                                                              text-gray-600">
                                                    {label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cổng kết nối phía sau */}
                                    <div className="absolute -left-4 bottom-10 flex flex-col gap-2 pointer-events-none">
                                        {/* Cổng nguồn */}
                                        <div className="w-4 h-8 bg-gray-800 rounded-l-md 
                                                              border border-gray-700 relative">
                                            <div className="absolute inset-x-0 bottom-1 h-2 flex justify-center">
                                                <div className="w-2 h-full bg-gray-600 rounded-sm" />
                                            </div>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className="absolute top-1 left-1/2 -translate-x-1/2 
                                                              w-1 h-1 rounded-full bg-blue-400 
                                                              shadow-[0_0_4px_rgba(96,165,250,0.5)]"
                                            />
                                        </div>
                                        {/* Các cổng HDMI */}
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className="w-4 h-3 bg-gray-800 rounded-l-sm 
                                                                  border border-gray-700">
                                                <div className="text-[4px] text-gray-600 text-center">
                                                    HDMI
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chân đế TV hiện đại */}
                                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                                                              w-40 h-8 bg-gradient-to-b from-gray-700 to-gray-900 
                                                              rounded-b-lg shadow-lg pointer-events-none">
                                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2
                                                              w-20 h-4 bg-gray-800 rounded-t-sm" />
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2
                                                              w-32 h-2 bg-gray-900 rounded-full
                                                              shadow-[0_-2px_10px_rgba(0,0,0,0.3)]" />
                                    </div>

                                    {/* Đường điện chạy */}
                                    <motion.div
                                        initial={{ left: "-100%" }}
                                        animate={{ left: "100%" }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                        className="absolute top-0 w-full h-[2px] 
                                                              bg-gradient-to-r from-transparent via-[#3E52E8] to-transparent
                                                              pointer-events-none"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AIPowered;