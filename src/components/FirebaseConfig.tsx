import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { useState, useEffect } from "react";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export const useFirebase = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeFirebase = async () => {
            if (!getApps().length) {
                const response = await fetch('/api/firebase-config');
                const config = await response.json();
                app = initializeApp(config);
                auth = getAuth(app);
                db = getFirestore(app);
            }
            setIsInitialized(true);
        };

        initializeFirebase();
    }, []);

    return { isInitialized, auth, db, app };
};
