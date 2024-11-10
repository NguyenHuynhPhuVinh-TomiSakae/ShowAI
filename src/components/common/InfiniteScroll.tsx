import { useEffect, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';

interface InfiniteScrollProps {
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    loadingMore: boolean;
    children: React.ReactNode;
}

export function InfiniteScroll({
    loading,
    hasMore,
    onLoadMore,
    loadingMore,
    children
}: InfiniteScrollProps) {
    const isMobile = useMediaQuery({ maxWidth: 768 });

    const handleScroll = useCallback(() => {
        if (loading || !hasMore || isMobile) return;

        const buffer = 200;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;

        if (scrollTop + clientHeight + buffer >= scrollHeight) {
            onLoadMore();
        }
    }, [loading, hasMore, onLoadMore, isMobile]);

    useEffect(() => {
        if (!isMobile) {
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll, isMobile]);

    return (
        <>
            {children}

            {!loading && hasMore && (
                <>
                    {isMobile ? (
                        <button
                            onClick={onLoadMore}
                            disabled={loadingMore}
                            className="w-full py-3 px-4 bg-[#2A3284] text-white rounded-lg mt-6 hover:bg-[#1E2563] transition-colors disabled:opacity-50"
                        >
                            {loadingMore ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tải...
                                </span>
                            ) : (
                                'Xem thêm'
                            )}
                        </button>
                    ) : (
                        <div className="text-center text-gray-400 my-6">
                            <div className="animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <p className="mt-2">Kéo xuống để tải thêm</p>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
