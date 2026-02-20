import React, { useState } from 'react';

interface PinSetupModalProps {
    onClose: () => void;
    onPinSet: (pin: string) => void;
}

const PinDisplay: React.FC<{ pin: string }> = ({ pin }) => (
    <div className="flex justify-center space-x-4">
        {[0, 1, 2, 3].map(i => (
            <div
                key={i}
                className={`w-4 h-4 rounded-full transition-colors ${
                    pin.length > i ? 'bg-primary' : 'bg-gray-300'
                }`}
            ></div>
        ))}
    </div>
);

const KeypadButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
    <button
        onClick={onClick}
        className="h-16 w-16 text-2xl font-semibold text-text-primary rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
    >
        {label}
    </button>
);

const PinSetupModal: React.FC<PinSetupModalProps> = ({ onClose, onPinSet }) => {
    const [step, setStep] = useState<'enter' | 'confirm'>('enter');
    const [pin, setPin] = useState('');
    const [firstPin, setFirstPin] = useState('');
    const [error, setError] = useState('');

    const handleKeyPress = (digit: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + digit);
            setError('');
        }
    };
    
    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError('');
    };

    const handleNext = () => {
        if (pin.length !== 4) {
            setError('PIN must be 4 digits long.');
            return;
        }
        setFirstPin(pin);
        setPin('');
        setStep('confirm');
    };

    const handleConfirm = () => {
        if (pin !== firstPin) {
            setError('PINs do not match. Please try again.');
            setFirstPin('');
            setPin('');
            setStep('enter');
            return;
        }
        onPinSet(pin);
    };

    const title = step === 'enter' ? 'Create a 4-Digit PIN' : 'Confirm Your PIN';
    const description = step === 'enter'
        ? 'This PIN will be used for quick login.'
        : 'Please enter the same PIN again to confirm.';

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-text-primary">{title}</h2>
                    <p className="text-sm text-text-secondary mt-1">{description}</p>
                    <div className="my-6">
                        <PinDisplay pin={pin} />
                    </div>
                    {error && <p className="text-red-500 text-xs min-h-[16px]">{error}</p>}
                </div>

                <div className="p-4 bg-gray-50 rounded-b-xl">
                    <div className="grid grid-cols-3 gap-4 place-items-center">
                        {[ '7', '8', '9', '4', '5', '6', '1', '2', '3'].map(digit => (
                            <KeypadButton key={digit} onClick={() => handleKeyPress(digit)} label={digit} />
                        ))}
                         <div/>
                        <KeypadButton onClick={() => handleKeyPress('0')} label="0" />
                        <KeypadButton onClick={handleBackspace} label="⌫" />
                    </div>
                </div>

                <div className="p-4">
                    {step === 'enter' ? (
                        <button onClick={handleNext} className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-800 disabled:bg-gray-400" disabled={pin.length !== 4}>
                            Next
                        </button>
                    ) : (
                        <button onClick={handleConfirm} className="w-full py-3 bg-secondary text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-400" disabled={pin.length !== 4}>
                            Confirm PIN
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PinSetupModal;