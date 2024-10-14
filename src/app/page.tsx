'use client'
import React, { useState, useEffect, useRef } from 'react';
import { FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import WebsiteList from '@/components/WebsiteList';
import SearchBar from '@/components/SearchBar';

interface AIWebsite {
  _id: string;
  id: string;
  name: string;
  description: string[];
  tags: string[];
  link: string;
  keyFeatures: string[];
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ApiResponse {
  data: AIWebsite[];
  pagination: PaginationInfo;
  tags: string[];
}

export default function Home() {
  const [aiWebsites, setAiWebsites] = useState<AIWebsite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchData(1);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchData = async (page: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      const response = await fetch(`/api/showai?page=${page}`, {
        signal: abortControllerRef.current.signal
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const apiResponse: ApiResponse = await response.json();
      setAiWebsites(apiResponse.data);
      setPaginationInfo(apiResponse.pagination);
      setAllTags(apiResponse.tags);
      setIsLoading(false);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        setIsLoading(false);
      }
    }
  };

  const handleTagSearch = (tag: string) => {
    router.push(`/search?tag=${encodeURIComponent(tag)}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (paginationInfo?.totalPages || 1)) {
      setPaginationInfo(prev => prev ? { ...prev, currentPage: newPage } : null);
      fetchData(newPage);
    }
  };

  return (
    <div className="bg-[#0F172A] text-white min-h-screen">
      <div className="bg-[#2A3284] text-center py-8 mb-8 px-4">
        <div className='py-4 sm:py-8'>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Tìm các công cụ và ứng dụng AI tốt nhất</h1>
          <p className="text-base sm:text-lg max-w-3xl mx-auto mb-6">
            Khám phá các công cụ AI miễn phí sử dụng được ở việt nam. Các AI hỗ trợ giúp công việc của bạn trở nên đơn giản hơn bao giờ hết.
          </p>
          <SearchBar onTagClick={handleTagSearch} allTags={allTags} />
        </div>
      </div>
      <div className="px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            {error}
          </div>
        ) : (
          <WebsiteList websites={aiWebsites} onTagClick={handleTagSearch} />
        )}
        {paginationInfo && (
          <div className="mt-8 flex justify-center items-center space-x-4">
            {paginationInfo.currentPage > 1 && (
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
              >
                <FaChevronLeft />
              </button>
            )}
            <span>{paginationInfo.currentPage}</span>
            {paginationInfo.currentPage < paginationInfo.totalPages && (
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
              >
                <FaChevronRight />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}