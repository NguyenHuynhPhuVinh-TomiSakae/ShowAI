/* eslint-disable @typescript-eslint/no-unused-vars */
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useScroll } from "framer-motion";

interface CustomScrollbarProps {
    currentSection: number;
    totalSections: number;
    showNextComponents: boolean;
    onSectionClick: (index: number) => void;
    scrollProgress: number;
    sectionScrollProgress: number;
    isNearEnd: boolean;
}

const CustomScrollbar = ({
    currentSection,
    totalSections,
    showNextComponents,
    onSectionClick,
    scrollProgress,
    sectionScrollProgress,
    isNearEnd
}: CustomScrollbarProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const { scrollYProgress } = useScroll();

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActiveSection = (index: number) => {
        if (!showNextComponents) {
            return false;
        }
        return currentSection === index;
    };

    const handleSectionClick = (index: number) => {
        if (showNextComponents) {
            onSectionClick(index);
        }
    };

    return (
        <motion.div
            className="fixed -right-1 top-8 z-[9999] flex flex-col items-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{
                opacity: isVisible ? 1 : 0,
                x: isVisible ? 0 : 20,
                filter: "drop-shadow(0 0 12px rgba(59,130,246,0.25))"
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
        >
            <div className="relative flex flex-col gap-2.5 p-3 pl-8 pr-2 rounded-l-xl
                bg-gray-900/90 backdrop-blur-md border-l border-t border-b border-gray-700/50">

                {!showNextComponents && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute left-2 top-1 z-50"
                    >
                        <div className="flex flex-col items-center gap-1.5">
                            {scrollProgress === 0 && (
                                <motion.span
                                    className="text-xs text-blue-400/70 whitespace-nowrap rotate-180 [writing-mode:vertical-lr] mb-1"
                                    animate={{
                                        opacity: [0.4, 1, 0.4]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    CUỘN
                                </motion.span>
                            )}
                            {scrollProgress > 0 && (
                                <span className="text-xs text-blue-400/70 whitespace-nowrap rotate-180 [writing-mode:vertical-lr] mb-1">
                                    TIẾP
                                </span>
                            )}
                            <div className="h-16 w-0.5 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="w-full bg-blue-500/70"
                                    style={{ height: `${scrollProgress * 100}%` }}
                                />
                            </div>
                            <motion.div
                                animate={{
                                    y: [0, 3, 0],
                                    opacity: [0.3, 0.8, 0.3]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="text-blue-400/50 rotate-90 text-sm"
                            >
                                →
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {showNextComponents && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute left-2 top-1 z-50"
                    >
                        <div className="flex flex-col items-center gap-1.5">
                            {currentSection === totalSections - 1 ? (
                                <>
                                    {sectionScrollProgress === 0 && (
                                        <motion.span
                                            className="text-xs text-blue-400/70 whitespace-nowrap rotate-180 [writing-mode:vertical-lr] mb-1"
                                            animate={{
                                                opacity: [0.4, 1, 0.4]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            CUỘN
                                        </motion.span>
                                    )}
                                    {sectionScrollProgress > 0 && (
                                        <span className="text-xs text-blue-400/70 whitespace-nowrap rotate-180 [writing-mode:vertical-lr] mb-1">
                                            QUAY LẠI
                                        </span>
                                    )}
                                    <div className="h-16 w-0.5 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="w-full bg-blue-500/70"
                                            style={{ height: `${sectionScrollProgress * 100}%` }}
                                        />
                                    </div>
                                    <motion.div
                                        animate={{
                                            y: [0, 3, 0],
                                            opacity: [0.3, 0.8, 0.3]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="text-blue-400/50 rotate-90 text-sm"
                                    >
                                        ↑
                                    </motion.div>
                                </>
                            ) : (
                                <>
                                    {sectionScrollProgress === 0 && (
                                        <motion.span
                                            className="text-xs text-blue-400/70 whitespace-nowrap rotate-180 [writing-mode:vertical-lr] mb-1"
                                            animate={{
                                                opacity: [0.4, 1, 0.4]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            CUỘN
                                        </motion.span>
                                    )}
                                    {sectionScrollProgress > 0 && (
                                        <span className="text-xs text-blue-400/70 whitespace-nowrap rotate-180 [writing-mode:vertical-lr] mb-1">
                                            TIẾP
                                        </span>
                                    )}
                                    <div className="h-16 w-0.5 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="w-full bg-blue-500/70"
                                            style={{ height: `${sectionScrollProgress * 100}%` }}
                                        />
                                    </div>
                                    <motion.div
                                        animate={{
                                            y: [0, 3, 0],
                                            opacity: [0.3, 0.8, 0.3]
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="text-blue-400/50 rotate-90 text-sm"
                                    >
                                        →
                                    </motion.div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}

                <motion.div
                    className="absolute -left-2 top-0 bottom-0 w-0.5"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(59,130,246,0.5), rgba(59,130,246,0.1))',
                        scaleY: scrollProgress,
                        transformOrigin: 'top'
                    }}
                >
                    {scrollProgress > 0.3 && (
                        <motion.div
                            className="absolute inset-0"
                            animate={{
                                opacity: [0, 1, 0],
                                height: ['0%', '100%']
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            style={{
                                background: 'linear-gradient(to bottom, transparent, #60A5FA, transparent)'
                            }}
                        />
                    )}
                </motion.div>

                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1.5 h-14 
                    bg-gray-800 rounded-l-md border-l border-t border-b border-gray-700">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1 h-1 bg-blue-400 rounded-full mx-auto my-2"
                            animate={{
                                opacity: [0.3, 1, 0.3],
                                scale: scrollProgress > 0.3 ? [1, 1.2, 1] : 1
                            }}
                            transition={{
                                duration: 1,
                                delay: i * 0.3,
                                repeat: Infinity
                            }}
                        />
                    ))}
                </div>

                <div className="absolute -left-4 top-1/4 h-20 w-1.5 
                    bg-gray-800 rounded-l-md border-l border-t border-b border-gray-700">
                    <motion.div
                        className="h-full w-0.5 mx-auto bg-gradient-to-b from-blue-500/30 via-purple-500/30 to-transparent"
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    {[...Array(2)].map((_, i) => (
                        <div key={i}
                            className="absolute left-0 w-2 h-0.5 bg-gray-700"
                            style={{ top: `${30 + i * 40}%` }}
                        />
                    ))}
                </div>

                <motion.button
                    className="group flex items-center gap-1.5 relative"
                    onClick={() => handleSectionClick(-1)}
                >
                    <motion.div
                        className={`relative w-2.5 h-2.5 rounded-full 
                            ${!showNextComponents
                                ? 'bg-blue-500/90 backdrop-blur-sm'
                                : 'bg-gray-600/80 group-hover:bg-gray-500'}`}
                        animate={{
                            scale: !showNextComponents ? [1, 1.2, 1] : 1,
                            boxShadow: !showNextComponents
                                ? '0 0 12px rgba(59,130,246,0.5)'
                                : 'none'
                        }}
                        transition={{
                            scale: {
                                repeat: Infinity,
                                duration: 2
                            }
                        }}
                    >
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                                scaleY: scrollProgress,
                                background: 'linear-gradient(to bottom, rgba(59,130,246,0.4), transparent)'
                            }}
                        />
                    </motion.div>
                </motion.button>

                {Array.from({ length: totalSections }).map((_, index) => (
                    <motion.button
                        key={index}
                        className="group flex items-center gap-1.5 relative"
                        onClick={() => handleSectionClick(index)}
                    >
                        <motion.div
                            className={`relative w-2.5 h-2.5 rounded-full 
                                ${isActiveSection(index)
                                    ? 'bg-blue-500'
                                    : showNextComponents && index < currentSection
                                        ? 'bg-blue-400/50'
                                        : 'bg-gray-600 group-hover:bg-gray-500'}`}
                            animate={{
                                scale: isActiveSection(index) ? [1, 1.15, 1] : 1,
                                boxShadow: isActiveSection(index)
                                    ? '0 0 10px rgba(59,130,246,0.45)'
                                    : 'none'
                            }}
                            transition={{
                                scale: {
                                    repeat: Infinity,
                                    duration: 1.5
                                }
                            }}
                        />
                    </motion.button>
                ))}

                <motion.div
                    className="absolute -left-1 top-0 bottom-0 w-[1.5px]"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(59,130,246,0.5), rgba(59,130,246,0.1))',
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <motion.div
                        className="absolute w-full bg-blue-400/30"
                        style={{
                            height: '100%',
                            scaleY: !showNextComponents ? scrollProgress : currentSection / (totalSections - 1),
                            transformOrigin: 'top',
                            boxShadow: '0 0 8px rgba(59,130,246,0.4)'
                        }}
                    />
                    <motion.div
                        className="absolute w-full h-4 bg-gradient-to-b from-blue-400/40 to-transparent"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                </motion.div>

                {scrollProgress > 0 && (
                    <motion.div
                        className="absolute inset-0 rounded-l-xl"
                        animate={{
                            background: [
                                'radial-gradient(circle at right, rgba(59,130,246,0.1), transparent 50%)',
                                'radial-gradient(circle at right, rgba(59,130,246,0.2), transparent 50%)',
                                'radial-gradient(circle at right, rgba(59,130,246,0.1), transparent 50%)'
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
};

export default CustomScrollbar; 