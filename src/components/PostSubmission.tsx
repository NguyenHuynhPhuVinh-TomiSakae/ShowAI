'use client'
import React, { useState } from 'react';
import { useFirebase } from '@/components/FirebaseConfig';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { motion } from 'framer-motion';
import WebsiteDetails from '@/components/WebsiteDetails';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface FormData {
    name: string;
    description: string[];
    tags: string[];
    link: string;
    keyFeatures: string[];
    image?: string;
}

const PostSubmission = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: [],
        tags: [],
        link: '',
        keyFeatures: [],
        image: ''
    });
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { app, auth } = useFirebase();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const uploadImage = async (imageData: string, id: string): Promise<string> => {
        const storage = getStorage(app);
        const imageName = `user_submissions/${id}_${Date.now()}.jpg`;
        const storageRef = ref(storage, imageName);

        try {
            await uploadString(storageRef, imageData, 'data_url');
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Lỗi khi tải lên ảnh:', error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            if (!auth?.currentUser) {
                throw new Error('Vui lòng đăng nhập để đăng bài');
            }
            // Lấy displayName từ Firestore
            const db = getFirestore(app!);
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const userSnap = await getDoc(userRef);
            const displayName = userSnap.exists() ? userSnap.data().displayName : 'Người dùng ẩn danh';

            let imageUrl = formData.image;
            if (formData.image && formData.image.startsWith('data:image')) {
                const tempId = Date.now().toString();
                imageUrl = await uploadImage(formData.image, tempId);
            }

            const submissionData = {
                ...formData,
                image: imageUrl,
                userId: auth.currentUser.uid,
                displayName: displayName, // Sử dụng displayName từ Firestore
                status: 'pending',
                submittedAt: new Date().toISOString(),
            };

            const response = await fetch('/api/submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (!response.ok) {
                throw new Error('Không thể gửi bài đăng');
            }

            setSuccessMessage('Bài đăng của bạn đã được gửi và đang chờ phê duyệt');
            setFormData({
                name: '',
                description: [],
                tags: [],
                link: '',
                keyFeatures: [],
                image: ''
            });
            setIsPreviewMode(false);
        } catch (error) {
            console.error('Lỗi khi đăng bài:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đăng bài');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-6 rounded-lg shadow-md"
        >
            <h2 className="text-xl font-semibold mb-6 text-blue-300">Đăng bài mới</h2>

            {errorMessage && (
                <div className="bg-red-500 text-white p-4 mb-4 rounded">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-500 text-white p-4 mb-4 rounded">
                    {successMessage}
                </div>
            )}

            {isPreviewMode ? (
                <div className="space-y-6">
                    <WebsiteDetails
                        website={{
                            ...formData,
                            _id: '',
                            id: '',
                            heart: 0,
                            view: 0,
                            comments: [],
                        }}
                        isPinned={false}
                        onPinClick={() => { }}
                        onTagClick={() => { }}
                        isPreviewMode={true}
                    />
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => setIsPreviewMode(false)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded transition duration-300"
                        >
                            Quay lại chỉnh sửa
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi bài'}
                        </button>
                    </div>
                </div>
            ) : (
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setIsPreviewMode(true);
                    }}
                >
                    <div className="space-y-2">
                        <label className="block text-blue-300 text-sm font-bold">
                            Tên trang web/công cụ AI
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2">
                            Mô tả (mỗi dòng một mô tả)
                        </label>
                        <textarea
                            value={formData.description.join('\n')}
                            onChange={(e) => setFormData({
                                ...formData,
                                description: e.target.value.split('\n').filter(desc => desc.trim() !== '')
                            })}
                            className="w-full px-3 py-2 bg-[#1E293B] border border-[#3B82F6] rounded"
                            rows={5}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2">
                            Tags (phân cách bằng dấu phẩy)
                        </label>
                        <input
                            type="text"
                            value={formData.tags.join(', ')}
                            onChange={(e) => setFormData({
                                ...formData,
                                tags: e.target.value.split(',').map(tag => tag.trim())
                            })}
                            className="w-full px-3 py-2 bg-[#1E293B] border border-[#3B82F6] rounded"
                        />
                    </div>

                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2">
                            Liên kết
                        </label>
                        <input
                            type="url"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-3 py-2 bg-[#1E293B] border border-[#3B82F6] rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2">
                            Tính năng chính (mỗi dòng một tính năng)
                        </label>
                        <textarea
                            value={formData.keyFeatures.join('\n')}
                            onChange={(e) => setFormData({
                                ...formData,
                                keyFeatures: e.target.value.split('\n').filter(feature => feature.trim() !== '')
                            })}
                            className="w-full px-3 py-2 bg-[#1E293B] border border-[#3B82F6] rounded"
                            rows={5}
                        />
                    </div>

                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2">
                            Hình ảnh
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({
                                                ...formData,
                                                image: reader.result as string
                                            });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="w-full px-3 py-2 bg-[#1E293B] border border-[#3B82F6] rounded"
                            />
                            {formData.image && (
                                <div className="relative w-24 h-24">
                                    <Image
                                        src={formData.image}
                                        alt="Preview"
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-300"
                        >
                            Xem trước
                        </button>
                    </div>
                </motion.form>
            )}
        </motion.div>
    );
};

export default PostSubmission;
