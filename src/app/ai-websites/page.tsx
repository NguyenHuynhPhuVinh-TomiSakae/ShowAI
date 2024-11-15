'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface AITool {
    id: number;
    name: string;
    description: string;
    tags: string[];
    link_ai_tool: string;
}

interface AIToolResponse {
    content: AITool[];
    totalPages: number;
    totalElements: number;
    pageNumber: number;
    pageSize: number;
}

export default function AIWebsites() {
    const [aiTools, setAiTools] = useState<AITool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paginationInfo, setPaginationInfo] = useState<AIToolResponse | null>(null);
    const router = useRouter();
    const abortControllerRef = useRef<AbortController | null>(null);
    const [, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        const initialPage = pageParam ? parseInt(pageParam) : 0;
        fetchData(initialPage);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const fetchData = async (page: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const res = await fetch(`/api/ai-tools?size=9&page=${page}`);

            if (!res.ok) {
                throw new Error(`Lỗi HTTP: ${res.status}`);
            }

            const data = await res.json();
            setAiTools(data.content);
            setPaginationInfo(data);
        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < (paginationInfo?.totalPages || 0)) {
            fetchData(newPage);
            router.push(`/ai-websites?page=${newPage}`);
        }
    };

    const SkeletonLoader = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="bg-[#1E293B] border border-[#2A3284] rounded-lg p-6">
                    <Skeleton height={24} baseColor="#243351" highlightColor="#2A3284" />
                    <Skeleton count={2} className="mt-3" baseColor="#243351" highlightColor="#2A3284" />
                    <div className="flex flex-wrap gap-2 mt-4">
                        {Array(3).fill(0).map((_, i) => (
                            <Skeleton key={i} width={60} height={24} baseColor="#243351" highlightColor="#2A3284" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    Website AI Mới
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Khám phá những công cụ AI mới nhất và hữu ích nhất
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
                            {aiTools.map((tool) => (
                                <a
                                    href={tool.link_ai_tool}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    key={tool.id}
                                    className="block bg-[#1E293B] border border-[#2A3284] rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow hover:bg-[#243351]"
                                >
                                    <h2 className="text-xl font-semibold mb-3 text-white">{tool.name}</h2>
                                    <p className="text-gray-300 mb-4 line-clamp-2">{tool.description}</p>
                                    <div className="flex flex-wrap gap-2 overflow-hidden h-8">
                                        {tool.tags.map((tag, tagIndex) => (
                                            <span
                                                key={tagIndex}
                                                className="bg-[#2A3284] text-gray-200 text-sm px-3 py-1 rounded-full whitespace-nowrap"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </a>
                            ))}
                        </div>

                        {aiTools.length === 0 && (
                            <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <p className="text-lg font-medium">Chưa có công cụ AI nào</p>
                                <p className="text-sm mt-2">Vui lòng quay lại sau!</p>
                            </div>
                        )}

                        {paginationInfo && (
                            <div className="mt-8 flex justify-center gap-2 flex-wrap px-4">
                                <button
                                    onClick={() => handlePageChange(0)}
                                    disabled={paginationInfo.pageNumber === 0}
                                    className={`px-3 py-1 rounded ${paginationInfo.pageNumber === 0
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : 'bg-[#1E293B] text-gray-300 hover:bg-[#243351]'
                                        }`}
                                >
                                    Đầu
                                </button>

                                {Array.from({ length: paginationInfo.totalPages }, (_, i) => {
                                    // Hiển thị 3 trang trước và sau trang hiện tại
                                    if (
                                        i === 0 ||
                                        i === paginationInfo.totalPages - 1 ||
                                        (i >= paginationInfo.pageNumber - 2 && i <= paginationInfo.pageNumber + 2)
                                    ) {
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(i)}
                                                className={`px-3 py-1 rounded ${paginationInfo.pageNumber === i
                                                        ? 'bg-[#2A3284] text-white'
                                                        : 'bg-[#1E293B] text-gray-300 hover:bg-[#243351]'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        );
                                    } else if (
                                        i === paginationInfo.pageNumber - 3 ||
                                        i === paginationInfo.pageNumber + 3
                                    ) {
                                        return <span key={i} className="text-gray-500 px-2">...</span>;
                                    }
                                    return null;
                                })}

                                <button
                                    onClick={() => handlePageChange(paginationInfo.totalPages - 1)}
                                    disabled={paginationInfo.pageNumber === paginationInfo.totalPages - 1}
                                    className={`px-3 py-1 rounded ${paginationInfo.pageNumber === paginationInfo.totalPages - 1
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : 'bg-[#1E293B] text-gray-300 hover:bg-[#243351]'
                                        }`}
                                >
                                    Cuối
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
