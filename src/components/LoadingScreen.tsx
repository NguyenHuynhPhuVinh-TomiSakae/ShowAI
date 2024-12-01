import { motion } from 'framer-motion';
import { useState, useEffect, useContext, createContext } from 'react';

const ErrorContext = createContext(false);

interface LoadingScreenProps {
    onLoadingComplete: () => void;
}

interface TechText {
    text: string;
    position: {
        top: string;
        left: string;
    };
    delay: number;
}

const GlitchText = ({ text }: { text: string }) => {
    const [displayText, setDisplayText] = useState(text);
    const hasError = useContext(ErrorContext);

    useEffect(() => {
        const glitchChars = '!<>-_\\/[]{}—=+*^?#________';
        let interval: NodeJS.Timeout;

        const startGlitch = () => {
            interval = setInterval(() => {
                const randomText = text
                    .split('')
                    .map(char => {
                        if (Math.random() < 0.1) {
                            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
                        }
                        return char;
                    })
                    .join('');
                setDisplayText(randomText);
            }, 50);
        };

        startGlitch();
        return () => clearInterval(interval);
    }, [text]);

    return (
        <span className={`font-mono ${hasError ? 'text-red-500' : ''}`}>
            {displayText}
        </span>
    );
};

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
    const [progress, setProgress] = useState(0);
    const [displayProgress, setDisplayProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [showCompletionEffect, setShowCompletionEffect] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!isComplete) {
                setHasError(true);
                setShowCompletionEffect(true);

                setTimeout(() => {
                    onLoadingComplete();
                }, 5000);
            }
        }, 20000);

        const preloadAssets = async () => {
            const assetsToPreload = [
                '/gears/gear1.svg',
                '/gears/gear2.svg',
                '/gears/gear3.svg',
                '/thirdparty/logos/google.svg',
                '/thirdparty/logos/mistral.svg',
                '/thirdparty/templates/code-interpreter-multilang.svg',
                '/thirdparty/templates/gradio-developer.svg',
                '/thirdparty/templates/nextjs-developer.svg',
                '/thirdparty/templates/streamlit-developer.svg',
                '/thirdparty/templates/vue-developer.svg',
                '/cursor.png',
                '/cursor1.mp4',
                '/cursor2.mp4',
                '/cursor3.mp4',
                '/grid.svg',
                '/logo.jpg',
                '/showai.jpg',
            ];

            let loadedAssets = 0;
            const totalAssets = assetsToPreload.length;

            const promises = assetsToPreload.map((asset) => {
                return new Promise((resolve) => {
                    const updateProgress = () => {
                        loadedAssets++;
                        setTimeout(() => {
                            setProgress((loadedAssets / totalAssets) * 100);
                            resolve(true);
                        }, 100 + Math.random() * 200);
                    };

                    if (asset.endsWith('.mp4')) {
                        const video = document.createElement('video');
                        video.onloadeddata = updateProgress;
                        video.onerror = updateProgress;
                        video.src = asset;
                    } else {
                        const img = new Image();
                        img.onload = updateProgress;
                        img.onerror = updateProgress;
                        img.src = asset;
                    }
                });
            });

            await Promise.all(promises);
            setIsComplete(true);

            setTimeout(() => {
                setShowCompletionEffect(true);

                localStorage.setItem('loadingAnimationTimestamp', Date.now().toString());

                setTimeout(() => {
                    onLoadingComplete();
                }, 3000);
            }, 1000);
        };

        preloadAssets();

        return () => {
            clearTimeout(timeoutId);
            document.body.classList.remove('loading-complete');
        };
    }, [onLoadingComplete, isComplete]);

    useEffect(() => {
        const animateProgress = () => {
            if (displayProgress < progress) {
                setDisplayProgress(prev => {
                    const increment = Math.max(1, Math.floor((progress - prev) / 3));
                    const next = prev + increment;
                    return next > progress ? progress : next;
                });
            }
        };

        const intervalId = setInterval(animateProgress, 50);
        return () => clearInterval(intervalId);
    }, [progress, displayProgress]);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] w-full h-full bg-gradient-to-b from-[#0F172A] to-[#1E293B] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{
                opacity: 0,
                scale: 1.1,
                filter: "brightness(1.5)",
                transition: {
                    duration: 0.8,
                    ease: [0.645, 0.045, 0.355, 1]
                }
            }}
        >
            {showCompletionEffect && (
                <>
                    {!hasError ? (
                        <motion.div
                            className="absolute inset-0 bg-[#00FF95]/20"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            exit={{ scaleY: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: "easeInOut",
                                when: "beforeChildren"
                            }}
                        />
                    ) : (
                        <motion.div
                            className="absolute inset-0 bg-red-500/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                duration: 0.5,
                                ease: "easeInOut"
                            }}
                        />
                    )}

                    {!hasError && (
                        <>
                            <motion.div
                                className="absolute inset-0 bg-[#00FF95]/30"
                                animate={{
                                    x: [-10, 0, 5, -5, 0],
                                    opacity: [0.5, 0.3, 0.5, 0.3, 0.5],
                                    scaleX: [1.02, 1, 1.01, 0.99, 1]
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 1.1,
                                    transition: { duration: 0.4 }
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                    ease: "easeInOut",
                                    times: [0, 0.2, 0.4, 0.6, 1]
                                }}
                            />

                            <motion.div
                                className="absolute inset-0 bg-[#00FF95]/20"
                                animate={{
                                    y: [-5, 0, 3, -3, 0],
                                    opacity: [0.3, 0.5, 0.3, 0.5, 0.3],
                                    scaleY: [1.01, 1, 1.02, 0.99, 1]
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 1.1,
                                    transition: { duration: 0.4 }
                                }}
                                transition={{
                                    duration: 0.35,
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    ease: "easeInOut",
                                    times: [0, 0.2, 0.4, 0.6, 1]
                                }}
                            />
                        </>
                    )}

                    {hasError && (
                        <motion.div
                            className="absolute inset-0 bg-red-500/30"
                            animate={{
                                opacity: [0.2, 0.4, 0.2],
                                scale: [1, 1.02, 1]
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        />
                    )}

                    <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00FF95]/10 to-transparent"
                        style={{ backgroundSize: '100% 3px' }}
                        animate={{
                            y: [0, 100],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        exit={{
                            opacity: 0,
                            scale: 1.1,
                            transition: { duration: 0.4 }
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />

                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute ${hasError ? 'bg-red-500/20' : 'bg-[#00FF95]/30'}`}
                            style={{
                                width: Math.random() * 100 + 50,
                                height: Math.random() * 100 + 20,
                            }}
                            animate={{
                                x: [
                                    Math.random() * window.innerWidth,
                                    Math.random() * window.innerWidth
                                ],
                                y: [
                                    Math.random() * window.innerHeight,
                                    Math.random() * window.innerHeight
                                ],
                                opacity: [0, 0.5, 0],
                                scale: [1, 1.2, 0.8, 1]
                            }}
                            exit={{
                                opacity: 0,
                                scale: 1.1,
                                transition: { duration: 0.4 }
                            }}
                            transition={{
                                duration: 0.3 + Math.random() * 0.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                                delay: i * 0.1
                            }}
                        />
                    ))}

                    <motion.div
                        className="absolute inset-0 bg-[#00FF95]/10"
                        animate={{
                            opacity: [0, 0.2, 0, 0.1, 0],
                        }}
                        exit={{
                            opacity: 0,
                            scale: 1.1,
                            transition: { duration: 0.4 }
                        }}
                        transition={{
                            duration: 0.2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            times: [0, 0.2, 0.4, 0.6, 1]
                        }}
                    />

                    <motion.div
                        className="absolute inset-0 mix-blend-overlay"
                        style={{
                            backgroundImage: 'url("/noise.png")',
                            backgroundSize: '150px 150px',
                        }}
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.1, 0.15, 0.1],
                            backgroundPosition: ['0% 0%', '100% 100%'],
                        }}
                        exit={{
                            opacity: 0,
                            scale: 1.1,
                            transition: { duration: 0.4 }
                        }}
                        transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    />

                    {techTexts.map((item, index) => (
                        <motion.div
                            key={index}
                            className={`absolute font-mono text-sm ${hasError ? 'text-red-500' : 'text-[#00FF95]'}`}
                            style={{ top: item.position.top, left: item.position.left }}
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: [0, 1, 0.8],
                                x: hasError ? [0, -5, 5, -2, 0] : 0,
                                y: hasError ? [0, 2, -2, 1, 0] : 0
                            }}
                            transition={{
                                delay: item.delay,
                                duration: hasError ? 0.2 : 1,
                                repeat: Infinity,
                                repeatDelay: hasError ? 0.1 : 0
                            }}
                        >
                            <GlitchText text={hasError ? item.text.replace(/[aeiou]/gi, 'X') : item.text} />
                        </motion.div>
                    ))}

                    {/* Các đường line ngang */}
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className={`absolute h-0.5 ${hasError ? 'bg-red-500/30' : 'bg-[#00FF95]/30'}`}
                            style={{
                                top: `${i * 10}%`,
                                left: 0,
                                right: 0,
                            }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: i * 0.1,
                                ease: "easeOut"
                            }}
                        />
                    ))}

                    {/* Các đường line dọc */}
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={`vertical-${i}`}
                            className={`absolute w-0.5 ${hasError ? 'bg-red-500/30' : 'bg-[#00FF95]/30'}`}
                            style={{
                                left: `${i * 10}%`,
                                top: 0,
                                bottom: 0,
                            }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{
                                duration: 0.8,
                                delay: i * 0.1,
                                ease: "easeOut"
                            }}
                        />
                    ))}

                    {/* Terminal Commands Effect */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={`cmd-${i}`}
                            className={`absolute font-mono text-xs ${hasError ? 'text-red-400 font-bold' : 'text-[#00FF95]/70'
                                }`}
                            style={{
                                left: Math.random() * 80 + 10 + '%',
                                top: Math.random() * 80 + 10 + '%',
                            }}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{
                                opacity: [0, 1, 0],
                                x: [-50, 0, 50],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.5,
                                repeatDelay: Math.random() * 2,
                            }}
                        >
                            {hasError ? [
                                "> SYSTEM_FAILURE_DETECTED",
                                "$ CRITICAL_ERROR_0xF8",
                                "< FATAL_EXCEPTION />",
                                "# MEMORY_CORRUPTION",
                                "> SYSTEM_HALT",
                            ][i] : [
                                "> accessing mainframe...",
                                "$ decrypt sequence_0x8F",
                                "< injecting payload />",
                                "# compiling neural data",
                                "> executing protocol_7",
                            ][i]}
                        </motion.div>
                    ))}

                    {/* Matrix Rain Effect */}
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={`matrix-${i}`}
                            className={`absolute font-mono text-[8px] ${hasError ? 'text-red-500/30' : 'text-[#00FF95]/30'
                                } whitespace-pre leading-none`}
                            style={{
                                left: `${i * 10}%`,
                                top: 0,
                            }}
                            initial={{ y: -100 }}
                            animate={{ y: window.innerHeight }}
                            exit={{
                                opacity: 0,
                                scale: 1.1,
                                transition: { duration: 0.4 }
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                repeatDelay: Math.random(),
                            }}
                        >
                            {Array(20).fill(0).map(() =>
                                String.fromCharCode(0x30A0 + Math.random() * 96)
                            ).join('\n')}
                        </motion.div>
                    ))}
                </>
            )}

            <div className="absolute inset-0 bg-[url('/grid.png')] opacity-20" />
            <div className="absolute inset-0 bg-[url('/circuit.png')] opacity-10" />

            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    className="relative w-full max-w-md mx-auto p-8"
                    animate={showCompletionEffect ? {
                        scale: [1, 1.1, 0],
                        opacity: [1, 1, 0],
                        y: [0, 0, -50]
                    } : {}}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        transition: { duration: 0.4 }
                    }}
                    transition={{
                        duration: 1.5,
                        times: [0, 0.4, 1],
                        ease: "easeInOut"
                    }}
                >
                    <div className="absolute -left-4 -top-4 w-8 h-8 border-l-2 border-t-2 border-[#00FF95]/50" />
                    <div className="absolute -right-4 -bottom-4 w-8 h-8 border-r-2 border-b-2 border-[#00FF95]/50" />

                    <motion.div
                        className="relative border border-[#00FF95]/20 bg-black/20 backdrop-blur-sm p-6"
                        animate={isComplete ? {
                            borderColor: hasError ? "rgba(255, 0, 0, 1)" : "rgba(0, 255, 149, 0.8)",
                            backgroundColor: hasError ? "rgba(255, 0, 0, 0.2)" : "rgba(0, 255, 149, 0.1)",
                            boxShadow: hasError ? "0 0 40px rgba(255, 0, 0, 0.4)" : "0 0 30px rgba(0, 255, 149, 0.3)"
                        } : {}}
                        exit={{
                            opacity: 0,
                            scale: 1.1,
                            transition: { duration: 0.4 }
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F172A] px-4 ${hasError ? 'text-red-500/70' : 'text-[#00FF95]/70'
                            } text-xs`}>
                            SYSTEM INITIALIZATION
                        </div>

                        <div className="space-y-6">
                            <div className={`flex justify-between text-xs ${hasError ? 'text-red-500/70' : 'text-[#00FF95]/70'
                                }`}>
                                <span>
                                    {isComplete ? "STATUS: COMPLETE" : "STATUS: LOADING"}
                                </span>
                                <span>{new Date().toLocaleTimeString()}</span>
                            </div>

                            <LoadingDots
                                isComplete={isComplete}
                                hasError={hasError}
                            />

                            <div className="flex flex-col items-center space-y-2">
                                <ProgressBar
                                    progress={progress}
                                    isComplete={isComplete}
                                    hasError={hasError}
                                />
                                <motion.p
                                    className={`text-sm font-medium tracking-wider ${hasError ? 'text-red-500' : 'text-white/90'
                                        }`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    {hasError ? (
                                        <GlitchText text="HỆ THỐNG KHỞI ĐỘNG THẤT BẠI" />
                                    ) : isComplete ? (
                                        "KHỞI ĐỘNG HOÀN TẤT"
                                    ) : (
                                        <GlitchText text={`ĐANG TẢI SYSTEM... ${Math.round(displayProgress)}%`} />
                                    )}
                                </motion.p>
                            </div>

                            <div className={`grid grid-cols-2 gap-2 text-[10px] ${hasError ? 'text-red-500/50' : 'text-[#00FF95]/50'
                                }`}>
                                <div>MEMORY: INITIALIZING</div>
                                <div>CPU: ACTIVE</div>
                                <div>NETWORK: STABLE</div>
                                <div>SECURITY: ENABLED</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {showCompletionEffect && (
                <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        transition: { duration: 0.4 }
                    }}
                    transition={{
                        duration: 1,
                        times: [0, 0.1, 1],
                        ease: "easeInOut"
                    }}
                />
            )}
        </motion.div>
    );
};

const LoadingDots = ({ isComplete, hasError }: {
    isComplete: boolean,
    hasError: boolean
}) => (
    <motion.div className="flex items-center justify-center space-x-3">
        {[0, 1, 2].map((index) => (
            <motion.div
                key={index}
                className={`w-2 h-2 ${hasError ? 'bg-red-500' : 'bg-[#00FF95]'}`}
                animate={isComplete ? {
                    scale: [1, 2, 0],
                    opacity: [1, 1, 0],
                    rotate: 180
                } : {
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                }}
                exit={{
                    opacity: 0,
                    scale: 1.1,
                    transition: { duration: 0.4 }
                }}
                transition={isComplete ? {
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: "easeInOut"
                } : {
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.2,
                }}
            />
        ))}
    </motion.div>
);

const ProgressBar = ({ progress, isComplete, hasError }: {
    progress: number,
    isComplete: boolean,
    hasError: boolean
}) => (
    <div className="w-full max-w-[280px] h-1 bg-gray-700/50">
        <motion.div
            className="relative h-full"
            initial={{ width: 0 }}
            animate={{
                width: `${progress}%`,
                backgroundColor: hasError ? "#ff0000" : "#00FF95",
            }}
            exit={{
                opacity: 0,
                scale: 1.1,
            }}
            transition={{ duration: 0.5 }}
        >
            {isComplete && (
                <motion.div
                    className={`absolute inset-0 ${hasError ? 'bg-red-500' : 'bg-white'}`}
                    animate={{
                        opacity: [0, 1, 0],
                    }}
                    exit={{
                        opacity: 0,
                        scale: 1.1,
                        transition: { duration: 0.4 }
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: 2,
                    }}
                />
            )}
        </motion.div>
    </div>
);

const techTexts: TechText[] = [
    { text: "INITIALIZING NEURAL NETWORK", position: { top: '15%', left: '10%' }, delay: 0.2 },
    { text: "QUANTUM PROCESSING: ACTIVE", position: { top: '35%', left: '75%' }, delay: 0.4 },
    { text: "SECURITY PROTOCOLS ENGAGED", position: { top: '65%', left: '20%' }, delay: 0.6 },
    { text: "ANALYZING DATA STREAMS", position: { top: '80%', left: '65%' }, delay: 0.8 },
    { text: "SYSTEM OPTIMIZATION: 100%", position: { top: '25%', left: '60%' }, delay: 1 },
    { text: "AI CORE: OPERATIONAL", position: { top: '45%', left: '15%' }, delay: 1.2 },
    { text: "> EXECUTING BREACH.EXE", position: { top: '55%', left: '40%' }, delay: 1.4 },
    { text: "> BYPASSING FIREWALL...", position: { top: '70%', left: '30%' }, delay: 1.6 },
    { text: "$ sudo access --force", position: { top: '85%', left: '55%' }, delay: 1.8 },
    { text: "#!/bin/hack -v --silent", position: { top: '5%', left: '45%' }, delay: 2.0 },
    { text: "MEMORY INJECTION: SUCCESS", position: { top: '30%', left: '25%' }, delay: 2.2 },
    { text: "< ENCRYPTED DATA STREAM />", position: { top: '40%', left: '70%' }, delay: 2.4 },
    { text: "rm -rf /security/*", position: { top: '75%', left: '5%' }, delay: 2.6 },
    { text: "CORE ACCESS: GRANTED", position: { top: '20%', left: '85%' }, delay: 2.8 },
    { text: "[SYS] OVERRIDE COMPLETE", position: { top: '90%', left: '40%' }, delay: 3.0 },
];

export default LoadingScreen;