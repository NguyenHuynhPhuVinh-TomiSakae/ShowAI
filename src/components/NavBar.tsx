'use client'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useFirestoreOperations } from '@/utils/firestore';
import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import MobileNavBar from './MobileNavBar';
import DesktopNavBar from './DesktopNavBar';
import AIImageGenModal from './AIImageGenModal';

const NavBar = () => {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAIToolsDropdownOpen, setIsAIToolsDropdownOpen] = useState(false);
    const [user, setUser] = useState<DocumentData | null>(null);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isAIImageGenModalOpen, setIsAIImageGenModalOpen] = useState(false);
    const { auth } = useFirebase();
    const { getUserFromFirestore } = useFirestoreOperations();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, async (currentUser: User | null) => {
                if (currentUser) {
                    const userData = await getUserFromFirestore(currentUser.uid);
                    if (userData !== undefined) {
                        setUser(userData);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            });

            return () => {
                unsubscribe();
                window.removeEventListener('resize', handleResize);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = async () => {
        if (auth) {
            try {
                await auth.signOut();
                setIsUserDropdownOpen(false);
                router.push('/login');
            } catch (error) {
                console.error("Lỗi khi đăng xuất: ", error);
            }
        }
    };

    return (
        <nav className="bg-blue-600 text-white p-4 border-b border-white border-opacity-20 shadow-lg">
            <div className="container md:mx-4 flex justify-between items-center">
                <div
                    className="text-3xl font-bold cursor-pointer"
                    onClick={() => router.push('/')}
                >
                    <Image
                        src="/logo.jpg"
                        alt="ShowAI Logo"
                        className='rounded-full'
                        width={60}
                        height={60}
                        onMouseEnter={() => window.dispatchEvent(new CustomEvent('logoHover', { detail: 'Đây là logo của ShowAI, một nền tảng giúp bạn khám phá và tìm kiếm các công cụ AI hữu ích.' }))}
                        onMouseLeave={() => window.dispatchEvent(new CustomEvent('logoLeave'))}
                    />
                </div>
                <MobileNavBar
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    isAIToolsDropdownOpen={isAIToolsDropdownOpen}
                    toggleAIToolsDropdown={() => setIsAIToolsDropdownOpen(!isAIToolsDropdownOpen)}
                    user={user ? { username: user.username } : null}
                    isUserDropdownOpen={isUserDropdownOpen}
                    toggleUserDropdown={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    handleLogout={handleLogout}
                    setIsAIImageGenModalOpen={setIsAIImageGenModalOpen}
                />
                <DesktopNavBar
                    isAIToolsDropdownOpen={isAIToolsDropdownOpen}
                    setIsAIToolsDropdownOpen={setIsAIToolsDropdownOpen}
                    setIsAIDesignModalOpen={() => { }}
                    user={user ? { username: user.username } : null}
                    isUserDropdownOpen={isUserDropdownOpen}
                    setIsUserDropdownOpen={setIsUserDropdownOpen}
                    handleLogout={handleLogout}
                    setIsAIImageGenModalOpen={setIsAIImageGenModalOpen}
                />
            </div>
            {isAIImageGenModalOpen && (
                <AIImageGenModal isOpen={isAIImageGenModalOpen} onClose={() => setIsAIImageGenModalOpen(false)} />
            )}
        </nav>
    );
};

export default NavBar;
