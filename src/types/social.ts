export interface Post {
    id: string;
    content: string;
    hashtags: string[];
    characterName: string;
    timestamp: number;
    likes: number;
    likedBy?: Record<string, boolean>;
    userId: string;
    comments?: {
        [key: string]: Comment
    };
    isEditing?: boolean;
    characterId?: string;
}

export interface Comment {
    content: string;
    characterName: string;
    timestamp: number;
    userId: string;
    characterId?: string;
}
