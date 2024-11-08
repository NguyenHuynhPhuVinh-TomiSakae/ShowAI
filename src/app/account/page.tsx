'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/FirebaseConfig';
import { FaUser, FaHeart, FaPlus, FaCube, FaStar, FaHistory } from 'react-icons/fa';
import { doc, getDoc, updateDoc, deleteDoc, collection, where, query, getDocs } from 'firebase/firestore';
import { signOut, deleteUser } from 'firebase/auth';
import WebsiteList from '@/components/WebsiteList';
import { motion, AnimatePresence } from 'framer-motion';
import DisplayNameEditor from '@/components/DisplayNameEditor';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import ModalPortal from '@/components/ModalPortal';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import type { MotionProps } from 'framer-motion';
import PostSubmission from '@/components/PostSubmission';
import { useMediaQuery } from 'react-responsive';

type ModalBackdropProps = MotionProps & {
    className?: string;
};

const AccountPage = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [user, setUser] = useState<{ displayName: string | null, uid: string | null } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [heartedWebsites, setHeartedWebsites] = useState<any[]>([]);
    const [isHeartedLoading, setIsHeartedLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { auth, db } = useFirebase();
    const router = useRouter();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [, setReceiveUpdates] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [is3DEnabled, setIs3DEnabled] = useState(false);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [isVIP, setIsVIP] = useState(false);
    const [showVIPModal, setShowVIPModal] = useState(false);
    const [vipCode, setVipCode] = useState('');
    const [userVIPCode, setUserVIPCode] = useState<string>('');
    const [vipCodeUsed, setVipCodeUsed] = useState(false);
    const [historyWebsites, setHistoryWebsites] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth?.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser({
                    displayName: currentUser.displayName,
                    uid: currentUser.uid
                });
                setIsGoogleUser(currentUser.providerData[0]?.providerId === 'google.com');
                fetchUserData(currentUser.uid);
                fetchHeartedWebsites(currentUser.uid);
                checkAdminStatus(currentUser.uid);
                if (currentUser.providerData[0]?.providerId === 'google.com') {
                    setEmail(currentUser.email || '');
                }
                fetchUserEmail(currentUser.uid);
                const storedReceiveUpdates = localStorage.getItem('receiveUpdates');
                setReceiveUpdates(storedReceiveUpdates === 'true');
                fetchUserPreferences(currentUser.uid);
                checkEmailSubscription(currentUser.uid);
                fetchHistoryWebsites(currentUser.uid);
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

    useEffect(() => {
        // Thêm vào useEffect hiện có
        const check3DMode = () => {
            const mode = localStorage.getItem('3d-mode');
            setIs3DEnabled(mode === 'enabled');
        };
        check3DMode();
        // ... rest of existing useEffect code ...
    }, []);

    useEffect(() => {
        if (user?.uid && db) {
            checkVIPStatus(user.uid);
        }
    }, [user, db]);

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
                }
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu người dùng:', error);
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
                    const response = await fetch(`/api/showai?list=${heartIdsQuery}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.data) {
                            setHeartedWebsites(data.data);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách trang web yêu thích:', error);
        } finally {
            setIsHeartedLoading(false);
        }
    };

    const handleTagClick = (tag: string) => {
        router.push(`/search?tag=${encodeURIComponent(tag)}`);
    };

    const handleSaveName = async (newName: string) => {
        if (user && user.uid && db) {
            try {
                const userDoc = doc(db, 'users', user.uid);
                await updateDoc(userDoc, { displayName: newName });
                setUser({ ...user, displayName: newName });
            } catch (error) {
                console.error('Lỗi khi cập nhật tên hiển thị:', error);
                setErrorMessage('Có lỗi xảy ra khi cập nhật tên hiển thị. Vui lòng thử lại sau.');
            }
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmNewPassword) {
            setErrorMessage('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }

        if (auth && auth.currentUser) {
            try {
                const credential = EmailAuthProvider.credential(
                    auth.currentUser.email!,
                    oldPassword
                );
                await reauthenticateWithCredential(auth.currentUser, credential);
                await updatePassword(auth.currentUser, newPassword);

                setSuccessMessage('Mật khẩu đã được cập nhật thành công.');
                setErrorMessage(null);
                setShowPasswordModal(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } catch (error) {
                console.error('Lỗi khi đặt lại mật khẩu:', error);
                setErrorMessage('Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng kiểm tra mật khẩu cũ và thử lại.');
                setSuccessMessage(null);
            }
        }
    };

    const handleDeleteAccount = async () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteAccount = async () => {
        if (user && user.uid && auth && auth.currentUser && db) {
            try {
                await deleteDoc(doc(db, 'users', user.uid));
                await deleteUser(auth.currentUser);
                router.push('/');
            } catch (error) {
                console.error('Lỗi khi xóa tài khoản:', error);
                setErrorMessage('Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại sau.');
            }
        }
        setShowDeleteModal(false);
    };

    const handleSignOut = async () => {
        if (auth) {
            try {
                await signOut(auth);
                router.push('/');
            } catch (error) {
                console.error('Lỗi khi đăng xuất:', error);
                setErrorMessage('Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại sau.');
            }
        }
    };

    const checkAdminStatus = async (userId: string) => {
        try {
            if (db) {
                const userDoc = doc(db, 'users', userId);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setIsAdmin(userData.admin === 1);
                }
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái admin:', error);
        }
    };

    const handleAdminAccess = () => {
        router.push('/admin');
    };

    const fetchUserPreferences = async (userId: string) => {
        try {
            if (db) {
                const userDoc = doc(db, 'users', userId);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setReceiveUpdates(userData.receiveUpdates || false);
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy tùy chọn người dùng:', error);
        }
    };

    const handleToggleUpdates = async () => {
        const newSubscriptionState = !isSubscribed;

        if (newSubscriptionState) {
            if (isGoogleUser) {
                await saveUserEmail(email);
            } else {
                setEmail('');
                setShowEmailModal(true);
                return; // Không cập nhật state ngay lập tức nếu cần nhập email
            }
        } else {
            await deleteUserEmail();
        }

        setIsSubscribed(newSubscriptionState);  // Cập nhật UI sau khi xử lý xong
    };

    const saveUserEmail = async (emailToSave: string) => {
        try {
            const response = await fetch('/api/userEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user?.uid, email: emailToSave }),
            });

            if (response.ok) {
                setSuccessMessage('Đã đăng ký nhận thông tin mới.');
            } else {
                setErrorMessage('Có lỗi xảy ra khi lưu email.');
                setIsSubscribed(false);  // Revert UI if API call fails
            }
        } catch (error) {
            console.error('Lỗi khi lưu email:', error);
            setErrorMessage('Có lỗi xảy ra khi lưu email.');
            setIsSubscribed(false);  // Revert UI if API call fails
        }
    };

    const deleteUserEmail = async () => {
        try {
            const response = await fetch(`/api/userEmail?userId=${user?.uid}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                if (!isGoogleUser) {
                    setEmail('');
                }
                setSuccessMessage('Đã hủy đăng ký nhận thông tin mới.');
            } else {
                setErrorMessage('Có lỗi xảy ra khi xóa email.');
                setIsSubscribed(true);  // Revert UI if API call fails
            }
        } catch (error) {
            console.error('Lỗi khi xóa email:', error);
            setErrorMessage('Có lỗi xảy ra khi xóa email.');
            setIsSubscribed(true);  // Revert UI if API call fails
        }
    };

    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    const handleEmailSubmit = async () => {
        if (validateEmail(email)) {
            setShowEmailModal(false);
            await saveUserEmail(email);
            setIsSubscribed(true); // Cập nhật state sau khi lưu email thành công
        } else {
            setErrorMessage('Vui lòng nhập email hợp lệ.');
        }
    };

    const fetchUserEmail = async (userId: string) => {
        try {
            const response = await fetch(`/api/userEmail?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.email) {
                    setEmail(data.email);
                    setReceiveUpdates(true);
                } else {
                    setReceiveUpdates(false);
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy email người dùng:', error);
        }
    };

    const checkEmailSubscription = async (userId: string) => {
        try {
            const response = await fetch(`/api/getEmail?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setIsSubscribed(data.isSubscribed);
                if (data.email) {
                    setEmail(data.email);
                }
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra đăng ký email:', error);
        }
    };

    const toggle3DMode = () => {
        const newMode = !is3DEnabled;
        localStorage.setItem('3d-mode', newMode ? 'enabled' : 'disabled');
        setIs3DEnabled(newMode);
    };

    const checkVIPStatus = async (userId: string) => {
        try {
            if (!db) {
                console.error('Firestore chưa được khởi tạo');
                return;
            }

            const userDoc = doc(db, 'users', userId);
            const userSnapshot = await getDoc(userDoc);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setIsVIP(userData.isVIP === true);
                setUserVIPCode(userData.vipCode || '');
                setVipCodeUsed(userData.vipCodeUsed || false);
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái VIP:', error);
        }
    };

    const activateVIP = async () => {
        if (!db || !user?.uid) {
            setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
            return;
        }

        if (!vipCode || vipCode.length !== 5 || !/^\d+$/.test(vipCode)) {
            setErrorMessage('Mã VIP phải là 5 chữ số');
            return;
        }

        try {
            // Tìm tất cả user có mã VIP này
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('vipCode', '==', vipCode));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setErrorMessage('Mã VIP không hợp lệ');
                return;
            }

            // Kiểm tra xem có mã VIP nào chưa được sử dụng không
            let validVIPOwner = null;
            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                if (!data.vipCodeUsed) {
                    validVIPOwner = { id: doc.id, data };
                    break;
                }
            }

            if (!validVIPOwner) {
                setErrorMessage('Mã VIP này đã được sử dụng');
                return;
            }

            // Không cho phép sử dụng mã VIP của chính mình
            if (validVIPOwner.id === user.uid) {
                setErrorMessage('Không thể sử dụng mã VIP của chính mình');
                return;
            }

            // Cập nhật trạng thái VIP cho user hiện tại
            const userDoc = doc(db, 'users', user.uid);
            await updateDoc(userDoc, {
                isVIP: true,
                vipActivatedAt: new Date().toISOString(),
                activatedWithCode: vipCode
            });

            // Đánh dấu mã VIP đã được sử dụng
            const vipOwnerRef = doc(db, 'users', validVIPOwner.id);
            await updateDoc(vipOwnerRef, {
                vipCodeUsed: true
            });

            setIsVIP(true);
            setSuccessMessage('Kích hoạt VIP thành công!');
            setShowVIPModal(false);
            setVipCode('');

            // Cập nhật lại trạng thái VIP và mã VIP
            await checkVIPStatus(user.uid);

        } catch (error) {
            console.error('Lỗi khi kích hoạt VIP:', error);
            setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
    };

    const fetchHistoryWebsites = async (userId: string) => {
        setIsHistoryLoading(true);
        try {
            if (db) {
                const userDoc = doc(db, 'users', userId);
                const userSnapshot = await getDoc(userDoc);
                if (userSnapshot.exists()) {
                    const viewHistory = userSnapshot.data().viewHistory || [];
                    if (viewHistory.length === 0) {
                        setHistoryWebsites([]);
                        setIsHistoryLoading(false);
                        return;
                    }

                    const historyIds = viewHistory.map((item: any) => item.websiteId);
                    const uniqueIds = [...new Set(historyIds)]; // Loại bỏ các ID trùng lặp
                    const historyIdsQuery = uniqueIds.join(',');

                    const response = await fetch(`/api/showai?list=${historyIdsQuery}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.data) {
                            // Sắp xếp theo thứ tự trong viewHistory
                            const sortedWebsites = data.data.sort((a: any, b: any) => {
                                const aIndex = viewHistory.findIndex((item: any) => item.websiteId === a.id);
                                const bIndex = viewHistory.findIndex((item: any) => item.websiteId === b.id);
                                return aIndex - bIndex;
                            });
                            setHistoryWebsites(sortedWebsites);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử xem:', error);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const SkeletonLoader = () => (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <Skeleton width={200} height={24} baseColor="#1F2937" highlightColor="#374151" className="mb-4" />
            <Skeleton count={3} baseColor="#1F2937" highlightColor="#374151" className="mb-4" />
            <div className="mt-6 flex flex-wrap gap-4">
                <Skeleton width={120} height={40} baseColor="#1F2937" highlightColor="#374151" />
                <Skeleton width={120} height={40} baseColor="#1F2937" highlightColor="#374151" />
                <Skeleton width={120} height={40} baseColor="#1F2937" highlightColor="#374151" />
            </div>
        </div>
    );

    const FavoritesSkeletonLoader = () => (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <Skeleton width={200} height={24} baseColor="#1F2937" highlightColor="#374151" className="mb-4" />
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <Skeleton height={150} baseColor="#1F2937" highlightColor="#374151" className="mb-2" />
                        <Skeleton count={2} baseColor="#1F2937" highlightColor="#374151" className="mb-2" />
                        <div className="flex flex-wrap gap-2">
                            <Skeleton width={60} height={24} baseColor="#1F2937" highlightColor="#374151" />
                            <Skeleton width={60} height={24} baseColor="#1F2937" highlightColor="#374151" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (isLoading || isHeartedLoading) {
        return (
            <div className="bg-[#0F172A] text-white min-h-screen pb-4">
                <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                    <Skeleton width={200} height={36} baseColor="#1F2937" highlightColor="#374151" className="mx-auto" />
                </div>
                <div className="container mx-auto px-4">
                    <div className="flex mb-6">
                        <Skeleton width={100} height={40} baseColor="#1F2937" highlightColor="#374151" className="mr-4" />
                        <Skeleton width={100} height={40} baseColor="#1F2937" highlightColor="#374151" />
                    </div>
                    <SkeletonLoader />
                </div>
            </div>
        );
    }

    const tabVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    };

    return (
        <motion.div className="bg-[#0F172A] text-white min-h-screen pb-4">
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Tài khoản của bạn</h1>
                <div className="flex justify-center gap-4">
                    {isAdmin && (
                        <button
                            onClick={handleAdminAccess}
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                        >
                            Truy cập trang Admin
                        </button>
                    )}
                </div>
            </div>
            <div className="container mx-auto px-4">
                {errorMessage && (
                    <div className="bg-red-500 text-white p-4 mb-4 rounded">
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-500 text-white p-4 mb-4 rounded">
                        {successMessage}
                    </div>
                )}
                <div className="flex flex-wrap mb-6 gap-2">
                    <button
                        className={`py-2 px-4 rounded-lg flex items-center ${activeTab === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                        onClick={() => setActiveTab('info')}
                    >
                        <FaUser className="mr-2" />
                        <span className="hidden sm:inline">Thông tin</span>
                    </button>
                    <button
                        className={`py-2 px-4 rounded-lg flex items-center ${activeTab === 'favorites' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        <FaHeart className="mr-2" />
                        <span className="hidden sm:inline">Yêu thích</span>
                    </button>
                    <button
                        className={`py-2 px-4 rounded-lg flex items-center ${activeTab === 'post' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                        onClick={() => setActiveTab('post')}
                    >
                        <FaPlus className="mr-2" />
                        <span className="hidden sm:inline">Đăng bài</span>
                    </button>
                    <button
                        className={`py-2 px-4 rounded-lg flex items-center ${activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                            }`}
                        onClick={() => setActiveTab('history')}
                    >
                        <FaHistory className="mr-2" />
                        <span className="hidden sm:inline">Lịch sử</span>
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'info' && user && (
                        <motion.div
                            key="info"
                            {...{
                                variants: tabVariants,
                                initial: "hidden",
                                animate: "visible",
                                exit: "exit",
                                transition: { duration: 0.5 },
                                className: "bg-gray-800 p-6 rounded-lg shadow-md"
                            } as ModalBackdropProps}
                        >
                            <h2 className="text-xl font-semibold mb-4 text-blue-300">Thông tin cá nhân</h2>
                            <DisplayNameEditor
                                initialName={user.displayName || ''}
                                onSave={handleSaveName}
                            />
                            {userVIPCode && !vipCodeUsed && (
                                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FaStar className="text-yellow-300" />
                                            <span className="font-semibold">Mã VIP của bạn:</span>
                                        </div>
                                        <span className="font-mono text-lg text-yellow-300">{userVIPCode}</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Chia sẻ mã này cho bạn bè để họ có thể kích hoạt tài khoản VIP
                                    </p>
                                </div>
                            )}
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isSubscribed}
                                            onChange={handleToggleUpdates}
                                            className="form-checkbox h-5 w-5 text-blue-600"
                                        />
                                        <span className="ml-2">Nhận thông tin AI mới qua email</span>
                                    </label>
                                </div>
                                {!isMobile && (
                                    <div>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={is3DEnabled}
                                                onChange={toggle3DMode}
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                            />
                                            <span className="ml-2 flex items-center gap-2">
                                                <FaCube /> Chế độ 3D
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-4">
                                {!isGoogleUser && (
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Đổi Mật Khẩu
                                    </button>
                                )}
                                <button
                                    onClick={handleDeleteAccount}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                >
                                    Xóa Tài Khoản
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                >
                                    Đăng Xuất
                                </button>
                                {!isVIP && (
                                    <button
                                        onClick={() => setShowVIPModal(true)}
                                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                                    >
                                        <FaStar className="text-yellow-300" />
                                        Kích Hoạt VIP
                                    </button>
                                )}
                                {isVIP && (
                                    <div className="bg-purple-500 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
                                        <FaStar className="text-yellow-300" />
                                        Tài Khoản VIP
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'favorites' && (
                        <motion.div
                            key="favorites"
                            {...{
                                variants: tabVariants,
                                initial: "hidden",
                                animate: "visible",
                                exit: "exit",
                                transition: { duration: 0.5 },
                                className: "bg-gray-800 p-6 rounded-lg shadow-md"
                            } as ModalBackdropProps}
                        >
                            <h2 className="text-xl font-semibold mb-4 text-blue-300">Trang web yêu thích</h2>
                            {isHeartedLoading ? (
                                <FavoritesSkeletonLoader />
                            ) : heartedWebsites.length > 0 ? (
                                <WebsiteList
                                    websites={heartedWebsites}
                                    onTagClick={handleTagClick}
                                    isSidebar={false}
                                    isShuffled={true}
                                />
                            ) : (
                                <p>Bạn chưa có trang web yêu thích nào.</p>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'post' && (
                        <motion.div
                            key="post"
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.5 }}
                        >
                            <PostSubmission />
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            {...{
                                variants: tabVariants,
                                initial: "hidden",
                                animate: "visible",
                                exit: "exit",
                                transition: { duration: 0.5 },
                                className: "bg-gray-800 p-6 rounded-lg shadow-md"
                            } as ModalBackdropProps}
                        >
                            <h2 className="text-xl font-semibold mb-4 text-blue-300">Lịch sử xem</h2>
                            {isHistoryLoading ? (
                                <FavoritesSkeletonLoader />
                            ) : historyWebsites.length > 0 ? (
                                <WebsiteList
                                    websites={historyWebsites}
                                    onTagClick={handleTagClick}
                                    isSidebar={false}
                                    isShuffled={true}
                                />
                            ) : (
                                <p>Bạn chưa xem trang web nào.</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                <ModalPortal>
                    {showPasswordModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>
                                <div className="space-y-4">
                                    <input
                                        type="password"
                                        placeholder="Mật khẩu cũ"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full p-2 rounded bg-gray-700 text-white"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Mật khẩu mới"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full p-2 rounded bg-gray-700 text-white"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Xác nhận mật khẩu mới"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        className="w-full p-2 rounded bg-gray-700 text-white"
                                    />
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={() => setShowPasswordModal(false)}
                                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleResetPassword}
                                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Xác nhận
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                            <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
                                <h2 className="text-xl font-bold mb-4">Xác nhận xóa tài khoản</h2>
                                <p className="mb-6">Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác.</p>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={confirmDeleteAccount}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showEmailModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">Nhập Email</h2>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2 rounded bg-gray-700 text-white mb-4"
                                    placeholder="Nhập email của bạn"
                                />
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => {
                                            setShowEmailModal(false);
                                            setIsSubscribed(false); // Đặt lại trạng thái khi hủy
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleEmailSubmit}
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showVIPModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <FaStar className="text-yellow-300" />
                                    Kích Hoạt VIP
                                </h2>
                                <p className="text-gray-300 mb-4">
                                    Nhập mã VIP 5 chữ số để kích hoạt tài khoản VIP của bạn
                                </p>
                                <input
                                    type="text"
                                    maxLength={5}
                                    value={vipCode}
                                    onChange={(e) => setVipCode(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full p-2 rounded bg-gray-700 text-white mb-4"
                                    placeholder="Nhập mã VIP 5 chữ số"
                                />
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => {
                                            setShowVIPModal(false);
                                            setVipCode('');
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={activateVIP}
                                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                                    >
                                        <FaStar className="text-yellow-300" />
                                        Kích Hoạt
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </ModalPortal>
            </div>
        </motion.div>
    );
};

export default AccountPage;
