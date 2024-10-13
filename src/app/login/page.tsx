/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useFirebase } from '@/components/FirebaseConfig';
import { FaGoogle } from 'react-icons/fa';
import { useFirestoreOperations } from '@/utils/firestore';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');

    const { auth } = useFirebase();
    const { addUserToFirestore, updateUserInFirestore, getUserFromFirestore } = useFirestoreOperations();
    const router = useRouter();

    useEffect(() => {
        const checkAuthState = () => {
            if (auth) {
                auth.onAuthStateChanged((user) => {
                    if (user) {
                        syncStarredWithFirestore(user.uid);
                        router.push('/');
                    }
                });
            }
        };

        checkAuthState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth, router]);

    const syncStarredWithFirestore = async (userId: string) => {
        const starredIds = JSON.parse(localStorage.getItem('starredIds') || '[]');
        if (starredIds.length > 0) {
            await handleStarredData(userId, starredIds);
        }
    };

    const handleStarredData = async (userId: string, starredIds: string[]) => {
        // Check if the user document exists in Firestore
        const userDoc = await getUserFromFirestore(userId); // Assume this function retrieves the user document
        if (!userDoc) {
            // If the user document does not exist, create it with starred data
            await addUserToFirestore(userId, {
                starredWebsites: starredIds // Tạo trường dữ liệu mới cho starred
            });
        } else {
            // If it exists, update the starredData
            await updateUserInFirestore(userId, {
                starredWebsites: starredIds // Cập nhật trường dữ liệu mới cho starred
            });
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const email = `${username}@gmail.com`;

        if (!isLogin && password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (!isLogin && password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        try {
            if (!auth) {
                throw new Error('Firebase auth is not initialized');
            }

            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                router.push('/');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                // Get the current user count from Firestore
                const displayName = `User${Date.now()}`;
                await addUserToFirestore(user.uid, {
                    email: user.email,
                    username: username,
                    displayName: displayName
                });
                setIsLogin(true);
                router.push('/');
            }
        } catch (error: any) {
            console.error('Authentication error:', error);
            if (error.code === 'auth/user-not-found') {
                setError('Tài khoản không tồn tại');
            } else if (error.code === 'auth/wrong-password') {
                setError('Sai mật khẩu');
            } else if (error.code === 'auth/invalid-email') {
                setError('Tài khoản không hợp lệ');
            } else if (error.code === 'auth/email-already-in-use') {
                setError('Tài khoản đã được sử dụng');
            } else {
                setError('Đã xảy ra lỗi trong quá trình xác thực');
            }
        }
    };

    const handleGoogleAuth = async () => {
        const provider = new GoogleAuthProvider();
        try {
            if (!auth) {
                throw new Error('Firebase auth is not initialized');
            }

            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userDoc = await getUserFromFirestore(user.uid);
            if (!userDoc) {
                await addUserToFirestore(user.uid, {
                    email: user.email,
                    username: user.displayName,
                    displayName: user.displayName || `User${Date.now()}`
                });
            }
            router.push('/');
        } catch (error: any) {
            console.error('Google auth error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                setError('Đăng nhập bị hủy');
            } else {
                setError('Đã xảy ra lỗi khi đăng nhập bằng Google');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 mx-4">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-300">
                    {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </h2>
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tài khoản"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 pr-24 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                            required
                        />
                    </div>
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                        required
                    />
                    {!isLogin && (
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                            required
                        />
                    )}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                    </button>
                </form>
                <div className="mt-6">
                    <button
                        onClick={handleGoogleAuth}
                        className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition duration-300 flex items-center justify-center"
                    >
                        <FaGoogle className="mr-2" /> Đăng nhập với Google
                    </button>
                </div>
                <p className="mt-6 text-center text-gray-400">
                    {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setPassword('');
                            setConfirmPassword('');
                        }}
                        className="text-blue-400 hover:underline ml-1 font-medium"
                    >
                        {isLogin ? 'Đăng ký' : 'Đăng nhập'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
