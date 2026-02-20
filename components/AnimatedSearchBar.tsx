import React, { useState, useRef } from 'react';
import SearchIcon from './icons/SearchIcon';
import BackIcon from './icons/BackIcon';

interface AnimatedSearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    placeholder: string;
}

const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({ searchTerm, setSearchTerm, placeholder }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFocus = () => {
        setIsFocused(true);
        inputRef.current?.focus();
    };

    const handleBlur = () => {
        if (!searchTerm) setIsFocused(false);
    };

    const handleClear = () => {
        setSearchTerm('');
        setIsFocused(false);
    };

    return (
        <div className="relative w-full px-1">
            <div className={`flex items-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-[24px] overflow-hidden ${
                isFocused || searchTerm 
                ? 'bg-white dark:bg-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-2 ring-black dark:ring-white' 
                : 'bg-gray-100 dark:bg-gray-900 ring-1 ring-transparent'
            }`}>
                <div className={`pl-5 transition-transform duration-300 ${isFocused ? 'scale-110 text-black dark:text-white' : 'text-gray-400'}`}>
                    <SearchIcon className="h-5 w-5" />
                </div>
                
                <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 bg-transparent border-none py-4 px-3 font-bold text-sm focus:outline-none placeholder:text-gray-400 text-black dark:text-white"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                />

                {(isFocused || searchTerm) && (
                    <button
                        onClick={handleClear}
                        className="pr-5 text-gray-400 hover:text-black dark:hover:text-white transition-colors animate-fade-in"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default AnimatedSearchBar;