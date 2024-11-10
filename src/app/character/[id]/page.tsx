'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { initializeFirebase } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, get, onValue, set } from 'firebase/database';
import { PostCard } from '@/components/social/PostCard';
import { PostSkeleton } from '@/components/social/PostSkeleton';
import { useFirebase } from '@/components/FirebaseConfig';
import SocialNav from '@/components/social/SocialNav';
import { usePostInteractions } from '@/hooks/usePostInteractions';

export default function CharacterPage() {
    const params = useParams();
    const characterId = !isNaN(Number(params.id)) ? Number(params.id) : params.id as string;
    const [loading, setLoading] = useState(true);
    const [characterName, setCharacterName] = useState<string>('');
    const { auth } = useFirebase();
    const currentUserId = auth?.currentUser?.uid;
    const [followCount, setFollowCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);

    const {
        posts,
        setPosts,
        handleLike,
        handleComment,
        handleEditComment,
        handleDeleteComment,
        toggleEditing
    } = usePostInteractions(auth);

    useEffect(() => {
        const fetchCharacterPosts = async () => {
            setLoading(true);
            try {
                const database = await initializeFirebase();
                const postsRef = ref(database, 'posts');
                const userPostsQuery = query(
                    postsRef,
                    orderByChild('characterId'),
                    equalTo(characterId)
                );

                const snapshot = await get(userPostsQuery);
                if (snapshot.exists()) {
                    const postsData = snapshot.val();
                    const postsArray = Object.entries(postsData).map(([id, data]: [string, any]) => ({
                        id,
                        ...data
                    }));

                    const sortedPosts = postsArray.sort((a, b) => b.timestamp - a.timestamp);
                    setPosts(sortedPosts);

                    if (sortedPosts.length > 0) {
                        setCharacterName(sortedPosts[0].characterName);
                    }
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error('Lỗi khi tải bài đăng:', error);
            } finally {
                setLoading(false);
            }
        };

        if (characterId !== undefined && characterId !== null) {
            fetchCharacterPosts();
        }
    }, [characterId]);

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
                        .filter(post => post.characterId === characterId) // Lọc theo characterId
                        .sort((a, b) => b.timestamp - a.timestamp);

                    setPosts(postsArray);

                    // Cập nhật characterName từ bài viết đầu tiên
                    if (postsArray.length > 0) {
                        setCharacterName(postsArray[0].characterName);
                    }
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
    }, [characterId]);

    // Thêm useEffect để lấy thông tin follow
    useEffect(() => {
        const fetchProfileData = async () => {
            if (characterId === undefined || characterId === null || !currentUserId) return;

            const database = await initializeFirebase();
            const profileRef = ref(database, `profiles/${characterId}`);

            const unsubscribe = onValue(profileRef, (snapshot) => {
                if (snapshot.exists()) {
                    const profileData = snapshot.val();
                    setFollowCount(profileData.followCount || 0);

                    // Kiểm tra followers một cách chặt chẽ hơn
                    const hasFollowers = profileData.followers && typeof profileData.followers === 'object';
                    const isUserFollowing = hasFollowers && profileData.followers[currentUserId] === true;
                    setIsFollowing(isUserFollowing);
                } else {
                    setFollowCount(0);
                    setIsFollowing(false);
                }
            });

            // Cleanup listener
            return () => unsubscribe();
        };

        fetchProfileData();
    }, [characterId, currentUserId]);

    // Thêm hàm xử lý follow/unfollow
    const handleFollowToggle = async () => {
        if (!currentUserId) return;

        const database = await initializeFirebase();
        const followerRef = ref(database, `profiles/${characterId}/followers/${currentUserId}`);
        const countRef = ref(database, `profiles/${characterId}/followCount`);

        try {
            if (isFollowing) {
                // Cập nhật state trước khi gửi request
                setIsFollowing(false);
                await get(countRef).then((snapshot) => {
                    const currentCount = snapshot.val() || 0;
                    return Promise.all([
                        set(followerRef, null),
                        set(countRef, Math.max(0, currentCount - 1))
                    ]);
                });
            } else {
                // Cập nhật state trước khi gửi request
                setIsFollowing(true);
                await get(countRef).then((snapshot) => {
                    const currentCount = snapshot.val() || 0;
                    return Promise.all([
                        set(followerRef, true),
                        set(countRef, currentCount + 1)
                    ]);
                });
            }
        } catch (error) {
            // Nếu có lỗi, khôi phục lại trạng thái ban đầu
            setIsFollowing(!isFollowing);
            console.error('Lỗi khi thay đổi trạng thái theo dõi:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {characterName || 'Trang cá nhân'}
                </h1>
                <p className="text-base sm:text-lg text-gray-200 mb-4">
                    Tất cả bài viết của {characterName || 'người dùng này'}
                </p>

                {/* Thêm phần hiển thị follow */}
                <div className="flex justify-center items-center gap-4">
                    <span className="text-white">{followCount} người theo dõi</span>
                    {currentUserId && (
                        <button
                            onClick={handleFollowToggle}
                            className={`px-4 py-2 rounded-full ${isFollowing
                                ? 'bg-gray-600 hover:bg-gray-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                                } text-white transition-colors`}
                        >
                            {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                        </button>
                    )}
                </div>
            </div>

            <SocialNav />

            <div className="max-w-2xl mx-auto px-4 pb-8">
                {loading ? (
                    <div className="space-y-4">
                        <PostSkeleton />
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
                            isSocialPage={true}
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-lg font-medium">Chưa có bài đăng nào</p>
                        <p className="text-sm mt-2">Người dùng này chưa đăng bài viết nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
