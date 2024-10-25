'use client'
import React, { useState, useEffect } from 'react';
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
    _id?: string;
    id?: string;
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
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    // Thêm useEffect để fetch tags từ API
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/showai');
                if (!response.ok) throw new Error('Không thể lấy danh sách tags');
                const data = await response.json();
                setAvailableTags(data.tags || []);
            } catch (error) {
                console.error('Lỗi khi lấy tags:', error);
            }
        };
        fetchTags();
    }, []);

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

        // Validation cho tất cả các trường
        if (!formData.name.trim()) {
            setErrorMessage('Vui lòng nhập tên trang web/công cụ AI');
            return;
        }

        if (formData.description.length === 0 || formData.description.some(desc => !desc.trim())) {
            setErrorMessage('Vui lòng nhập ít nhất một mô tả');
            return;
        }

        if (formData.tags.length === 0 || formData.tags.some(tag => !tag.trim())) {
            setErrorMessage('Vui lòng nhập ít nhất một tag');
            return;
        }

        if (!formData.link.trim()) {
            setErrorMessage('Vui lòng nhập liên kết');
            return;
        }

        if (formData.keyFeatures.length === 0 || formData.keyFeatures.some(feature => !feature.trim())) {
            setErrorMessage('Vui lòng nhập ít nhất một tính năng chính');
            return;
        }

        if (!formData.image) {
            setErrorMessage('Vui lòng tải lên hình ảnh');
            return;
        }

        if (!isPreviewMode) {
            setIsPreviewMode(true);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            if (!auth?.currentUser) {
                throw new Error('Vui lòng đăng nhập để đăng bài');
            }

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
                displayName: displayName,
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

    const handleAddField = (field: 'description' | 'tags' | 'keyFeatures') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const handleRemoveField = (field: 'description' | 'tags' | 'keyFeatures', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleFieldChange = (field: 'description' | 'tags' | 'keyFeatures', index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    // Thay đổi hàm xử lý chọn tag
    const handleTagToggle = (tag: string) => {
        setFormData(prev => {
            const newTags = prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag];
            return { ...prev, tags: newTags };
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full min-h-screen md:max-w-4xl mx-auto p-2 md:p-8"
        >
            <div className="bg-gray-800/90 backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-xl border border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-blue-300 text-center">
                    Chia sẻ công cụ AI mới
                </h2>

                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/80 backdrop-blur text-white p-4 mb-6 rounded-lg shadow flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                        </svg>
                        <p>{errorMessage}</p>
                    </motion.div>
                )}

                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/80 backdrop-blur text-white p-4 mb-6 rounded-lg shadow flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                        <p>{successMessage}</p>
                    </motion.div>
                )}

                {!isPreviewMode ? (
                    <motion.form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-blue-300 text-sm font-semibold">
                                Tên trang web/công cụ AI <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                                placeholder="Ví dụ: ChatGPT, Midjourney..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-blue-300 text-sm font-semibold">
                                Mô tả <span className="text-red-400">*</span>
                            </label>
                            {formData.description.map((desc, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={desc}
                                        onChange={(e) => handleFieldChange('description', index, e.target.value)}
                                        className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                                        placeholder="Nhập mô tả..."
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveField('description', index)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => handleAddField('description')}
                                className="mt-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Thêm mô tả
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-blue-300 text-sm font-semibold mb-3">
                                Tags <span className="text-red-400">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleTagToggle(tag)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${formData.tags?.includes(tag)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                            }`}
                                    >
                                        {formData.tags?.includes(tag) ? (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                {tag}
                                            </span>
                                        ) : (
                                            tag
                                        )}
                                    </button>
                                ))}
                            </div>
                            {(!formData.tags || formData.tags.length === 0) && (
                                <p className="text-red-400 text-sm mt-2">Vui lòng chọn ít nhất một tag</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-blue-300 text-sm font-semibold">
                                Liên kết <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="url"
                                value={formData.link}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (!value.startsWith('http://') && !value.startsWith('https://')) {
                                        value = 'https://' + value;
                                    }
                                    setFormData({ ...formData, link: value });
                                }}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                                placeholder="https://..."
                                defaultValue="https://"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-blue-300 text-sm font-semibold">
                                Tính năng chính <span className="text-red-400">*</span>
                            </label>
                            {formData.keyFeatures.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFieldChange('keyFeatures', index, e.target.value)}
                                        className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                                        placeholder="Nhập tính năng..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveField('keyFeatures', index)}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => handleAddField('keyFeatures')}
                                className="mt-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Thêm tính năng
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-blue-300 text-sm font-semibold">
                                Hình ảnh <span className="text-red-400">*</span>
                            </label>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
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
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                                />
                                {formData.image && (
                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                        <Image
                                            src={formData.image}
                                            alt="Preview"
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: '' })}
                                            className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 md:space-x-4 pt-4 md:pt-6">
                            <button
                                type="button"
                                onClick={() => setIsPreviewMode(false)}
                                className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base text-gray-300 hover:text-white transition-colors"
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 md:px-8 py-2 md:py-3 text-sm md:text-base rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xem trước'
                                )}
                            </button>
                        </div>
                    </motion.form>
                ) : (
                    <div className="space-y-6">
                        <WebsiteDetails
                            website={{
                                ...formData,
                                _id: formData._id || '',
                                id: formData.id || formData._id || ''
                            }}
                            isPinned={false}
                            onPinClick={() => { }}
                            onTagClick={() => { }}
                            isPreviewMode={true}
                        />
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setIsPreviewMode(false)}
                                className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                                disabled={isSubmitting}
                            >
                                Chỉnh sửa
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8 py-3 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Đăng bài'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PostSubmission;
