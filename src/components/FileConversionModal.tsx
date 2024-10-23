import React, { useState, useEffect } from 'react';
import { IoClose, IoExpand, IoContract, IoDownload, IoCloudUpload } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { getImageDimensions, getFileInfo } from '../utils/fileUtils';

interface FileConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ConvertedFile {
    id: string;
    name: string;
    url: string;
}

interface FileInfo {
    type: string;
    format: string;
    size: number;
}

const FileConversionModal: React.FC<FileConversionModalProps> = ({ isOpen, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isImage, setIsImage] = useState(false);
    const [targetFormat, setTargetFormat] = useState<string>('');
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);

            const fileInfo = await getFileInfo(selectedFile);
            setFileInfo(fileInfo);

            const isImageFile = fileInfo.type === 'image';
            setIsImage(isImageFile);

            if (isImageFile) {
                const dimensions = await getImageDimensions(selectedFile);
                setImageDimensions(dimensions);
            }

            setTargetFormat('');
        }
    };

    const handleConversion = async () => {
        if (!file || !isImage || !targetFormat) return;

        setIsLoading(true);
        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: `image/${targetFormat}`,
            };

            const compressedFile = await imageCompression(file, options);

            const newConvertedFile = {
                id: uuidv4(),
                name: `converted_${file.name.split('.')[0]}.${targetFormat}`,
                url: URL.createObjectURL(compressedFile)
            };
            setConvertedFiles(prevFiles => [newConvertedFile, ...prevFiles]);
        } catch (error) {
            console.error("Lỗi khi Chuyển Đổi Ảnh:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = (fileUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const imageFormats = ['png', 'jpeg', 'webp', 'svg', 'tiff', 'bmp'];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-0"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-[#0F172A] rounded-lg p-4 sm:p-6 flex flex-col border border-[#3E52E8] transition-all duration-300 ${isExpanded ? 'w-full h-full' : 'w-full max-w-2xl h-[90vh] sm:h-3/4'}`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#93C5FD]">Chuyển Đổi Ảnh</h2>
                            <div className="flex items-center">
                                <button
                                    onClick={toggleExpand}
                                    className="text-gray-400 hover:text-white transition-colors duration-300 mr-4"
                                >
                                    {isExpanded ? <IoContract className="h-5 w-5 md:h-6 md:w-6" /> : <IoExpand className="h-5 w-5 md:h-6 md:w-6" />}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors duration-300"
                                >
                                    <IoClose className="h-6 w-6 md:h-7 md:w-7" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <div className="space-y-4">
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="fileInput" className="flex flex-col items-center justify-center w-full h-40 sm:h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-[#1E293B] hover:bg-[#2A3BAF] transition-colors duration-300">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <IoCloudUpload className="w-10 h-10 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Nhấp để tải lên</span> hoặc kéo và thả</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Chọn file để chuyển đổi</p>
                                        </div>
                                        <input id="fileInput" type="file" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                                {file && fileInfo && (
                                    <div className="text-white text-sm sm:text-base">
                                        <p>File đã chọn: {file.name}</p>
                                        <p>Loại file: {fileInfo.type}</p>
                                        <p>Định dạng: {fileInfo.format}</p>
                                        <p>Kích thước: {(fileInfo.size / 1024 / 1024).toFixed(2)} MB</p>
                                        {imageDimensions && fileInfo.format !== 'svg' && (
                                            <p>Kích thước ảnh: {imageDimensions.width}x{imageDimensions.height}</p>
                                        )}
                                        {isImage && (
                                            <select
                                                value={targetFormat}
                                                onChange={(e) => setTargetFormat(e.target.value)}
                                                className="mt-2 bg-[#1E293B] text-white p-2 rounded"
                                            >
                                                <option value="">Chọn định dạng</option>
                                                {imageFormats.filter(format => format !== fileInfo.format).map(format => (
                                                    <option key={format} value={format}>{format.toUpperCase()}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}
                                <button
                                    onClick={handleConversion}
                                    className="bg-[#3E52E8] text-white px-4 py-2 rounded w-full hover:bg-[#2A3BAF] transition-colors duration-300 flex items-center justify-center text-sm sm:text-base"
                                    disabled={isLoading || !file || (isImage && !targetFormat) || !isImage}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang chuyển đổi...
                                        </>
                                    ) : (
                                        'Chuyển Đổi Ảnh'
                                    )}
                                </button>
                                {convertedFiles.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <h3 className="text-base sm:text-lg font-semibold text-white">File đã chuyển đổi:</h3>
                                        {convertedFiles.map((convertedFile) => (
                                            <div key={convertedFile.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#1E293B] p-2 rounded text-xs sm:text-sm md:text-base">
                                                <span className="text-white mb-2 sm:mb-0 break-all">{convertedFile.name}</span>
                                                <button
                                                    onClick={() => handleDownload(convertedFile.url, convertedFile.name)}
                                                    className="flex items-center text-[#3E52E8] hover:text-[#2A3BAF] transition-colors duration-300 text-xs sm:text-sm"
                                                >
                                                    <IoDownload className="mr-1" />
                                                    Tải xuống
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FileConversionModal;
