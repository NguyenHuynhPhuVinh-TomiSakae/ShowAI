import { useState } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { ref, push, set, update } from 'firebase/database';
import { Post } from '@/types/social';

export function usePostInteractions(auth: any) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [editingStates, setEditingStates] = useState<Record<string, boolean>>({});

    const handleLike = async (postId: string, currentLikes: number, likedBy: Record<string, boolean> = {}): Promise<void> => {
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

    const handleComment = async (postId: string, comment: string): Promise<void> => {
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
                            [commentId as string]: newComment
                        }
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Lỗi khi bình luận:', error);
        }
    };

    const handleEditComment = async (postId: string, commentId: string, newContent: string): Promise<void> => {
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

    const handleDeleteComment = async (postId: string, commentId: string): Promise<void> => {
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

    const toggleEditing = (postId: string, isEditing: boolean) => {
        setEditingStates(prev => ({
            ...prev,
            [postId]: isEditing
        }));
    };

    const isEditing = (postId: string) => {
        return editingStates[postId] || false;
    };

    return {
        posts,
        setPosts,
        handleLike,
        handleComment,
        handleEditComment,
        handleDeleteComment,
        toggleEditing,
        isEditing,
        editingStates
    };
}
