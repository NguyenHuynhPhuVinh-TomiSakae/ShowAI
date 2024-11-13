'use client';

import { useState } from 'react';
import { useFirebase } from '@/components/FirebaseConfig';
import { useCharacterActions, Character } from '@/hooks/useCharacterActions';
import { toast, Toaster } from 'react-hot-toast';
import SocialNav from '@/components/social/SocialNav';
import ModalPortal from '@/components/ModalPortal';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AccountPage() {
    const [characterName, setCharacterName] = useState('');
    const [personality, setPersonality] = useState('');
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editPersonality, setEditPersonality] = useState('');

    const { auth } = useFirebase();
    const currentUserId = auth?.currentUser?.uid;
    const currentUserName = auth?.currentUser?.displayName || 'Người dùng ẩn danh';

    const { characters, createCharacter, updateCharacter, deleteCharacter } = useCharacterActions(currentUserId, currentUserName);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!characterName.trim()) return;

        try {
            let result;
            if (editingCharacter) {
                result = await updateCharacter(editingCharacter.id, characterName, personality);
                if (result) {
                    toast.success('Cập nhật nhân vật thành công!');
                    setEditingCharacter(null);
                }
            } else {
                result = await createCharacter(characterName, personality);
                if (result) {
                    toast.success('Tạo nhân vật thành công!');
                }
            }

            if (result) {
                setCharacterName('');
                setPersonality('');
            }
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra khi tạo nhân vật');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc muốn xóa nhân vật này?')) {
            try {
                const result = await deleteCharacter(id);
                if (result) {
                    toast.success('Xóa nhân vật thành công!');
                }
            } catch (error: any) {
                toast.error(error.message || 'Có lỗi xảy ra khi xóa nhân vật');
            }
        }
    };

    if (!currentUserId) {
        return (
            <div className="min-h-screen bg-[#0F172A]">
                <div className="bg-[#2A3284] text-center py-8 px-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Tài khoản
                    </h1>
                </div>
                <SocialNav />
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="text-center text-gray-400 bg-[#1E293B] rounded-lg p-8 border border-[#2A3284]">
                        <p className="text-lg font-medium">Vui lòng đăng nhập để tạo nhân vật</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A]">
            <ModalPortal>
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1E293B',
                            color: '#fff',
                        },
                        success: {
                            iconTheme: {
                                primary: '#4ECCA3',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#EF4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </ModalPortal>
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {currentUserName}
                </h1>
                <p className="text-base sm:text-lg text-gray-200">
                    Quản lý nhân vật của bạn
                </p>
            </div>

            <SocialNav />

            <div className="max-w-2xl mx-auto px-4 pb-8">
                <form onSubmit={handleSubmit} className="bg-[#1E293B] rounded-xl p-6 border border-[#2A3284] mb-6">
                    <h2 className="text-[#4ECCA3] text-xl font-medium mb-4">
                        {editingCharacter ? 'Chỉnh sửa nhân vật' : 'Tạo nhân vật mới'}
                    </h2>

                    <div className="space-y-4">
                        <input
                            type="text"
                            value={characterName}
                            onChange={(e) => setCharacterName(e.target.value)}
                            placeholder="Tên nhân vật..."
                            className="w-full bg-[#0F172A] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                        />

                        <textarea
                            value={personality}
                            onChange={(e) => setPersonality(e.target.value)}
                            placeholder="Mô tả tính cách của nhân vật..."
                            className="w-full bg-[#0F172A] text-white rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                            rows={4}
                        />

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={!characterName.trim()}
                                className="flex-1 rounded-xl py-3 px-6 bg-[#3E52E8] hover:bg-[#4B5EFF] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingCharacter ? 'Cập nhật' : 'Tạo nhân vật'}
                            </button>

                            {editingCharacter && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingCharacter(null);
                                        setCharacterName('');
                                        setPersonality('');
                                    }}
                                    className="rounded-xl py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-medium"
                                >
                                    Hủy
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                <div className="space-y-4">
                    {characters.map((character) => (
                        <div key={character.id} className="bg-[#1E293B] rounded-xl p-6 border border-[#2A3284]">
                            {editingId === character.id ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-[#0F172A] text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                    />
                                    <textarea
                                        value={editPersonality}
                                        onChange={(e) => setEditPersonality(e.target.value)}
                                        className="w-full bg-[#0F172A] text-white rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#2A3284]"
                                        rows={4}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const result = await updateCharacter(character.id, editName, editPersonality);
                                                    if (result) {
                                                        toast.success('Cập nhật nhân vật thành công!');
                                                        setEditingId(null);
                                                    }
                                                } catch (error: any) {
                                                    toast.error(error.message || 'Có lỗi xảy ra khi cập nhật nhân vật');
                                                }
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#4ECCA3] hover:bg-[#3DBB92] text-white rounded-lg"
                                        >
                                            <CheckIcon className="w-5 h-5" />
                                            <span>Lưu</span>
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                            <span>Hủy</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-white text-lg font-medium mb-2">{character.name}</h3>
                                    <p className="text-gray-300 mb-4">{character.personality}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingId(character.id);
                                                setEditName(character.name);
                                                setEditPersonality(character.personality);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#4ECCA3] hover:bg-[#3DBB92] text-white rounded-lg"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                            <span>Chỉnh sửa</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(character.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
