'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import WebsiteList from '@/components/WebsiteList';
import SearchBar from '@/components/SearchBar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface AIWebsite {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string[];
    link: string;
    keyFeatures: string[];
}

interface ApiResponse {
    data: AIWebsite[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
    tags: string[];
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [aiWebsites, setAiWebsites] = useState<AIWebsite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [displayTerm, setDisplayTerm] = useState('');
    const [isTagSearch, setIsTagSearch] = useState(false);
    const [allTags, setAllTags] = useState<string[]>([]);

    useEffect(() => {
        const query = searchParams.get('q');
        const tag = searchParams.get('tag');
        if (query) {
            setDisplayTerm(query);
            setIsTagSearch(false);
            handleSearch(query, 'q');
        } else if (tag) {
            setDisplayTerm(tag);
            setIsTagSearch(true);
            handleSearch(tag, 'tag');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSearch = async (term: string = searchTerm, type: 'q' | 'tag' = 'q') => {
        if (!term.trim()) return;
        setIsLoading(true);
        setError(null);
        setDisplayTerm(term);
        setSearchTerm(''); // Clear the input after search
        try {
            const response = await fetch(`/api/showai?${type}=${encodeURIComponent(term)}&sort=view`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const apiResponse: ApiResponse = await response.json();
            setAiWebsites(apiResponse.data);
            setAllTags(apiResponse.tags);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTagClick = (tag: string) => {
        router.push(`/search?tag=${encodeURIComponent(tag)}`);
        setSearchTerm('');
    };

    const SkeletonLoader = () => (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg overflow-hidden">
                    <Skeleton height={192} baseColor="#1F2937" highlightColor="#374151" />
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-3">
                            <Skeleton width={150} baseColor="#1F2937" highlightColor="#374151" />
                            <Skeleton circle={true} height={20} width={20} baseColor="#1F2937" highlightColor="#374151" />
                        </div>
                        <Skeleton count={3} baseColor="#1F2937" highlightColor="#374151" />
                        <div className="flex items-center space-x-4 my-4">
                            <Skeleton width={50} baseColor="#1F2937" highlightColor="#374151" />
                            <Skeleton width={50} baseColor="#1F2937" highlightColor="#374151" />
                            <Skeleton width={50} baseColor="#1F2937" highlightColor="#374151" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Skeleton width={60} baseColor="#1F2937" highlightColor="#374151" />
                            <Skeleton width={60} baseColor="#1F2937" highlightColor="#374151" />
                            <Skeleton width={60} baseColor="#1F2937" highlightColor="#374151" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
                <div className="py-4 sm:py-8">
                    <SearchBar onTagClick={handleTagClick} allTags={allTags} />
                    <p className="mt-4 text-base sm:text-lg font-bold">
                        {isTagSearch ? `Kết quả của tag: ${displayTerm}` : `Kết quả của: ${displayTerm}`}
                    </p>
                </div>
            </div>
            <div className="px-4 py-8">
                {isLoading ? (
                    <SkeletonLoader />
                ) : error ? (
                    <p className="text-center text-red-500">{error}</p>
                ) : (
                    aiWebsites.length > 0 ? (
                        <WebsiteList websites={aiWebsites} onTagClick={handleTagClick} />
                    ) : (
                        <p className="text-center text-lg">Không tìm thấy kết quả</p>
                    )
                )}
            </div>
        </div>
    );
}

export default function Search() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchContent />
        </Suspense>
    );
}
