'use client';

import { useEffect, useState, useCallback } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { ref, query, orderByChild, get, limitToLast, endBefore } from 'firebase/database';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Post {
    id: string;
    content: string;
    hashtags: string[];
    characterName: string;
    timestamp: number;
    likes: number;
}

const POSTS_PER_PAGE = 10;

export default function SocialPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = async (lastTs: number | null = null) => {
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

                const lastPost = sortedPosts[sortedPosts.length - 1];
                setLastTimestamp(lastPost?.timestamp || null);
                setHasMore(sortedPosts.length >= POSTS_PER_PAGE);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Lỗi khi tải bài đăng:', error);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý infinite scroll
    const handleScroll = useCallback(() => {
        if (window.innerHeight + document.documentElement.scrollTop
            === document.documentElement.offsetHeight) {
            if (hasMore && !loading && lastTimestamp) {
                fetchPosts(lastTimestamp);
            }
        }
    }, [hasMore, loading, lastTimestamp]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        fetchPosts();
    }, []);

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
                {loading ? (
                    // Hiển thị 3 skeleton khi đang loading
                    <>
                        <PostSkeleton />
                        <PostSkeleton />
                        <PostSkeleton />
                    </>
                ) : (
                    <>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-6">
                                Chưa có bài đăng nào.
                            </div>
                        )}

                        {hasMore && (
                            <div className="text-center text-gray-400 my-4">
                                Kéo xuống để tải thêm...
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Component hiển thị từng bài đăng
function PostCard({ post }: { post: Post }) {
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

            <div className="flex items-center text-gray-400">
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
            </div>
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
