'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { initializeFirebase } from '@/lib/firebase';
import { ref, get, onValue, update, push, set } from 'firebase/database';
import { Post } from '@/types/social';
import { PostCard } from '@/components/social/PostCard';
import { PostSkeleton } from '@/components/social/PostSkeleton';
import { useFirebase } from '@/components/FirebaseConfig';
import SocialNav from '@/components/social/SocialNav';

export default function HashtagPage() {
    const params = useParams();
    const tag = decodeURIComponent(params.tag as string);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { auth } = useFirebase();
    const currentUserId = auth?.currentUser?.uid;

    useEffect(() => {
        const fetchHashtagPosts = async () => {
            setLoading(true);
            try {
                const database = await initializeFirebase();
                const postsRef = ref(database, 'posts');
                const snapshot = await get(postsRef);

                if (snapshot.exists()) {
                    const postsData = snapshot.val();
                    const postsArray = Object.entries(postsData)
                        .map(([id, data]: [string, any]) => ({
                            id,
                            ...data
                        }))
                        .filter(post => post.hashtags?.includes(tag))
                        .sort((a, b) => b.timestamp - a.timestamp);

                    setPosts(postsArray);
                }
            } catch (error) {
                console.error('Lỗi khi tải bài đăng:', error);
            } finally {
                setLoading(false);
            }
        };

        if (tag) {
            fetchHashtagPosts();
        }
    }, [tag]);

    // Thêm realtime updates cho bài viết mới
    useEffect(() => {
        const setupRealtimeUpdates = async () => {
            const database = await initializeFirebase();
            const postsRef = ref(database, 'posts');

            // Lắng nghe thay đổi trong realtime
            return onValue(postsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const postsData = snapshot.val();
                    const postsArray = Object.entries(postsData)
                        .map(([id, data]: [string, any]) => ({
                            id,
                            ...data
                        }))
                        .filter(post => post.hashtags?.includes(tag))
                        .sort((a, b) => b.timestamp - a.timestamp);

                    setPosts(postsArray);
                } else {
                    setPosts([]);
                }
            });
        };

        const unsubscribe = setupRealtimeUpdates();

        // Cleanup listener khi component unmount
        return () => {
            unsubscribe.then(unsubFn => unsubFn());
        };
    }, [tag]);

    const handleLike = async (postId: string, currentLikes: number, likedBy: Record<string, boolean> = {}) => {
        if (!auth?.currentUser) return;

        try {
            const database = await initializeFirebase();
            const postRef = ref(database, `posts/${postId}`);
            const userId = auth.currentUser?.uid;
            const isLiked = likedBy[userId || ''];

            await update(postRef, {
                likes: isLiked ? currentLikes - 1 : currentLikes + 1,
                [`likedBy/${userId}`]: !isLiked
            });

            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        likes: isLiked ? currentLikes - 1 : currentLikes + 1,
                        likedBy: {
                            ...post.likedBy,
                            [userId || '']: !isLiked
                        }
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Lỗi khi thích bài viết:', error);
        }
    };

    const handleComment = async (postId: string, comment: string) => {
        if (!auth?.currentUser || !comment.trim()) return;

        try {
            const database = await initializeFirebase();
            const commentRef = push(ref(database, `posts/${postId}/comments`));
            const commentId = commentRef.key;
            const newComment = {
                content: comment.trim(),
                characterName: auth.currentUser?.displayName || 'Người dùng ẩn danh',
                characterId: auth.currentUser?.uid,
                timestamp: Date.now(),
                userId: auth.currentUser?.uid
            };

            await set(commentRef, newComment);

            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: {
                            ...(post.comments || {}),
                            [commentId || '']: newComment
                        }
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Lỗi khi bình luận:', error);
        }
    };

    const toggleEditing = (postId: string, isEditing: boolean) => {
        setPosts(prev => prev.map(p =>
            p.id === postId ? { ...p, isEditing } : p
        ));
    };

    const handleEditComment = async (postId: string, commentId: string, newContent: string) => {
        if (!auth?.currentUser || !newContent.trim()) return;

        try {
            const database = await initializeFirebase();
            const commentRef = ref(database, `posts/${postId}/comments/${commentId}`);

            await update(commentRef, {
                content: newContent.trim()
            });

            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId && post.comments) {
                    return {
                        ...post,
                        comments: {
                            ...post.comments,
                            [commentId]: {
                                ...post.comments[commentId],
                                content: newContent.trim()
                            }
                        }
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Lỗi khi cập nhật bình luận:', error);
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        if (!auth?.currentUser) return;

        try {
            const database = await initializeFirebase();
            const commentRef = ref(database, `posts/${postId}/comments/${commentId}`);
            await set(commentRef, null);

            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId && post.comments) {
                    const newComments = { ...post.comments };
                    delete newComments[commentId];

                    return {
                        ...post,
                        comments: newComments
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Lỗi khi xóa bình luận:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {tag}
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Tất cả bài viết với hashtag {tag}
                </p>
            </div>

            <SocialNav />

            <div className="max-w-2xl mx-auto px-4 pb-8">
                {loading ? (
                    <div className="space-y-4">
                        <PostSkeleton />
                        <PostSkeleton />
                    </div>
                ) : posts.length > 0 ? (
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
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-lg font-medium">Chưa có bài đăng nào</p>
                        <p className="text-sm mt-2">Chưa có bài viết nào với hashtag này.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
