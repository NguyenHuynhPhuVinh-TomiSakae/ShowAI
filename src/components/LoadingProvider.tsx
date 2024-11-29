'use client';

import { useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    return (
        <>
            {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
            {children}
        </>
    );
} 