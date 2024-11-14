export default async function AINews() {
    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Tin Tức AI Mới
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Cập nhật những tin tức mới nhất về AI
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-lg font-medium">Chưa có tin tức AI nào</p>
                    <p className="text-sm mt-2">Vui lòng quay lại sau!</p>
                </div>
            </div>
        </div>
    );
}
