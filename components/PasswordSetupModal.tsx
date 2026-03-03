import React, { useState } from 'react';

interface PasswordSetupModalProps {
    onClose: () => void;
    onPasswordSet: (password: string) => void;
}

const PasswordSetupModal: React.FC<PasswordSetupModalProps> = ({ onClose, onPasswordSet }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        onPasswordSet(password);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-950 w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-slide-up border border-gray-100 dark:border-gray-800">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter italic">Set Security Password</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Required for sensitive actions</p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                placeholder="Min 6 characters"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all font-medium"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                placeholder="Repeat password"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all font-medium"
                            />
                        </div>
                        {error && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{error}</p>}
                        
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-4 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                            >
                                Set Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PasswordSetupModal;
