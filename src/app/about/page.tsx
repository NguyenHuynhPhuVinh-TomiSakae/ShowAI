const AboutPage = () => {
    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <div className='py-4 sm:py-8'>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4">Về ShowAI</h1>
                    <p className="text-base sm:text-lg max-w-3xl mx-auto mb-6">
                        Khám phá câu chuyện đằng sau ShowAI và sứ mệnh của tôi trong việc đem công nghệ AI đến gần hơn với mọi người.
                    </p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-blue-300">Tầm nhìn của ShowAI</h2>
                    <p className="mb-4">
                        ShowAI là dự án cá nhân của tôi, được tạo ra với mục đích giới thiệu và đánh giá các công cụ AI hữu ích.
                        Tôi tin rằng AI có tiềm năng to lớn trong việc cải thiện cuộc sống và công việc của mọi người, và
                        ShowAI là nơi để chia sẻ niềm đam mê này với cộng đồng.
                    </p>
                    <p>
                        Với kiến thức và kinh nghiệm của mình trong lĩnh vực công nghệ, tôi không ngừng tìm kiếm và
                        đánh giá các công cụ AI mới nhất, giúp bạn dễ dàng khám phá và áp dụng chúng vào cuộc sống hàng ngày.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-blue-300">Cam kết của tôi</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Cung cấp thông tin chính xác và cập nhật về các công cụ AI</li>
                        <li>Đánh giá khách quan và chi tiết về từng ứng dụng</li>
                        <li>Hỗ trợ cộng đồng trong việc tìm hiểu và sử dụng AI hiệu quả</li>
                        <li>Liên tục cập nhật và mở rộng danh sách công cụ AI</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;