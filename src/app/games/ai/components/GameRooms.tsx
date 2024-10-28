'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaUsers, FaClock, FaLock } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

interface Room {
    id: string;
    name: string;
    players: number;
    max_players: number;
    status: 'waiting' | 'playing';
    is_private: boolean;
    created_at: string;
    created_by: string;
}

interface GameRoomsProps {
    nickname: string;
}

export default function GameRooms({ nickname }: GameRoomsProps) {
    const router = useRouter();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [supabase, setSupabase] = useState<any>(null);
    const [formattedRooms, setFormattedRooms] = useState<Room[]>([]);

    // Khởi tạo Supabase client
    useEffect(() => {
        async function initSupabase() {
            try {
                const response = await fetch('/api/supabase-key');
                const { url, key } = await response.json();
                const client = createClient(url, key);
                setSupabase(client);
            } catch (error) {
                console.error('Lỗi khi khởi tạo Supabase:', error);
            }
        }
        initSupabase();
    }, []);

    useEffect(() => {
        if (!supabase) return;

        const fetchRooms = async () => {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Lỗi khi lấy danh sách phòng:', error);
                return;
            }

            if (data) {
                const formattedRooms: Room[] = data.map((room: Room) => ({
                    id: room.id,
                    name: room.name,
                    players: room.players,
                    max_players: room.max_players,
                    status: room.status,
                    is_private: room.is_private,
                    created_at: room.created_at,
                    created_by: room.created_by
                }));
                setFormattedRooms(formattedRooms);
            }
        };

        fetchRooms();

        const roomsSubscription = supabase
            .channel('rooms_channel')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'rooms' },
                (payload: { new: Room }) => {
                    const newRoom = payload.new as Room;
                    setFormattedRooms(prevRooms => [newRoom, ...prevRooms]);
                }
            )
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'rooms' },
                (payload: { new: Room }) => {
                    const updatedRoom = payload.new as Room;
                    setFormattedRooms(prevRooms =>
                        prevRooms.map(room =>
                            room.id === updatedRoom.id ? updatedRoom : room
                        )
                    );
                }
            )
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'rooms' },
                (payload: { old: Room }) => {
                    const deletedRoomId = payload.old.id;
                    setFormattedRooms(prevRooms =>
                        prevRooms.filter(room => room.id !== deletedRoomId)
                    );
                }
            )
            .subscribe();

        return () => {
            roomsSubscription.unsubscribe();
        };
    }, [supabase]);

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();

        const { data } = await supabase
            .from('rooms')
            .insert([
                {
                    name: roomName,
                    is_private: isPrivate,
                    created_by: nickname,
                    players: 1,
                    max_players: 4,
                    status: 'waiting'
                }
            ])
            .select()
            .single();

        if (data) {
            router.push(`/games/ai/room/${data.id}`);
            setShowCreateModal(false);
        }
    };

    const handleJoinRoom = (roomId: string) => {
        router.push(`/games/ai/room/${roomId}`);
    };

    return (
        <div className="bg-[#0F172A] text-white min-h-screen">
            <div className="bg-[#2A3284] text-center py-8 px-4">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">Danh Sách Phòng</h1>
                <p className="text-lg">Xin chào, {nickname}!</p>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Phòng Hiện Có</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-300"
                    >
                        <FaPlus /> Tạo Phòng
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {formattedRooms.map((room) => (
                        <motion.div
                            key={room.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl border border-gray-700"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold">{room.name}</h3>
                                {room.is_private && <FaLock className="text-yellow-500" />}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                    <FaUsers />
                                    <span>{room.players}/{room.max_players}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <FaClock />
                                    <span>{new Date(room.created_at).toLocaleTimeString()}</span>
                                </div>
                            </div>

                            <button
                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition duration-300"
                                disabled={room.status === 'playing'}
                                onClick={() => handleJoinRoom(room.id)}
                            >
                                {room.status === 'waiting' ? 'Tham Gia' : 'Đang Chơi'}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
                    >
                        <h3 className="text-xl font-semibold mb-4">Tạo Phòng Mới</h3>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên Phòng</label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500"
                                    placeholder="Nhập tên phòng..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={isPrivate}
                                    onChange={(e) => setIsPrivate(e.target.checked)}
                                />
                                <label htmlFor="isPrivate">Phòng Riêng Tư</label>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                                >
                                    Tạo Phòng
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
