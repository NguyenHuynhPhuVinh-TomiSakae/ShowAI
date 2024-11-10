import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useFirebase } from '@/components/FirebaseConfig';
import { Post } from '@/types/social';
import { useRouter } from 'next/navigation';

interface PostCardProps {
    post: Post;
    onComment: (postId: string, comment: string) => Promise<void>;
    onLike: (postId: string, currentLikes: number, likedBy?: Record<string, boolean>) => Promise<void>;
    onEdit: (postId: string, newContent: string, newHashtags: string) => Promise<void>;
    onDelete: (postId: string) => Promise<void>;
    currentUserId?: string;
    toggleEditing: (postId: string, isEditing: boolean) => void;
    onEditComment: (postId: string, commentId: string, newContent: string) => Promise<void>;
    onDeleteComment: (postId: string, commentId: string) => Promise<void>;
    isSocialPage?: boolean;
}

export function PostCard({
    post,
    onComment,
    onLike,
    onEdit,
    onDelete,
    currentUserId,
    toggleEditing,
    onEditComment,
    onDeleteComment,
    isSocialPage
}: PostCardProps) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const { auth } = useFirebase();
    const isAuthenticated = auth?.currentUser != null;
    const comments = post.comments ? Object.entries(post.comments) : [];
    const [editContent, setEditContent] = useState(post.content);
    const [editHashtags, setEditHashtags] = useState(post.hashtags.join(', '));
    const isOwner = currentUserId === post.userId;
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    const router = useRouter();

    const handleNameClick = (characterId?: string) => {
        if (characterId !== undefined && characterId !== null) {
            router.push(`/character/${characterId}`);
        }
    };

    const handleHashtagClick = (tag: string) => {
        router.push(`/hashtag/${encodeURIComponent(tag)}`);
    };

    return (
        <div className="bg-[#1E293B] rounded-lg p-6 mb-4 shadow-lg border border-[#2A3284] hover:border-[#3E52E8] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="text-white">
                    <h3
                        onClick={() => handleNameClick(post.characterId)}
                        className="font-semibold text-blue-300 cursor-pointer hover:text-blue-400 transition-colors"
                    >
                        {post.characterName}
                    </h3>
                    <p className="text-sm text-gray-400">
                        {new Date(post.timestamp).toLocaleDateString('vi-VN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                {isOwner && !isSocialPage && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (post.isEditing) {
                                    onEdit(post.id, editContent, editHashtags);
                                    toggleEditing(post.id, false);
                                } else {
                                    toggleEditing(post.id, true);
                                }
                            }}
                            className="text-blue-400 hover:text-blue-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onDelete(post.id)}
                            className="text-red-400 hover:text-red-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {post.isEditing ? (
                <div className="mb-4">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-[#0F172A] text-white rounded-lg p-3 mb-2
                                 focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                        rows={4}
                        placeholder="Nội dung bài viết..."
                    />
                    <input
                        type="text"
                        value={editHashtags}
                        onChange={(e) => setEditHashtags(e.target.value)}
                        placeholder="Hashtags (phân cách bằng dấu phẩy)"
                        className="w-full bg-[#0F172A] text-white rounded-lg p-3
                                 focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                    />
                </div>
            ) : (
                <>
                    <p className="text-white mb-4 whitespace-pre-wrap">{post.content}</p>
                    {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.hashtags.map((tag, index) => (
                                <span
                                    key={index}
                                    onClick={() => handleHashtagClick(tag)}
                                    className="bg-[#3E52E8] hover:bg-[#2E42D8] text-sm text-white px-2 py-1 rounded-full transition-colors cursor-pointer"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </>
            )}

            <div className="flex items-center text-gray-400 space-x-4">
                <button
                    onClick={() => isAuthenticated ? onLike(post.id, post.likes, post.likedBy) : undefined}
                    className={`flex items-center space-x-1 ${isAuthenticated ? 'hover:text-blue-300' : 'cursor-not-allowed'} transition`}
                    disabled={!isAuthenticated}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${post.likedBy?.[currentUserId || ''] ? 'text-blue-400' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                    <span>{post.likes}</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-1 hover:text-blue-300 transition"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${showComments ? 'text-blue-400' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                    <span>{comments.length}</span>
                </button>
            </div>

            {showComments && (
                <>
                    {isAuthenticated && (
                        <div className="mt-4 border-t border-gray-700 pt-4">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                onComment(post.id, commentText);
                                setCommentText('');
                            }}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Thêm bình luận..."
                                        className="w-full bg-[#0F172A] text-white pl-4 pr-24 py-2.5 rounded-lg
                                                  focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim()}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2
                                                 rounded-lg h-8 w-8 bg-[#3E52E8] hover:bg-[#4B5EFF] 
                                                 text-white flex items-center justify-center
                                                 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {comments.length > 0 ? (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            {comments.map(([commentId, comment]) => (
                                <div key={commentId} className="mb-3 last:mb-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center">
                                            <span
                                                onClick={() => handleNameClick(comment.characterId)}
                                                className="text-blue-300 text-sm font-medium cursor-pointer hover:text-blue-400 transition-colors"
                                            >
                                                {comment.characterName}
                                            </span>
                                            <span className="text-gray-500 text-xs ml-2">
                                                {new Date(comment.timestamp).toLocaleDateString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        {currentUserId === comment.userId && isAuthenticated && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (editingCommentId === commentId) {
                                                            onEditComment(post.id, commentId, editCommentContent);
                                                            setEditingCommentId(null);
                                                        } else {
                                                            setEditingCommentId(commentId);
                                                            setEditCommentContent(comment.content);
                                                        }
                                                    }}
                                                    className="text-blue-400 hover:text-blue-300"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
                                                            onDeleteComment(post.id, commentId);
                                                        }
                                                    }}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {editingCommentId === commentId ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editCommentContent}
                                                onChange={(e) => setEditCommentContent(e.target.value)}
                                                className="flex-1 bg-[#0F172A] text-white rounded-lg px-3 py-1
                                                 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                            />
                                            <button
                                                onClick={() => setEditingCommentId(null)}
                                                className="text-gray-400 hover:text-gray-300 text-sm"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-gray-300 text-sm">{comment.content}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 pt-4 border-t border-gray-700 text-center text-gray-400">
                            <p>Chưa có bình luận nào</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
