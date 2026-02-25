import React from 'react';
import { User } from '../types';
import GoogleIcon from '../components/icons/GoogleIcon';

interface AccountChooserScreenProps {
  users: User[];
  onSelectAccount: (user: User) => void;
  onAddNewAccount: () => void;
  onPremiumClick: () => void;
  onDeleteAccount: (userId: string) => void;
}

const AccountChooserScreen: React.FC<AccountChooserScreenProps> = ({ users, onSelectAccount, onAddNewAccount, onDeleteAccount }) => {
  return (
    <div className="h-[100dvh] flex flex-col bg-[#FFFFFF] dark:bg-gray-950 transition-colors relative overflow-hidden font-sans">
        
        {/* Top Header: Branding Left, Navigation Right */}
        <header className="absolute top-0 left-0 right-0 z-30 px-8 pt-10 flex items-baseline justify-between">
            <div className="flex items-center gap-1.5 animate-fade-in">
                <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter leading-none italic uppercase">OB</h1>
                <span className="bg-black dark:bg-white text-white dark:text-black text-[9px] font-black px-2 py-1 rounded-lg italic uppercase tracking-tighter shadow-sm">Pro</span>
            </div>
            
            <div className="text-right animate-fade-in [animation-delay:200ms]">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em]">
                    Choose Login
                </p>
                <div className="h-0.5 w-12 bg-black dark:bg-white ml-auto mt-1 rounded-full opacity-10"></div>
            </div>
        </header>

        {/* Decoration */}
        <div className="absolute top-0 right-12 z-20 pointer-events-none opacity-10">
            <div className="animate-swing origin-top flex flex-col items-center">
                <div className="w-10 h-32 bg-[#4B2A63] rounded-b-full shadow-md relative -mb-4 flex flex-col items-center justify-end pb-3">
                    <span className="text-[4px] text-white/30 font-black uppercase tracking-[0.2em] -rotate-90 whitespace-nowrap mb-6">Ordinary Business</span>
                </div>
            </div>
        </div>

        <main className="flex-1 flex flex-col p-8 z-10 pt-44">
            <div className="w-full max-w-md mx-auto flex flex-col h-full">
                
                <div className="mb-12 text-center animate-slide-up">
                    <h2 className="text-5xl font-black text-black dark:text-white tracking-tight leading-none italic uppercase">
                        Welcome Boss
                    </h2>
                    <p className="text-gray-400 dark:text-gray-600 font-bold uppercase tracking-[0.4em] text-[10px] mt-5">
                        Choose business profile
                    </p>
                </div>

                <div className="space-y-5 animate-slide-up [animation-delay:400ms]">
                    {users.map(user => (
                        <div
                            key={user.id}
                            onClick={() => onSelectAccount(user)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onSelectAccount(user);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 p-5 rounded-[36px] flex items-center gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-all text-left group relative cursor-pointer outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        >
                            <div className="relative shrink-0">
                                <div className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg transform group-hover:scale-105 transition-transform">
                                    <img 
                                        src={user.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                                        alt={user.name} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                {user.accountType === 'google' && (
                                    <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-50 dark:border-gray-700">
                                        <GoogleIcon className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-black dark:text-white text-xl tracking-tighter truncate uppercase italic leading-none">{user.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate mt-2">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteAccount(user.id);
                                    }}
                                    className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-all shadow-sm"
                                    title="Delete Profile"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-300 group-hover:text-black dark:group-hover:text-white group-hover:bg-white dark:group-hover:bg-gray-600 transition-all group-hover:translate-x-1 shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button
                        onClick={onAddNewAccount}
                        className="w-full border-2 border-dashed border-gray-200 dark:border-gray-800 p-10 rounded-[36px] flex flex-col items-center justify-center gap-3 group hover:border-black dark:hover:border-white hover:bg-gray-50/50 transition-all active:scale-[0.98]"
                    >
                        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-black dark:group-hover:text-white group-hover:bg-white transition-all shadow-sm">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em] group-hover:text-black dark:group-hover:text-white transition-colors">Add Account</span>
                    </button>
                </div>
            </div>
        </main>

        <footer className="pb-12 px-10 shrink-0 z-20 flex flex-col items-center animate-fade-in [animation-delay:600ms]">
            <div className="flex items-center gap-2 opacity-10">
                <span className="text-black dark:text-white font-black text-[12px] uppercase tracking-[0.6em]">Ordinary Business</span>
            </div>
        </footer>

        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-[100px] -z-10 opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-50 dark:bg-purple-900/10 rounded-full blur-[100px] -z-10 opacity-60"></div>

        <style>{`
            @keyframes swing {
                0% { transform: rotate(-3deg); }
                50% { transform: rotate(3deg); }
                100% { transform: rotate(-3deg); }
            }
            .animate-swing {
                animation: swing 4s ease-in-out infinite;
                transform-origin: top center;
            }
        `}</style>
    </div>
  );
};

export default AccountChooserScreen;