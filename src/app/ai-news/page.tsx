'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Article {
    title: string;
    link: string;
    description: string;
}

interface ArticleResponse {
    articles: Article[];
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
}

export default function AINews() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paginationInfo, setPaginationInfo] = useState<ArticleResponse | null>(null);
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        const initialPage = pageParam ? parseInt(pageParam) : 1;
        fetchData(initialPage);
    }, []);

    const fetchData = async (page: number) => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await fetch(`/api/ai-news?page=${page}&per_page=9`);

            if (!res.ok) {
                throw new Error(`Lỗi HTTP: ${res.status}`);
            }

            const data: ArticleResponse = await res.json();
            // Đảo ngược mảng để hiển thị từ cuối lên đầu
            setArticles([...data.articles].reverse());
            setPaginationInfo(data);
        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= (paginationInfo?.total_pages || 1)) {
            fetchData(newPage);
            router.push(`/ai-news?page=${newPage}`);
        }
    };

    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="bg-[#1E293B] border border-[#2A3284] rounded-lg p-6">
                    <Skeleton height={24} baseColor="#243351" highlightColor="#2A3284" />
                    <Skeleton count={2} className="mt-3" baseColor="#243351" highlightColor="#2A3284" />
                </div>
            ))}
        </div>
    );

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
                {isLoading ? (
                    <SkeletonLoader />
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article, index) => (
                                <a
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={index}
                                    className="block bg-[#1E293B] border border-[#2A3284] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow hover:bg-[#243351]"
                                >
                                    <h2 className="text-xl font-semibold mb-3 text-white line-clamp-2">{article.title}</h2>
                                    <p className="text-gray-300 line-clamp-3">{article.description}</p>
                                </a>
                            ))}
                        </div>

                        {articles.length === 0 && (
                            <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <p className="text-lg font-medium">Chưa có tin tức AI nào</p>
                                <p className="text-sm mt-2">Vui lòng quay lại sau!</p>
                            </div>
                        )}

                        {paginationInfo && (
                            <div className="mt-8 flex justify-center gap-2">
                                {Array.from({ length: paginationInfo.total_pages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`px-4 py-2 rounded ${paginationInfo.current_page === i + 1
                                            ? 'bg-[#2A3284] text-white'
                                            : 'bg-[#1E293B] text-gray-300 hover:bg-[#243351]'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
