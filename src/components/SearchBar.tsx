import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTags } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
    onTagClick?: (tag: string) => void;
    allTags?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onTagClick, allTags = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSearch = () => {
        if (searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleTagSearch = (tag: string) => {
        router.push(`/search?tag=${encodeURIComponent(tag)}`);
        setShowTagDropdown(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !(event.target as Element).closest('button')) {
                setShowTagDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative flex w-full max-w-md">
                <input
                    type="text"
                    placeholder="Tìm kiếm công cụ AI..."
                    className="py-2 px-4 pr-12 rounded-full w-full text-black"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 mr-4"
                    onClick={() => setShowTagDropdown(!showTagDropdown)}
                >
                    <FaTags />
                </button>
                <button
                    className="bg-white text-black rounded-full px-4 py-2 ml-2"
                    onClick={handleSearch}
                >
                    <FaSearch />
                </button>
                <div
                    ref={dropdownRef}
                    className={`absolute top-full left-0 mt-2 w-full bg-[#1E293B] rounded-lg shadow-xl z-10 p-4 border border-[#3E52E8] transition-all duration-300 ${showTagDropdown ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                        } origin-top`}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {allTags.map((tag, index) => (
                            <button
                                key={index}
                                className="flex items-center justify-center bg-[#3E52E8] hover:bg-[#4B5EFF] text-white rounded-lg px-3 py-2 text-sm transition-colors duration-300 shadow-md hover:shadow-lg"
                                onClick={() => onTagClick ? onTagClick(tag) : handleTagSearch(tag)}
                            >
                                <FaSearch className="mr-2" />
                                <span className="truncate">{tag}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchBar;