import { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaCheck, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import useInputValidation from '@/hooks/useInputValidation';

interface DisplayNameEditorProps {
    initialName: string;
    onSave: (newName: string) => Promise<void>;
}

const DisplayNameEditor: React.FC<DisplayNameEditorProps> = ({ initialName, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newDisplayName, setNewDisplayName] = useState(initialName);
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [isNameValid, setIsNameValid] = useState<boolean | null>(null);
    const [lastCheckedName, setLastCheckedName] = useState('');
    const { validateInput } = useInputValidation();

    const handleEditName = () => {
        setIsEditing(true);
    };

    const handleCheckName = async () => {
        setIsCheckingName(true);
        try {
            const isValid = await validateInput(newDisplayName, {
                instruction: "Kiểm tra xem tên người dùng có phù hợp với cộng đồng không. Chỉ trả lời 'true' nếu phù hợp, ngược lại trả lời 'false'.",
                validResponse: "true",
                invalidResponse: "false"
            });
            setIsNameValid(isValid);
            setLastCheckedName(newDisplayName);
        } catch (error) {
            console.error('Lỗi khi kiểm tra tên hiển thị:', error);
            setIsNameValid(false);
        } finally {
            setIsCheckingName(false);
        }
    };

    const handleSaveName = async () => {
        if (isNameValid && newDisplayName === lastCheckedName) {
            await onSave(newDisplayName);
            setIsEditing(false);
            setIsNameValid(null);
            setLastCheckedName('');
        }
    };

    const handleCancelEdit = () => {
        setNewDisplayName(initialName);
        setIsEditing(false);
        setIsNameValid(null);
        setLastCheckedName('');
    };

    useEffect(() => {
        if (newDisplayName !== lastCheckedName) {
            setIsNameValid(null);
        }
    }, [newDisplayName, lastCheckedName]);

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
            <strong className="mr-2 mb-2 sm:mb-0">Tên người dùng:</strong>
            {isEditing ? (
                <div className="flex flex-col sm:flex-row w-full sm:w-auto">
                    <input
                        type="text"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        className="bg-gray-700 text-white px-2 py-1 rounded mb-2 sm:mb-0 sm:mr-2 w-full sm:w-auto"
                    />
                    <div className="flex flex-col sm:flex-row">
                        <div className="flex mb-2 sm:mb-0 sm:mr-2">
                            <button
                                onClick={handleCheckName}
                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2 flex items-center"
                                disabled={isCheckingName}
                            >
                                {isCheckingName ? <FaSpinner className="animate-spin mr-1" /> : <FaCheck className="mr-1" />}
                                {isCheckingName ? 'Đang kiểm tra...' : 'Kiểm tra'}
                            </button>
                            {isNameValid === false && (
                                <div className="flex items-center text-red-500">
                                    <FaExclamationTriangle className="mr-1" />
                                    <span>Tên không phù hợp</span>
                                </div>
                            )}
                        </div>
                        <div className="flex">
                            <button
                                onClick={handleSaveName}
                                className={`${isNameValid && newDisplayName === lastCheckedName ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 cursor-not-allowed'} text-white px-2 py-1 rounded mr-2 flex items-center`}
                                disabled={!isNameValid || newDisplayName !== lastCheckedName}
                            >
                                <FaSave className="mr-1" /> Lưu
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 flex items-center"
                            >
                                <FaTimes className="mr-1" /> Hủy
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center">
                    <span>{initialName || 'Chưa cập nhật'}</span>
                    <button
                        onClick={handleEditName}
                        className="ml-2 text-blue-300 hover:text-blue-400"
                    >
                        <FaEdit />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DisplayNameEditor;
