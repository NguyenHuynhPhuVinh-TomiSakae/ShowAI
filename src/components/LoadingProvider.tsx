'use client';

import { useState } from "react";
import { usePathname } from 'next/navigation';
import LoadingScreen from "./LoadingScreen";

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    return (
        <>
            {isLoading && pathname === '/' && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
            {children}
        </>
    );
} 