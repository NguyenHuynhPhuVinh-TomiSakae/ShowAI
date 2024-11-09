'use client';

import { useEffect, useState, useCallback } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { ref, query, orderByChild, get, limitToLast, endBefore, onValue } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import { PostCard } from '@/components/social/PostCard';
import { PostSkeleton } from '@/components/social/PostSkeleton';
import SocialNav from '@/components/social/SocialNav';
import { usePostInteractions } from '@/hooks/usePostInteractions';

const POSTS_PER_PAGE = 10;

export default function SocialPage() {
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
    const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const currentUserId = auth?.currentUser?.uid;

    const fetchPosts = useCallback(async (lastTs: number | null = null) => {
        setLoading(true);
        try {
            const database = await initializeFirebase();
            const postsRef = ref(database, 'posts');
            let postsQuery;

            if (lastTs) {
                postsQuery = query(
                    postsRef,
                    orderByChild('timestamp'),
                    endBefore(lastTs),
                    limitToLast(POSTS_PER_PAGE)
                );
            } else {
                postsQuery = query(
                    postsRef,
                    orderByChild('timestamp'),
                    limitToLast(POSTS_PER_PAGE)
                );
            }

            const snapshot = await get(postsQuery);
            if (snapshot.exists()) {
                const postsData = snapshot.val();
                const postsArray = Object.entries(postsData).map(([id, data]: [string, any]) => ({
                    id,
                    ...data
                }));

                const sortedPosts = postsArray.sort((a, b) => b.timestamp - a.timestamp);

                if (lastTs) {
                    setPosts(prev => [...prev, ...sortedPosts]);
                } else {
                    setPosts(sortedPosts);
                }

                if (sortedPosts.length > 0) {
                    const lastPost = sortedPosts[sortedPosts.length - 1];
                    setLastTimestamp(lastPost.timestamp);
                    setHasMore(sortedPosts.length >= POSTS_PER_PAGE);
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
        }
    }, []);

    const handleScroll = useCallback(() => {
        if (loading || !hasMore) return;

        const buffer = 200;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;

        if (scrollTop + clientHeight + buffer >= scrollHeight) {
            if (lastTimestamp) {
                fetchPosts(lastTimestamp);
            }
        }
    }, [loading, hasMore, lastTimestamp, fetchPosts]);

    useEffect(() => {
        if (!loading && posts.length === 0) {
            fetchPosts();
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        const initializeRealtimeUpdates = async () => {
            const database = await initializeFirebase();
            const postsRef = ref(database, 'posts');
            const recentPostsQuery = query(
                postsRef,
                orderByChild('timestamp'),
                limitToLast(1)
            );

            // Lắng nghe các thay đổi realtime
            return onValue(recentPostsQuery, async (snapshot) => {
                if (snapshot.exists()) {
                    const newPostData = snapshot.val();
                    const newPost = Object.entries(newPostData).map(([id, data]: [string, any]) => ({
                        id,
                        ...data
                    }))[0];

                    // Kiểm tra xem bài đăng mới có timestamp lớn hơn bài mới nhất hiện t
                    if (!posts.length || newPost.timestamp > posts[0].timestamp) {
                        // Tải lại toàn bộ danh sách bài đăng
                        await fetchPosts();
                    }
                }
            });
        };

        const unsubscribe = initializeRealtimeUpdates();

        // Cleanup listener khi component unmount
        return () => {
            unsubscribe.then(unsubFn => unsubFn());
        };
    }, [posts]); // Thêm posts vào dependencies

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Cộng đồng AI
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Chia sẻ và khám phá trải nghiệm AI cùng mọi người
                </p>
            </div>

            <SocialNav />

            <div className="max-w-2xl mx-auto px-4 pb-8">
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
                        <p className="text-lg font-medium">Chưa có bài đăng nào</p>
                        <p className="text-sm mt-2">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
                    </div>
                )}

                {!loading && hasMore && (
                    <div className="text-center text-gray-400 my-6">
                        <div className="animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <p className="mt-2">Kéo xuống để tải thêm</p>
                    </div>
                )}
            </div>
        </div>
    );
}
