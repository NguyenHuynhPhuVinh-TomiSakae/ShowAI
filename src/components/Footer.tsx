'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaFacebook, FaGithub } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';

const Footer = () => {
    const router = useRouter();
    const [footerStyles, setFooterStyles] = useState({
        bgColor: 'bg-gray-800',
        textColor: 'text-gray-300',
        padding: 'py-12'
    });

    useEffect(() => {
        const storedFooterStyles = localStorage.getItem('footerStyles');
        if (storedFooterStyles) {
            setFooterStyles(JSON.parse(storedFooterStyles));
        } else {
            localStorage.setItem('footerStyles', JSON.stringify(footerStyles));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <footer className={`${footerStyles.bgColor} ${footerStyles.textColor} ${footerStyles.padding}`}>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-white">Về ShowAI</h3>
                        <p className="text-sm leading-relaxed">ShowAI là nền tảng giúp bạn khám phá và tìm kiếm các công cụ AI hữu ích cho công việc và cuộc sống.</p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-white">Liên kết nhanh</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <ul className="space-y-3">
                                <li><span onClick={() => router.push('/')} className="hover:text-white cursor-pointer transition duration-300">Trang chủ</span></li>
                                <li><span onClick={() => router.push('/about')} className="hover:text-white cursor-pointer transition duration-300">Giới thiệu</span></li>
                            </ul>
                            <ul className="space-y-3">
                                <li><span onClick={() => router.push('/contact')} className="hover:text-white cursor-pointer transition duration-300">Liên hệ</span></li>
                                <li><span onClick={() => router.push('/privacy-policy')} className="hover:text-white cursor-pointer transition duration-300">Chính sách bảo mật</span></li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-white">Kết nối với tôi</h3>
                        <div className="flex space-x-6">
                            <a href="https://www.facebook.com/TomiSakaeAnime/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300"><FaFacebook size={28} /></a>
                            <a href="https://zalo.me/0762605309" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300"><SiZalo size={28} /></a>
                            <a href="https://github.com/TomiSakae" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300"><FaGithub size={28} /></a>
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-700 text-center">
                    <p className="text-sm">&copy; {new Date().getFullYear()} ShowAI. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
