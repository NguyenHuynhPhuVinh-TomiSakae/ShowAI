'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useSearchParams, useRouter } from 'next/navigation';
import WebsiteList from '@/components/WebsiteList';
import SearchBar from '@/components/SearchBar';

interface AIWebsite {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string;
    link: string;
    keyFeatures: string;
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
    const [isLoading, setIsLoading] = useState(false);
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
            const response = await fetch(`/api/showai?${type}=${encodeURIComponent(term)}`);
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
                {isLoading && <p className="text-center"><FaSpinner className="inline-block animate-spin mr-2" /> Đang tìm kiếm...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!isLoading && !error && (
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
