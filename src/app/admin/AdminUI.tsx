import React, { useState, useEffect } from 'react'
import WebsiteList from '@/components/WebsiteList'
import Image from 'next/image'
import DataAnalysis from '@/components/DataAnalysis'
import Modal from './Modal'; // Giả sử bạn đã có component Modal
import WebsiteDetails from '@/components/WebsiteDetails'
import '@fortawesome/fontawesome-free/css/all.min.css';
import { motion } from 'framer-motion';

interface DataItem {
    _id: string;
    id: string;
    name: string;
    description: string[];
    tags: string[];
    link: string;
    keyFeatures: string[];
    heart: number;
    star: number;
    view: number;
    image?: string;
    comments: any[];
    shortComments: any[];
    ratings: any[];
}

interface AdminUIProps {
    filteredData: DataItem[];
    formData: Partial<DataItem>;
    handleAdd: () => void;
    handleEdit: (item: DataItem) => void;
    handleDelete: (id: string, name: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    setSelectedTag: (tag: string) => void;
    setFormData: (data: Partial<DataItem>) => void;
}

export default function AdminUI({
    filteredData,
    formData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    setSelectedTag,
    setFormData
}: AdminUIProps) {
    const [activeTab, setActiveTab] = useState('list')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [filterTag, setFilterTag] = useState('')
    const itemsPerPage = 9
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
    const [confirmMessage, setConfirmMessage] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setFormData({
            name: '',
            description: [],
            tags: [],
            link: '',
            keyFeatures: [],
            image: ''
        });
        setIsPreviewMode(false);
    }

