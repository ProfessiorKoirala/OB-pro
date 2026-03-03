import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AuthenticationPromptModalProps {
    user: User;
    onConfirm: (credential: string) => boolean; // Returns true on success, false on failure
    onClose: () => void;
}

// Reusable components from PIN screens
const PinDisplay: React.FC<{ pin: string; hasError: boolean }> = ({ pin, hasError }) => (
    <div className={`flex justify-center space-x-4 ${hasError ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all duration-200 ${ pin.length > i ? 'bg-primary' : 'bg-gray-300' } ${hasError ? '!bg-red-500' : ''}`} />
        ))}
    </div>
);

const KeypadButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
    <button type="button" onClick={onClick} className="h-16 w-16 text-2xl font-semibold text-text-primary rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors">
        {label}
    </button>
);

const AuthenticationPromptModal: React.FC<AuthenticationPromptModalProps> = ({ user, onConfirm, onClose }) => {
    const [authType, setAuthType] = useState<'pin' | 'password' | 'none'>('none');
    const [pin, setPin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user.enablePinLogin && user.pinCode) {
            setAuthType('pin');
        } else if (user.password) {
            setAuthType('password');
        }
    }, [user]);

    const handlePinKeyPress = (digit: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit);
            setError('');
        }
    };

    const handlePinBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError('');
    };

    const handleSubmit = () => {
        const credential = authType === 'pin' ? pin : password;
        if (!credential) return;

        const success = onConfirm(credential);
        if (!success) {
            setError(`Incorrect ${authType}. Please try again.`);
            if (authType === 'pin') setPin('');
            setPassword('');
        }
    };
    
    if (authType === 'none') {
        // This case should be prevented by the parent component logic, but as a fallback:
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
                    <p>No authentication method available.</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Close</button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-text-primary">Confirm Your Identity</h2>
                    <p className="text-sm text-text-secondary mt-1">
                        Enter your {authType} to proceed with this action.
                    </p>
                    
                    <div className="my-6">
                        {authType === 'pin' ? (
                            <PinDisplay pin={pin} hasError={!!error} />
                        ) : (
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                autoFocus
                                className={`w-full px-4 py-3 text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm ${error ? 'border-red-500 animate-shake' : 'border-gray-300'}`}
                            />
                        )}
                         <p className="text-red-500 text-xs font-semibold min-h-[16px] mt-2">{error}</p>
                    </div>
                </div>

                {authType === 'pin' && (
                    <div className="p-4 bg-gray-50">
                        <div className="grid grid-cols-3 gap-4 place-items-center">
                            {[ '7', '8', '9', '4', '5', '6', '1', '2', '3'].map(digit => (
                                <KeypadButton key={digit} onClick={() => handlePinKeyPress(digit)} label={digit} />
                            ))}
                            <div/>
                            <KeypadButton onClick={() => handlePinKeyPress('0')} label="0" />
                            <KeypadButton onClick={handlePinBackspace} label="⌫" />
                        </div>
                    </div>
                )}

                <div className="p-4 bg-gray-50 rounded-b-xl flex space-x-2">
                     <button type="button" onClick={onClose} className="w-full py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300">Cancel</button>
                     <button
                        onClick={handleSubmit}
                        disabled={(authType === 'pin' && pin.length !== 4) || (authType === 'password' && !password)}
                        className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthenticationPromptModal;
