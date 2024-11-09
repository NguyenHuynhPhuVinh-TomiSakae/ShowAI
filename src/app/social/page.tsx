'use client';

import { useEffect, useState, useCallback } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { ref, query, orderByChild, get, limitToLast, endBefore, onValue, push, set, update } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import { Post } from '@/types/social';
import { PostCard } from '@/components/social/PostCard';
import { PostSkeleton } from '@/components/social/PostSkeleton';

const POSTS_PER_PAGE = 10;

export default function SocialPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [hashtags, setHashtags] = useState('');
    const { auth } = useFirebase();

    const isAuthenticated = auth?.currentUser != null;
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

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth?.currentUser || !newPost.trim()) return;

        try {
            const database = await initializeFirebase();
            const postsRef = ref(database, 'posts');
            const newPostRef = push(postsRef);

            const postData = {
                content: newPost.trim(),
                hashtags: hashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
                characterName: auth.currentUser?.displayName || 'Người dùng ẩn danh',
                timestamp: Date.now(),
                likes: 0,
                likedBy: {},
                userId: auth.currentUser?.uid
            };

            await set(newPostRef, postData);
            setNewPost('');
            setHashtags('');
        } catch (error) {
            console.error('Lỗi khi đăng bài:', error);
        }
    };

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

    const handleEditPost = async (postId: string, newContent: string, newHashtags: string) => {
        if (!auth?.currentUser) return;

        try {
            const database = await initializeFirebase();
            const postRef = ref(database, `posts/${postId}`);

            const updates = {
                content: newContent.trim(),
                hashtags: newHashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
            };

            await update(postRef, updates);

            // Cập nhật UI
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        ...updates,
                        isEditing: false
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Lỗi khi cập nhật bài viết:', error);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!auth?.currentUser) return;

        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            try {
                const database = await initializeFirebase();
                const postRef = ref(database, `posts/${postId}`);
                await set(postRef, null);

                // Cập nhật UI
                setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
            } catch (error) {
                console.error('Lỗi khi xóa bài viết:', error);
            }
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
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Cộng đồng AI
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Chia sẻ và khám phá trải nghiệm AI cùng mọi người
                </p>
            </div>

            <div className="max-w-2xl mx-auto px-4 pb-8">
                {isAuthenticated && (
                    <form onSubmit={handleCreatePost} className="bg-[#1E293B] rounded-xl p-4 mb-6 border border-[#2A3284]">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4ECCA3]" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-2 0c0 3.314-2.686 6-6 6s-6-2.686-6-6 2.686-6 6-6 6 2.686 6 6z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[#4ECCA3] font-medium">Chia sẻ trải nghiệm</span>
                            </div>
                            <textarea
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm AI của bạn..."
                                className="w-full bg-[#0F172A] text-white rounded-lg p-3 min-h-[100px] resize-none 
                                          focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                rows={4}
                            />
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4ECCA3]" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[#4ECCA3] font-medium">Hashtags</span>
                            </div>
                            <input
                                type="text"
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                                placeholder="Thêm hashtag (phân cách bằng dấu phẩy)"
                                className="w-full bg-[#0F172A] text-white rounded-lg p-3
                                          focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!newPost.trim()}
                            className="rounded-xl h-10 w-full sm:w-auto px-6 bg-[#3E52E8] hover:bg-[#4B5EFF] 
                                     text-white flex items-center justify-center gap-2 disabled:opacity-50
                                     disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            Đăng bài
                        </button>
                    </form>
                )}

                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onComment={handleComment}
                        onLike={handleLike}
                        onEdit={handleEditPost}
                        onDelete={handleDeletePost}
                        currentUserId={currentUserId}
                        toggleEditing={toggleEditing}
                        onEditComment={handleEditComment}
                        onDeleteComment={handleDeleteComment}
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
