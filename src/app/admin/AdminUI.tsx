import React, { useState, useEffect } from 'react'
import WebsiteList from '@/components/WebsiteList'
import Image from 'next/image'
import DataAnalysis from '@/components/DataAnalysis'
import Modal from './Modal'; // Giả sử bạn đã có component Modal
import WebsiteDetails from '@/components/WebsiteDetails'
import '@fortawesome/fontawesome-free/css/all.min.css';

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

    const resetForm = () => {
        setFormData({
            name: '',
            description: [],
            tags: [],
            link: '',
            keyFeatures: [],
            image: ''
        });
    }

    useEffect(() => {
        if (activeTab === 'create') {
            handleAdd();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmit(e);
        window.location.reload();
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
        <div className="mb-4 flex flex-wrap gap-4">
            <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 bg-[#2D3748] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white"
            />
            <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-3 py-2 bg-[#2D3748] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white"
            >
                <option value="">Tất cả tags</option>
                {Array.from(new Set(filteredData.flatMap(item => item.tags))).map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                ))}
            </select>
        </div>
    );

    const renderPagination = () => (
        <div className="mt-4 flex justify-center">
            {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`mx-1 px-3 py-1 rounded ${currentPage === page ? 'bg-[#3B82F6] text-white' : 'bg-[#2D3748] text-[#93C5FD]'}`}
                >
                    {page}
                </button>
            ))}
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
                    />
                    <div className="mt-4 flex justify-end space-x-4">
                        <button
                            onClick={() => setIsPreviewMode(false)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                        >
                            Quay lại chỉnh sửa
                        </button>
                        <button
                            onClick={() => showConfirmationModal(
                                'Bạn có chắc chắn muốn lưu những thay đổi này không?',
                                () => handleFormSubmit(new Event('submit') as unknown as React.FormEvent)
                            )}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    setIsPreviewMode(true);
                }} className="space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2" htmlFor="name">
                            Tên
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-[#2D3748] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white transition duration-300 ease-in-out"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2" htmlFor="description">
                            Mô tả (mỗi dòng một mô tả)
                        </label>
                        <textarea
                            id="description"
                            value={formData.description ? formData.description.join('\n') : ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value.split('\n').filter(desc => desc.trim() !== '') })}
                            className="w-full px-3 py-2 bg-[#2D3748] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white transition duration-300 ease-in-out"
                            rows={5}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2" htmlFor="tags">
                            Tags (phân cách bằng dấu phẩy)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            value={formData.tags ? formData.tags.join(', ') : ''}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                            className="w-full px-3 py-2 bg-[#2D3748] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white transition duration-300 ease-in-out"
                        />
                    </div>
                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2" htmlFor="link">
                            Liên kết
                        </label>
                        <input
                            type="url"
                            id="link"
                            value={formData.link || ''}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-3 py-2 bg-[#2D3748] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white transition duration-300 ease-in-out"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2" htmlFor="keyFeatures">
                            Tính năng chính (mỗi dòng một tính năng, để trống nếu không có)
                        </label>
                        <textarea
                            id="keyFeatures"
                            value={formData.keyFeatures ? formData.keyFeatures.join('\n') : ''}
                            onChange={(e) => {
                                const features = e.target.value.split('\n').filter(feature => feature.trim() !== '');
                                setFormData({ ...formData, keyFeatures: features });
                            }}
                            className="w-full px-3 py-2 bg-[#2D3748] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white transition duration-300 ease-in-out"
                            rows={5}
                        />
                    </div>
                    <div>
                        <label className="block text-[#93C5FD] text-sm font-bold mb-2" htmlFor="image">
                            Hình ảnh
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData({ ...formData, image: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="w-full px-3 py-2 bg-[#2D3748] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white transition duration-300 ease-in-out"
                            />
                            {formData.image && (
                                <div className="relative w-24 h-24">
                                    <Image
                                        src={formData.image}
                                        alt="Xem trước"
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-md"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Xem trước
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab('list');
                                resetForm();
                            }}
                            className="w-full sm:w-auto bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            {isEditing ? 'Hủy chỉnh sửa' : 'Hủy'}
                        </button>
                    </div>
                </form>
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
                w-64 bg-[#1A2234] h-screen
                transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                z-40
            `}>
                <div className="p-4 pt-16 lg:pt-4">
                    <span className="text-gray-400 text-sm font-medium">Trang Quản Trị ShowAI</span>
                </div>

                <div className="flex flex-col">
                    <button
                        onClick={() => {
                            setActiveTab('list');
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-2 text-sm ${activeTab === 'list'
                            ? 'text-white bg-[#3B82F6]'
                            : 'text-gray-400 hover:bg-[#242B3D] hover:text-gray-200'
                            }`}
                    >
                        <i className="fas fa-list mr-3"></i>
                        Danh sách
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('create');
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-2 text-sm ${activeTab === 'create'
                            ? 'text-white bg-[#3B82F6]'
                            : 'text-gray-400 hover:bg-[#242B3D] hover:text-gray-200'
                            }`}
                    >
                        <i className="fas fa-plus mr-3"></i>
                        Tạo mới
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('edit');
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-2 text-sm ${activeTab === 'edit' || activeTab === 'editForm'
                            ? 'text-white bg-[#3B82F6]'
                            : 'text-gray-400 hover:bg-[#242B3D] hover:text-gray-200'
                            }`}
                    >
                        <i className="fas fa-edit mr-3"></i>
                        Chỉnh sửa
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('delete');
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-2 text-sm ${activeTab === 'delete'
                            ? 'text-white bg-[#3B82F6]'
                            : 'text-gray-400 hover:bg-[#242B3D] hover:text-gray-200'
                            }`}
                    >
                        <i className="fas fa-trash mr-3"></i>
                        Xóa
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab('analysis');
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-2 text-sm ${activeTab === 'analysis'
                            ? 'text-white bg-[#3B82F6]'
                            : 'text-gray-400 hover:bg-[#242B3D] hover:text-gray-200'
                            }`}
                    >
                        <i className="fas fa-chart-bar mr-3"></i>
                        Phân tích
                    </button>
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
