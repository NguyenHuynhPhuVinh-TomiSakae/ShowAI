'use client'
import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import WebsiteList from '@/components/WebsiteList';
import { Button } from "@/components/ui/button"
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import ParallaxHeader from '@/components/ParallaxHeader'
import AIPowered from '@/components/landing/AIPowered';
import CombinedFeatures from '@/components/landing/CombinedFeatures';
import AIPages from '@/components/landing/AIPages';
import AIUpdates from '@/components/landing/AIUpdates';
import FlutterAIApp from '@/components/landing/FlutterAIApp';
import CustomScrollbar from '@/components/common/CustomScrollbar';
import ModalPortal from '@/components/ModalPortal';
import { useMediaQuery } from 'react-responsive';
import LoadingScreen from '@/components/LoadingScreen';

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
  const [isMounted, setIsMounted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    setIsMounted(true);
    router.prefetch('/show');
  }, [router]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    const initialPage = pageParam ? parseInt(pageParam, 10) : 1;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/showai?page=${initialPage}`, {
          signal: controller.signal
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const apiResponse: ApiResponse = await response.json();
        setAiWebsites(apiResponse.data);
        setPaginationInfo(apiResponse.pagination);
        setAllTags(apiResponse.tags);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching data:', error);
          setError('Failed to fetch data');
        }
      } finally {
        setIsLoading(false);
        setInitialLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  const handleLoadingComplete = () => {
    setInitialLoading(false);
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage >= 1 && newPage <= (paginationInfo?.totalPages || 1)) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/showai?page=${newPage}`);
        if (!response.ok) throw new Error('Network response was not ok');

        const apiResponse: ApiResponse = await response.json();
        setAiWebsites(apiResponse.data);
        setPaginationInfo(apiResponse.pagination);
        router.push(`/?page=${newPage}`);
      } catch (error) {
        console.error('Error changing page:', error);
        setError('Failed to change page');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTagSearch = (tag: string) => {
    router.push(`/search?tag=${encodeURIComponent(tag)}`);
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
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} width={50} baseColor="#1F2937" highlightColor="#374151" />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} width={60} baseColor="#1F2937" highlightColor="#374151" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {initialLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}

      <div className="bg-[#0F172A] text-white min-h-screen">
        <style jsx global>{`
          html, body {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          html::-webkit-scrollbar,
          body::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {isMounted && (
          <>
            <ParallaxHeader onTagClick={handleTagSearch} allTags={allTags} />
            <div className="px-4 py-8">
              {isLoading && !initialLoading ? (
                <SkeletonLoader />
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : aiWebsites && aiWebsites.length > 0 ? (
                <WebsiteList websites={aiWebsites} onTagClick={handleTagSearch} />
              ) : null}

              {paginationInfo && (
                <div className="mt-8 flex justify-center items-center space-x-4">
                  {paginationInfo.currentPage > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                    >
                      <FaChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <span>{paginationInfo.currentPage}</span>
                  {paginationInfo.currentPage < paginationInfo.totalPages && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                    >
                      <FaChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <CombinedFeatures />
            <AIPowered />
            <AIPages />
            <AIUpdates />
            <FlutterAIApp />
          </>
        )}

        <ModalPortal>
          {!isMobile && <CustomScrollbar />}
        </ModalPortal>
      </div>
    </>
  );
}
