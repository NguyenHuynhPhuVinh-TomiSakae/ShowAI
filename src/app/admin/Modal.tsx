import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '@/components/ModalPortal';
import type { MotionProps } from 'framer-motion';

type ModalBackdropProps = MotionProps & {
    className?: string;
};
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
    return (
        <ModalPortal>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        {...{
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                            className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        } as ModalBackdropProps}
                    >
                        <motion.div
                            {...{
                                initial: { scale: 0.9, opacity: 0 },
                                animate: { scale: 1, opacity: 1 },
                                exit: { scale: 0.9, opacity: 0 },
                                className: "bg-[#1E293B] p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
                            } as ModalBackdropProps}
                        >
                            <h2 className="text-xl font-bold mb-4 text-[#93C5FD]">Xác nhận</h2>
                            <p className="text-white mb-6">{message}</p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ModalPortal>
    );
};

export default Modal;