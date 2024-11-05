import React, { useState, useEffect } from 'react';
import { FaStar, FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useFirebase } from './FirebaseConfig';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

interface RatingProps {
    websiteId: string;
    initialRating: number;
    user: any;
    onRatingUpdate: (rating: number) => void;
    onRatingStart: () => void;
    className?: string;
    'data-button-id'?: string;
}

const Rating: React.FC<RatingProps> = ({
    websiteId,
    initialRating,
    user,
    onRatingUpdate,
    onRatingStart,
    className,
    'data-button-id': buttonId
}) => {
    const [userRating, setUserRating] = useState<number | null>(null);
    const [hoverRating, setHoverRating] = useState(0);
    const [canRate, setCanRate] = useState(true);
    const [localEvaluation] = useState(initialRating);
    const router = useRouter();
    const { db } = useFirebase();

    useEffect(() => {
        if (user && db) {
            checkUserRating(user.uid, websiteId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, websiteId, db]);

    const checkUserRating = async (userId: string, websiteId: string) => {
        if (!db) return;
        const userDoc = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const ratedWebsites = userData.ratedWebsites || {};
            if (websiteId in ratedWebsites) {
                setUserRating(ratedWebsites[websiteId]);
                setCanRate(false);
            } else {
                setCanRate(true);
            }
        }
    };

    const handleRating = async (rating: number) => {
        if (!user || !db) {
            router.push('/login');
            return;
        }

        onRatingStart();

        try {
            const userDoc = doc(db, 'users', user.uid);
            await updateDoc(userDoc, {
                [`ratedWebsites.${websiteId}`]: rating
            });

            setUserRating(rating);
            setCanRate(false);
            onRatingUpdate(rating);

            const response = await fetch('/api/updateRating', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ websiteId, userId: user.uid, rating }),
            });

            if (!response.ok) {
                throw new Error('Failed to update rating');
            }
        } catch (error) {
            console.error('Error updating rating:', error);
            setUserRating(null);
            setCanRate(true);
            onRatingUpdate(initialRating);
        }
    };

    const handleRemoveRating = async () => {
        if (!user || !db) return;

        try {
            const userDoc = doc(db, 'users', user.uid);
            await updateDoc(userDoc, {
                [`ratedWebsites.${websiteId}`]: deleteField()
            });

            setUserRating(null);
            setCanRate(true);
            setHoverRating(0);
            onRatingUpdate(0);

            const response = await fetch('/api/removeRating', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ websiteId, userId: user.uid }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove rating');
            }
        } catch (error) {
            console.error('Error removing rating:', error);
        }
    };

    return (
        <div className={className} data-button-id={buttonId}>
            <div className="mt-4">
                <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-blue-300 mr-2">Đánh giá</h3>
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-gray-300">{localEvaluation.toFixed(1) || 'Chưa có'}</span>
                </div>
                <div className="flex items-center">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                                key={star}
                                className={`cursor-pointer text-2xl mr-1 ${star <= (hoverRating || userRating || 0)
                                    ? 'text-yellow-400'
                                    : 'text-gray-400'
                                    }`}
                                onClick={() => canRate && handleRating(star)}
                                onMouseEnter={() => canRate && setHoverRating(star)}
                                onMouseLeave={() => canRate && setHoverRating(0)}
                            />
                        ))}
                    </div>
                    {!canRate && (
                        <button
                            onClick={handleRemoveRating}
                            className="ml-4 text-red-400 hover:text-red-300 flex items-center"
                        >
                            <FaTrash className="mr-1" /> Xóa đánh giá
                        </button>
                    )}
                </div>
                {!user && (
                    <p className="text-gray-400 mt-2">Đăng nhập để đánh giá</p>
                )}
            </div>
        </div>
    );
};

export default Rating;
