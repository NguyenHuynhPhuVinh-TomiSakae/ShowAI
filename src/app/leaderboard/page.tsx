'use client'
import React, { useState, useEffect } from 'react';
import { FaSpinner, FaEye, FaHeart, FaTrophy, FaChevronLeft, FaChevronRight, FaFire, FaThumbsUp } from 'react-icons/fa';
import WebsiteList from '@/components/WebsiteList';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

interface AIWebsite {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string;
    link: string;
    keyFeatures: string;
    view?: number;
    heart?: number;
    star?: number;
    evaluation?: number;
}

const LeaderboardPage = () => {
    const router = useRouter();
    const [viewWebsites, setViewWebsites] = useState<AIWebsite[]>([]);
    const [heartWebsites, setHeartWebsites] = useState<AIWebsite[]>([]);
    const [starWebsites, setStarWebsites] = useState<AIWebsite[]>([]);
    const [evaluationWebsites, setEvaluationWebsites] = useState<AIWebsite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('view');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        fetchLeaderboardData();
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchLeaderboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const viewResponse = await fetch('/api/showai?sort=view&limit=9');
            const heartResponse = await fetch('/api/showai?sort=heart&limit=9');
            const starResponse = await fetch('/api/showai?sort=star&limit=9');
            const evaluationResponse = await fetch('/api/showai?sort=evaluation&limit=9');

            if (!viewResponse.ok || !heartResponse.ok || !starResponse.ok || !evaluationResponse.ok) {
                throw new Error('Lỗi khi tải dữ liệu bảng xếp hạng');
            }

            const viewData = await viewResponse.json();
            const heartData = await heartResponse.json();
            const starData = await starResponse.json();
            const evaluationData = await evaluationResponse.json();

            setViewWebsites(viewData.data);
            setHeartWebsites(heartData.data);
            setStarWebsites(starData.data);
            setEvaluationWebsites(evaluationData.data);
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            setError('Không thể tải dữ liệu bảng xếp hạng');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTagClick = (tag: string) => {
        router.push(`/search?tag=${encodeURIComponent(tag)}`);
    };

    const tabs = ['view', 'heart', 'star', 'evaluation'];
    const changeTab = (direction: 'next' | 'prev') => {
        const currentIndex = tabs.indexOf(activeTab);
        let newIndex;
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % tabs.length;
        } else {
            newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }
        setActiveTab(tabs[newIndex]);
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => changeTab('next'),
        onSwipedRight: () => changeTab('prev'),
        trackMouse: true
    });

    const renderTabContent = () => {
        switch (activeTab) {
            case 'view':
                return (
                    <LeaderboardSection
                        title="Bảng Lượt Xem"
                        icon={<FaEye className="text-blue-500" />}
                        websites={viewWebsites}
                        onTagClick={handleTagClick}
                    />
                );
            case 'heart':
                return (
                    <LeaderboardSection
                        title="Bảng Yêu Thích"
                        icon={<FaHeart className="text-red-500" />}
                        websites={heartWebsites}
                        onTagClick={handleTagClick}
                    />
                );
            case 'star':
                return (
                    <LeaderboardSection
                        title="Bảng Phổ Biến"
                        icon={<FaFire className="text-orange-500" />}
                        websites={starWebsites}
                        onTagClick={handleTagClick}
                    />
                );
            case 'evaluation':
                return (
                    <LeaderboardSection
                        title="Bảng Đánh Giá"
                        icon={<FaThumbsUp className="text-green-500" />}
                        websites={evaluationWebsites}
                        onTagClick={handleTagClick}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Bảng Xếp Hạng</h1>
                <p className="text-base sm:text-lg max-w-3xl mx-auto">
                    Khám phá các công cụ AI phổ biến nhất.
                </p>
            </div>
            <div className="container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <FaSpinner className="animate-spin text-4xl text-blue-500" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500">
                        {error}
                    </div>
                ) : (
                    <>
                        {isMobile ? (
                            <div className="flex justify-between items-center mb-8">
                                <FaChevronLeft
                                    className="text-2xl text-gray-400 cursor-pointer"
                                    onClick={() => changeTab('prev')}
                                />
                                <button
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'view' ? 'bg-blue-500' :
                                        activeTab === 'heart' ? 'bg-red-500' :
                                            activeTab === 'star' ? 'bg-orange-500' :
                                                'bg-green-500'
                                        }`}
                                >
                                    {activeTab === 'view' && <FaEye className="inline mr-2" />}
                                    {activeTab === 'heart' && <FaHeart className="inline mr-2" />}
                                    {activeTab === 'star' && <FaFire className="inline mr-2" />}
                                    {activeTab === 'evaluation' && <FaThumbsUp className="inline mr-2" />}
                                    {activeTab === 'view' ? 'Lượt Xem' :
                                        activeTab === 'heart' ? 'Yêu Thích' :
                                            activeTab === 'star' ? 'Phổ Biến' : 'Đánh Giá'}
                                </button>
                                <FaChevronRight
                                    className="text-2xl text-gray-400 cursor-pointer"
                                    onClick={() => changeTab('next')}
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center mb-8">
                                <button
                                    className={`px-4 py-2 mx-2 rounded-lg ${activeTab === 'view' ? 'bg-blue-500' : 'bg-gray-700'}`}
                                    onClick={() => setActiveTab('view')}
                                >
                                    <FaEye className="inline mr-2" /> Lượt Xem
                                </button>
                                <button
                                    className={`px-4 py-2 mx-2 rounded-lg ${activeTab === 'heart' ? 'bg-red-500' : 'bg-gray-700'}`}
                                    onClick={() => setActiveTab('heart')}
                                >
                                    <FaHeart className="inline mr-2" /> Yêu Thích
                                </button>
                                <button
                                    className={`px-4 py-2 mx-2 rounded-lg ${activeTab === 'star' ? 'bg-orange-500' : 'bg-gray-700'}`}
                                    onClick={() => setActiveTab('star')}
                                >
                                    <FaFire className="inline mr-2" /> Phổ Biến
                                </button>
                                <button
                                    className={`px-4 py-2 mx-2 rounded-lg ${activeTab === 'evaluation' ? 'bg-green-500' : 'bg-gray-700'}`}
                                    onClick={() => setActiveTab('evaluation')}
                                >
                                    <FaThumbsUp className="inline mr-2" /> Đánh Giá
                                </button>
                            </div>
                        )}
                        <div {...handlers}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: isMobile ? 100 : 0, y: isMobile ? 0 : 20 }}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    exit={{ opacity: 0, x: isMobile ? -100 : 0, y: isMobile ? 0 : -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {renderTabContent()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

interface LeaderboardSectionProps {
    title: string;
    icon: React.ReactNode;
    websites: AIWebsite[];
    onTagClick: (tag: string) => void;
}

const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({ title, icon, websites, onTagClick }) => {
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
                {icon}
                <span className="ml-2">{title}</span>
            </h2>
            <div className="overflow-x-auto">
                <div className="inline-flex space-x-4">
                    <WebsiteList
                        websites={websites.map((website, index) => ({
                            ...website,
                            label: index === 0 ? 'TOP1' : index === 1 ? 'TOP2' : index === 2 ? 'TOP3' : undefined,
                            labelColor: index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : undefined,
                            labelIcon: index === 0 ? <FaTrophy className="text-yellow-400 mr-1" /> :
                                index === 1 ? <FaTrophy className="text-gray-300 mr-1" /> :
                                    index === 2 ? <FaTrophy className="text-orange-400 mr-1" /> : undefined
                        }))}
                        onTagClick={onTagClick}
                        isRandom={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;