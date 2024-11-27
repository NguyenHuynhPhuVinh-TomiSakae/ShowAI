import React from 'react';
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from 'framer-motion';
import { AI_MODELS } from './ModelList';

interface ModelSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectModel: (modelId: string) => void;
}

const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({ isOpen, onClose, onSelectModel }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#0F172A] rounded-xl shadow-2xl p-6 w-full max-w-[90%] border border-[#3E52E8]/20 mx-4 max-h-[90vh] flex flex-col"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Chọn Mô Hình AI</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <IoClose className="h-5 w-5 text-white/70 hover:text-white" />
                        </button>
                    </div>

                    <div className="overflow-y-auto scrollbar-hide">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {AI_MODELS.map((model) => (
                                <motion.button
                                    key={model.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onSelectModel(model.id)}
                                    className="w-full p-4 border border-[#3E52E8]/20 rounded-lg hover:bg-[#1E293B] 
                                             transition-colors flex items-center space-x-4"
                                >
                                    <span className="text-2xl">{model.icon}</span>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="font-medium text-white truncate">{model.name}</div>
                                        <div className="text-sm text-gray-400 truncate">{model.description}</div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <style jsx global>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </AnimatePresence>
    );
};

export default ModelSelectionModal; 