import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";

const CustomScrollbar = () => {
    const { scrollYProgress } = useScroll();
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Cập nhật giá trị progress
    useEffect(() => {
        const unsubscribe = scrollYProgress.onChange(v => setProgress(v));
        return () => unsubscribe();
    }, [scrollYProgress]);

    return (
        <>
            {/* Lớp trang trí phía sau */}
            <motion.div
                className="fixed right-8 top-[20%] -translate-y-1/2 z-[9998] h-56 w-1
                        bg-gradient-to-b from-blue-500/10 to-purple-500/10 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            />

            {/* Thanh cuộn chính */}
            <motion.div
                className="fixed right-6 top-[20%] -translate-y-1/2 z-[9999] h-60 w-2.5
                     bg-gray-900/40 rounded-full overflow-hidden backdrop-blur-md
                     shadow-[0_0_20px_rgba(59,130,246,0.3)]
                     border border-blue-500/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                    opacity: isVisible ? 1 : 0,
                    x: isVisible ? 0 : 20
                }}
                transition={{ duration: 0.5 }}
                style={{ pointerEvents: 'none' }}
            >
                {/* Hiệu ứng đường năng lượng */}
                <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-full h-[1px]"
                            style={{ top: `${12 + i * 10}%` }}
                            animate={{
                                opacity: [0.2, 0.6, 0.2],
                                x: ['-100%', '100%']
                            }}
                            transition={{
                                duration: 3,
                                delay: i * 0.15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            <div className="h-full bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
                        </motion.div>
                    ))}
                </div>

                {/* Thanh cuộn chính */}
                <motion.div
                    className="absolute left-0 w-full rounded-full origin-top"
                    style={{
                        top: 0,
                        height: "100%",
                        scaleY: progress,
                        transformOrigin: "top",
                        background: "linear-gradient(180deg, rgba(59,130,246,0.7), rgba(147,51,234,0.7))"
                    }}
                >
                    {/* Hiệu ứng lớp phủ */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-blue-300/30 to-purple-300/30"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    />
                </motion.div>

                {/* Đèn báo hiệu */}
                <div className="absolute -right-1 top-0 w-2 h-2">
                    <motion.div
                        className="absolute inset-0 rounded-full bg-blue-400/60"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    />
                </div>
                <div className="absolute -right-1 bottom-0 w-2 h-2">
                    <motion.div
                        className="absolute inset-0 rounded-full bg-purple-400/60"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2.5, delay: 1.25, repeat: Infinity }}
                    />
                </div>
            </motion.div>

            {/* Các điểm trang trí */}
            <div className="fixed right-4 top-[20%] -translate-y-1/2 z-[9997] h-60 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-blue-400/30"
                        style={{
                            top: `${15 + i * 20}%`,
                            right: `-${i % 2 ? 2 : 4}px`
                        }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                            duration: 2,
                            delay: i * 0.3,
                            repeat: Infinity
                        }}
                    />
                ))}
            </div>

            {/* Đường kẻ trang trí */}
            <div className="fixed right-7 top-[20%] -translate-y-1/2 z-[9997] h-60 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-4 h-[1px] bg-gradient-to-r from-blue-400/20 to-transparent"
                        style={{
                            top: `${20 + i * 30}%`,
                            right: '100%'
                        }}
                        animate={{
                            width: ['16px', '24px', '16px'],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                            duration: 3,
                            delay: i * 0.5,
                            repeat: Infinity
                        }}
                    />
                ))}
            </div>

            {/* Vòng tròn trang trí */}
            <motion.div
                className="fixed right-6 top-[20%] -translate-y-1/2 z-[9996] h-64 w-8
                        rounded-full border border-blue-500/10 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: isVisible ? [0.1, 0.3, 0.1] : 0,
                    scale: [1, 1.05, 1]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity
                }}
            />

            {/* Vạch tiến độ với số liệu */}
            <div className="fixed right-9 top-[20%] -translate-y-1/2 z-[9996] h-60 pointer-events-none">
                {[...Array(3)].map((_, i) => {
                    const percentage = i * 0.5;
                    return (
                        <motion.div
                            key={i}
                            className="relative"
                            style={{
                                position: 'absolute',
                                top: `${percentage * 100}%`,
                            }}
                        >
                            <motion.div
                                className="absolute h-[1px] bg-gradient-to-r from-blue-400/20 to-transparent"
                                style={{
                                    right: '100%',
                                    width: '6px'
                                }}
                                animate={{
                                    opacity: progress >= percentage ? 0.6 : 0.2,
                                    width: progress >= percentage ? '8px' : '6px'
                                }}
                            />
                        </motion.div>
                    );
                })}
            </div>

            {/* Đường viền năng lượng */}
            <motion.div
                className="fixed right-6 top-[20%] -translate-y-1/2 z-[9995] h-60 w-3
                        pointer-events-none overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
            >
                <motion.div
                    className="absolute inset-0 border-r-2 border-blue-400/20"
                    style={{
                        clipPath: `inset(${100 - (scrollYProgress.get() * 100)}% 0 0 0)`
                    }}
                />
                <motion.div
                    className="absolute w-full h-4 bg-gradient-to-b from-blue-400/20 to-transparent"
                    style={{
                        top: `${scrollYProgress.get() * 100}%`
                    }}
                />
            </motion.div>

            {/* Chỉ số phần trăm */}
            <motion.div
                className="fixed right-12 top-[20%] -translate-y-1/2 z-[9996] 
                        font-mono text-xs text-blue-400/50 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
            >
                <motion.span
                    animate={{
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity
                    }}
                >
                    {Math.round(scrollYProgress.get() * 100)}%
                </motion.span>
            </motion.div>

            {/* Hiệu ứng particle theo cuộn */}
            <div className="fixed right-6 top-[20%] -translate-y-1/2 z-[9994] h-60 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-blue-400/30"
                        style={{
                            top: `${scrollYProgress.get() * 100}%`,
                            right: `${(i + 1) * 8}px`
                        }}
                        animate={{
                            y: [-20, 0, -20],
                            opacity: [0, 0.5, 0],
                            scale: [0.8, 1, 0.8]
                        }}
                        transition={{
                            duration: 2,
                            delay: i * 0.2,
                            repeat: Infinity
                        }}
                    />
                ))}
            </div>

            {/* Hiệu ứng hologram */}
            <motion.div
                className="fixed right-10 top-[20%] -translate-y-1/2 z-[9986] 
                        font-mono text-[8px] text-blue-400/50 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
            >
                <motion.div
                    className="space-y-0.5"
                    animate={{ opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <div>Q:{(progress * 100).toFixed(0)}%</div>
                    <div>F:{(Math.sin(progress * Math.PI) * 100).toFixed(0)}</div>
                </motion.div>
            </motion.div>

            {/* Đường dẫn năng lượng */}
            <div className="fixed right-14 top-[20%] -translate-y-1/2 z-[9992] h-60 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-[2px] bg-blue-400/10"
                        style={{
                            height: '100%',
                            right: `${i * 4}px`,
                            top: 0
                        }}
                    >
                        <motion.div
                            className="absolute w-full bg-blue-400/30"
                            style={{
                                height: '30%',
                                top: `${progress * (100 - 30)}%`,
                                filter: 'blur(1px)'
                            }}
                            animate={{
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity
                            }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Hiển thị số liệu kỹ thuật */}
            <motion.div
                className="fixed right-16 top-[20%] -translate-y-1/2 z-[9996] 
                        font-mono text-xs space-y-2 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
            >
                <motion.div
                    className="text-blue-400/50"
                    animate={{ opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div>SCROLL: {Math.round(progress * 100)}%</div>
                    <div>POS: {Math.round(window.scrollY)}px</div>
                    <div>RATE: {Math.round(progress * 100) / 100}</div>
                </motion.div>
            </motion.div>

            {/* Hiệu ứng quét laser */}
            <motion.div
                className="fixed right-6 top-[20%] -translate-y-1/2 z-[9991] h-60 w-4
                        pointer-events-none overflow-hidden"
            >
                <motion.div
                    className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"
                    style={{
                        top: `${progress * (100 - 2)}%`
                    }}
                    animate={{
                        boxShadow: [
                            '0 0 4px rgba(59,130,246,0.3)',
                            '0 0 8px rgba(59,130,246,0.5)',
                            '0 0 4px rgba(59,130,246,0.3)'
                        ]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity
                    }}
                />
            </motion.div>

            {/* Hiệu ứng quantum field */}
            <motion.div
                className="fixed right-8 top-[20%] -translate-y-1/2 z-[9990] h-64 w-8
                        pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
            >
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-full"
                        style={{
                            height: '2px',
                            top: `${(i * 12) + progress * 10}%`,
                            background: `linear-gradient(90deg, 
                                transparent 0%,
                                rgba(59,130,246,${0.1 + progress * 0.2}) 50%,
                                transparent 100%
                            )`
                        }}
                        animate={{
                            x: ['-50%', '50%'],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{
                            duration: 3 + i * 0.2,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: i * 0.1
                        }}
                    />
                ))}
            </motion.div>

            {/* Hiệu ứng plasma shield */}
            <motion.div
                className="fixed right-6 top-[20%] -translate-y-1/2 z-[9989] h-64 w-10
                        pointer-events-none overflow-hidden"
                style={{
                    background: `radial-gradient(
                        circle at ${50 + progress * 50}% ${progress * 100}%,
                        rgba(59,130,246,0.1) 0%,
                        transparent 70%
                    )`
                }}
            >
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: `repeating-linear-gradient(
                            ${45 + progress * 90}deg,
                            transparent,
                            rgba(147,51,234,0.1) 2px,
                            transparent 4px
                        )`
                    }}
                    animate={{
                        backgroundPosition: ['0px 0px', '10px 10px']
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                />
            </motion.div>

            {/* Neural network visualization */}
            <div className="fixed right-9 top-[20%] -translate-y-1/2 z-[9988] h-60 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-0.5 h-0.5 rounded-full bg-blue-400/30"
                        style={{
                            top: `${(i * 20) + progress * 10}%`,
                            right: `${Math.sin(i) * 6}px`
                        }}
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.3, 0.6, 0.3],
                            x: [0, Math.sin(i * progress) * 3, 0]
                        }}
                        transition={{
                            duration: 2 + i * 0.2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    >
                        <motion.div
                            className="absolute w-4 h-[1px]"
                            style={{
                                background: `linear-gradient(90deg, 
                                    rgba(59,130,246,${0.2 + progress * 0.3}) 0%,
                                    transparent 100%
                                )`
                            }}
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.2, 1]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Quantum data stream */}
            <motion.div
                className="fixed right-7 top-[20%] -translate-y-1/2 z-[9987] h-60 w-1
                        pointer-events-none overflow-hidden"
            >
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-full h-[1px]"
                        style={{
                            top: `${(i * 20) + progress * 10}%`,
                            background: `linear-gradient(90deg,
                                rgba(59,130,246,${0.1 + (i % 2) * 0.1}) 0%,
                                rgba(147,51,234,${0.1 + (i % 2) * 0.1}) 100%
                            )`
                        }}
                        animate={{
                            scaleY: [1, 1.5, 1],
                            opacity: [0.2, 0.4, 0.2],
                            x: ['-50%', '50%']
                        }}
                        transition={{
                            duration: 3,
                            delay: i * 0.2,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    />
                ))}
            </motion.div>

            {/* Energy core pulses */}
            <motion.div
                className="fixed right-6 top-[20%] -translate-y-1/2 z-[9982] pointer-events-none"
                style={{
                    width: '4px',
                    height: `${60 * progress}px`
                }}
            >
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `linear-gradient(to bottom,
                            rgba(59,130,246,0.5),
                            rgba(147,51,234,0.5)
                        )`
                    }}
                    animate={{
                        boxShadow: [
                            '0 0 10px rgba(59,130,246,0.5)',
                            '0 0 20px rgba(59,130,246,0.7)',
                            '0 0 10px rgba(59,130,246,0.5)'
                        ]
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity
                    }}
                />
            </motion.div>

            {/* Quantum interference patterns */}
            <div className="fixed right-7 top-[20%] -translate-y-1/2 z-[9981] h-60 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-6 h-[1px]"
                        style={{
                            top: `${25 * i}%`,
                            background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)'
                        }}
                        animate={{
                            scaleX: [1, 1.5, 1],
                            opacity: [0.2, 0.4, 0.2],
                            rotate: [0, progress * 180, 0]
                        }}
                        transition={{
                            duration: 3,
                            delay: i * 0.2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>
        </>
    );
};

export default CustomScrollbar; 