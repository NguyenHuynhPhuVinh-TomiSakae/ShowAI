import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaEye, FaHeart, FaThumbtack, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import AdditionalInfoButton from './AdditionalInfoButton';
import { useFirebase } from './FirebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Rating from './Rating';
import Comments from './Comments';
import ShortCommentInput from './ShortCommentInput';
import Image from 'next/image';
import AICompare from './AICompare';
import TipTapEditor from './TipTapEditorModal';
import type { MotionProps } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import AIChart from './AIChart';
import AIRating from './AIRating';
import AIButton from './AIButton';

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
    comments?: Array<{ id: string; uid: string; user: string; text: string; date: string }>;
    image?: string; // Thêm trường image vào interface
    displayName?: string;
}

interface WebsiteDetailsProps {
    website: AIWebsite;
    isPinned: boolean;
    onPinClick: () => void;
    onTagClick: (tag: string) => void;
    isPreviewMode?: boolean; // Thêm prop mới
}

const WebsiteDetails: React.FC<WebsiteDetailsProps> = ({ website, isPinned, onPinClick, onTagClick, isPreviewMode }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [viewCount] = useState(website.view || 0);
    const [isHearted, setIsHearted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const { auth, db } = useFirebase();
    const [heartCount, setHeartCount] = useState(website.heart || 0);
    const [canHeart, setCanHeart] = useState(true);
    const router = useRouter();
    const [websiteRating, setWebsiteRating] = useState(website.evaluation || 0);
    const [isRating, setIsRating] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 768 });

    useEffect(() => {
        setIsVisible(true);
        const unsubscribe = auth?.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                checkHeartStatus(currentUser.uid, website.id);
            }
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth, website.id]);

    const checkHeartStatus = async (userId: string, websiteId: string) => {
        if (!db) return;
        const userDoc = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setIsHearted(userData.heartedWebsites?.includes(websiteId) || false);
            setCanHeart(true);
        }
    };

    const handleHeartClick = async () => {
        if (isPreviewMode) return;
        if (!user) {
            router.push('/login');
            return;
        }

        if (!db || !canHeart) return;

        // Immediately update UI
        setIsHearted(!isHearted);
        setHeartCount(prevCount => isHearted ? prevCount - 1 : prevCount + 1);

        // Perform background operations
        try {
            const userDoc = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userDoc);

            if (userSnapshot.exists()) {
                if (!isHearted) {
                    // Add to hearted websites
                    updateDoc(userDoc, {
                        heartedWebsites: arrayUnion(website.id)
                    });
                } else {
                    // Remove from hearted websites
                    updateDoc(userDoc, {
                        heartedWebsites: arrayRemove(website.id)
                    });
                }

                // Update heart count in the API
                updateHeartCount(website.id, !isHearted);
            }
        } catch (error) {
            console.error('Error handling heart click:', error);
            // Revert UI changes if there's an error
            setIsHearted(!isHearted);
            setHeartCount(prevCount => isHearted ? prevCount + 1 : prevCount - 1);
        }
    };

    // Điều chỉnh containerVariants dựa trên thiết bị
    const containerVariants = isMobile ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 }
    } : {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const updateHeartCount = async (websiteId: string, increment: boolean) => {
        try {
            const response = await fetch('/api/updateHeart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: websiteId, increment }),
            });
            if (!response.ok) {
                throw new Error('Failed to update heart count');
            }
            const data = await response.json();
            return data.newHeartCount;
        } catch (error) {
            console.error('Error updating heart count:', error);
            throw error;
        }
    };

    const handleRatingStart = () => {
        setIsRating(true);
    };

    const handleRatingUpdate = (newRating: number) => {
        setWebsiteRating(newRating);
        setIsRating(false);
    };

    // Thêm hàm sắp xếp comments
    const sortComments = (comments: Array<{ id: string; uid: string; user: string; text: string; date: string }>) => {
        return [...comments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const handlePinClick = () => {
        if (isPreviewMode) return;
        onPinClick();
    };

    const handleTagClick = (tag: string) => {
        if (isPreviewMode) return;
        onTagClick(tag);
    };

    return (
        <motion.div
            {...{
                className: "bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-4 sm:p-8 shadow-2xl border border-gray-700 overflow-hidden",
                initial: isMobile ? "visible" : "hidden",
                animate: isVisible ? "visible" : "hidden",
                variants: containerVariants
            } as ModalBackdropProps}
        >
            {website.image && (
                <div className="mb-6 sm:mb-8 relative w-full h-48 sm:h-96 overflow-hidden rounded-2xl">
                    <Image
                        src={website.image}
                        alt={website.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
                    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">{website.name}</h2>
                        <div className="text-sm text-gray-300">
                            Đăng bởi: {website.displayName || 'Admin'}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
                {!website.image && (
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-blue-300 mr-4 mb-2 sm:mb-0">
                            {website.name}
                        </h2>
                        <div className="text-sm text-gray-400 mb-4">
                            Đăng bởi: {website.displayName || 'Admin'}
                        </div>
                    </div>
                )}
                <div className="flex items-center space-x-4 sm:space-x-8 mb-4 sm:mb-0">
                    <div className="flex items-center text-gray-400 hover:text-gray-300 transition-colors">
                        <FaEye className="text-xl sm:text-2xl mr-2" />
                        <span className="text-base sm:text-lg">{viewCount}</span>
                    </div>
                    <div className="flex items-center">
                        <FaHeart
                            className={`text-xl sm:text-2xl mr-2 ${isHearted ? 'text-red-500' : 'text-gray-400 hover:text-red-400 cursor-pointer'} 
                            ${isPreviewMode ? 'cursor-default' : 'cursor-pointer'} transition-colors ai-hoverable`}
                            data-button-id="website-heart"
                            onClick={handleHeartClick}
                        />
                        <span className="text-base sm:text-lg text-gray-400">{heartCount}</span>
                    </div>
                    <button
                        onClick={handlePinClick}
                        data-button-id="website-pin"
                        className={`text-2xl ${isPinned ? 'text-green-400' : 'text-gray-400'} hover:text-green-400 transition-colors duration-200 ${isPreviewMode ? 'cursor-default pointer-events-none' : ''} ai-hoverable`}
                    >
                        <FaThumbtack />
                    </button>

                    {!isPreviewMode && (
                        <AIButton
                            websiteName={website.name}
                            description={website.description}
                            keyFeatures={website.keyFeatures}
                        />
                    )}
                </div>
                <Link
                    href={website.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-button-id="website-access"
                    className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                    text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-full transition-all duration-300 
                    transform hover:scale-105 shadow-lg text-sm sm:text-base
                    hover:-translate-y-1 active:translate-y-0
                    border-b-4 border-blue-800 hover:border-blue-900 active:border-b-0
                    active:shadow-inner ai-hoverable"
                >
                    Truy cập trang web
                </Link>
            </div>

            <div className="mb-6 sm:mb-8">
                {!isPreviewMode && (
                    isRating ? (
                        <p className="text-gray-400 flex items-center">
                            <FaSpinner className="animate-spin mr-2" />
                            Đang phản hồi...
                        </p>
                    ) : (
                        <Rating
                            websiteId={website.id}
                            initialRating={websiteRating}
                            user={user}
                            onRatingUpdate={handleRatingUpdate}
                            onRatingStart={handleRatingStart}
                            className="ai-hoverable"
                            data-button-id="website-rating"
                        />
                    )
                )}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                {website.tags && website.tags.map((tag, index) => (
                    <span
                        key={index}
                        onClick={() => handleTagClick(tag)}
                        className="bg-blue-900 text-blue-200 text-xs sm:text-sm font-medium px-3 py-1 sm:px-4 sm:py-2 rounded-full cursor-pointer hover:bg-blue-800 transition-colors duration-300"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <TipTapEditor
                content={Array.isArray(website.description)
                    ? website.description.join('\n\n')
                    : website.description}
            />

            {website.keyFeatures && website.keyFeatures.length > 0 && (
                <div className="mb-6 sm:mb-8 bg-gray-800 rounded-xl p-4 sm:p-6">
                    <strong className="text-xl sm:text-2xl text-blue-300 mb-3 sm:mb-4 block">Tính năng chính:</strong>
                    <ul className="list-none mt-3 sm:mt-4 text-gray-300 space-y-2 sm:space-y-3">
                        {website.keyFeatures.map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-blue-400 mr-2 sm:mr-3 text-lg sm:text-xl">•</span>
                                <TypeAnimation
                                    sequence={[
                                        feature,
                                        () => { },
                                    ]}
                                    speed={75}
                                    cursor={false}
                                    className="text-base sm:text-lg"
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!isPreviewMode && (
                <>
                    <AdditionalInfoButton
                        websiteData={JSON.stringify(website)}
                        className="ai-hoverable"
                        data-button-id="website-info"
                    />
                    <AIRating
                        websiteName={website.name}
                        description={website.description}
                        keyFeatures={website.keyFeatures}
                    />
                    <AIChart
                        websiteId={website.id}
                        websiteName={website.name}
                        description={website.description}
                        keyFeatures={website.keyFeatures}
                    />
                    <AICompare
                        currentWebsite={website}
                        className="ai-hoverable"
                        data-button-id="website-compare"
                    />
                    <div className="mt-8 sm:mt-12">
                        <ShortCommentInput
                            websiteId={website.id}
                            user={user}
                            className="ai-hoverable"
                            data-button-id="website-comment"
                        />
                        <Comments
                            websiteId={website.id}
                            comments={sortComments(website.comments || [])}
                            user={user}
                        />
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default WebsiteDetails;
