import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaReply, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import useInputValidation from '@/hooks/useInputValidation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/components/FirebaseConfig';

interface Comment {
    id: string;
    uid: string;
    user: string;
    text: string;
    date: string;
    replies?: Comment[];
    parentId?: string;
    replyToId?: string;
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
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const router = useRouter();
    const { validateInput, isValidating } = useInputValidation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
    const { db } = useFirebase();

    useEffect(() => {
        setComments(initialComments || []);
        setIsLoading(false);
    }, [initialComments]);

    useEffect(() => {
        const fetchUserDisplayName = async () => {
            if (user && user.uid && db) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    if (userData && userData.displayName) {
                        setUserDisplayName(userData.displayName);
                    }
                }
            }
        };

        fetchUserDisplayName();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const validateContent = async (content: string): Promise<boolean> => {
        const isValid = await validateInput(content, {
            instruction: "Kiểm tra xem nội dung này có phù hợp và không chứa nội dung xúc phạm hay không. Chỉ trả lời true hoặc false.",
            validResponse: "true",
            invalidResponse: "false"
        });
        return isValid;
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        const isValid = await validateContent(newComment);

        if (!isValid) {
            setErrorMessage("Bình luận của bạn không phù hợp. Vui lòng kiểm tra lại nội dung.");
            setIsLoading(false);
            return;
        }

        const newCommentObj = {
            id: Date.now().toString(),
            uid: user.uid,
            user: userDisplayName || 'Anonymous',
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveEdit = async (commentId: string) => {
        setIsLoading(true);
        setErrorMessage(null);
        const isValid = await validateContent(editedCommentText);

        if (!isValid) {
            setErrorMessage("Nội dung chỉnh sửa của bạn không phù hợp. Vui lòng kiểm tra lại.");
            setIsLoading(false);
            return;
        }

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
        } finally {
            setIsLoading(false);
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

    const handleReplySubmit = async (parentId: string, replyToId?: string) => {
        if (!user) {
            router.push('/login');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        const isValid = await validateContent(replyText);

        if (!isValid) {
            setErrorMessage("Câu trả lời của bạn không phù hợp. Vui lòng kiểm tra lại nội dung.");
            setIsLoading(false);
            return;
        }

        const newReply = {
            id: Date.now().toString(),
            uid: user.uid,
            user: userDisplayName || 'Anonymous',
            text: replyText,
            date: new Date().toISOString(),
            parentId: parentId,
            replyToId: replyToId,
        };

        // Cập nhật state ngay lập tức
        setComments(prevComments => addReplyToComments(prevComments, parentId, replyToId, newReply));
        setReplyText('');
        setReplyingTo(null);

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ websiteId, comment: newReply }),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi thêm trả lời');
            }
        } catch (error) {
            console.error('Lỗi khi thêm trả lời:', error);
            // Có thể thêm logic để hoàn tác thay đổi nếu API gặp lỗi
        } finally {
            setIsLoading(false);
        }
    };

    const addReplyToComments = (comments: Comment[], parentId: string, replyToId: string | undefined, newReply: Comment): Comment[] => {
        return comments.map(comment => {
            if (comment.id === parentId) {
                if (replyToId) {
                    // Nếu có replyToId, tìm và thêm vào replies của reply đó
                    return {
                        ...comment,
                        replies: comment.replies?.map(reply =>
                            reply.id === replyToId
                                ? { ...reply, replies: [...(reply.replies || []), newReply] }
                                : reply
                        ) || [],
                    };
                } else {
                    // Nếu không có replyToId, thêm vào replies của comment cha
                    return {
                        ...comment,
                        replies: [...(comment.replies || []), newReply],
                    };
                }
            } else if (comment.replies) {
                return {
                    ...comment,
                    replies: addReplyToComments(comment.replies, parentId, replyToId, newReply),
                };
            }
            return comment;
        });
    };

