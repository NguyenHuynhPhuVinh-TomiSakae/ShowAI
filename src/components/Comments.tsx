import React, { useState } from 'react';
import { FaEdit, FaTrash, FaReply } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useFirebase } from './FirebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';

interface Comment {
    id: string;
    uid: string;
    user: string;
    text: string;
    date: string;
    replies?: Comment[];
}

interface CommentsProps {
    websiteId: string;
    comments: Comment[];
    user: {
        uid: string;
        displayName?: string;
    } | null;
}

const Comments: React.FC<CommentsProps> = ({ websiteId, comments, user }) => {
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editedCommentText, setEditedCommentText] = useState('');
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const router = useRouter();
    const { db } = useFirebase();

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !db) {
            router.push('/login');
            return;
        }

        const newCommentObj = {
            id: Date.now().toString(),
            uid: user.uid,
            user: user.displayName || 'Anonymous',
            text: newComment,
            date: Timestamp.now().toDate().toISOString(),
        };

        try {
            const websiteRef = doc(db, 'websites', websiteId);
            await updateDoc(websiteRef, {
                comments: arrayUnion(newCommentObj)
            });

            // Update local state or trigger a refetch of comments
            // This depends on how you're managing state in the parent component

            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleEditComment = (commentId: string, text: string) => {
        setEditingCommentId(commentId);
        setEditedCommentText(text);
    };

    const handleSaveEdit = async (commentId: string) => {
        if (!db) return;

        try {
            const websiteRef = doc(db, 'websites', websiteId);
            const updatedComments = comments.map(comment =>
                comment.id === commentId ? { ...comment, text: editedCommentText } : comment
            );

            await updateDoc(websiteRef, { comments: updatedComments });

            // Update local state or trigger a refetch of comments

            setEditingCommentId(null);
            setEditedCommentText('');
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!db) return;

        try {
            const websiteRef = doc(db, 'websites', websiteId);
            await updateDoc(websiteRef, {
                comments: arrayRemove(comments.find(comment => comment.id === commentId))
            });

            // Update local state or trigger a refetch of comments

        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleReply = (commentId: string) => {
        setReplyingToId(commentId);
        setReplyText('');
    };

    const handleSubmitReply = async (parentCommentId: string) => {
        if (!user || !db) {
            router.push('/login');
            return;
        }

        const newReply = {
            id: Date.now().toString(),
            uid: user.uid,
            user: user.displayName || 'Anonymous',
            text: replyText,
            date: Timestamp.now().toDate().toISOString(),
        };

        try {
            const websiteRef = doc(db, 'websites', websiteId);
            const updatedComments = comments.map(comment =>
                comment.id === parentCommentId
                    ? { ...comment, replies: [...(comment.replies || []), newReply] }
                    : comment
            );

            await updateDoc(websiteRef, { comments: updatedComments });

            // Update local state or trigger a refetch of comments

            setReplyingToId(null);
            setReplyText('');
        } catch (error) {
            console.error('Error adding reply:', error);
        }
    };

    const renderComment = (comment: Comment, depth = 0) => (
        <div key={comment.id} className={`mt-4 ${depth > 0 ? 'ml-8' : ''}`}>
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
                {user && replyingToId !== comment.id && (
                    <button onClick={() => handleReply(comment.id)} className="text-blue-400 mt-2">
                        <FaReply className="inline mr-1" /> Trả lời
                    </button>
                )}
                {replyingToId === comment.id && (
                    <div className="mt-2">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full p-2 bg-gray-600 text-white rounded"
                            placeholder="Nhập trả lời của bạn..."
                        />
                        <button onClick={() => handleSubmitReply(comment.id)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                            Gửi trả lời
                        </button>
                    </div>
                )}
            </div>
            {comment.replies && comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
    );

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Bình luận</h3>
            {comments.map(comment => renderComment(comment))}
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
        </div>
    );
};

export default Comments;
