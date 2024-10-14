import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Comment {
    id: string;
    uid: string;
    user: string;
    text: string;
    date: string;
}

interface CommentsProps {
    websiteId: string;
    comments: Comment[];
    user: {
        uid: string;
        displayName?: string;
    } | null;
}

const Comments: React.FC<CommentsProps> = ({ websiteId, comments: initialComments, user }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedCommentText, setEditedCommentText] = useState('');
    const router = useRouter();

    useEffect(() => {
        setComments(initialComments || []);
        setIsLoading(false);
    }, [initialComments]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push('/login');
            return;
        }

        const newCommentObj = {
            id: Date.now().toString(),
            uid: user.uid,
            user: user.displayName || 'Anonymous',
            text: newComment,
            date: new Date().toISOString(),
        };

        // Cập nhật state ngay lập tức
        setComments(prevComments => [newCommentObj, ...(prevComments || [])]);
        setNewComment('');

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ websiteId, comment: newCommentObj }),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi thêm bình luận');
            }
        } catch (error) {
            console.error('Lỗi khi thêm bình luận:', error);
            // Có thể thêm logic để hoàn tác thay đổi nếu API gặp lỗi
        }
    };

    const handleEditComment = (commentId: string, text: string) => {
        setEditingCommentId(commentId);
        setEditedCommentText(text);
    };

    const handleSaveEdit = async (commentId: string) => {
        // Cập nhật state ngay lập tức
        setComments(prevComments => prevComments.map(comment =>
            comment.id === commentId ? { ...comment, text: editedCommentText } : comment
        ));
        setEditingCommentId(null);
        setEditedCommentText('');

        try {
            const response = await fetch('/api/comments', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ websiteId, commentId, text: editedCommentText }),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi chỉnh sửa bình luận');
            }
        } catch (error) {
            console.error('Lỗi khi chỉnh sửa bình luận:', error);
            // Có thể thêm logic để hoàn tác thay đổi nếu API gặp lỗi
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        // Cập nhật state ngay lập tức
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));

        try {
            const response = await fetch('/api/comments', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ websiteId, commentId }),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi xóa bình luận');
            }
        } catch (error) {
            console.error('Lỗi khi xóa bình luận:', error);
            // Có thể thêm logic để hoàn tác thay đổi nếu API gặp lỗi
        }
    };

    const renderComment = (comment: Comment) => (
        <div key={comment.id} className="mt-4">
            <div className="bg-gray-700 p-4 rounded">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="font-bold text-blue-300">{comment.user}</span>
                        <span className="text-gray-400 ml-2 text-sm">{new Date(comment.date).toLocaleString()}</span>
                    </div>
                    {user && user.uid === comment.uid && (
                        <div>
                            <button onClick={() => handleEditComment(comment.id, comment.text)} className="text-blue-400 mr-2">
                                <FaEdit />
                            </button>
                            <button onClick={() => handleDeleteComment(comment.id)} className="text-red-400">
                                <FaTrash />
                            </button>
                        </div>
                    )}
                </div>
                {editingCommentId === comment.id ? (
                    <div className="mt-2">
                        <textarea
                            value={editedCommentText}
                            onChange={(e) => setEditedCommentText(e.target.value)}
                            className="w-full p-2 bg-gray-600 text-white rounded"
                        />
                        <button onClick={() => handleSaveEdit(comment.id)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                            Lưu
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-300 mt-2">{comment.text}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Bình luận</h3>
            {isLoading ? (
                <p>Đang tải bình luận...</p>
            ) : (
                <>
                    {comments.length > 0 ? (
                        comments.map(comment => renderComment(comment))
                    ) : (
                        <p className="text-gray-400">Chưa có bình luận nào.</p>
                    )}
                    {user ? (
                        <form onSubmit={handleCommentSubmit} className="mt-4">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full p-2 bg-gray-700 text-white rounded"
                                placeholder="Thêm bình luận của bạn..."
                            />
                            <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Gửi</button>
                        </form>
                    ) : (
                        <p className="text-gray-400 mt-4">Đăng nhập để bình luận</p>
                    )}
                </>
            )}
        </div>
    );
};

export default Comments;
