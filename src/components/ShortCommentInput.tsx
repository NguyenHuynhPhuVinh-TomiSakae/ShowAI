import React, { useState, useEffect, Suspense } from 'react';
import { FaCommentAlt, FaSpinner } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import useInputValidation from '../hooks/useInputValidation';
import ModalPortal from './ModalPortal';

interface ShortCommentInputProps {
    websiteId: string;
    user: any;
    className?: string;
    'data-button-id'?: string;
}

const ShortCommentInputContent: React.FC<ShortCommentInputProps> = ({ user, className, 'data-button-id': buttonId }) => {
    const searchParams = useSearchParams();
    const websiteId = searchParams.get('id');

    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAnimation] = useState(false);
    const [animationStyle] = useState({});
    const [animatedComment] = useState('');
    const [comments, setComments] = useState<string[]>([]);
    const [showAllComments, setShowAllComments] = useState(false);
    const [animatedComments, setAnimatedComments] = useState<{ text: string; style: React.CSSProperties }[]>([]);
    const { validateInput, isValidating } = useInputValidation();
    const [isCommentsLoaded, setIsCommentsLoaded] = useState(false);

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [websiteId]);

    const fetchComments = async () => {
        if (!websiteId) return;
        try {
            setIsCommentsLoaded(false); // Đặt trạng thái tải về false khi bắt đầu tải
            const response = await fetch(`/api/showai?id=${websiteId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    const website = data.data[0];
                    setComments(website.shortComments.map((comment: any) => comment.text));
                } else {
                    console.error('Không tìm thấy dữ liệu website');
                }
            } else {
                console.error('Lỗi khi lấy danh sách bình luận');
            }
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
        } finally {
            setIsCommentsLoaded(true); // Đặt trạng thái tải về true khi đã tải xong
        }
    };

    useEffect(() => {
        if (showAllComments) {
            const newAnimatedComments = comments.map(comment => {
                const speed = Math.random() * (15 - 5) + 5;
                const topPosition = Math.random() * (window.innerHeight - 50);
                const startPosition = window.innerWidth;

                return {
                    text: comment,
                    style: {
                        position: 'fixed',
                        top: `${topPosition}px`,
                        left: `${startPosition}px`,
                        whiteSpace: 'nowrap',
                        animation: `moveHorizontal ${speed}s linear forwards`,
                        zIndex: 9999,
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '16px',
                    },
                };
            });

            setAnimatedComments(newAnimatedComments as { text: string; style: React.CSSProperties }[]);

            const styleSheet = document.styleSheets[0];
            styleSheet.insertRule(`
                @keyframes moveHorizontal {
                    from { left: ${window.innerWidth}px; }
                    to { left: -300px; }
                }
            `, styleSheet.cssRules.length);

            const timer = setTimeout(() => {
                setShowAllComments(false);
                setAnimatedComments([]);
            }, 15000); // Đặt thời gian hiển thị tối đa là 15 giây

            return () => {
                clearTimeout(timer);
                for (let i = 0; i < styleSheet.cssRules.length; i++) {
                    const rule = styleSheet.cssRules[i];
                    if (rule instanceof CSSKeyframesRule && rule.name === 'moveHorizontal') {
                        styleSheet.deleteRule(i);
                        break;
                    }
                }
            };
        }
    }, [showAllComments, comments]);

    const addAnimatedComment = (commentText: string) => {
        const newAnimatedComment = {
            text: commentText,
            style: {
                position: 'fixed' as const,
                top: `${Math.random() * window.innerHeight}px`,
                left: `${window.innerWidth}px`,
                whiteSpace: 'nowrap' as const,
                animation: `moveHorizontal ${Math.random() * 10 + 5}s linear forwards`,
                zIndex: 9999,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '16px',
            },
        };
        setAnimatedComments(prevComments => [...prevComments, newAnimatedComment]);
    };

    const handleShowAllComments = () => {
        setError(''); // Xóa thông báo lỗi
        comments.forEach(comment => addAnimatedComment(comment));
    };

    useEffect(() => {
        const styleSheet = document.styleSheets[0];
        styleSheet.insertRule(`
            @keyframes moveHorizontal {
                from { left: ${window.innerWidth}px; }
                to { left: -300px; }
            }
        `, styleSheet.cssRules.length);

        return () => {
            for (let i = 0; i < styleSheet.cssRules.length; i++) {
                const rule = styleSheet.cssRules[i];
                if (rule instanceof CSSKeyframesRule && rule.name === 'moveHorizontal') {
                    styleSheet.deleteRule(i);
                    break;
                }
            }
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!websiteId) return;
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        if (comment.trim().split(/\s+/).length <= 20) {
            try {
                const isValid = await validateInput(comment, {
                    instruction: "Kiểm tra xem bình luận này có phù hợp với cộng đồng không. Chỉ trả lời true hoặc false.",
                    validResponse: "true",
                    invalidResponse: "false"
                });

                if (!isValid) {
                    setError('Bình luận không phù hợp với cộng đồng. Vui lòng thử lại.');
                    setIsLoading(false);
                    return;
                }

                const response = await fetch('/api/shortComments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        websiteId,
                        comment
                    }),
                });

                if (response.ok) {
                    setSuccessMessage('Bình luận đã được gửi thành công!');
                    addAnimatedComment(comment); // Thêm bình luận mới vào animation
                    setComment('');
                    fetchComments();
                } else {
                    const data = await response.json();
                    setError(`Lỗi: ${data.error}`);
                }
            } catch (error) {
                console.error('Lỗi khi gửi bình luận:', error);
                setError('Đã xảy ra lỗi khi gửi bình luận');
            } finally {
                setIsLoading(false);
            }
        } else {
            setError('Bình luận không được quá 20 từ!');
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="mb-4 mt-4">
                <p className="text-gray-400">Vui lòng đăng nhập để gửi bình luận nhanh.</p>
            </div>
        );
    }

    return (
        <div className={`mb-4 mt-4 ${className}`} data-button-id={buttonId}>
            <div className="flex items-center mb-2">
                <FaCommentAlt className="text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Bình luận ngắn</h3>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="flex items-center mb-2">
                    <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Nhập bình luận ngắn (tối đa 20 từ)..."
                        className="flex-grow mr-2 p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center w-20 h-10"
                        disabled={isLoading || isValidating}
                    >
                        {isLoading || isValidating ? (
                            <FaSpinner className="animate-spin text-2xl" />
                        ) : (
                            'Gửi'
                        )}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
                {showAnimation && (
                    <div style={animationStyle}>
                        {animatedComment}
                    </div>
                )}
                {isCommentsLoaded && comments.length > 0 && (
                    <div className="mt-4">
                        <button
                            onClick={handleShowAllComments}
                            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                            type="button"
                        >
                            Hiển thị tất cả bình luận
                        </button>
                    </div>
                )}
                <ModalPortal>
                    {animatedComments.map((comment, index) => (
                        <div key={`${index}-${comment.text}`} style={comment.style}>
                            {comment.text}
                        </div>
                    ))}
                </ModalPortal>
            </form>
        </div>
    );
};

const ShortCommentInput: React.FC<ShortCommentInputProps> = (props) => {
    return (
        <Suspense fallback={<div>Đang tải...</div>}>
            <ShortCommentInputContent {...props} />
        </Suspense>
    );
};

export default ShortCommentInput;
