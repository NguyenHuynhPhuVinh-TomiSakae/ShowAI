'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useFirebase } from '@/components/FirebaseConfig';

// Dynamic import để đảm bảo các module chỉ được load ở client
const TrackerComponent = dynamic(() =>
    Promise.resolve().then(() => {
        const OpenReplayTracker: React.FC = () => {
            const { auth } = useFirebase();
            const [tracker, setTracker] = useState<any>(null);

            useEffect(() => {
                // Async import các module cần thiết
                const initTracker = async () => {
                    try {
                        const [TrackerModule, trackerAssistModule] = await Promise.all([
                            import('@openreplay/tracker'),
                            import('@openreplay/tracker-assist')
                        ]);

                        const response = await fetch('/api/openreplay-config');
                        const config = await response.json();

                        const trackerInstance = new TrackerModule.default({
                            projectKey: config.projectKey,
                        });

                        trackerInstance.use(trackerAssistModule.default({
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
                if (!tracker || !auth) return;

                auth.onAuthStateChanged((user) => {
                    tracker.start()
                        .then(() => {
                            console.log('OpenReplay started successfully');
                            tracker.setUserID(user ? (user.email || user.uid) : 'anonymous');
                        })
                        .catch((error: Error) => {
                            console.error('OpenReplay failed to start:', error);
                        });
                });
            }, [tracker, auth]);

            return null;
        }
        return OpenReplayTracker;
    }),
    { ssr: false }
);

export default TrackerComponent;
