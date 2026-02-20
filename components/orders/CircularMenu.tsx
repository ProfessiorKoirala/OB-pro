import React, { useEffect, useState } from 'react';
import CloseIcon from '../icons/CloseIcon';

export interface CircularMenuItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    colorClass?: string;
}

interface CircularMenuProps {
    isOpen: boolean;
    onClose: () => void;
    actions: CircularMenuItem[];
}

const CircularMenu: React.FC<CircularMenuProps> = ({ isOpen, onClose, actions }) => {
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        } else {
            // allows for fade-out animation
            const timer = setTimeout(() => setIsRendered(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);
    
    if (!isRendered) {
        return null;
    }

    const radius = 100; // Radius of the circle
    const angleStep = (2 * Math.PI) / actions.length;

    return (
        <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            <div className="relative w-64 h-64" onClick={e => e.stopPropagation()}>
                {/* Center close button */}
                <button
                    onClick={onClose}
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-0'}`}
                >
                    <CloseIcon className="w-8 h-8" />
                </button>

                {actions.map((action, index) => {
                    const angle = index * angleStep - (Math.PI / 2); // Start from top
                    const x = radius * Math.cos(angle);
                    const y = radius * Math.sin(angle);

                    return (
                        <div
                            key={action.label}
                            className={`absolute top-1/2 left-1/2 transition-all duration-300 ease-out`}
                            style={{
                                transform: `translate(-50%, -50%) ${isOpen ? `translate(${x}px, ${y}px) scale(1)` : 'scale(0)'}`,
                                transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                            }}
                        >
                            <button
                                onClick={() => {
                                    action.onClick();
                                    onClose();
                                }}
                                className="flex flex-col items-center justify-center group"
                            >
                                <div className={`w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center mb-1 transition-transform group-hover:scale-110 ${action.colorClass || 'text-text-primary'}`}>
                                    {action.icon}
                                </div>
                                <span className="text-white text-xs font-semibold">{action.label}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CircularMenu;
