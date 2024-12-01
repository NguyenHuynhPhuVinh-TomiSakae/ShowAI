'use client'

import { usePathname } from 'next/navigation'
import LoadingAnimation from './LoadingAnimation'

export default function ClientPathCheck() {
    const pathname = usePathname()
    const isHomePage = pathname === '/'

    if (!isHomePage) {
        return <LoadingAnimation />
    }

    return null
} 