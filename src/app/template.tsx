import { ReactNode } from 'react';
import ClientPageTransition from '@/components/ClientPageTransition';

interface TemplateProps {
    children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
    return <ClientPageTransition>{children}</ClientPageTransition>;
}