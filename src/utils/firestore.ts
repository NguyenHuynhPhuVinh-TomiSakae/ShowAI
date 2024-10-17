
import { useFirebase } from '@/components/FirebaseConfig';
import { updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';

export const useFirestoreOperations = () => {
    const { db } = useFirebase();

    const addUserToFirestore = async (userId: string, userData: any) => {
        if (!db) {
            console.error("Firestore database is not initialized");
            return;
        }
        try {
            await setDoc(doc(db, 'users', userId), {
                ...userData,
                createdAt: new Date()
            });
        } catch (error) {
            console.error("Error adding user to Firestore: ", error);
        }
    };

    const updateUserInFirestore = async (userId: string, userData: any) => {
        if (!db) {
            console.error("Firestore database is not initialized");
            return;
        }
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, userData);
        } catch (error) {
            console.error("Error updating user in Firestore: ", error);
        }
    };

    const getUserFromFirestore = async (userId: string) => {
        if (!db) {
            console.error("Firestore database is not initialized");
            return;
        }
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                return userSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting user from Firestore: ", error);
            return null;
        }
    };

    return {
        addUserToFirestore,
        updateUserInFirestore,
        getUserFromFirestore
    };
};
