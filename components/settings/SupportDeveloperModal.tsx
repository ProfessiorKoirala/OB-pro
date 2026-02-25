import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HeartIcon from '../icons/HeartIcon';

interface SupportDeveloperModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SupportOption: React.FC<{
    logo: React.ReactNode;
    name: string;
    detail: string;
    color: string;
    url: string;
}> = ({ logo, name, detail, color, url }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(detail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform active:scale-90 hover:scale-105 ${color}`}
                    title={`Open ${name} App`}
                >
                    {logo}
                </a>
                <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">{name}</p>
                    <p className="text-sm font-bold text-black dark:text-white font-mono">{detail}</p>
                </div>
            </div>
            <button 
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                    copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                }`}
            >
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
};

const SupportDeveloperModal: React.FC<SupportDeveloperModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500">
                                        <HeartIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">Support Dev</h2>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Buy a coffee</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">
                                If you find OB Pro helpful, consider supporting its development. Your contribution helps keep the app updated and free of ads.
                            </p>

                            <div className="space-y-3">
                                <SupportOption 
                                    name="eSewa" 
                                    detail="9825953166" 
                                    color="bg-[#60bb46]" 
                                    url="https://esewa.com.np"
                                    logo={<span className="font-black text-lg italic">e</span>} 
                                />
                                <SupportOption 
                                    name="Khalti" 
                                    detail="9825953166" 
                                    color="bg-[#5c2d91]" 
                                    url="https://khalti.com"
                                    logo={<span className="font-black text-lg italic">K</span>} 
                                />
                                <SupportOption 
                                    name="NIC Asia Bank" 
                                    detail="C957032608052401" 
                                    color="bg-[#ed1c24]" 
                                    url="https://www.nicasiabank.com"
                                    logo={<span className="font-black text-xs text-center leading-none">NIC<br/>ASIA</span>} 
                                />
                                <SupportOption 
                                    name="Nabil Bank" 
                                    detail="05010017515382" 
                                    color="bg-[#0054a6]" 
                                    url="https://www.nabilbank.com"
                                    logo={<span className="font-black text-xs text-center leading-none">NABIL</span>} 
                                />
                            </div>

                            <div className="mt-8 pt-8 border-t dark:border-gray-800 text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thank you for your support! 🙏</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SupportDeveloperModal;
