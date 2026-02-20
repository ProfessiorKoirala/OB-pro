import React from 'react';
import StarIcon from '../components/icons/StarIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import SmsIcon from '../components/icons/SmsIcon';

interface PremiumFeatureScreenProps {
    onBack: () => void;
}

// Local Icon Components for expanded contacts
const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
    </svg>
);

const PremiumFeatureScreen: React.FC<PremiumFeatureScreenProps> = ({ onBack }) => {
    return (
        <div className="h-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden transition-colors relative">
            {/* Header Branding: Brand on Left, Control on Right */}
            <header className="flex justify-between items-center pt-10 px-8 shrink-0 z-20">
                <div className="flex items-center gap-1.5 animate-fade-in">
                    <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter leading-none italic">OB</h1>
                    <span className="bg-black dark:bg-white text-white dark:text-black text-[7px] font-black px-1 py-0.5 rounded italic uppercase tracking-tighter">Pro</span>
                </div>
                <button onClick={onBack} className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] hover:text-black dark:hover:text-white transition-colors">
                    Close
                </button>
            </header>

            <main className="flex-1 relative overflow-hidden flex items-center justify-center">
                <div className="w-full flex flex-col items-center justify-center px-10 text-center gap-8 max-w-lg">
                    
                    {/* Animated Star Icon with Decorative Elements */}
                    <div className="relative animate-slide-up">
                        <div className="relative z-10 scale-150 text-yellow-500 drop-shadow-2xl">
                            <StarIcon filled={true} className="w-20 h-20" />
                        </div>
                        <svg className="absolute inset-0 w-full h-full scale-[2.5] -rotate-6 opacity-30 dark:opacity-50" viewBox="0 0 160 80" fill="none">
                            <path 
                                d="M10,40 C10,10 150,10 150,40 C150,70 10,70 15,40" 
                                stroke="#F59E0B" 
                                strokeWidth="5" 
                                strokeLinecap="round"
                                className="animate-draw"
                                style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                            />
                        </svg>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-4">
                        <div className="space-y-2 animate-slide-up [animation-delay:200ms]">
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] px-3 py-1 rounded-full border border-yellow-100 dark:border-yellow-900/30 text-yellow-600 bg-yellow-50/50 dark:bg-yellow-900/10 inline-block mb-1">
                                EXCLUSIVE ACCESS
                            </span>
                            <h2 className="text-4xl font-black text-black dark:text-white tracking-tight leading-none">
                                Premium Feature
                            </h2>
                        </div>
                        
                        <div className="relative inline-block animate-slide-up [animation-delay:400ms]">
                            <p className="text-xl font-handwriting text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                                Google Drive sync and multi-device access are reserved for our Pro users.
                            </p>
                            
                            {/* Hand-drawn Underline Animation */}
                            <div className="flex justify-center mt-1">
                                <svg className="w-48 h-4 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path 
                                        d="M0,5 Q50,0 100,8" 
                                        stroke="#F59E0B" 
                                        strokeWidth="8" 
                                        strokeLinecap="round"
                                        className="animate-draw-fast"
                                        style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Developer Contact Card: High Impact Grid */}
                    <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[40px] border border-gray-100 dark:border-gray-800 animate-slide-up [animation-delay:600ms] shadow-sm">
                        <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-4">Contact Developer</p>
                        <h3 className="text-2xl font-black text-black dark:text-white mb-0.5">Sandesh Koirala</h3>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-6 uppercase tracking-wider">Software Architect</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <a href="tel:+9779825953166" className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-gray-700 text-black dark:text-white font-black rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-[10px] uppercase tracking-widest border border-gray-100 dark:border-gray-600">
                                <PhoneIcon className="w-4 h-4" /> Call
                            </a>
                            <a href="sms:+9779825953166" className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-gray-700 text-black dark:text-white font-black rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-[10px] uppercase tracking-widest border border-gray-100 dark:border-gray-600">
                                <SmsIcon className="w-4 h-4" /> SMS
                            </a>
                            <a href="mailto:Sandeshkoirala009@gmail.com" className="flex items-center justify-center gap-2 py-3.5 bg-white dark:bg-gray-700 text-black dark:text-white font-black rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 text-[10px] uppercase tracking-widest border border-gray-100 dark:border-gray-600">
                                <MailIcon className="w-4 h-4" /> Email
                            </a>
                            <a href="https://www.facebook.com/share/18GZzHbZFa/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-3.5 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-xl hover:opacity-90 transition-all active:scale-95 text-[10px] uppercase tracking-widest">
                                <FacebookIcon className="w-4 h-4" /> Facebook
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="pb-16 px-10 shrink-0 z-20 flex flex-col items-center">
                <div className="w-full max-w-xs flex flex-col gap-6">
                    <button 
                        onClick={onBack} 
                        className="w-full bg-white dark:bg-gray-800 text-black dark:text-white font-black py-5 px-8 rounded-full border border-gray-100 dark:border-gray-700 active:scale-[0.96] transition-all uppercase tracking-[0.25em] text-xs"
                    >
                        Maybe Later
                    </button>
                    
                    <div className="flex justify-center">
                        <span className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.45em] text-center">
                            Ordinary Business Pro
                        </span>
                    </div>
                </div>
            </footer>

            {/* Decorative Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] bg-yellow-50 dark:bg-yellow-900/10 rounded-full blur-[100px] -z-10 rotate-45"></div>
            
            <style>{`
                @keyframes draw {
                    to { stroke-dashoffset: 0; }
                }
                .animate-draw {
                    animation: draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.4s;
                }
                .animate-draw-fast {
                    animation: draw 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.8s;
                }
            `}</style>
        </div>
    );
};

export default PremiumFeatureScreen;