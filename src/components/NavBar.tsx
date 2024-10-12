'use client'
import Image from 'next/image';
import { useState, useEffect } from 'react';
import GeminiChat from './GeminiChat';
import AIDesignModal from './AIDesignModal';
import AICompareModal from './AICompareModal';
import Live2DModelComponent from './Live2DModelComponent';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/components/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useFirestoreOperations } from '@/utils/firestore';
import { User } from 'firebase/auth';
import { DocumentData } from 'firebase/firestore';
import MobileNavBar from './MobileNavBar';
import DesktopNavBar from './DesktopNavBar';

const NavBar = () => {
    const router = useRouter();
    const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
    const [isAIDesignModalOpen, setIsAIDesignModalOpen] = useState(false);
    const [isAICompareModalOpen, setIsAICompareModalOpen] = useState(false);
    const [isLive2DModalOpen, setIsLive2DModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAIToolsDropdownOpen, setIsAIToolsDropdownOpen] = useState(false);
    const [navStyles, setNavStyles] = useState({
        bgColor: 'bg-[#3E52E8]',
        textColor: 'text-white',
        padding: 'p-4'
    });
    const [user, setUser] = useState<DocumentData | null>(null);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const { auth } = useFirebase();
    const { getUserFromFirestore } = useFirestoreOperations();

    useEffect(() => {
        const storedNavStyles = localStorage.getItem('navStyles');
        if (storedNavStyles) {
            setNavStyles(JSON.parse(storedNavStyles));
        } else {
            localStorage.setItem('navStyles', JSON.stringify(navStyles));
        }

        const storedLive2DState = localStorage.getItem('isLive2DModalOpen');
        if (storedLive2DState) {
            setIsLive2DModalOpen(JSON.parse(storedLive2DState));
        }

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

    const toggleLive2DModal = () => {
        const newState = !isLive2DModalOpen;
        setIsLive2DModalOpen(newState);
        localStorage.setItem('isLive2DModalOpen', JSON.stringify(newState));
    };

    const handleLogout = async () => {
        if (auth) {
            try {
                await auth.signOut();
                setIsUserDropdownOpen(false);
                router.push('/login');
            } catch (error) {
                console.error("Error signing out: ", error);
            }
        }
    };

    return (
        <nav className={`${navStyles.bgColor} ${navStyles.textColor} ${navStyles.padding}`}>
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
                    setIsAIDesignModalOpen={setIsAIDesignModalOpen}
                    setIsGeminiChatOpen={setIsGeminiChatOpen}
                    setIsAICompareModalOpen={setIsAICompareModalOpen}
                    user={user ? { username: user.username } : null}
                    isUserDropdownOpen={isUserDropdownOpen}
                    toggleUserDropdown={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    handleLogout={handleLogout}
                />
                <DesktopNavBar
                    isAIToolsDropdownOpen={isAIToolsDropdownOpen}
                    setIsAIToolsDropdownOpen={setIsAIToolsDropdownOpen}
                    setIsAIDesignModalOpen={setIsAIDesignModalOpen}
                    setIsGeminiChatOpen={setIsGeminiChatOpen}
                    setIsAICompareModalOpen={setIsAICompareModalOpen}
                    isLive2DModalOpen={isLive2DModalOpen}
                    toggleLive2DModal={toggleLive2DModal}
                    user={user ? { username: user.username } : null}
                    isUserDropdownOpen={isUserDropdownOpen}
                    setIsUserDropdownOpen={setIsUserDropdownOpen}
                    handleLogout={handleLogout}
                />
            </div>
            {isAIDesignModalOpen && (
                <AIDesignModal isOpen={isAIDesignModalOpen} onClose={() => setIsAIDesignModalOpen(false)} />
            )}
            {isAICompareModalOpen && (
                <AICompareModal isOpen={isAICompareModalOpen} onClose={() => setIsAICompareModalOpen(false)} />
            )}
            {isLive2DModalOpen && (
                <Live2DModelComponent />
            )}
            {isGeminiChatOpen && (
                <GeminiChat isOpen={isGeminiChatOpen} onClose={() => setIsGeminiChatOpen(false)} />
            )}
        </nav>
    );
};

export default NavBar;