    useEffect(() => {
        if (activeTab === 'create') {
            handleAdd();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await handleSubmit(e);
            window.location.reload();
        } catch (error) {
            console.error('Lỗi khi submit form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async (id: string, name: string) => {
        showConfirmationModal(
            `Bạn có chắc chắn muốn xóa "${name}" không?`,
            async () => {
                await handleDelete(id, name);
                window.location.reload();
            }
        );
    };

    const filteredAndSearchedData = filteredData
        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.some(desc => desc.toLowerCase().includes(searchTerm.toLowerCase())))
        .filter(item => filterTag ? item.tags.includes(filterTag) : true);

    const pageCount = Math.ceil(filteredAndSearchedData.length / itemsPerPage);
    const paginatedData = filteredAndSearchedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderSearchAndFilter = () => (
        <div className="mb-6 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#1E293B]/50 
                              border border-gray-700/50 rounded-xl
                              focus:outline-none focus:ring-2 focus:ring-blue-500/50
                              text-white placeholder-gray-400
                              transition-all duration-200"
                />
            </div>
            <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-4 py-3 bg-[#1E293B]/50 
                          border border-gray-700/50 rounded-xl
                          focus:outline-none focus:ring-2 focus:ring-blue-500/50
                          text-white min-w-[150px]
                          transition-all duration-200"
            >
                <option value="">Tất cả tags</option>
                {Array.from(new Set(filteredData.flatMap(item => item.tags))).map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                ))}
            </select>
        </div>
    );

    const renderPagination = () => (
        <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-xl overflow-hidden shadow-lg bg-[#1E293B]/50 p-1">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`
                            mx-1 px-4 py-2 rounded-lg
                            transition-all duration-200
                            ${currentPage === page
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                            }
                        `}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'list':
                return (
                    <>
                        {renderSearchAndFilter()}
                        <WebsiteList
                            websites={paginatedData}
                            onTagClick={setSelectedTag}
                            isShuffled={true}
                        />
                        {renderPagination()}
                    </>
                )
            case 'create':
                return renderForm(false)
            case 'edit':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-[#93C5FD]">Chọn trang web để chỉnh sửa:</h3>
                        {renderSearchAndFilter()}
                        <ul className="space-y-2">
                            {paginatedData.map(item => (
                                <li key={item._id} className="flex justify-between items-center bg-[#1E293B] p-2 rounded">
                                    <span>{item.name}</span>
                                    <button
                                        onClick={() => {
                                            handleEdit(item)
                                            setActiveTab('editForm')
                                        }}
                                        className="bg-[#FBBF24] hover:bg-[#F59E0B] text-white font-bold py-1 px-3 rounded-full transition duration-300 ease-in-out"
                                    >
                                        Sửa
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {renderPagination()}
                    </div>
                )
            case 'editForm':
                return renderForm(true)
            case 'delete':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-[#93C5FD]">Chọn trang web để xóa:</h3>
                        {renderSearchAndFilter()}
                        <ul className="space-y-2">
                            {paginatedData.map(item => (
                                <li key={item._id} className="flex justify-between items-center bg-[#1E293B] p-2 rounded">
                                    <span>{item.name}</span>
                                    <button
                                        onClick={() => handleDeleteItem(item._id, item.name)}
                                        className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-1 px-3 rounded-full transition duration-300 ease-in-out"
                                    >
                                        Xóa
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {renderPagination()}
                    </div>
                )
            case 'analysis':
                return (
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-full lg:w-auto">
                            <DataAnalysis data={filteredData} />
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    const renderForm = (isEditing: boolean = false) => (
        <>
            {isPreviewMode ? (
                <div>
                    <WebsiteDetails
                        website={formData as DataItem}
                        isPinned={false}
                        onPinClick={() => { }}
                        onTagClick={() => { }}
                        isPreviewMode={true}
                    />
                    <div className="mt-4 flex justify-end space-x-4">
                        <button
                            onClick={() => setIsPreviewMode(false)}
                            className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                            disabled={isSubmitting}
                        >
                            Quay lại chỉnh sửa
                        </button>
                        <button
                            onClick={() => showConfirmationModal(
                                'Bạn có chắc chắn muốn lưu những thay đổi này không?',
                                () => handleFormSubmit(new Event('submit') as unknown as React.FormEvent)
                            )}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8 py-3 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            ) : (
                <motion.form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setIsPreviewMode(true);
                    }}
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="space-y-2">
                        <label className="block text-blue-300 text-sm font-semibold">
                            Tên trang web/công cụ AI <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name || ''}
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
                        {formData.description?.map((desc, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={desc}
                                    onChange={(e) => {
                                        const newDesc = [...(formData.description || [])];
                                        newDesc[index] = e.target.value;
                                        setFormData({ ...formData, description: newDesc });
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                                    placeholder="Nhập mô tả..."
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newDesc = formData.description?.filter((_, i) => i !== index);
                                        setFormData({ ...formData, description: newDesc });
                                    }}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setFormData({
                                ...formData,
                                description: [...(formData.description || []), '']
                            })}
                            className="mt-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i>
                            Thêm mô tả
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-blue-300 text-sm font-semibold">
                            Tags <span className="text-red-400">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(filteredData.flatMap(item => item.tags))).map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                        const newTags = formData.tags?.includes(tag)
                                            ? formData.tags.filter(t => t !== tag)
                                            : [...(formData.tags || []), tag];
                                        setFormData({ ...formData, tags: newTags });
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${formData.tags?.includes(tag)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                                        }`}
                                >
                                    {formData.tags?.includes(tag) ? (
                                        <span className="flex items-center gap-1">
                                            <i className="fas fa-check text-xs"></i>
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
                            value={formData.link || ''}
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
                        {formData.keyFeatures?.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => {
                                        const newFeatures = [...(formData.keyFeatures || [])];
                                        newFeatures[index] = e.target.value;
                                        setFormData({ ...formData, keyFeatures: newFeatures });
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-white"
                                    placeholder="Nhập tính năng..."
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newFeatures = formData.keyFeatures?.filter((_, i) => i !== index);
                                        setFormData({ ...formData, keyFeatures: newFeatures });
                                    }}
                                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setFormData({
                                ...formData,
                                keyFeatures: [...(formData.keyFeatures || []), '']
                            })}
                            className="mt-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i>
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
                                        <i className="fas fa-times text-white"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('list');
                                resetForm();
                            }}
                            className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                            disabled={isSubmitting}
                        >
                            {isEditing ? 'Hủy chỉnh sửa' : 'Hủy'}
                        </button>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8 py-3 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i>
                                    Đang xử lý...
                                </>
                            ) : (
                                'Xem trước'
                            )}
                        </button>
                    </div>
                </motion.form>
            )}
        </>
    )

    const showConfirmationModal = (message: string, action: () => void) => {
        setConfirmMessage(message);
        setConfirmAction(() => action);
        setShowConfirmModal(true);
    };

    const handleConfirm = () => {
        confirmAction();
        setShowConfirmModal(false);
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#1A2234] text-gray-400 hover:text-white"
            >
                <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>

            <div className={`
                fixed lg:static 
                w-64 h-screen
                bg-gradient-to-b from-[#1A2234]/95 to-[#2D3748]/95
                backdrop-blur-lg
                border-r border-gray-800/50
                transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                z-40
            `}>
                <div className="p-4 pt-16 lg:pt-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"></div>
                        <span className="text-gray-200 font-semibold">ShowAI Admin</span>
                    </div>
                </div>

                <div className="flex flex-col mt-6 space-y-2">
                    {[
                        { id: 'list', icon: 'fa-list', label: 'Danh sách' },
                        { id: 'create', icon: 'fa-plus', label: 'Tạo mới' },
                        { id: 'edit', icon: 'fa-edit', label: 'Chỉnh sửa' },
                        { id: 'delete', icon: 'fa-trash', label: 'Xóa' },
                        { id: 'analysis', icon: 'fa-chart-bar', label: 'Phân tích' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={`
                                w-full flex items-center px-4 py-3 
                                rounded-lg mx-2
                                transition-all duration-200
                                ${activeTab === item.id
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                }
                            `}
                        >
                            <i className={`fas ${item.icon} mr-3`}></i>
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <div className="flex-1 p-4 lg:p-6 ml-0 lg:ml-0 mt-16 lg:mt-0">
                {renderTabContent()}
            </div>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirm}
                message={confirmMessage}
            />
        </div>
    )
}
