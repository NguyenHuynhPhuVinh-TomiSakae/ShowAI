'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initializeFirebase } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';
import ChatNav from '@/components/chat/ChatNav';
import { useFirebase } from '@/components/FirebaseConfig';

interface Profile {
    id: string;
    name: string;
    followCount: number;
    friends?: { [key: string]: boolean };
}

export default function SearchPage() {
    const { auth } = useFirebase();
    const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
    const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchProfiles = async () => {
        if (!auth) return;

        try {
            const database = await initializeFirebase();
            const profilesRef = ref(database, 'profiles');
            const snapshot = await get(profilesRef);

            if (snapshot.exists()) {
                const profilesData = snapshot.val();
                const profilesList = Object.entries(profilesData).map(([id, data]: [string, any]) => ({
                    id,
                    name: data.name,
                    followCount: data.followCount || 0,
                    friends: data.friends || {}
                }));

                const sortedProfiles = profilesList.sort((a, b) => b.followCount - a.followCount);
                setAllProfiles(sortedProfiles);
                setFilteredProfiles(sortedProfiles);
            }
        } catch (error) {
            console.error('Lỗi khi tải profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, [auth]);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchTerm.trim()) {
                const filtered = allProfiles.filter(profile =>
                    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredProfiles(filtered);
            } else {
                setFilteredProfiles(allProfiles);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm, allProfiles]);

    const handleProfileClick = (profileId: string) => {
        router.push(`/character/${profileId}`);
    };

    const handleAddFriend = async (profileId: string, event: React.MouseEvent) => {
        event.stopPropagation();

        if (!auth?.currentUser) {
            alert('Vui lòng đăng nhập để kết bạn');
            return;
        }

        const currentUserId = auth.currentUser.uid;

        try {
            const database = await initializeFirebase();

            // Chỉ update friends trong profile của người được kết bạn
            const updates = {
                [`profiles/${profileId}/friends/${currentUserId}`]: true
            };

            // Update profile
            await update(ref(database), updates);

            await fetchProfiles();
        } catch (error) {
            console.error('Lỗi khi thêm bạn:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Tìm kiếm AI
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Khám phá và kết nối với AI mới
                </p>
            </div>

            <ChatNav />

            <div className="max-w-2xl mx-auto px-4 pb-8">
                <div className="mb-6 mt-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm AI hoặc nhập ID để xem trang cá nhân..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-[#1E293B] border border-[#2A3284] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {loading ? (
                    <div className="space-y-4">
                        <div className="animate-pulse bg-[#1E293B] p-4 rounded-lg border border-[#2A3284]">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-[#2A3284]"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-[#2A3284] rounded w-1/4 mb-2"></div>
                                    <div className="h-3 bg-[#2A3284] rounded w-1/6"></div>
                                </div>
                            </div>
                        </div>
                        <div className="animate-pulse bg-[#1E293B] p-4 rounded-lg border border-[#2A3284]">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-[#2A3284]"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-[#2A3284] rounded w-1/3 mb-2"></div>
                                    <div className="h-3 bg-[#2A3284] rounded w-1/5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : filteredProfiles.length === 0 ? (
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8">
                        <p className="text-lg">Không tìm thấy kết quả nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProfiles.map((profile) => {
                            const isFriend = auth?.currentUser ? profile.friends?.[auth.currentUser.uid] === true : false;

                            return (
                                <div
                                    key={profile.id}
                                    onClick={() => handleProfileClick(profile.id)}
                                    className="bg-[#1E293B] p-4 rounded-lg border border-[#2A3284] hover:border-blue-500 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#2A3284] text-white text-xl font-bold">
                                                {profile.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{profile.name}</h3>
                                                <p className="text-sm text-gray-400">
                                                    {profile.followCount} người theo dõi
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleAddFriend(profile.id, e)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${isFriend
                                                ? 'bg-gray-600 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                } text-white`}
                                            disabled={isFriend}
                                        >
                                            {isFriend ? 'Đã kết bạn' : 'Kết bạn'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
