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
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const { auth } = useFirebase();
    const { addUserToFirestore } = useFirestoreOperations();
    const router = useRouter();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const checkAuthState = () => {
            if (auth) {
                auth.onAuthStateChanged((user) => {
                    if (user) {
                        router.push('/');
                    }
                });
            }
        };

        checkAuthState();
    }, [auth, router]);

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
                await addUserToFirestore(user.uid, {
                    email: user.email,
                    username: username
                });
                setShowSuccessPopup(true);
                setIsLogin(true);
                setTimeout(() => {
                    setShowSuccessPopup(false);
                    router.push('/');
                }, 2000);
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
            await addUserToFirestore(user.uid, {
                email: user.email,
                username: user.displayName
            });
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
            {showSuccessPopup && (
                <div className={`fixed ${isMobile ? 'bottom-4' : 'top-0'} left-0 right-0 flex justify-center z-50`}>
                    <div className="bg-green-500 text-white p-4 rounded-md shadow-lg">
                        Đăng ký thành công!
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;