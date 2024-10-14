/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaStar, FaEye, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import AdditionalInfoButton from './AdditionalInfoButton';
import { FaSpinner } from 'react-icons/fa';
import { useFirebase } from './FirebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Rating from './Rating';
import Comments from './Comments';

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
    const [isHearted, setIsHearted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const { auth, db } = useFirebase();
    const [heartCount, setHeartCount] = useState(website.heart || 0);
    const [canHeart, setCanHeart] = useState(true);
    const router = useRouter();
    const [websiteRating, setWebsiteRating] = useState(website.evaluation || 0);
    const [isRating, setIsRating] = useState(false);

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

    const containerVariants = {
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

    return (
        <motion.div
            className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={containerVariants}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 sm:mb-0">
                    <h2 className="text-2xl font-bold text-blue-300 mr-4">{website.name}</h2>
                    <div className="flex items-center space-x-6 mt-2 sm:mt-0">
                        <div className="flex items-center text-gray-400">
                            <FaEye className="text-2xl mr-1" />
                            <span>{viewCount}</span>
                        </div>
                        <div className="flex items-center">
                            <FaHeart
                                className={`text-2xl mr-1 ${isHearted ? 'text-red-500' : 'text-gray-400 cursor-pointer'}`}
                                onClick={handleHeartClick}
                            />
                            <span className="text-gray-400">{heartCount}</span>
                        </div>
                        <div className="flex items-center">
                            <FaStar
                                className={`cursor-pointer text-3xl mr-1 ${isStarred ? 'text-yellow-400' : 'text-gray-400'}`}
                                onClick={onStarClick}
                            />
                        </div>
                    </div>
                </div>
                <Link
                    href={website.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#6366F1] hover:bg-[#93C5FD] text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 mt-2 sm:mt-0"
                >
                    Truy cập trang web
                </Link>
            </div>

            <div className="mb-4">
                {isRating ? (
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
                    />
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
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

            <Comments
                websiteId={website.id}
                comments={sortComments(website.comments || [])}
                user={user}
            />
        </motion.div>
    );
};

export default WebsiteDetails;
