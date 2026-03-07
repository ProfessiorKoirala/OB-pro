import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import WifiIcon from './icons/WifiIcon';
import CloseIcon from './icons/CloseIcon';

interface WifiQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrImage?: string;
    onUpload?: (image: string) => void;
    isDesktop?: boolean;
}

const WifiQRModal: React.FC<WifiQRModalProps> = ({ isOpen, onClose, qrImage, onUpload, isDesktop }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUpload) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpload(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[200] pointer-events-none">
                    {/* Backdrop - transparent for dropdown feel */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/5 pointer-events-auto"
                    />
                    
                    {/* Dropdown Container */}
                    <div className="absolute top-[68px] right-4 w-[240px] sm:w-[280px] pointer-events-none flex flex-col items-end">
                        {/* Dropdown Card */}
                        <motion.div 
                            initial={{ y: -10, opacity: 0, scale: 0.95, transformOrigin: 'top right' }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -10, opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full pointer-events-auto bg-white dark:bg-gray-900 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800 rounded-[24px] overflow-hidden flex flex-col"
                        >
                            {/* Header Section */}
                            <div className="px-4 pt-4 pb-2.5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-[#4285F4] rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                            <WifiIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <h2 className="text-[10px] font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">WIFI ACCESS</h2>
                                            <p className="text-[6px] font-black text-gray-400 uppercase tracking-[0.2em] mt-0.5">GUEST NETWORK</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={onClose} 
                                        className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-black dark:hover:text-white active:scale-90 transition-all"
                                    >
                                        <CloseIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="px-4 pb-4">
                                <div className="w-full aspect-square bg-[#F8F9FA] dark:bg-gray-800/50 rounded-[20px] flex flex-col items-center justify-center text-center p-5 border border-gray-100 dark:border-gray-700 mb-2.5">
                                    {qrImage ? (
                                        <img 
                                            src={qrImage} 
                                            alt="WiFi QR Code" 
                                            className="w-full h-full object-contain rounded-lg" 
                                        />
                                    ) : (
                                        <>
                                            <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-200 dark:text-gray-600 mb-2.5 shadow-sm">
                                                <WifiIcon className="w-4.5 h-4.5" />
                                            </div>
                                            <p className="text-[8px] font-black text-black dark:text-white uppercase tracking-widest mb-0.5">NO QR FOUND</p>
                                            <p className="text-[6px] text-gray-400 dark:text-gray-500 leading-relaxed max-w-[120px]">Upload your WiFi QR code to share access with guests.</p>
                                        </>
                                    )}
                                </div>
                                
                                {onUpload && (
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-2.5 bg-[#4285F4] hover:bg-blue-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        {qrImage ? 'CHANGE QR' : 'UPLOAD QR'}
                                    </button>
                                )}
                                
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    hidden 
                                    accept="image/*" 
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default WifiQRModal;
