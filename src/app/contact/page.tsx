'use client'
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';

const ContactPage = () => {
    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <div className='py-4 sm:py-8'>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4">Liên hệ với tôi</h1>
                    <p className="text-base sm:text-lg max-w-3xl mx-auto mb-6">
                        Tôi luôn sẵn sàng lắng nghe ý kiến của bạn. Hãy liên hệ với tôi qua các phương thức sau.
                    </p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-blue-300">Thông tin liên hệ</h2>
                        <ul className="space-y-4">
                            <li className="flex items-center">
                                <FaEnvelope className="mr-3 text-blue-500" />
                                <span>Email: tomisakaeap1@gmail.com</span>
                            </li>
                            <li className="flex items-center">
                                <FaPhone className="mr-3 text-blue-500" />
                                <span>Điện thoại: +84 762605309</span>
                            </li>
                            <li className="flex items-center">
                                <SiZalo className="mr-3 text-blue-500" />
                                <span>Zalo: 0762605309</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-blue-300">Liên hệ qua Zalo</h2>
                        <div className="flex items-center justify-center">
                            <a href="https://zalo.me/0762605309" target="_blank" rel="noopener noreferrer" className="flex items-center bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition duration-300">
                                <SiZalo className="mr-2" />
                                <span>Nhắn tin qua Zalo</span>
                            </a>
                        </div>
                    </div>
                </div>
                <p className="mt-8 text-center text-gray-400">
                    Tôi sẽ phản hồi trong vòng 24 giờ làm việc.
                </p>
            </div>
        </div>
    );
};

export default ContactPage;