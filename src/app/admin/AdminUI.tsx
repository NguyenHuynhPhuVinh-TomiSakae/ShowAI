import React, { useState, useEffect } from 'react'
import WebsiteList from '@/components/WebsiteList'
import Image from 'next/image'
import DataAnalysis from '@/components/DataAnalysis'

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
        window.location.reload(); // Reload trang sau khi gửi form
    };

    const handleDeleteItem = async (id: string, name: string) => {
        await handleDelete(id, name);
        window.location.reload(); // Reload trang sau khi xóa
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'list':
                return (
                    <WebsiteList
                        websites={filteredData}
                        onTagClick={setSelectedTag}
                        isShuffled={true}
                    />
                )
            case 'create':
                return renderForm(false)
            case 'edit':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-[#93C5FD]">Chọn trang web để chỉnh sửa:</h3>
                        <ul className="space-y-2">
                            {filteredData.map(item => (
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
                    </div>
                )
            case 'editForm':
                return renderForm(true)
            case 'delete':
                return (
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-[#93C5FD]">Chọn trang web để xóa:</h3>
                        <ul className="space-y-2">
                            {filteredData.map(item => (
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
                    </div>
                )
            case 'analysis':
                return <DataAnalysis data={filteredData} />
            default:
                return null
        }
    }

    const renderForm = (isEditing: boolean) => (
        <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
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
            {/* Thay đổi trường nhập liệu cho hình ảnh */}
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
                    {isEditing ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab('list');
                        resetForm();
                    }}
                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                >
                    Hủy
                </button>
            </div>
        </form>
    )

    return (
        <div className="container mx-auto p-4 bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex py-6">
            <div className="w-1/4 pr-4">
                <h1 className="text-3xl font-bold mb-6 text-[#93C5FD]">Quản lý dữ liệu</h1>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-4 py-2 text-left ${activeTab === 'list' ? 'bg-[#3B82F6] text-white' : 'bg-[#1E293B] text-[#93C5FD]'}`}
                    >
                        Danh sách
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-4 py-2 text-left ${activeTab === 'create' ? 'bg-[#3B82F6] text-white' : 'bg-[#1E293B] text-[#93C5FD]'}`}
                    >
                        Tạo mới
                    </button>
                    <button
                        onClick={() => setActiveTab('edit')}
                        className={`px-4 py-2 text-left ${activeTab === 'edit' || activeTab === 'editForm' ? 'bg-[#3B82F6] text-white' : 'bg-[#1E293B] text-[#93C5FD]'}`}
                    >
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={() => setActiveTab('delete')}
                        className={`px-4 py-2 text-left ${activeTab === 'delete' ? 'bg-[#3B82F6] text-white' : 'bg-[#1E293B] text-[#93C5FD]'}`}
                    >
                        Xóa
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`px-4 py-2 text-left ${activeTab === 'analysis' ? 'bg-[#3B82F6] text-white' : 'bg-[#1E293B] text-[#93C5FD]'}`}
                    >
                        Phân tích
                    </button>
                </div>
            </div>
            <div className="w-3/4">
                {renderTabContent()}
            </div>
        </div>
    )
}
