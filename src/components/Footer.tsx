'use client'
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaFacebook, FaGithub } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';

const Footer = () => {
    const [footerStyles, setFooterStyles] = useState({
        bgColor: 'bg-[#3E52E8]',
        textColor: 'text-white',
        padding: 'py-8'
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Về ShowAI</h3>
                        <p className="text-sm">ShowAI là nền tảng giúp bạn khám phá và tìm kiếm các công cụ AI hữu ích cho công việc và cuộc sống.</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Liên kết nhanh</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <ul className="space-y-2">
                                <li><Link href="/" className="hover:text-gray-300">Trang chủ</Link></li>
                                <li><Link href="/about" className="hover:text-gray-300">Giới thiệu</Link></li>
                            </ul>
                            <ul className="space-y-2">
                                <li><Link href="/contact" className="hover:text-gray-300">Liên hệ</Link></li>
                                <li><Link href="/privacy-policy" className="hover:text-gray-300">Chính sách bảo mật</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Kết nối với tôi</h3>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/TomiSakaeAnime/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300"><FaFacebook size={24} /></a>
                            <a href="https://zalo.me/0762605309" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300"><SiZalo size={24} /></a>
                            <a href="https://github.com/TomiSakae" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300"><FaGithub size={24} /></a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-700 text-center">
                    <p>&copy; {new Date().getFullYear()} ShowAI. Tất cả các quyền được bảo lưu.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;