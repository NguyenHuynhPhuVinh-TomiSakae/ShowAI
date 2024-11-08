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
    const [agreeToTerms, setAgreeToTerms] = useState(false);

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

    const generateVIPCode = () => {
        return Math.floor(10000 + Math.random() * 90000).toString();
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!agreeToTerms) {
            setError('Vui lòng đồng ý với điều khoản và chính sách bảo mật');
            return;
        }

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
                const vipCode = generateVIPCode();
                const displayName = `User${user.uid}`;

                await addUserToFirestore(user.uid, {
                    email: user.email,
                    username: username,
                    displayName: displayName,
                    vipCode: vipCode,
                    isVIP: false,
                    vipCodeUsed: false,
                    createdAt: new Date().toISOString()
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
        if (!agreeToTerms) {
            setError('Vui lòng đồng ý với điều khoản và chính sách bảo mật');
            return;
        }

        const provider = new GoogleAuthProvider();
        try {
            if (!auth) {
                throw new Error('Firebase auth is not initialized');
            }

            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userDoc = await getUserFromFirestore(user.uid);

            if (!userDoc) {
                const vipCode = generateVIPCode();
                await addUserToFirestore(user.uid, {
                    email: user.email,
                    username: user.displayName,
                    displayName: user.displayName || `User${Date.now()}`,
                    vipCode: vipCode,
                    isVIP: false,
                    vipCodeUsed: false,
                    createdAt: new Date().toISOString()
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
        <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
            <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-blue-300">
                    {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </h2>
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tài khoản"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
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
                    <div className="flex items-start">
                        <input
                            type="checkbox"
                            id="agreeToTerms"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            className="mt-1 mr-2"
                        />
                        <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                            Tôi đồng ý với{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/privacy-policy')}
                                className="text-blue-400 hover:underline"
                            >
                                điều khoản và chính sách bảo mật
                            </button>
                        </label>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                    </button>
                </form>
                <div className="mt-4 sm:mt-6">
                    <button
                        onClick={handleGoogleAuth}
                        className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition duration-300 flex items-center justify-center"
                    >
                        <FaGoogle className="mr-2" /> Đăng nhập với Google
                    </button>
                </div>
                <p className="mt-4 sm:mt-6 text-center text-gray-400 text-sm">
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
