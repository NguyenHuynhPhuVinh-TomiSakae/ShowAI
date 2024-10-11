const PrivacyPolicyPage = () => {
    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <div className='py-4 sm:py-8'>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4">Chính sách bảo mật</h1>
                    <p className="text-base sm:text-lg max-w-3xl mx-auto mb-6">
                        Chúng tôi coi trọng quyền riêng tư của bạn. Hãy đọc kỹ chính sách bảo mật của chúng tôi.
                    </p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-blue-300">Thu thập thông tin</h2>
                    <p className="mb-4">
                        Chúng tôi chỉ thu thập thông tin cần thiết để cải thiện trải nghiệm người dùng và
                        cung cấp dịch vụ tốt nhất. Thông tin này có thể bao gồm địa chỉ IP, loại trình duyệt,
                        và thời gian truy cập.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-blue-300">Sử dụng thông tin</h2>
                    <p className="mb-4">
                        Thông tin thu thập được sử dụng để phân tích xu hướng, quản lý trang web,
                        theo dõi hành vi người dùng và thu thập thông tin nhân khẩu học tổng hợp.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-blue-300">Bảo mật thông tin</h2>
                    <p className="mb-4">
                        Chúng tôi cam kết bảo vệ thông tin của bạn. Chúng tôi sử dụng các biện pháp
                        bảo mật phù hợp để ngăn chặn truy cập trái phép hoặc sửa đổi, tiết lộ hoặc
                        phá hủy thông tin.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