    const handleDeleteReply = async (parentId: string, replyId: string) => {
        // Cập nhật state ngay lập tức
        setComments(prevComments => prevComments.map(comment => {
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: comment.replies?.filter(reply => reply.id !== replyId)
                };
            }
            return comment;
        }));

        try {
            const response = await fetch('/api/comments', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ websiteId, parentId, replyId }),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi xóa câu trả lời');
            }
        } catch (error) {
            console.error('Lỗi khi xóa câu trả lời:', error);
            // Có thể thêm logic để hoàn tác thay đổi nếu API gặp lỗi
        }
    };

    const handleEditReply = async (parentId: string, replyId: string, newText: string) => {
        setIsLoading(true);
        setErrorMessage(null);
        const isValid = await validateContent(newText);

        if (!isValid) {
            setErrorMessage("Nội dung chỉnh sửa của bạn không phù hợp. Vui lòng kiểm tra lại.");
            setIsLoading(false);
            return;
        }

        // Cập nhật state ngay lập tức
        setComments(prevComments => prevComments.map(comment => {
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: comment.replies?.map(reply =>
                        reply.id === replyId ? { ...reply, text: newText } : reply
                    )
                };
            }
            return comment;
        }));
        setEditingCommentId(null);
        setEditedCommentText('');

        try {
            const response = await fetch('/api/comments', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ websiteId, parentId, replyId, text: newText }),
            });

            if (!response.ok) {
                throw new Error('Lỗi khi chỉnh sửa câu trả lời');
            }
        } catch (error) {
            console.error('Lỗi khi chỉnh sửa câu trả lời:', error);
            // Có thể thêm logic để hoàn tác thay đổi nếu API gặp lỗi
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyText('');
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditedCommentText('');
    };

    const handleEditComment = (commentId: string, commentText: string) => {
        setEditingCommentId(commentId);
        setEditedCommentText(commentText);
    };

    const renderCommentWithReplies = (comment: Comment) => (
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
                    <div>
                        <textarea
                            value={editedCommentText}
                            onChange={(e) => setEditedCommentText(e.target.value)}
                            className="w-full p-2 bg-gray-600 text-white rounded mt-2"
                        />
                        {errorMessage && (
                            <p className="text-red-500 mt-2">{errorMessage}</p>
                        )}
                        <div className="mt-2 flex space-x-2">
                            <button
                                onClick={() => handleSaveEdit(comment.id)}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                disabled={isValidating || isLoading}
                            >
                                {isValidating ? 'Đang kiểm tra...' : isLoading ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded">
                                Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-300 mt-2">{comment.text}</p>
                )}
                {user && (
                    <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-blue-400 mt-2"
                    >
                        <FaReply className="inline mr-2" /> Trả lời
                    </button>
                )}
                {replyingTo === comment.id && (
                    <div className="mt-2">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full p-2 bg-gray-600 text-white rounded"
                            placeholder="Nhập câu trả lời của bạn..."
                        />
                        {errorMessage && (
                            <p className="text-red-500 mt-2">{errorMessage}</p>
                        )}
                        <div className="mt-2 flex space-x-2">
                            <button
                                onClick={() => handleReplySubmit(comment.id)}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                                disabled={isValidating || isLoading}
                            >
                                {isValidating ? 'Đang kiểm tra...' : isLoading ? 'Đang gửi...' : 'Gửi trả lời'}
                            </button>
                            <button
                                onClick={handleCancelReply}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {comment.replies && comment.replies.map(reply => (
                <div key={reply.id} className="ml-8 mt-2">
                    <div className="bg-gray-700 p-4 rounded">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="font-bold text-blue-300">{reply.user}</span>
                                <span className="text-gray-400 ml-2 text-sm">{new Date(reply.date).toLocaleString()}</span>
                            </div>
                            {user && user.uid === reply.uid && (
                                <div>
                                    <button onClick={() => handleEditComment(reply.id, reply.text)} className="text-blue-400 mr-2">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDeleteReply(comment.id, reply.id)} className="text-red-400">
                                        <FaTrash />
                                    </button>
                                </div>
                            )}
                        </div>
                        {editingCommentId === reply.id ? (
                            <div>
                                <textarea
                                    value={editedCommentText}
                                    onChange={(e) => setEditedCommentText(e.target.value)}
                                    className="w-full p-2 bg-gray-600 text-white rounded mt-2"
                                />
                                {errorMessage && (
                                    <p className="text-red-500 mt-2">{errorMessage}</p>
                                )}
                                <div className="mt-2 flex space-x-2">
                                    <button
                                        onClick={() => handleEditReply(comment.id, reply.id, editedCommentText)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                        disabled={isValidating || isLoading}
                                    >
                                        {isValidating ? 'Đang kiểm tra...' : isLoading ? 'Đang lưu...' : 'Lưu'}
                                    </button>
                                    <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded">
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-300 mt-2">{reply.text}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Bình luận</h3>
            {isLoading ? (
                <p className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Đang kiểm tra bình luận...
                </p>
            ) : (
                <>
                    {errorMessage && (
                        <p className="text-red-500 mb-2">{errorMessage}</p>
                    )}
                    {comments.length > 0 ? (
                        comments.map(comment => renderCommentWithReplies(comment))
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
                            <button
                                type="submit"
                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                                disabled={isValidating || isLoading}
                            >
                                {isValidating ? 'Đang kiểm tra...' : isLoading ? 'Đang gửi...' : 'Gửi'}
                            </button>
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