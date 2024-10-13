/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/FirebaseConfig';
import { FaUser, FaHeart, FaSpinner, FaEdit } from 'react-icons/fa';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import WebsiteList from '@/components/WebsiteList';
import { motion, AnimatePresence } from 'framer-motion';

const AccountPage = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [user, setUser] = useState<{ displayName: string | null, uid: string | null } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [heartedWebsites, setHeartedWebsites] = useState<any[]>([]);
    const [isHeartedLoading, setIsHeartedLoading] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState('');
    const { auth, db } = useFirebase();
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth?.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser({
                    displayName: currentUser.displayName,
                    uid: currentUser.uid
                });
                setNewDisplayName(currentUser.displayName || '');
                fetchUserData(currentUser.uid);
                fetchHeartedWebsites(currentUser.uid);
            } else {
                router.push('/login');
            }
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth, router]);

    const fetchUserData = async (userId: string) => {
        setIsLoading(true);
        try {
            if (db) {
                const userDoc = doc(db, 'users', userId);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setUser(prevUser => ({
                        ...prevUser!,
                        displayName: userData.displayName || null,
                        uid: prevUser?.uid || null
                    }));
                    setNewDisplayName(userData.displayName || '');
                }
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setIsLoading(false);
        }
    };

    const fetchHeartedWebsites = async (userId: string) => {
        setIsHeartedLoading(true);
        try {
            if (db) {
                const userDoc = doc(db, 'users', userId);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const heartedIds = userSnapshot.data().heartedWebsites || [];
                    if (heartedIds.length === 0) {
                        setHeartedWebsites([]);
                        setIsHeartedLoading(false);
                        return;
                    }

                    const heartIdsQuery = heartedIds.join(',');
                    const response = await fetch(`https://vercel-api-five-nu.vercel.app/api/showai?list=${heartIdsQuery}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.data) {
                            setHeartedWebsites(data.data);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching hearted websites:', error);
        } finally {
            setIsHeartedLoading(false);
        }
    };

    const handleTagClick = (tag: string) => {
        router.push(`/search?tag=${encodeURIComponent(tag)}`);
    };

    const handleEditName = () => {
        setIsEditingName(true);
    };

    const handleSaveName = async () => {
        if (user && user.uid && db) {
            try {
                const userDoc = doc(db, 'users', user.uid);
                await updateDoc(userDoc, { displayName: newDisplayName });
                setUser({ ...user, displayName: newDisplayName });
                setIsEditingName(false);
            } catch (error) {
                console.error('Error updating display name:', error);
            }
        }
    };

    if (isLoading || isHeartedLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0F172A]">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    const tabVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#0F172A] text-white min-h-screen pb-4"
        >
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Tài khoản của bạn</h1>
            </div>
            <div className="container mx-auto px-4">
                <div className="flex mb-6">
                    <button
                        className={`mr-4 py-2 px-4 rounded-t-lg ${activeTab === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setActiveTab('info')}
                    >
                        <FaUser className="inline-block mr-2" /> Thông tin
                    </button>
                    <button
                        className={`py-2 px-4 rounded-t-lg ${activeTab === 'favorites' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        <FaHeart className="inline-block mr-2" /> Yêu thích
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'info' && user && (
                        <motion.div
                            key="info"
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.5 }}
                            className="bg-gray-800 p-6 rounded-lg shadow-md"
                        >
                            <h2 className="text-xl font-semibold mb-4 text-blue-300">Thông tin cá nhân</h2>
                            <div className="flex items-center mb-4">
                                <strong className="mr-2">Tên người dùng:</strong>
                                {isEditingName ? (
                                    <input
                                        type="text"
                                        value={newDisplayName}
                                        onChange={(e) => setNewDisplayName(e.target.value)}
                                        className="bg-gray-700 text-white px-2 py-1 rounded"
                                    />
                                ) : (
                                    <span>{user.displayName || 'Chưa cập nhật'}</span>
                                )}
                                {isEditingName ? (
                                    <button
                                        onClick={handleSaveName}
                                        className="ml-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                    >
                                        Lưu
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEditName}
                                        className="ml-2 text-blue-300 hover:text-blue-400"
                                    >
                                        <FaEdit />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'favorites' && (
                        <motion.div
                            key="favorites"
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.5 }}
                            className="bg-gray-800 p-6 rounded-lg shadow-md"
                        >
                            <h2 className="text-xl font-semibold mb-4 text-blue-300">Trang web yêu thích</h2>
                            {heartedWebsites.length > 0 ? (
                                <WebsiteList
                                    websites={heartedWebsites}
                                    onTagClick={handleTagClick}
                                    isSidebar={false}
                                    isRandom={true}
                                />
                            ) : (
                                <p>Bạn chưa có trang web yêu thích nào.</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default AccountPage;
