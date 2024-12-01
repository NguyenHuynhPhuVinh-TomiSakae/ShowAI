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
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

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
  const [showLoading, setShowLoading] = useState(true);
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const [, setInitialContentLoaded] = useState(false);
  const [, setShowInitialContent] = useState(false);

  const [, setIsLoadingComplete] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showNextComponents, setShowNextComponents] = useState(false);
  const websiteListRef = useRef<HTMLDivElement>(null);
  const currentSectionRef = useRef<HTMLDivElement>(null);
  const [sectionScrollProgress, setSectionScrollProgress] = useState(0);
  const [isNearEnd, setIsNearEnd] = useState(false);
  const lastScrollAttemptRef = useRef(0);
  const scrollAttemptCountRef = useRef(0);

  const { scrollY } = useScroll();

  const [, setHeaderScrollProgress] = useState(0);
  const [showHeaderNext, setShowHeaderNext] = useState(false);

  const SCROLL_THRESHOLD = 20;

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!showNextComponents && websiteListRef.current) {
      const element = websiteListRef.current;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollPosition = latest;
      const scrollableHeight = elementHeight - windowHeight;
      const scrollPercentage = scrollPosition / scrollableHeight;

      setShowHeaderNext(scrollPercentage > 0.7);
    }
  });

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
        setShowLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setIsLoadingComplete(true);
    setInitialContentLoaded(true);
    setTimeout(() => {
      setShowInitialContent(true);
    }, 100);
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

  const [currentSection, setCurrentSection] = useState(0);
  const sections = [
    { component: CombinedFeatures },
    { component: AIPowered },
    { component: AIPages },
    { component: AIUpdates },
    { component: FlutterAIApp }
  ];

  const sectionScrollAttemptRef = useRef(0);
  const sectionLastScrollRef = useRef(0);

  useEffect(() => {
    const handleHeaderWheel = (e: WheelEvent) => {
      if (!showNextComponents && websiteListRef.current) {
        const scrollingUp = e.deltaY < 0;
        const element = websiteListRef.current;
        const threshold = 50;
        const isAtBottom = window.innerHeight + window.pageYOffset >= element.offsetHeight - threshold;

        if (!scrollingUp && isAtBottom) {
          const now = Date.now();
          if (now - lastScrollAttemptRef.current < 300) {
            scrollAttemptCountRef.current += 1;
            if (scrollAttemptCountRef.current > SCROLL_THRESHOLD * 0.3) {
              e.preventDefault();
            }
          } else {
            scrollAttemptCountRef.current = Math.max(0, scrollAttemptCountRef.current - 0.3);
          }
          lastScrollAttemptRef.current = now;

          const progress = Math.min(scrollAttemptCountRef.current / SCROLL_THRESHOLD, 1);
          setScrollProgress(progress);

          if (progress >= 1) {
            setShowNextComponents(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            scrollAttemptCountRef.current = 0;
            setScrollProgress(0);
            setHeaderScrollProgress(0);
            setShowHeaderNext(false);
            setIsNearEnd(false);
          }
        } else if (scrollingUp || !isAtBottom) {
          scrollAttemptCountRef.current = 0;
          setScrollProgress(0);
          setShowHeaderNext(false);
          lastScrollAttemptRef.current = 0;
        }
      }
    };

    const handleHeaderTouch = (e: TouchEvent) => {
      if (showHeaderNext && scrollAttemptCountRef.current > SCROLL_THRESHOLD * 0.3) {
        e.preventDefault();
      }
    };

    if (!showNextComponents) {
      window.addEventListener('wheel', handleHeaderWheel, { passive: false });
      window.addEventListener('touchmove', handleHeaderTouch, { passive: false });
    }

    return () => {
      window.removeEventListener('wheel', handleHeaderWheel);
      window.removeEventListener('touchmove', handleHeaderTouch);
    };
  }, [showNextComponents, showHeaderNext]);

  useEffect(() => {
    const handleSectionWheel = (e: WheelEvent) => {
      if (showNextComponents && currentSectionRef.current && currentSection < sections.length - 1) {
        const scrollingUp = e.deltaY < 0;
        const element = currentSectionRef.current;
        const threshold = 50;
        const isAtBottom = window.innerHeight + window.pageYOffset >= element.offsetHeight - threshold;

        if (!scrollingUp && isAtBottom) {
          const now = Date.now();
          if (now - sectionLastScrollRef.current < 300) {
            sectionScrollAttemptRef.current += 1;
            if (sectionScrollAttemptRef.current > SCROLL_THRESHOLD * 0.3) {
              e.preventDefault();
            }
          } else {
            sectionScrollAttemptRef.current = Math.max(0, sectionScrollAttemptRef.current - 0.3);
          }
          sectionLastScrollRef.current = now;

          const progress = Math.min(sectionScrollAttemptRef.current / SCROLL_THRESHOLD, 1);
          setSectionScrollProgress(progress);
          setIsNearEnd(progress > 0.3);

          if (progress >= 1) {
            let isTransitioning = false;

            if (!isTransitioning) {
              isTransitioning = true;
              sectionScrollAttemptRef.current = 0;
              setSectionScrollProgress(0);
              setIsNearEnd(false);

              setTimeout(() => {
                setCurrentSection(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                isTransitioning = false;
              }, 300);
            }
          }
        } else {
          sectionScrollAttemptRef.current = Math.max(0, sectionScrollAttemptRef.current - 0.3);
          setSectionScrollProgress(0);
          setIsNearEnd(false);
        }
      }
    };

    const handleSectionTouch = (e: TouchEvent) => {
      if (showNextComponents && isNearEnd && sectionScrollAttemptRef.current > SCROLL_THRESHOLD * 0.3) {
        e.preventDefault();
      }
    };

    if (showNextComponents) {
      window.addEventListener('wheel', handleSectionWheel, { passive: false });
      window.addEventListener('touchmove', handleSectionTouch, { passive: false });
    }

    return () => {
      window.removeEventListener('wheel', handleSectionWheel);
      window.removeEventListener('touchmove', handleSectionTouch);
    };
  }, [showNextComponents, currentSection, isNearEnd]);

  const [, setShowFooter] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    const isLastSection = showNextComponents && currentSection === sections.length - 1;

    if (footer) {
      if (isLastSection) {
        setShowFooter(true);
        footer.style.display = 'block';
        footer.style.opacity = '1';
        footer.style.transition = 'opacity 0.3s ease-in-out';
      } else {
        setShowFooter(false);
        footer.style.opacity = '0';
        setTimeout(() => {
          if (!isLastSection) {
            footer.style.display = 'none';
          }
        }, 300);
      }
    }
  }, [showNextComponents, currentSection]);

  const globalStyles = `
    html, body {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      display: none;
    }
    footer {
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
  `;

  const handleSectionClick = (index: number) => {
    if (index === -1) {
      setShowNextComponents(false);
      setCurrentSection(0);
      setSectionScrollProgress(0);
      setScrollProgress(0);
      setIsNearEnd(false);
      sectionScrollAttemptRef.current = 0;
      scrollAttemptCountRef.current = 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentSection(index);
      setSectionScrollProgress(0);
      setIsNearEnd(false);
      sectionScrollAttemptRef.current = 0;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLoadingFinish = () => {
    setTimeout(() => {
      setShowLoading(false);
      setIsLoadingComplete(true);
      handleLoadingComplete();
      sessionStorage.setItem('initialLoadComplete', 'true');
    }, 2000);
  };

  // Thêm state để theo dõi việc load lần đầu
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  useEffect(() => {
    const initialLoadComplete = typeof window !== 'undefined' ? sessionStorage.getItem('initialLoadComplete') : null;
    setHasInitialLoad(!!initialLoadComplete);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showLoading && !hasInitialLoad && !sessionStorage.getItem('initialLoadComplete') ? (
        <LoadingScreen key="loading" onLoadingComplete={handleLoadingFinish} />
      ) : (
        <motion.div
          key="content"
          className="bg-[#0F172A] text-white min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeInOut"
          }}
        >
          <style jsx global>
            {globalStyles}
          </style>

          {isMounted && !showNextComponents && (
            <>
              <ParallaxHeader onTagClick={handleTagSearch} allTags={allTags} />
              <div ref={websiteListRef} className="px-4 py-8 relative z-[1]">
                {isLoading && !showLoading ? (
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
            </>
          )}

          {showNextComponents && (
            <motion.div
              className="min-h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence mode="wait" initial={true}>
                {sections.map((Section, index) => (
                  index === currentSection && (
                    <motion.div
                      key={index}
                      ref={currentSectionRef}
                      className="min-h-screen relative"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.5
                      }}
                    >
                      <Section.component />
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          <ModalPortal>
            {!isMobile && (
              <CustomScrollbar
                currentSection={currentSection}
                totalSections={sections.length}
                showNextComponents={showNextComponents}
                onSectionClick={handleSectionClick}
                scrollProgress={scrollProgress}
                sectionScrollProgress={sectionScrollProgress}
                isNearEnd={isNearEnd}
              />
            )}
          </ModalPortal>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
