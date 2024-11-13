/* eslint-disable @typescript-eslint/no-unused-vars */
import { initializeFirebase } from '@/lib/firebase';
import { ref, push, set, remove, update, onValue, off, getDatabase, get } from 'firebase/database';
import { useState, useEffect } from 'react';

export interface Character {
    id: string;
    name: string;
    personality: string;
    userId: string;
    userName: string;
    createdAt: number;
    updatedAt: number;
}

export function useCharacterActions(currentUserId: string | undefined, currentUserName: string) {
    const [characters, setCharacters] = useState<Character[]>([]);

    useEffect(() => {
        if (!currentUserId) return;

        const loadCharacters = async () => {
            await initializeFirebase();
            const database = getDatabase();
            const charactersRef = ref(database, 'characters');

            onValue(charactersRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const charactersList = Object.entries(data)
                        .map(([key, value]: [string, any]) => ({
                            id: key,
                            ...value
                        }))
                        .filter(char => char.userId === currentUserId);
                    setCharacters(charactersList);
                } else {
                    setCharacters([]);
                }
            });
        };

        loadCharacters();
        return () => {
            const database = getDatabase();
            const charactersRef = ref(database, 'characters');
            off(charactersRef);
        };
    }, [currentUserId]);

    const createCharacter = async (name: string, personality: string) => {
        if (!currentUserId || !name.trim()) return null;

        try {
            await initializeFirebase();
            const database = getDatabase();

            const profilesRef = ref(database, 'profiles');
            const profilesSnapshot = await get(profilesRef);
            const profiles = profilesSnapshot.val();

            if (profiles) {
                const duplicateProfiles = Object.values(profiles).filter(
                    (profile: any) => profile.name.toLowerCase() === name.trim().toLowerCase()
                );

                if (duplicateProfiles.length > 0) {
                    const duplicateNames = duplicateProfiles.map((profile: any) => profile.name).join(', ');
                    throw new Error(`Tên nhân vật "${name}" đã tồn tại (${duplicateNames}). Vui lòng chọn tên khác.`);
                }
            }

            const charactersRef = ref(database, 'characters');
            const newCharacterRef = push(charactersRef);
            const characterId = newCharacterRef.key;

            const characterData = {
                name: name.trim(),
                personality: personality.trim(),
                userId: currentUserId,
                userName: currentUserName,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            await set(newCharacterRef, characterData);

            const profileRef = ref(database, `profiles/${characterId}`);
            await set(profileRef, {
                id: characterId,
                name: name.trim(),
                createdAt: Date.now(),
                followCount: 0,
                followers: {}
            });

            return { id: characterId, ...characterData };
        } catch (error) {
            throw error;
        }
    };

    const updateCharacter = async (id: string, name: string, personality: string) => {
        if (!currentUserId) return null;

        try {
            await initializeFirebase();
            const database = getDatabase();

            // Kiểm tra trùng tên trong profiles
            const profilesRef = ref(database, 'profiles');
            const profilesSnapshot = await get(profilesRef);
            const profiles = profilesSnapshot.val();

            if (profiles) {
                const duplicateProfiles = Object.values(profiles)
                    .filter((profile: any) =>
                        profile.id !== id && // Bỏ qua profile hiện tại
                        profile.name.toLowerCase() === name.trim().toLowerCase()
                    );

                if (duplicateProfiles.length > 0) {
                    const duplicateNames = duplicateProfiles.map((profile: any) => profile.name).join(', ');
                    throw new Error(`Tên nhân vật "${name}" đã tồn tại (${duplicateNames}). Vui lòng chọn tên khác.`);
                }
            }

            // Cập nhật character
            const characterRef = ref(database, `characters/${id}`);
            const characterUpdates = {
                name: name.trim(),
                personality: personality.trim(),
                updatedAt: Date.now(),
            };
            await update(characterRef, characterUpdates);

            // Cập nhật profile
            const profileRef = ref(database, `profiles/${id}`);
            const profileUpdates = {
                name: name.trim(),
            };
            await update(profileRef, profileUpdates);

            return true;
        } catch (error) {
            throw error;
        }
    };

    const deleteCharacter = async (id: string) => {
        if (!currentUserId) return null;

        try {
            await initializeFirebase();
            const database = getDatabase();

            const characterRef = ref(database, `characters/${id}`);
            await remove(characterRef);

            const profileRef = ref(database, `profiles/${id}`);
            await remove(profileRef);

            return true;
        } catch (error) {
            throw error;
        }
    };

    return {
        characters,
        createCharacter,
        updateCharacter,
        deleteCharacter,
    };
}
