
'use client'
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaTimes, FaThumbtack } from 'react-icons/fa';
import WebsiteList from '@/components/WebsiteList';
import SearchBar from '@/components/SearchBar';
import ModalPortal from '@/components/ModalPortal';
import WebsiteDetails from '@/components/WebsiteDetails';
import { useStarredWebsites } from '@/hooks/useStarredWebsites';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
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
    image?: string;
}

function ShowContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [website, setWebsite] = useState<AIWebsite | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [randomWebsites, setRandomWebsites] = useState<AIWebsite[]>([]);
    const [isRandomLoading, setIsRandomLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [showStarredModal, setShowStarredModal] = useState(false);
    const { starredWebsites, isStarredLoading, toggleStar, isStarred } = useStarredWebsites();
    const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            fetchWebsiteDetails(id);
        }
        fetchRandomWebsites();

        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const fetchWebsiteDetails = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/showai?id=${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Received data:', data);
            if (data && data.data && data.data.length > 0) {
                setWebsite(data.data[0]);
                setAllTags(data.tags);
            } else {
                setError('Không tìm thấy dữ liệu website');
            }
        } catch (error) {
            console.error('Error fetching website details:', error);
            setError('Không thể tải thông tin website');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRandomWebsites = async () => {
        setIsRandomLoading(true);
        try {
            const response = await fetch('/api/showai?random=8');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data && data.data) {
                setRandomWebsites(data.data);
                setAllTags(data.tags);
            }
        } catch (error) {
            console.error('Error fetching random websites:', error);
        } finally {
            setIsRandomLoading(false);
        }
    };

    const handleTagClick = (tag: string) => {
        router.push(`/search?tag=${encodeURIComponent(tag)}`);
    };

    const handleStarClick = async () => {
        if (website) {
            await toggleStar(website.id);
        }
    };

    const toggleStarredModal = () => {
        setShowStarredModal(!showStarredModal);
    };

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 300) {
            setIsScrollButtonVisible(true);
        } else {
            setIsScrollButtonVisible(false);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const WebsiteDetailsSkeleton = () => (
        <div className="bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden p-6">
            <div className="flex justify-between items-center mb-4">
                <Skeleton width={200} height={30} baseColor="#1F2937" highlightColor="#374151" />
                <Skeleton width={30} height={30} baseColor="#1F2937" highlightColor="#374151" />
            </div>
            <Skeleton count={3} baseColor="#1F2937" highlightColor="#374151" />
            <div className="mt-4">
                <Skeleton width={100} height={24} baseColor="#1F2937" highlightColor="#374151" />
                <div className="flex flex-wrap gap-2 mt-2">
                    <Skeleton width={60} height={24} baseColor="#1F2937" highlightColor="#374151" />
                    <Skeleton width={60} height={24} baseColor="#1F2937" highlightColor="#374151" />
                    <Skeleton width={60} height={24} baseColor="#1F2937" highlightColor="#374151" />
                </div>
            </div>
            <div className="mt-4">
                <Skeleton width={150} height={24} baseColor="#1F2937" highlightColor="#374151" />
                <Skeleton count={3} baseColor="#1F2937" highlightColor="#374151" />
            </div>
        </div>
    );

    const RandomWebsitesSkeleton = () => (
        <div className="mt-8">
            <Skeleton width={200} height={30} baseColor="#1F2937" highlightColor="#374151" className="mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        <Skeleton height={150} baseColor="#1F2937" highlightColor="#374151" />
                        <div className="p-4">
                            <Skeleton width={150} height={24} baseColor="#1F2937" highlightColor="#374151" />
                            <Skeleton count={2} baseColor="#1F2937" highlightColor="#374151" />
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Skeleton width={60} height={24} baseColor="#1F2937" highlightColor="#374151" />
                                <Skeleton width={60} height={24} baseColor="#1F2937" highlightColor="#374151" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <div className="bg-[#2A3284] text-center py-4 mb-4 px-4">
                <div className="py-4 sm:py-8">
                    <SearchBar onTagClick={handleTagClick} allTags={allTags} />
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {isLoading ? (
                            <WebsiteDetailsSkeleton />
                        ) : error ? (
                            <p className="text-center text-red-500">{error}</p>
                        ) : website ? (
                            <WebsiteDetails
                                website={website}
                                isPinned={isStarred(website.id)}
                                onPinClick={handleStarClick}
                                onTagClick={handleTagClick}
                            />
                        ) : (
                            <p className="text-center">Không có dữ liệu để hiển thị.</p>
                        )}

                        {isRandomLoading ? (
                            <RandomWebsitesSkeleton />
                        ) : randomWebsites.length > 0 ? (
                            <div className="mt-8">
                                <h3 className="text-xl md:text-2xl text-center font-bold text-blue-300 mb-4">Đề xuất trang web AI ngẫu nhiên</h3>
                                <WebsiteList websites={randomWebsites} onTagClick={handleTagClick} isRandom={true} />
                            </div>
                        ) : (
                            <p className="text-center mt-8">Không có đề xuất nào để hiển thị.</p>
                        )}
                    </div>

                    {/* Starred Websites Modal (only for mobile) */}
                    {isMobile && showStarredModal && (
                        <ModalPortal>
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
                                <div className="bg-gray-800 w-full max-w-md h-full overflow-y-auto">
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-bold text-blue-300 flex items-center">
                                                <FaThumbtack className="mr-2 text-green-400" />
                                                Danh sách các trang đã ghim
                                            </h2>
                                            <button onClick={toggleStarredModal} className="text-white">
                                                <FaTimes />
                                            </button>
                                        </div>
                                        {isStarredLoading ? (
                                            <div>
                                                <Skeleton count={5} height={50} baseColor="#1F2937" highlightColor="#374151" />
                                            </div>
                                        ) : starredWebsites.length > 0 ? (
                                            <WebsiteList websites={starredWebsites} onTagClick={handleTagClick} isSidebar={true} />
                                        ) : (
                                            <p className="text-center text-white">Không có trang nào được ghim.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ModalPortal>
                    )}

                    {/* Starred Websites (for desktop) */}
                    {!isMobile && (
                        <div className="lg:block sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
                            <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center">
                                <FaThumbtack className="mr-2 text-green-400" />
                                Danh sách các trang đã ghim
                            </h2>
                            <div className="overflow-y-auto">
                                {isStarredLoading ? (
                                    <div>
                                        <Skeleton count={5} height={50} baseColor="#1F2937" highlightColor="#374151" />
                                    </div>
                                ) : starredWebsites.length > 0 ? (
                                    <WebsiteList websites={starredWebsites} onTagClick={handleTagClick} isSidebar={true} />
                                ) : (
                                    <p className="text-center text-white">Không có trang nào được ghim.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isMobile && (
                <ModalPortal>
                    <AnimatePresence>
                        <motion.button
                            {...{
                                initial: { y: 0, opacity: 1 },
                                animate: {
                                    y: isScrollButtonVisible ? -190 : 0,
                                    opacity: 1
                                },
                                transition: { duration: 0.3 },
                                className: "fixed bottom-5 right-5 bg-blue-500 text-white p-3 rounded-full",
                                onClick: toggleStarredModal
                            } as ModalBackdropProps}
                        >
                            <FaThumbtack />
                        </motion.button>
                    </AnimatePresence>
                </ModalPortal>
            )}
        </div>
    );
}

export default function Show() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ShowContent />
        </Suspense>
    );
}
