import React from 'react';
import { Promotion } from '../types';
import CloseIcon from './icons/CloseIcon';

interface PromotionModalProps {
    promotion: Promotion;
    onClose: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ promotion, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-gray-100 dark:border-gray-800">
                <div className="relative">
                    {promotion.imageUrl && (
                        <img 
                            src={promotion.imageUrl} 
                            alt={promotion.title} 
                            className="w-full h-64 object-cover"
                            referrerPolicy="no-referrer"
                        />
                    )}
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-colors z-10"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-8 text-center space-y-4">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/30 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 inline-block">
                            SPECIAL PROMOTION
                        </span>
                        <h2 className="text-3xl font-black text-black dark:text-white tracking-tighter leading-none italic">
                            {promotion.title}
                        </h2>
                    </div>
                    
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                        {promotion.message}
                    </p>
                    
                    <button 
                        onClick={onClose}
                        className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] hover:text-black dark:hover:text-white transition-colors pt-2"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;
