'use client';

import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, onValue } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import { Post } from '@/types/social';
import { PostCard } from '@/components/social/PostCard';
import { PostSkeleton } from '@/components/social/PostSkeleton';
import SocialNav from '@/components/social/SocialNav';
import { usePostActions } from '@/hooks/usePostActions';
import { usePostInteractions } from '@/hooks/usePostInteractions';

export default function AccountPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { auth } = useFirebase();
    const currentUserId = auth?.currentUser?.uid;
    const currentUserName = auth?.currentUser?.displayName || 'Người dùng ẩn danh';
    const [newPost, setNewPost] = useState('');
    const [hashtags, setHashtags] = useState('');

    // Sử dụng các hook mới
    const { createPost, updatePost, deletePost } = usePostActions(currentUserId, currentUserName);
    const {
        handleLike,
        handleComment,
        handleEditComment,
        handleDeleteComment,
        toggleEditing,
        isEditing
    } = usePostInteractions(auth);

    // Thêm realtime updates
    useEffect(() => {
        const setupRealtimeUpdates = async () => {
            if (!currentUserId) return;

            const database = await initializeFirebase();
            const postsRef = ref(database, 'posts');
            const userPostsQuery = query(
                postsRef,
                orderByChild('userId'),
                equalTo(currentUserId)
            );

            return onValue(userPostsQuery, (snapshot) => {
                if (snapshot.exists()) {
                    const postsData = snapshot.val();
                    const postsArray = Object.entries(postsData)
                        .map(([id, data]: [string, any]) => ({
                            id,
                            ...data
                        }))
                        .sort((a, b) => b.timestamp - a.timestamp);
                    setPosts(postsArray);
                } else {
                    setPosts([]);
                }
                setLoading(false);
            });
        };

        const unsubscribe = setupRealtimeUpdates();
        return () => {
            if (unsubscribe) {
                unsubscribe.then(unsubFn => unsubFn && unsubFn());
            }
        };
    }, [currentUserId]);

    // Cập nhật hàm handleCreatePost
    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        const result = await createPost(newPost, hashtags);
        if (result) {
            setNewPost('');
            setHashtags('');
        }
    };

    // Cập nhật hàm handleEditPost
    const handleEditPost = async (postId: string, newContent: string, newHashtags: string) => {
        await updatePost(postId, newContent, newHashtags);
        toggleEditing(postId, false);
    };

    // Cập nhật hàm handleDeletePost
    const handleDeletePost = async (postId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            await deletePost(postId);
        }
    };

    if (!currentUserId) {
        return (
            <div className="min-h-screen bg-[#0F172A]">
                <SocialNav />
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                        <p className="text-lg font-medium">Vui lòng đăng nhập để xem trang cá nhân</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {currentUserName}
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Quản lý bài đăng của bạn
                </p>
            </div>

            <SocialNav />

            <div className="max-w-2xl mx-auto px-4 pb-8">
                {/* Thêm form đăng bài */}
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
                            className="w-full bg-[#0F172A] text-white rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
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
                            className="w-full bg-[#0F172A] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!newPost.trim()}
                        className="rounded-xl h-10 w-full sm:w-auto px-6 bg-[#3E52E8] hover:bg-[#4B5EFF] text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Đăng bài
                    </button>
                </form>

                {loading ? (
                    <div className="space-y-4">
                        <PostSkeleton />
                        <PostSkeleton />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-lg font-medium">Bạn chưa có bài đăng nào</p>
                        <p className="text-sm mt-2">Hãy chia sẻ trải nghiệm đầu tiên của bạn!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={{
                                ...post,
                                isEditing: isEditing(post.id)
                            }}
                            onComment={handleComment}
                            onLike={handleLike}
                            onEdit={handleEditPost}
                            onDelete={handleDeletePost}
                            currentUserId={currentUserId}
                            toggleEditing={toggleEditing}
                            onEditComment={handleEditComment}
                            onDeleteComment={handleDeleteComment}
                            isSocialPage={false}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
