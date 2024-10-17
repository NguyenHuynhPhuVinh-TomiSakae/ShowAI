import React from 'react'
import ModalPortal from '@/components/ModalPortal'

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
    image?: string; // Thêm trường image
}

interface AdminUIProps {
    filteredData: DataItem[];
    viewMode: 'full' | 'compact';
    searchTerm: string;
    selectedTag: string;
    isFormOpen: boolean;
    isEditing: boolean;
    formData: Partial<DataItem>;
    handleAdd: () => void;
    handleEdit: (item: DataItem) => void;
    handleDelete: (id: string, name: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    setSearchTerm: (term: string) => void;
    setSelectedTag: (tag: string) => void;
    setViewMode: (mode: 'full' | 'compact') => void;
    setIsFormOpen: (isOpen: boolean) => void;
    setFormData: (data: Partial<DataItem>) => void;
}

export default function AdminUI({
    filteredData,
    viewMode,
    searchTerm,
    selectedTag,
    isFormOpen,
    isEditing,
    formData,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSubmit,
    setSearchTerm,
    setSelectedTag,
    setViewMode,
    setIsFormOpen,
    setFormData
}: AdminUIProps) {
    return (
        <div className="container mx-auto p-4 bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
            <h1 className="text-3xl font-bold mb-6 text-[#93C5FD]">Quản lý dữ liệu</h1>
            <div className="mb-6 flex flex-col sm:flex-row flex-wrap items-center gap-4 bg-[#1E293B] p-4 rounded-lg shadow-lg">
                <button
                    onClick={handleAdd}
                    className="w-full sm:w-auto bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
                >
                    Thêm mới
                </button>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc mô tả"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-[#4B5563] rounded-full bg-[#374151] text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                />
                <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-[#4B5563] rounded-full bg-[#374151] text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                    <option value="">Tất cả tags</option>
                    {Array.from(new Set(filteredData.flatMap(item => item.tags))).map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
                <button
                    onClick={() => setViewMode(viewMode === 'full' ? 'compact' : 'full')}
                    className="w-full sm:w-auto bg-[#4B5563] hover:bg-[#6B7280] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out shadow-md"
                >
                    {viewMode === 'full' ? 'Chế độ thu gọn' : 'Chế độ đầy đủ'}
                </button>
            </div>
            <div className={viewMode === 'full' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {filteredData.map((item) => (
                    viewMode === 'full' ? (
                        <div key={item._id} className="bg-[#1E293B] border border-[#3B82F6] p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-[#93C5FD]">{item.name}</h2>
                            <ul className="mb-4 list-disc list-inside space-y-2">
                                {item.description.map((desc, index) => (
                                    <li key={index} className="text-sm sm:text-base text-gray-300">{desc}</li>
                                ))}
                            </ul>
                            <div className="flex flex-wrap mb-4">
                                {item.tags.map((tag, index) => (
                                    <span key={index} className="bg-[#3B82F6] text-white rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold mr-2 mb-2">{tag}</span>
                                ))}
                            </div>
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[#60A5FA] hover:text-[#93C5FD] hover:underline mb-4 block transition duration-300 ease-in-out">
                                Liên kết
                            </a>
                            {item.keyFeatures && item.keyFeatures.length > 0 && (
                                <div className="mb-4">
                                    <strong className="text-base sm:text-lg text-[#93C5FD]">Tính năng chính:</strong>
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        {item.keyFeatures.map((feature, index) => (
                                            <li key={index} className="text-sm sm:text-base text-gray-300">{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="w-full sm:w-auto bg-[#FBBF24] hover:bg-[#F59E0B] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id, item.name)}
                                    className="w-full sm:w-auto bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div key={item._id} className="flex flex-col sm:flex-row justify-between items-center bg-[#1E293B] border border-[#3B82F6] p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out">
                            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0 text-[#93C5FD]">{item.name}</h2>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="w-full sm:w-auto bg-[#FBBF24] hover:bg-[#F59E0B] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(item._id, item.name)}
                                    className="w-full sm:w-auto bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    )
                ))}
            </div>
            {isFormOpen && (
                <ModalPortal>
                    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
                        <div className="bg-[#1E293B] p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl border border-[#3B82F6]">
                            <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-[#93C5FD]">
                                {isEditing ? 'Sửa dữ liệu' : 'Thêm dữ liệu mới'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                                {/* Thêm trường nhập liệu cho hình ảnh */}
                                <div>
                                    <label className="block text-[#93C5FD] text-sm font-bold mb-2" htmlFor="image">
                                        Link hình ảnh
                                    </label>
                                    <input
                                        type="url"
                                        id="image"
                                        value={formData.image || ''}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#2D3748] border border-[#4B5563] rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6] text-white transition duration-300 ease-in-out"
                                        placeholder="https://example.com/image.jpg"
                                    />
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
                                        onClick={() => setIsFormOpen(false)}
                                        className="w-full sm:w-auto bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    )
}
