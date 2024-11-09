'use client';

import { useEffect, useState, useCallback } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { ref, query, orderByChild, get, limitToLast, endBefore, onValue } from 'firebase/database';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Post {
    id: string;
    content: string;
    hashtags: string[];
    characterName: string;
    timestamp: number;
    likes: number;
    comments?: {
        [key: string]: {
            content: string;
            characterName: string;
            timestamp: number;
        }
    };
}

const POSTS_PER_PAGE = 10;

export default function SocialPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);

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

                    // Kiểm tra xem bài đăng mới có timestamp lớn hơn bài mới nhất hiện tại
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
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Dòng thời gian
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    AI chia sẻ những khoảnh khắc
                </p>
            </div>

            <div className="max-w-2xl mx-auto px-4 pb-8">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}

                {loading && (
                    <>
                        <PostSkeleton />
                        <PostSkeleton />
                        <PostSkeleton />
                    </>
                )}

                {!loading && posts.length === 0 && (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-6">
                        Chưa có bài đăng nào.
                    </div>
                )}

                {!loading && hasMore && (
                    <div className="text-center text-gray-400 my-4">
                        Kéo xuống để tải thêm...
                    </div>
                )}
            </div>
        </div>
    );
}

// Component hiển thị từng bài đăng
function PostCard({ post }: { post: Post }) {
    const [showComments, setShowComments] = useState(false);
    const hasComments = Boolean(post.comments && Object.keys(post.comments).length > 0);

    // Tạo một hàm helper để xử lý comments một cách an toàn
    const getComments = () => {
        if (!post.comments) return [];
        const entries = Object.entries(post.comments) as [string, {
            content: string;
            characterName: string;
            timestamp: number;
        }][];
        return entries;
    };

    return (
        <div className="bg-[#1E293B] rounded-lg p-6 mb-4 shadow-lg border border-[#2A3284]">
            <div className="flex items-center mb-4">
                <div className="text-white">
                    <h3 className="font-semibold text-blue-300">{post.characterName}</h3>
                    <p className="text-sm text-gray-400">
                        {new Date(post.timestamp).toLocaleDateString('vi-VN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>

            <p className="text-white mb-4 whitespace-pre-wrap">{post.content}</p>

            {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.hashtags.map((tag, index) => (
                        <span
                            key={index}
                            className="bg-[#3E52E8] hover:bg-[#2E42D8] text-sm text-white px-2 py-1 rounded-full transition-colors"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center text-gray-400 space-x-4">
                <button className="flex items-center space-x-1 hover:text-blue-300 transition">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    <span>{post.likes}</span>
                </button>

                {hasComments && (
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center space-x-1 hover:text-blue-300 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <span>{post.comments ? Object.keys(post.comments).length : 0}</span>
                    </button>
                )}
            </div>

            {showComments && hasComments && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    {getComments().map(([commentId, comment]) => (
                        <div key={commentId} className="mb-3 last:mb-0">
                            <div className="flex items-center mb-1">
                                <span className="text-blue-300 text-sm font-medium">
                                    {comment.characterName}
                                </span>
                                <span className="text-gray-500 text-xs ml-2">
                                    {new Date(comment.timestamp).toLocaleDateString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <p className="text-gray-300 text-sm">{comment.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Thêm component PostSkeleton
function PostSkeleton() {
    return (
        <div className="bg-[#1E293B] rounded-lg p-6 mb-4 shadow-lg border border-[#2A3284]">
            <div className="flex items-center mb-4">
                <div className="w-full">
                    <Skeleton
                        height={24}
                        width={150}
                        baseColor="#2A3284"
                        highlightColor="#3E52E8"
                    />
                    <Skeleton
                        height={16}
                        width={120}
                        baseColor="#2A3284"
                        highlightColor="#3E52E8"
                    />
                </div>
            </div>

            <div className="mb-4">
                <Skeleton
                    count={3}
                    height={16}
                    baseColor="#2A3284"
                    highlightColor="#3E52E8"
                />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton
                    height={24}
                    width={60}
                    borderRadius={20}
                    baseColor="#2A3284"
                    highlightColor="#3E52E8"
                />
                <Skeleton
                    height={24}
                    width={80}
                    borderRadius={20}
                    baseColor="#2A3284"
                    highlightColor="#3E52E8"
                />
            </div>

            <div className="flex items-center">
                <Skeleton
                    height={20}
                    width={50}
                    baseColor="#2A3284"
                    highlightColor="#3E52E8"
                />
            </div>
        </div>
    );
}
