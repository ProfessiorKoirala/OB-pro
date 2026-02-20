
import React from 'react';
import { createPortal } from 'react-dom';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    onSecondaryAction?: () => void;
    confirmText?: string;
    cancelText?: string;
    secondaryText?: string;
    confirmButtonClass?: string;
    secondaryButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    title,
    message,
    onConfirm,
    onCancel,
    onSecondaryAction,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    secondaryText = 'Save Changes',
    confirmButtonClass = 'bg-black dark:bg-white text-white dark:text-black',
    secondaryButtonClass = 'bg-blue-600 text-white'
}) => {
    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-6 animate-fade-in" onClick={onCancel}>
            <div className="bg-white dark:bg-gray-900 rounded-[36px] shadow-2xl w-full max-w-[340px] overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-8 pb-4 text-center">
                    <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-[20px] bg-amber-50 dark:bg-amber-900/10 mb-6">
                        <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none mb-3">
                        {title}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        {message}
                    </p>
                </div>
                <div className="p-6 pt-4 flex flex-col gap-2 bg-gray-50/50 dark:bg-gray-800/30">
                    {onSecondaryAction && (
                        <button
                            type="button"
                            className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-lg active:scale-95 transition-all ${secondaryButtonClass}`}
                            onClick={onSecondaryAction}
                        >
                            {secondaryText}
                        </button>
                    )}
                    <button
                        type="button"
                        className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-lg active:scale-95 transition-all ${confirmButtonClass}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        className="w-full py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
