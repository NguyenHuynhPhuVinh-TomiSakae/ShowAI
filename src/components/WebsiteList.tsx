import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaExternalLinkAlt, FaEye } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

interface AIWebsite {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string[];
    link: string;
    keyFeatures: string[];
    view?: number;
}

interface WebsiteListProps {
    websites: AIWebsite[];
    onTagClick: (tag: string) => void;
    isSidebar?: boolean;
}

const WebsiteList: React.FC<WebsiteListProps> = ({ websites, onTagClick, isSidebar = false }) => {
    const router = useRouter();
    const [hoveredWebsite, setHoveredWebsite] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const websiteRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleWebsiteClick = async (id: string) => {
        try {
            const response = await fetch('/api/incrementView', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });
            if (response.ok) {
                router.push(`/show?id=${id}`);
            } else {
                console.error('Failed to increment view count');
                router.push(`/show?id=${id}`);
            }
        } catch (error) {
            console.error('Error incrementing view count:', error);
            router.push(`/show?id=${id}`);
        }
    };

    const handleMouseEnter = (id: string, index: number) => {
        if (!isSidebar && !isMobile) {
            setHoveredWebsite(id);
            gsap.to(websiteRefs.current[index], {
                scale: 1.05,
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    };

    const handleMouseLeave = (index: number) => {
        if (!isSidebar && !isMobile) {
            setHoveredWebsite(null);
            gsap.to(websiteRefs.current[index], {
                scale: 1,
                boxShadow: 'none',
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <motion.div
            className={isSidebar ? "flex flex-col gap-4 mb-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {websites.map((website, index) => (
                <motion.div
                    key={index}
                    ref={(el: HTMLDivElement | null) => {
                        if (el) websiteRefs.current[index] = el;
                    }}
                    variants={itemVariants}
                    onClick={() => handleWebsiteClick(website.id)}
                    onMouseEnter={() => handleMouseEnter(website.id, index)}
                    onMouseLeave={() => handleMouseLeave(index)}
                    className={`border border-gray-700 rounded-lg p-5 transition-all duration-300 flex flex-col bg-gray-800 cursor-pointer ${isSidebar ? 'h-auto' : 'h-full'}`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                            <h2 className={`font-semibold text-blue-300 ${isSidebar ? 'text-lg' : 'text-xl'}`}>{website.name}</h2>
                            {website.view !== undefined && (
                                <div className="flex items-center text-gray-400 text-sm">
                                    <FaEye className="mr-1" />
                                    <span>{website.view}</span>
                                </div>
                            )}
                        </div>
                        <a
                            href={website.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`text-blue-300 hover:text-blue-500 ${isMobile || isSidebar || (!isSidebar && !isMobile && hoveredWebsite === website.id) ? 'block' : 'hidden'}`}
                        >
                            <FaExternalLinkAlt />
                        </a>
                    </div>
                    <AnimatePresence>
                        {!isSidebar && !isMobile && hoveredWebsite === website.id ? (
                            <motion.div
                                className="text-gray-300 mb-4 flex-grow overflow-hidden"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p>
                                    {Array.isArray(website.description) ? website.description[0] : website.description}
                                </p>
                            </motion.div>
                        ) : (
                            <div className="text-gray-300 mb-4 flex-grow overflow-hidden">
                                <p className={isSidebar ? "line-clamp-3" : "line-clamp-4"}>
                                    {Array.isArray(website.description) ? website.description[0] : website.description}
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                    <div className="flex flex-wrap gap-2">
                        {website.tags.map((tag, tagIndex) => (
                            <span
                                key={tagIndex}
                                className="bg-blue-900 text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded cursor-pointer hover:bg-blue-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTagClick(tag);
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default WebsiteList;
