import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaExternalLinkAlt, FaEye, FaHeart, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { MotionProps } from 'framer-motion';

type ModalBackdropProps = MotionProps & {
    className?: string;
};

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
    createdAt?: string; // Thêm trường này
}

interface WebsiteListProps {
    websites: AIWebsite[];
    onTagClick: (tag: string) => void;
    isSidebar?: boolean;
    isRandom?: boolean;
    isShuffled?: boolean;
}

const WebsiteList: React.FC<WebsiteListProps> = ({ websites, onTagClick, isSidebar = false, isRandom = false, isShuffled = false }) => {
    const router = useRouter();
    const websiteRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleWebsiteClick = (id: string) => {
        router.push(`/show?id=${id}`);

        fetch('/api/incrementView', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        }).catch(error => {
            console.error('Lỗi khi tăng số lượt xem:', error);
        });
    };

    const isNewWebsite = (createdAt?: string) => {
        if (!createdAt) return false;
        const createdDate = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 1;
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
            {...{
                className: `grid gap-6 ${isSidebar
                    ? "grid-cols-1"
                    : isRandom
                        ? "grid-cols-1 sm:grid-cols-2"
                        : isShuffled
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`,
                variants: containerVariants,
                initial: "hidden",
                animate: "visible"
            } as ModalBackdropProps}
        >
            {websites.map((website, index) => (
                <motion.div
                    key={index}
                    {...{
                        ref: (el: HTMLDivElement | null) => {
                            if (el) websiteRefs.current[index] = el;
                        },
                        variants: itemVariants,
                        onClick: () => handleWebsiteClick(website.id),
                        className: "cursor-pointer bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-blue-500"
                    } as ModalBackdropProps}
                >
                    {website.image && !isSidebar && (
                        <div className="relative w-full h-48 overflow-hidden">
                            <Image
                                src={website.image}
                                alt={website.name}
                                layout="fill"
                                objectFit="cover"
                                className="transition-transform duration-300 hover:scale-110"
                            />
                        </div>
                    )}
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                                <h2 className="text-xl font-bold text-blue-300 truncate mr-2">
                                    {website.name}
                                </h2>
                                {isNewWebsite(website.createdAt) && (
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
            ))}
        </motion.div>
    );
};

export default WebsiteList;
