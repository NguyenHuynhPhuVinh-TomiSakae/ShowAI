import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { AnimeModel, animeModels } from '../utils/animeModels';

interface AnimeModelSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectModel: (model: AnimeModel) => void;
    currentModel: AnimeModel;
}

const AnimeModelSelector: React.FC<AnimeModelSelectorProps> = ({ isOpen, onClose, onSelectModel, currentModel }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                ref={modalRef}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0F172A] rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
            >
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Chọn mô hình Anime</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                        aria-label="Đóng"
                    >
                        <IoClose className="h-5 w-5 text-white/70 hover:text-white" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    <div className="p-4 space-y-4">
                        {animeModels.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onSelectModel(model);
                                    onClose();
                                }}
                                className={`w-full p-3 rounded-xl text-left transition-colors duration-200 ${model.id === currentModel.id
                                        ? 'bg-[#3E52E8] text-white'
                                        : 'bg-[#1E293B] text-white hover:bg-[#2E3B52]'
                                    }`}
                            >
                                {model.name}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AnimeModelSelector; 