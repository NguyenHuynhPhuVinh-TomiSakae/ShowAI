import { initializeFirebase } from '@/lib/firebase';
import { ref, push, set, update } from 'firebase/database';

export function usePostActions(currentUserId: string | undefined, currentUserName: string) {
    const createPost = async (content: string, hashtags: string) => {
        if (!currentUserId || !content.trim()) return null;

        try {
            const database = await initializeFirebase();
            const postsRef = ref(database, 'posts');
            const newPostRef = push(postsRef);

            const postData = {
                content: content.trim(),
                hashtags: hashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
                characterName: currentUserName,
                characterId: currentUserId,
                timestamp: Date.now(),
                likes: 0,
                likedBy: {},
                userId: currentUserId
            };

            await set(newPostRef, postData);
            return postData;
        } catch (error) {
            console.error('Lỗi khi đăng bài:', error);
            return null;
        }
    };

    const updatePost = async (postId: string, newContent: string, newHashtags: string): Promise<void> => {
        if (!currentUserId) return;

        try {
            const database = await initializeFirebase();
            const postRef = ref(database, `posts/${postId}`);

            const updates = {
                content: newContent.trim(),
                hashtags: newHashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
            };

            await update(postRef, updates);
        } catch (error) {
            console.error('Lỗi khi cập nhật bài viết:', error);
        }
    };

    const deletePost = async (postId: string): Promise<void> => {
        if (!currentUserId) return;

        try {
            const database = await initializeFirebase();
            const postRef = ref(database, `posts/${postId}`);
            await set(postRef, null);
        } catch (error) {
            console.error('Lỗi khi xóa bài viết:', error);
        }
    };

    return {
        createPost,
        updatePost,
        deletePost
    };
}
