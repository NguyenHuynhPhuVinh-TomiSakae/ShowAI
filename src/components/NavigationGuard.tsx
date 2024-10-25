import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationGuardProps {
    isBlocked: boolean;
    message?: string;
}

export function NavigationGuard({ isBlocked, message = 'Dữ liệu đang tải. Bạn có chắc chắn muốn rời khỏi trang?' }: NavigationGuardProps) {
    const router = useRouter();

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isBlocked) {
                e.preventDefault();
                e.returnValue = message;
            }
        };

        const handlePushState = () => {
            if (isBlocked && !window.confirm(message)) {
                window.history.pushState(null, '', window.location.pathname);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePushState);

        // Patch router.push
        const originalPush = router.push;
        router.push = function (...args: Parameters<typeof router.push>) {
            if (isBlocked) {
                if (window.confirm(message)) {
                    return originalPush.apply(router, args);
                }
                return Promise.reject('Navigation cancelled');
            }
            return originalPush.apply(router, args);
        };

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePushState);
            router.push = originalPush;
        };
    }, [isBlocked, message, router]);

    return null;
}
