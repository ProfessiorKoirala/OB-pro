import React, { useState } from 'react';
import { User } from '../types';

interface PasswordLoginScreenProps {
    user: User;
    onSuccess: (password: string) => boolean;
    onBack: () => void;
    onDeleteProfile?: () => void;
}

const PasswordLoginScreen: React.FC<PasswordLoginScreenProps> = ({ user, onSuccess, onBack, onDeleteProfile }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network delay
        setTimeout(() => {
            if (onSuccess(password)) {
                // Success is handled by parent
            } else {
                setError('Incorrect password. Please try again.');
                setPassword('');
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm text-center">
                <img src={user.profilePicUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg" />
                <h1 className="text-2xl font-bold text-text-primary">Welcome, {user.name.split(' ')[0]}</h1>
                <p className="text-text-secondary mt-1">Enter your password to continue</p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left">
                    <div>
                        <label htmlFor="password-input" className="sr-only">Password</label>
                        <input
                            id="password-input"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                            className={`w-full px-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ${error ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-blue-800 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? 'Verifying...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-4">
                    <button onClick={onBack} className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
                        Choose a different account
                    </button>
                    {onDeleteProfile && (
                        <button 
                            onClick={onDeleteProfile}
                            className="text-xs font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                        >
                            Delete Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PasswordLoginScreen;