
import React, { useState } from 'react';
import { getDirectoryHandle } from '../utils/fileSystemApi';

interface PermissionScreenProps {
    onResult: () => void;
}

const PermissionScreen: React.FC<PermissionScreenProps> = ({ onResult }) => {
    const [status, setStatus] = useState<'idle' | 'loading'>('idle');

    const handleAllow = async () => {
        setStatus('loading');
        try {
            // Force user to choose a folder if browser supports it
            const canUsePicker = 'showDirectoryPicker' in window && window.self === window.top;
            
            if (canUsePicker) {
                const handle = await getDirectoryHandle(true);
                if (handle) {
                    alert("Success! Your business data will now be saved directly to the folder you selected.");
                    onResult();
                    return;
                }
            } else {
                // Fallback: Persistence for browser-managed storage
                if (navigator.storage && navigator.storage.persist) {
                    const isPersisted = await navigator.storage.persist();
                    if (isPersisted) {
                        alert("Storage access secured! Your data will be saved in your browser's permanent internal memory. Use 'Export' in Settings for manual backups.");
                    }
                }
            }
            
            // Proceed to the app
            onResult();
        } catch (error) {
            console.error("Storage permission error:", error);
            onResult();
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-white dark:bg-gray-950 overflow-hidden transition-colors relative font-sans">
            <header className="absolute top-10 left-10 z-20">
                <div className="flex items-center gap-1.5 animate-fade-in">
                    <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter leading-none italic uppercase">
                        OB<span className="bg-black dark:bg-white text-white dark:text-black text-[9px] px-1.5 py-0.5 ml-1.5 rounded italic uppercase tracking-tighter shadow-sm">Pro</span>
                    </h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-10 text-center z-10">
                <div className="flex flex-col items-center gap-12 animate-slide-up">
                    <div className="flex flex-col items-center gap-8 text-center">
                        <div className="relative group">
                            <span className="text-7xl sm:text-8xl font-handwriting text-[#2D2A4A] dark:text-white inline-block px-10 py-6">
                                Hi Boss.
                            </span>
                            <svg className="absolute inset-0 w-full h-full -rotate-2 scale-125" viewBox="0 0 160 80" fill="none">
                                <path 
                                    d="M10,40 C10,10 150,10 150,40 C150,70 10,70 15,40" 
                                    stroke="#6B4F7D" 
                                    strokeWidth="4" 
                                    strokeLinecap="round"
                                    className="animate-draw-path"
                                    style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                                />
                            </svg>
                        </div>

                        <div className="space-y-12">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter italic">Enable Persistent Storage</h2>
                                <p className="text-lg font-handwriting text-[#2D2A4A] dark:text-gray-400 leading-tight max-w-[280px] mx-auto">
                                    Save data directly to your device
                                </p>
                            </div>
                            
                            <div className="relative inline-block">
                                <span className="text-5xl sm:text-6xl font-handwriting font-bold text-[#2D2A4A] dark:text-white uppercase tracking-wider">
                                    BUSINESS DATA
                                </span>
                                <svg className="absolute -bottom-4 left-0 w-full h-6" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path 
                                        d="M0,5 Q50,0 100,8" 
                                        stroke="#6B4F7D" 
                                        strokeWidth="8" 
                                        strokeLinecap="round"
                                        className="animate-draw-path"
                                        style={{ strokeDasharray: 100, strokeDashoffset: 100, animationDelay: '0.8s' }}
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="p-12 pb-24 flex flex-col items-center gap-6 z-20">
                <div className="w-full max-w-[320px] flex flex-col gap-4 animate-slide-up [animation-delay:600ms]">
                    <button 
                        onClick={handleAllow} 
                        disabled={status === 'loading'}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-black py-6 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-[0.96] transition-all uppercase tracking-[0.4em] text-[12px] relative overflow-hidden group"
                    >
                        <span className={status === 'loading' ? 'opacity-0' : 'opacity-100 group-active:scale-95'}>
                            Grant Access
                        </span>
                        {status === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] animate-[shine_5s_infinite]"></div>
                    </button>
                    
                    <button 
                        onClick={() => onResult()}
                        className="w-full py-4 rounded-full border border-gray-100 dark:border-gray-800 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.5em] hover:bg-gray-50 dark:hover:bg-gray-900 transition-all active:scale-95"
                    >
                        Maybe Later
                    </button>
                </div>
            </footer>

            <style>{`
                @keyframes draw { to { stroke-dashoffset: 0; } }
                .animate-draw-path { animation: draw 1.2s ease-out forwards; }
                @keyframes shine {
                    0% { left: -100%; }
                    20% { left: 130%; }
                    100% { left: 130%; }
                }
            `}</style>
        </div>
    );
};

export default PermissionScreen;
