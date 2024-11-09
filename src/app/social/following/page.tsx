'use client';

import { useEffect, useState, useCallback } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { ref, get, onValue } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import { PostCard } from '@/components/social/PostCard';
import { PostSkeleton } from '@/components/social/PostSkeleton';
import SocialNav from '@/components/social/SocialNav';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import { useMediaQuery } from 'react-responsive';

const POSTS_PER_PAGE = 10;

export default function FollowingPage() {
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const { auth } = useFirebase();
    const {
        posts,
        setPosts,
        handleLike,
        handleComment,
        handleEditComment,
        handleDeleteComment,
        toggleEditing
    } = usePostInteractions(auth);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const currentUserId = auth?.currentUser?.uid;

    const fetchFollowingPosts = useCallback(async (lastTs: number | null = null) => {
        if (!currentUserId) {
            setLoading(false);
            return;
        }

        if (lastTs === null) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const database = await initializeFirebase();

            // Lấy danh sách người đang theo dõi
            const profilesRef = ref(database, 'profiles');
            const profilesSnapshot = await get(profilesRef);

            if (!profilesSnapshot.exists()) {
                setLoading(false);
                return;
            }

            const profiles = profilesSnapshot.val();
            const followingIds: string[] = [];

            // Lọc ra các ID của nhân vật đang theo dõi
            Object.entries(profiles).forEach(([profileId, profileData]: [string, any]) => {
                if (profileData.followers && profileData.followers[currentUserId]) {
                    followingIds.push(profileId);
                }
            });

            if (followingIds.length === 0) {
                setPosts([]);
                setLoading(false);
                setLoadingMore(false);
                setHasMore(false);
                return;
            }

            // Lấy toàn bộ bài viết
            const postsRef = ref(database, 'posts');
            const postsSnapshot = await get(postsRef);

            if (postsSnapshot.exists()) {
                const postsData = postsSnapshot.val();
                const seenIds = new Set();
                const allPosts = Object.entries(postsData)
                    .map(([id, data]: [string, any]) => ({
                        id,
                        ...data
                    }))
                    .filter(post => {
                        // Lọc chỉ lấy bài viết từ người đang theo dõi
                        return followingIds.includes(post.characterId.toString()) &&
                            !seenIds.has(post.id) && seenIds.add(post.id);
                    })
                    .sort((a, b) => b.timestamp - a.timestamp); // Sắp xếp theo thời gian mới nhất

                // Phân trang ở phía client
                const startIndex = lastTs ? allPosts.findIndex(post => post.timestamp === lastTs) + 1 : 0;
                const paginatedPosts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

                if (lastTs) {
                    setPosts(prev => {
                        const combinedPosts = [...prev, ...paginatedPosts];
                        const uniquePosts = Array.from(
                            new Map(combinedPosts.map(post => [post.id, post])).values()
                        );
                        return uniquePosts;
                    });
                } else {
                    setPosts(paginatedPosts);
                }

                // Cập nhật trạng thái phân trang
                if (paginatedPosts.length > 0) {
                    const lastPost = paginatedPosts[paginatedPosts.length - 1];
                    setLastTimestamp(lastPost.timestamp);
                    setHasMore(startIndex + POSTS_PER_PAGE < allPosts.length);
                } else {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Lỗi khi tải bài đăng:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [currentUserId, setPosts]);

    const handleScroll = useCallback(() => {
        if (loading || !hasMore || isMobile) return;

        const buffer = 200;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;

        if (scrollTop + clientHeight + buffer >= scrollHeight) {
            if (lastTimestamp) {
                fetchFollowingPosts(lastTimestamp);
            }
        }
    }, [loading, hasMore, lastTimestamp, fetchFollowingPosts, isMobile]);

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && lastTimestamp !== null) {
            fetchFollowingPosts(lastTimestamp);
        }
    };

    useEffect(() => {
        fetchFollowingPosts();
    }, [fetchFollowingPosts]);

    useEffect(() => {
        if (!isMobile) {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll, isMobile]);

    // Thêm useEffect để lắng nghe bài viết mới trong realtime
    useEffect(() => {
        const setupRealtimeUpdates = async () => {
            if (!currentUserId) return;

            const database = await initializeFirebase();
            const postsRef = ref(database, 'posts');

            const unsubscribe = onValue(postsRef, (snapshot) => {
                if (snapshot.exists()) {
                    fetchFollowingPosts();
                }
            });

            return unsubscribe; // onValue trả về một hàm unsubscribe trực tiếp
        };

        let cleanup: (() => void) | undefined;
        setupRealtimeUpdates().then(unsub => {
            cleanup = unsub;
        });

        return () => {
            cleanup?.();
        };
    }, [currentUserId, fetchFollowingPosts]);

    if (!currentUserId) {
        return (
            <div className="min-h-screen bg-[#0F172A]">
                <div className="bg-[#2A3284] text-center py-8 px-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Bài viết đang theo dõi
                    </h1>
                </div>
                <SocialNav />
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                        <p className="text-lg font-medium">Vui lòng đăng nhập để xem bài viết từ người bạn theo dõi</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Bài viết đang theo dõi
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Xem bài viết từ những người bạn theo dõi
                </p>
            </div>

            <SocialNav />

            <div className="max-w-2xl mx-auto px-4 pb-8">
                {loading ? (
                    <div className="space-y-4">
                        <PostSkeleton />
                        <PostSkeleton />
                        <PostSkeleton />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-lg font-medium">Chưa có bài viết nào</p>
                        <p className="text-sm mt-2">Hãy theo dõi một số người để xem bài viết của họ!</p>
                    </div>
                ) : (
                    <>
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onComment={handleComment}
                                onLike={handleLike}
                                onEdit={async () => { }}
                                onDelete={async () => { }}
                                currentUserId={currentUserId}
                                toggleEditing={toggleEditing}
                                onEditComment={handleEditComment}
                                onDeleteComment={handleDeleteComment}
                                isSocialPage={true}
                            />
                        ))}

                        {hasMore && (
                            <>
                                {isMobile ? (
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="w-full py-3 px-4 bg-[#2A3284] text-white rounded-lg mt-6 hover:bg-[#1E2563] transition-colors disabled:opacity-50"
                                    >
                                        {loadingMore ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang tải...
                                            </span>
                                        ) : (
                                            'Xem thêm'
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-center text-gray-400 my-6">
                                        <div className="animate-bounce">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                        <p className="mt-2">Kéo xuống để tải thêm</p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
