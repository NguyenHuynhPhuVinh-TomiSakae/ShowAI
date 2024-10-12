import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaStar, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import AdditionalInfoButton from './AdditionalInfoButton';

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

interface WebsiteDetailsProps {
    website: AIWebsite;
    isStarred: boolean;
    onStarClick: () => void;
    onTagClick: (tag: string) => void;
}

const WebsiteDetails: React.FC<WebsiteDetailsProps> = ({ website, isStarred, onStarClick, onTagClick }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [viewCount] = useState(website.view || 0);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={containerVariants}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                <div className="flex items-center">
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-300 mb-2 mr-2">{website.name}</h2>
                    <div className="flex items-center text-gray-400 text-sm mb-2 mr-2">
                        <FaEye className="mr-1" />
                        <span>{viewCount}</span>
                    </div>
                    <FaStar
                        className={`mb-2 cursor-pointer text-2xl ${isStarred ? 'text-yellow-400' : 'text-gray-400'}`}
                        onClick={onStarClick}
                    />
                </div>
                <Link
                    href={website.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#6366F1] hover:bg-[#93C5FD] text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 mt-4 sm:mt-0"
                >
                    Truy cập trang web
                </Link>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
                {website.tags && website.tags.map((tag, index) => (
                    <span
                        key={index}
                        onClick={() => onTagClick(tag)}
                        className="bg-blue-900 text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded cursor-pointer hover:bg-blue-800 transition-colors duration-300"
                    >
                        {tag}
                    </span>
                ))}
            </div>
            <TypeAnimation
                sequence={[
                    Array.isArray(website.description)
                        ? website.description.join('\n\n')
                        : website.description,
                    () => { },
                ]}
                wrapper="p"
                speed={99}
                className="text-gray-300 mb-4 whitespace-pre-wrap"
                cursor={false}
            />
            {website.keyFeatures && website.keyFeatures.length > 0 && (
                <div>
                    <strong className="text-blue-300">Tính năng chính:</strong>
                    <ul className="list-disc list-inside mt-2 text-gray-300">
                        {website.keyFeatures.map((feature, index) => (
                            <li key={index}>
                                <TypeAnimation
                                    sequence={[
                                        feature,
                                        () => { },
                                    ]}
                                    speed={75}
                                    cursor={false}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <AdditionalInfoButton websiteData={JSON.stringify(website)} />
        </motion.div>
    );
};

export default WebsiteDetails;
