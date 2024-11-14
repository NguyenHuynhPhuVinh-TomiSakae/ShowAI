'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaFacebook, FaGithub, FaAndroid } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';

const Footer = () => {
    const router = useRouter();
    const [footerStyles, setFooterStyles] = useState({
        bgColor: 'bg-gray-800',
        textColor: 'text-gray-300',
        padding: 'py-12'
    });

    useEffect(() => {
        const storedFooterStyles = localStorage.getItem('newFooterStyles');
        if (storedFooterStyles) {
            setFooterStyles(JSON.parse(storedFooterStyles));
        } else {
            localStorage.setItem('newFooterStyles', JSON.stringify(footerStyles));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <footer className={`${footerStyles.bgColor} ${footerStyles.textColor} ${footerStyles.padding}`}>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                    <div className="flex flex-col items-start">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">Về ShowAI</h3>
                        <p className="text-sm leading-relaxed">ShowAI là nền tảng giúp bạn khám phá và tìm kiếm các công cụ AI hữu ích cho công việc và cuộc sống.</p>
                    </div>
                    <div className="flex flex-col items-start">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">Liên kết nhanh</h3>
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <ul className="space-y-2">
                                <li><span onClick={() => router.push('/')} className="hover:text-white cursor-pointer transition duration-300">Trang chủ</span></li>
                                <li><span onClick={() => router.push('/about')} className="hover:text-white cursor-pointer transition duration-300">Giới thiệu</span></li>
                            </ul>
                            <ul className="space-y-2">
                                <li><span onClick={() => router.push('/contact')} className="hover:text-white cursor-pointer transition duration-300">Liên hệ</span></li>
                                <li><span onClick={() => router.push('/privacy-policy')} className="hover:text-white cursor-pointer transition duration-300">Chính sách</span></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col items-start">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">Tải ứng dụng</h3>
                        <div className="space-y-2 w-full">
                            <a
                                href="/android/ShowAI-v1.1.1.apk"
                                download
                                className="w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition duration-300"
                            >
                                <FaAndroid size={24} />
                                <div>
                                    <div className="text-xs">Tải về cho</div>
                                    <div className="text-sm font-bold">Android</div>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col items-start">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">Kết nối với tôi</h3>
                        <div className="flex space-x-6">
                            <a href="https://www.facebook.com/TomiSakaeAnime/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300">
                                <FaFacebook size={28} />
                            </a>
                            <a href="https://zalo.me/0762605309" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300">
                                <SiZalo size={28} />
                            </a>
                            <a href="https://github.com/TomiSakae" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300">
                                <FaGithub size={28} />
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col items-start">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">Xã hội AI</h3>
                        <ul className="space-y-2">
                            <li><span onClick={() => router.push('/social')} className="hover:text-white cursor-pointer transition duration-300">Dòng thời gian</span></li>
                            <li><span onClick={() => router.push('/social/chat')} className="hover:text-white cursor-pointer transition duration-300">Cuộc trò chuyện</span></li>
                        </ul>
                    </div>
                    <div className="flex flex-col items-start">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-white">Thông tin thêm</h3>
                        <ul className="space-y-2">
                            <li><span onClick={() => router.push('/ai-websites')} className="hover:text-white cursor-pointer transition duration-300">Trang web AI</span></li>
                            <li><span onClick={() => router.push('/ai-news')} className="hover:text-white cursor-pointer transition duration-300">Tin tức AI</span></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-700 text-center">
                    <p className="text-sm">&copy; {new Date().getFullYear()} ShowAI. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
