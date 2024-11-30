import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTags } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import VoiceSearch from './VoiceSearch';

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

    const handleVoiceTranscript = (transcript: string) => {
        setSearchTerm(transcript);
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
        <div className="flex flex-col items-center justify-center relative z-[9999]">
            <div className="relative flex w-full max-w-md items-center">
                <div className="relative flex w-full p-[3px] bg-gradient-to-r from-[#3E52E8] to-[#4B5EFF] rounded-full shadow-lg">
                    <div className="relative flex w-full bg-gray-900 rounded-full">
                        <input
                            type="text"
                            placeholder="Tìm kiếm công cụ AI..."
                            className="py-3 px-5 pr-36 rounded-full w-full text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3E52E8] focus:border-transparent transition-all duration-300 ai-hoverable"
                            data-button-id="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <VoiceSearch
                            onTranscript={handleVoiceTranscript}
                            onClearInput={() => setSearchTerm('')}
                            className="absolute right-24 top-1/2 transform -translate-y-1/2 text-[#3E52E8] hover:text-[#4B5EFF] transition-colors duration-300 ai-hoverable"
                            data-button-id="voice-search"
                        />
                        <button
                            className="absolute right-14 top-1/2 transform -translate-y-1/2 text-[#3E52E8] hover:text-[#4B5EFF] transition-colors duration-300 ai-hoverable"
                            data-button-id="tag-button"
                            onClick={() => setShowTagDropdown(!showTagDropdown)}
                        >
                            <FaTags className="text-xl" />
                        </button>
                        <button
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#3E52E8] text-white rounded-full p-2 hover:bg-[#4B5EFF] transition-colors duration-300 ai-hoverable"
                            data-button-id="search-button"
                            onClick={handleSearch}
                        >
                            <FaSearch className="text-xl" />
                        </button>
                    </div>
                </div>
                <div
                    ref={dropdownRef}
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-full bg-gray-900 rounded-lg shadow-xl z-[10000] p-4 border border-[#3E52E8] transition-all duration-300 ${showTagDropdown ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                        } origin-top`}
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                        {allTags.map((tag, index) => (
                            <button
                                key={index}
                                className="flex items-center justify-center bg-gray-800 hover:bg-[#3E52E8] text-white rounded-lg px-3 py-2 text-sm transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ai-hoverable"
                                data-button-id="Tag"
                                onClick={() => onTagClick ? onTagClick(tag) : handleTagSearch(tag)}
                            >
                                <FaSearch className="mr-2 text-xs" />
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
