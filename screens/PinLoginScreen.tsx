import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface PinLoginScreenProps {
    correctPin: string;
    onSuccess: () => void;
    onBack: () => void;
    onDeleteProfile?: () => void;
    user: { name: string; profilePicUrl?: string };
}

const PinDisplay: React.FC<{ pin: string; hasError: boolean }> = ({ pin, hasError }) => (
    <div className={`flex justify-center space-x-4 ${hasError ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(i => (
            <div
                key={i}
                className={`w-5 h-5 rounded-full transition-all duration-200 ${
                    pin.length > i ? 'bg-primary scale-110' : 'bg-gray-300'
                } ${hasError ? '!bg-red-500' : ''}`}
            ></div>
        ))}
    </div>
);

const KeypadButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
    <button
        onClick={onClick}
        className="h-16 w-16 sm:h-20 sm:w-20 text-2xl sm:text-3xl font-semibold text-text-primary rounded-full flex items-center justify-center bg-white/50 hover:bg-white active:bg-gray-100 transition-colors shadow-sm"
    >
        {label}
    </button>
);

const PinLoginScreen: React.FC<PinLoginScreenProps> = ({ correctPin, onSuccess, onBack, onDeleteProfile, user }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === correctPin) {
                onSuccess();
            } else {
                setError('Incorrect PIN. Please try again.');
                setTimeout(() => {
                    setPin('');
                    setError('');
                }, 800);
            }
        }
    }, [pin, correctPin, onSuccess]);

    const handleKeyPress = (digit: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-xs text-center">
                <img src={user.profilePicUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg border-4 border-white" />
                <h1 className="text-2xl font-bold text-text-primary">Welcome, {user.name.split(' ')[0]}</h1>
                <p className="text-text-secondary mt-2">Enter your PIN to unlock</p>
                
                <div className="my-8">
                    <PinDisplay pin={pin} hasError={!!error} />
                    <p className="text-red-500 text-sm font-semibold min-h-[20px] mt-3">{error}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 place-items-center">
                    {[ '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                        <KeypadButton key={digit} onClick={() => handleKeyPress(digit)} label={digit} />
                    ))}
                    <button onClick={onBack} className="font-semibold text-text-secondary h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center text-sm">Back</button>
                    <KeypadButton onClick={() => handleKeyPress('0')} label="0" />
                    <KeypadButton onClick={handleBackspace} label="⌫" />
                </div>

                <div className="mt-12 flex flex-col items-center gap-4">
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

export default PinLoginScreen;