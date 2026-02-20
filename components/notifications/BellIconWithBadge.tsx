import React from 'react';
import BellIcon from '../icons/BellIcon';

interface BellIconWithBadgeProps {
    unreadCount: number;
    onClick: () => void;
}

const BellIconWithBadge: React.FC<BellIconWithBadgeProps> = ({ unreadCount, onClick }) => {
    return (
        <button onClick={onClick} className="relative p-2 text-gray-600 hover:text-primary transition-colors">
            <BellIcon className="h-7 w-7" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
};

export default BellIconWithBadge;
