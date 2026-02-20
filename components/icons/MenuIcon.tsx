import React from 'react';

const MenuIcon: React.FC<{ className?: string; isOpen?: boolean }> = ({ className = "h-5 w-5", isOpen }) => {
    const commonClasses = 'h-0.5 w-5 bg-current transition-all duration-300 ease-in-out';
    
    return (
        <div className={`relative ${className} flex flex-col justify-center items-center`}>
            <span className={`${commonClasses} absolute ${isOpen ? 'rotate-45' : '-translate-y-1.5'}`}></span>
            <span className={`${commonClasses} absolute ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`${commonClasses} absolute ${isOpen ? '-rotate-45' : 'translate-y-1.5'}`}></span>
        </div>
    );
};

export default MenuIcon;
