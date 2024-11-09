'use client';

import { useState, useEffect } from 'react';
import { initializeFirebase } from '@/lib/firebase';
import { ref, query, orderByChild, get } from 'firebase/database';
import { useFirebase } from '@/components/FirebaseConfig';
import { Post } from '@/types/social';
import { PostCard } from '@/components/social/PostCard';
import { PostSkeleton } from '@/components/social/PostSkeleton';
import SocialNav from '@/components/social/SocialNav';
import { usePostInteractions } from '@/hooks/usePostInteractions';

export default function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const { auth } = useFirebase();
    const currentUserId = auth?.currentUser?.uid;

    const {
        handleLike,
        handleComment,
        handleEditComment,
        handleDeleteComment,
        toggleEditing,
    } = usePostInteractions(auth);

    const searchPosts = async (term: string) => {
        if (!term.trim()) {
            setPosts([]);
            return;
        }

        setLoading(true);
        try {
            const database = await initializeFirebase();
            const postsRef = ref(database, 'posts');
            const postsQuery = query(postsRef, orderByChild('timestamp'));

            const snapshot = await get(postsQuery);
            if (snapshot.exists()) {
                const postsData = snapshot.val();
                const postsArray = Object.entries(postsData)
                    .map(([id, data]: [string, any]) => ({
                        id,
                        ...data
                    }))
                    .filter(post =>
                        post.content.toLowerCase().includes(term.toLowerCase()) ||
                        post.characterName.toLowerCase().includes(term.toLowerCase())
                    )
                    .sort((a, b) => b.timestamp - a.timestamp);

                setPosts(postsArray);
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            searchPosts(searchTerm);
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Tìm kiếm bài viết
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Tìm kiếm bài viết và người dùng trong cộng đồng
                </p>
            </div>

            <SocialNav />

            <div className="max-w-2xl mx-auto px-4 pb-8">
                <div className="mb-6 mt-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết hoặc tên người dùng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-[#1E293B] border border-[#2A3284] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

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
                            isSocialPage={false}
                        />
                    ))
                ) : searchTerm ? (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 mt-4">
                        <p className="text-lg">Không tìm thấy kết quả nào</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
