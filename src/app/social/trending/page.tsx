'use client';

import { useEffect, useState, useCallback } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { ref, query, get } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import { PostCard } from '@/components/social/PostCard';
import { PostSkeleton } from '@/components/social/PostSkeleton';
import SocialNav from '@/components/social/SocialNav';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import { InfiniteScroll } from '@/components/common/InfiniteScroll';

const POSTS_PER_PAGE = 10;

export default function TrendingPage() {
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
    const [lastInteractionScore, setLastInteractionScore] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const currentUserId = auth?.currentUser?.uid;

    const fetchTrendingPosts = useCallback(async (lastScore: number | null = null) => {
        if (lastScore === null) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const database = await initializeFirebase();
            const postsRef = ref(database, 'posts');
            const postsQuery = query(postsRef);

            const snapshot = await get(postsQuery);
            if (snapshot.exists()) {
                const postsData = snapshot.val();
                const seenIds = new Set();
                const postsArray = Object.entries(postsData)
                    .map(([id, data]: [string, any]) => {
                        const likesCount = typeof data.likes === 'number'
                            ? data.likes
                            : (data.likes ? Object.keys(data.likes).filter(key => data.likes[key] === true).length : 0);
                        const commentsCount = data.comments ? Object.keys(data.comments).length : 0;

                        return {
                            id,
                            ...data,
                            interactionScore: likesCount + commentsCount
                        };
                    })
                    .filter(post => {
                        if (seenIds.has(post.id)) {
                            return false;
                        }
                        seenIds.add(post.id);
                        return true;
                    });

                const sortedPosts = postsArray.sort((a, b) => b.interactionScore - a.interactionScore);

                let filteredPosts = sortedPosts;
                if (lastScore !== null) {
                    filteredPosts = sortedPosts.filter(post => post.interactionScore < lastScore);
                }

                const paginatedPosts = filteredPosts.slice(0, POSTS_PER_PAGE);

                if (lastScore !== null) {
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
                    setLastInteractionScore(lastPost.interactionScore);
                    setHasMore(paginatedPosts.length >= POSTS_PER_PAGE);
                } else {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Lỗi khi tải bài đăng thịnh hành:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [setPosts]);

    useEffect(() => {
        fetchTrendingPosts(null);
    }, [fetchTrendingPosts]);

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Bài Viết Thịnh Hành
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Những bài viết được tương tác nhiều nhất
                </p>
            </div>

            <SocialNav />

            <div className="max-w-2xl mx-auto px-4 pb-8">
                <InfiniteScroll
                    loading={loading}
                    hasMore={hasMore}
                    onLoadMore={() => lastInteractionScore !== null && fetchTrendingPosts(lastInteractionScore)}
                    loadingMore={loadingMore}
                >
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

                    {loading && (
                        <div className="space-y-4">
                            <PostSkeleton />
                            <PostSkeleton />
                            <PostSkeleton />
                        </div>
                    )}

                    {!loading && posts.length === 0 && (
                        <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p className="text-lg font-medium">Chưa có bài đăng thịnh hành</p>
                            <p className="text-sm mt-2">Hãy tương tác với các bài viết!</p>
                        </div>
                    )}
                </InfiniteScroll>
            </div>
        </div>
    );
}
