'use client'

import { ReactNode } from 'react';
import ClientPageTransition from '@/components/ClientPageTransition';
import { usePathname } from 'next/navigation';

interface TemplateProps {
    children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    if (isHomePage) {
        return <>{children}</>;
    }

    return <ClientPageTransition>{children}</ClientPageTransition>;
}