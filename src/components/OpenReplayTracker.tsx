'use client';

import { useEffect, useState } from 'react';
import Tracker from '@openreplay/tracker';
import trackerAssist from '@openreplay/tracker-assist';
import { useFirebase } from '@/components/FirebaseConfig';

const OpenReplayTracker: React.FC = () => {
    const { auth } = useFirebase();
    const [tracker, setTracker] = useState<Tracker | null>(null);

    useEffect(() => {
        // Kiểm tra môi trường client
        if (typeof window === 'undefined') return;

        // Khởi tạo tracker
        const initTracker = async () => {
            try {
                const response = await fetch('/api/openreplay-config');
                const config = await response.json();

                const trackerInstance = new Tracker({
                    projectKey: config.projectKey,
                });

                trackerInstance.use(trackerAssist({
                    confirmText: "Bạn có muốn bắt đầu phiên hỗ trợ không?",
                }));

                setTracker(trackerInstance);
            } catch (error) {
                console.error('Failed to initialize OpenReplay:', error);
            }
        };

        initTracker();
    }, []);

    useEffect(() => {
        // Kiểm tra môi trường client và các dependencies
        if (typeof window === 'undefined' || !tracker || !auth) return;

        const unsubscribe = auth.onAuthStateChanged((user) => {
            tracker.start()
                .then(() => {
                    console.log('OpenReplay started successfully');
                    tracker.setUserID(user ? (user.email || user.uid) : 'anonymous');
                })
                .catch((error) => {
                    console.error('OpenReplay failed to start:', error);
                });
        });

        // Cleanup function
        return () => unsubscribe();
    }, [tracker, auth]);

    return null;
}

export default OpenReplayTracker;
