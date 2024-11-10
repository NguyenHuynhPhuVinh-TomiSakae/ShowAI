'use client';

import { useEffect, useState, useCallback } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import { PostCard } from '@/components/social/PostCard';
import { PostSkeleton } from '@/components/social/PostSkeleton';
import SocialNav from '@/components/social/SocialNav';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import { InfiniteScroll } from '@/components/common/InfiniteScroll';

const POSTS_PER_PAGE = 10;

export default function FollowingPage() {
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
                        return followingIds.includes(post.characterId.toString()) &&
                            !seenIds.has(post.id) && seenIds.add(post.id);
                    })
                    .sort((a, b) => b.timestamp - a.timestamp);

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

    useEffect(() => {
        fetchFollowingPosts();
    }, [fetchFollowingPosts]);

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
                <InfiniteScroll
                    loading={loading}
                    hasMore={hasMore}
                    onLoadMore={() => lastTimestamp && fetchFollowingPosts(lastTimestamp)}
                    loadingMore={loadingMore}
                >
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
                        posts.map((post) => (
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
                        ))
                    )}
                </InfiniteScroll>
            </div>
        </div>
    );
}
