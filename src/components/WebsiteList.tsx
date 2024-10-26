import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaExternalLinkAlt, FaEye, FaHeart, FaStar } from 'react-icons/fa';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';

interface AIWebsite {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string[];
    link: string;
    keyFeatures: string[];
    view?: number;
    heart?: number;
    evaluation?: number;
    label?: string;
    labelColor?: string;
    labelIcon?: React.ReactNode;
    image?: string;
    createdAt?: string;
    displayName?: string; // Thêm trường này
}

interface WebsiteListProps {
    websites: AIWebsite[];
    onTagClick: (tag: string) => void;
    isSidebar?: boolean;
    isRandom?: boolean;
    isShuffled?: boolean;
}

const WebsiteCard: React.FC<{
    website: AIWebsite;
    onClick: () => void;
    onTagClick: (tag: string) => void;
    isRandom?: boolean;
    isShuffled?: boolean;
    isSidebar?: boolean;
}> = ({ website, onClick, onTagClick, isRandom, isShuffled, isSidebar }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState(true); // Default to mobile to prevent flicker

    useEffect(() => {
        // Kiểm tra mobile và set loaded state
        setIsMobile(window.innerWidth <= 768);
        // Thêm kiểm tra document.readyState
        const checkReadyState = () => {
            if (document.readyState === 'complete') {
                setIsLoaded(true);
            }
        };

        // Kiểm tra ngay lập tức
        checkReadyState();

        // Thêm event listener để theo dõi trạng thái load
        document.addEventListener('readystatechange', checkReadyState);

        return () => {
            document.removeEventListener('readystatechange', checkReadyState);
        };
    }, []);

    // Thêm isLoaded vào điều kiện
    const shouldDisableAnimation = !isLoaded || isRandom || isShuffled || isSidebar || isMobile;

    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const dragX = useMotionValue(0);
    const dragY = useMotionValue(0);

    const springConfig = {
        stiffness: shouldDisableAnimation ? 200 : 1000,
        damping: shouldDisableAnimation ? 25 : 10,
    };

    const rotateX = useSpring(
        useTransform(y, [-100, 100], shouldDisableAnimation ? [0, 0] : [30, -30]),
        springConfig
    );
    const rotateY = useSpring(
        useTransform(x, [-100, 100], shouldDisableAnimation ? [0, 0] : [-30, 30]),
        springConfig
    );

    const dragRotateX = useSpring(
        useTransform(dragY, [-100, 100], shouldDisableAnimation ? [0, 0] : [360, -360]),
        springConfig
    );
    const dragRotateY = useSpring(
        useTransform(dragX, [-100, 100], shouldDisableAnimation ? [0, 0] : [-360, 360]),
        springConfig
    );

    const rotateXTransform = useTransform([rotateX, dragRotateX], (values: number[]) => values[0] + values[1]);
    const rotateYTransform = useTransform([rotateY, dragRotateY], (values: number[]) => values[0] + values[1]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (shouldDisableAnimation) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        x.set((event.clientX - centerX) * 1.2);
        y.set((event.clientY - centerY) * 1.2);
    };

    return (
        <motion.div
            style={{
                perspective: shouldDisableAnimation ? 0 : 3000,
            }}
            className="relative"
            initial={false}
        >
            <motion.div
                style={{
                    rotateX: shouldDisableAnimation ? 0 : rotateXTransform,
                    rotateY: shouldDisableAnimation ? 0 : rotateYTransform,
                    transformStyle: shouldDisableAnimation ? "flat" : "preserve-3d",
                }}
                initial={false}
                drag={!shouldDisableAnimation}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={shouldDisableAnimation ? 0 : 1.5}
                whileDrag={{ scale: shouldDisableAnimation ? 1 : 1.15 }}
                whileHover={{ scale: shouldDisableAnimation ? 1 : 1.04 }}
                onDrag={(_, info) => {
                    if (shouldDisableAnimation) return;
                    dragX.set(info.offset.x);
                    dragY.set(info.offset.y);
                }}
                onDragEnd={() => {
                    dragX.set(0);
                    dragY.set(0);
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                    x.set(0);
                    y.set(0);
                }}
                onClick={onClick}
                className="cursor-pointer bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-blue-500"
            >
                {website.image && (
                    <div className="relative w-full h-48 overflow-hidden"
                        style={{ transform: shouldDisableAnimation ? "none" : "translateZ(20px)" }}>
                        <Image
                            src={website.image}
                            alt={website.name}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-300 hover:scale-110"
                            onLoad={() => setIsLoaded(true)}
                        />
                    </div>
                )}
                <div className="p-5"
                    style={{ transform: shouldDisableAnimation ? "none" : "translateZ(50px)" }}>
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center">
                            <h2 className="text-xl font-bold text-blue-300 truncate mr-2">
                                {website.name}
                            </h2>
                            {website.createdAt && new Date().getTime() - new Date(website.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                                    Mới
                                </div>
                            )}
                        </div>
                        <a
                            href={website.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-blue-300 hover:text-blue-500 transition-colors duration-200"
                        >
                            <FaExternalLinkAlt />
                        </a>
                    </div>
                    <div className="mb-2 text-sm text-gray-400">
                        Đăng bởi: {website.displayName || 'Admin'}
                    </div>
                    {website.label && (
                        <div className="mb-2">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${website.labelColor || 'bg-blue-500 text-white'}`}>
                                {website.labelIcon && <span className="mr-1">{website.labelIcon}</span>}
                                {website.label}
                            </div>
                        </div>
                    )}
                    <p className="text-gray-300 mb-4 line-clamp-3">
                        {Array.isArray(website.description) ? website.description[0] : website.description}
                    </p>
                    <div className="flex items-center space-x-4 text-gray-400 text-sm mb-4">
                        {website.view !== undefined && (
                            <div className="flex items-center">
                                <FaEye className="mr-1" />
                                <span>{website.view}</span>
                            </div>
                        )}
                        {website.heart !== undefined && (
                            <div className="flex items-center">
                                <FaHeart className="mr-1 text-red-500" />
                                <span>{website.heart}</span>
                            </div>
                        )}
                        {website.evaluation !== undefined && (
                            <div className="flex items-center">
                                <FaStar className="mr-1 text-yellow-400" />
                                <span>{website.evaluation.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {website.tags.map((tag, tagIndex) => (
                            <span
                                key={tagIndex}
                                className="bg-blue-900 text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTagClick(tag);
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const WebsiteList: React.FC<WebsiteListProps> = ({ websites, onTagClick, isSidebar = false, isRandom = false, isShuffled = false }) => {
    const router = useRouter();

    const handleWebsiteClick = (id: string) => {
        router.push(`/show?id=${id}`);
    };

    return (
        <motion.div
            className={`grid gap-6 ${isSidebar
                ? "grid-cols-1"
                : isRandom
                    ? "grid-cols-1 sm:grid-cols-2"
                    : isShuffled
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }`}
        >
            {websites.map((website) => (
                <WebsiteCard
                    key={website.id}
                    website={website}
                    onClick={() => handleWebsiteClick(website.id)}
                    onTagClick={onTagClick}
                    isRandom={isRandom}
                    isShuffled={isShuffled}
                    isSidebar={isSidebar}
                />
            ))}
        </motion.div>
    );
};

export default WebsiteList;
