import React from 'react';
import { User } from '../types';
import PinIcon from '../components/icons/PinIcon';
import LockIcon from '../components/icons/LockIcon';
import FingerprintIcon from '../components/icons/FingerprintIcon';

interface AuthMethodChooserScreenProps {
    user: User;
    onSelect: (method: 'PIN' | 'PASSWORD' | 'BIOMETRIC') => void;
    onBack: () => void;
}

const AuthMethodChooserScreen: React.FC<AuthMethodChooserScreenProps> = ({ user, onSelect, onBack }) => {
    return (
        <div className="h-[100dvh] flex flex-col bg-white dark:bg-gray-900 transition-colors relative overflow-hidden">
            {/* Header Branding */}
            <header className="flex justify-between items-center pt-10 px-8 shrink-0 z-20">
                <div className="flex items-center gap-1.5 animate-fade-in">
                    <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter leading-none italic">OB</h1>
                    <span className="bg-black dark:bg-white text-white dark:text-black text-[7px] font-black px-1 py-0.5 rounded italic uppercase tracking-tighter">Pro</span>
                </div>
                <div className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em]">
                    Security
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-8 z-10">
                <div className="w-full max-w-sm text-center animate-slide-up">
                    <div className="relative inline-block mb-8">
                        <img 
                            src={user.profilePicUrl} 
                            alt={user.name} 
                            className="w-28 h-28 rounded-[40px] mx-auto shadow-2xl border-4 border-white dark:border-gray-800 object-cover" 
                        />
                        <div className="absolute -bottom-2 -right-2 bg-black dark:bg-white p-2 rounded-2xl shadow-lg">
                            <LockIcon className="w-5 h-5 text-white dark:text-black" />
                        </div>
                    </div>
                    
                    <h2 className="text-4xl font-black text-black dark:text-white tracking-tight leading-none mb-2">
                        Verify Identity
                    </h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-12">
                        Select your preferred entry for {user.name.split(' ')[0]}
                    </p>

                    <div className="space-y-4">
                        <button 
                            onClick={() => onSelect('PIN')}
                            className="w-full flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] border border-gray-100 dark:border-gray-800 active:scale-95 transition-all group shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center shadow-xl">
                                    <PinIcon className="w-7 h-7" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-black dark:text-white uppercase tracking-widest text-sm">PIN Access</p>
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-0.5">Quick & Secure</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                            </div>
                        </button>

                        {user.enableBiometricLogin && (
                            <button 
                                onClick={() => onSelect('BIOMETRIC')}
                                className="w-full flex items-center justify-between p-6 bg-blue-50/30 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-900/20 active:scale-95 transition-all group shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <FingerprintIcon className="w-7 h-7" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-black dark:text-white uppercase tracking-widest text-sm">Biometric</p>
                                        <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.2em] mt-0.5">Fingerprint / Face ID</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                                </div>
                            </button>
                        )}

                        <button 
                            onClick={() => onSelect('PASSWORD')}
                            className="w-full flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[32px] border border-gray-100 dark:border-gray-800 active:scale-95 transition-all group shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-2xl flex items-center justify-center">
                                    <LockIcon className="w-7 h-7" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-black dark:text-white uppercase tracking-widest text-sm">Password</p>
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mt-0.5">Master Account Key</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                            </div>
                        </button>
                    </div>
                </div>
            </main>

            <footer className="pb-16 px-10 shrink-0 z-20 flex flex-col items-center">
                <button 
                    onClick={onBack} 
                    className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] hover:text-black dark:hover:text-white transition-colors"
                >
                    Back to Accounts
                </button>
            </footer>

            {/* Decorative Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-blue-50/50 dark:bg-blue-900/5 rounded-full blur-[120px] -z-10"></div>
        </div>
    );
};

export default AuthMethodChooserScreen;