
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/components/FirebaseConfig';

interface AIWebsite {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string[];
    link: string;
    keyFeatures: string[];
}

export function useStarredWebsites() {
    const [starredWebsites, setStarredWebsites] = useState<AIWebsite[]>([]);
    const [isStarredLoading, setIsStarredLoading] = useState(true);
    const { auth, db } = useFirebase();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = auth?.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [auth]);

    useEffect(() => {
        fetchStarredWebsites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchStarredWebsites = async () => {
        setIsStarredLoading(true);
        try {
            let starredIds = [];
            if (user && db) {
                const userDoc = doc(db, 'users', user.uid);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    starredIds = userSnapshot.data().starredWebsites || [];
                }
            } else {
                starredIds = JSON.parse(localStorage.getItem('starredIds') || '[]');
            }

            if (starredIds.length === 0) {
                setStarredWebsites([]);
                setIsStarredLoading(false);
                return;
            }

            const starIdsQuery = starredIds.join(',');
            const response = await fetch(`/api/showai?list=${starIdsQuery}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.data) {
                    setStarredWebsites(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching starred websites:', error);
        } finally {
            setIsStarredLoading(false);
        }
    };

    const toggleStar = async (websiteId: string) => {
        try {
            // Existing code for updating local state
            setStarredWebsites(prevWebsites => {
                const isCurrentlyStarred = prevWebsites.some(website => website.id === websiteId);
                if (isCurrentlyStarred) {
                    return prevWebsites.filter(website => website.id !== websiteId);
                } else {
                    const tempWebsite: AIWebsite = {
                        _id: websiteId,
                        id: websiteId,
                        name: 'Loading...',
                        description: [],
                        tags: [],
                        link: '',
                        keyFeatures: []
                    };
                    return [...prevWebsites, tempWebsite];
                }
            });

            let starredIds = JSON.parse(localStorage.getItem('starredIds') || '[]');

            if (user && db) {
                const userDoc = doc(db, 'users', user.uid);
                const userSnapshot = await getDoc(userDoc);

                if (userSnapshot.exists()) {
                    starredIds = userSnapshot.data().starredWebsites || [];
                }

                const isCurrentlyStarred = starredIds.includes(websiteId);
                if (isCurrentlyStarred) {
                    starredIds = starredIds.filter((id: string) => id !== websiteId);
                } else {
                    starredIds.push(websiteId);
                }

                // Update Firestore
                await updateDoc(userDoc, {
                    starredWebsites: starredIds
                });

                // Call API to update star count
                const response = await fetch('/api/updateStar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: websiteId, increment: !isCurrentlyStarred }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update star count');
                }
            } else {
                // Handle non-logged-in users
                const isCurrentlyStarred = starredIds.includes(websiteId);
                if (isCurrentlyStarred) {
                    starredIds = starredIds.filter((id: string) => id !== websiteId);
                } else {
                    starredIds.push(websiteId);
                }

                localStorage.setItem('starredIds', JSON.stringify(starredIds));
            }

            // Fetch updated data
            await fetchStarredWebsites();
        } catch (error) {
            console.error('Error updating starred websites:', error);
            // Revert local changes if there's an error
            await fetchStarredWebsites();
        }
    };

    const isStarred = (websiteId: string) => {
        return starredWebsites.some(website => website.id === websiteId);
    };

    return { starredWebsites, isStarredLoading, toggleStar, isStarred, fetchStarredWebsites };
}
