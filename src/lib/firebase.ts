import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

let app: FirebaseApp;
let database: Database;

async function getFirebaseConfig() {
    const response = await fetch('/api/firebase-config');
    return response.json();
}

export async function initializeFirebase() {
    if (!app) {
        const firebaseConfig = await getFirebaseConfig();
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
    }
    return database;
}
