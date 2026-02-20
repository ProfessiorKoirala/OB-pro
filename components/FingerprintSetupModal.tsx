
import React from 'react';
import FingerprintIcon from './icons/FingerprintIcon';
import { User } from '../types';
import { arrayBufferToBase64Url, stringToArrayBuffer } from '../utils/dataUtils';


interface FingerprintSetupModalProps {
    onClose: () => void;
    onComplete: (credentialId: string) => void;
    user: User;
}

const FingerprintSetupModal: React.FC<FingerprintSetupModalProps> = ({ onClose, onComplete, user }) => {
    const handleSetup = async () => {
        try {
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
                challenge,
                rp: {
                    name: 'OB',
                },
                user: {
                    id: stringToArrayBuffer(user.id), 
                    name: user.email,
                    displayName: user.name,
                },
                pubKeyCredParams: [{ alg: -7, type: 'public-key' }], 
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    userVerification: 'required',
                },
                timeout: 60000,
                attestation: 'none',
            };

            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
            });

            if (credential && (credential as any).rawId) {
                const credentialId = arrayBufferToBase64Url((credential as any).rawId);
                onComplete(credentialId);
            } else {
                 throw new Error('Credential creation failed or was canceled.');
            }
        } catch (error) {
            console.error('Fingerprint setup error:', error);
            alert(`Could not set up fingerprint login. Error: ${(error as Error).message}`);
            onClose();
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <div className="bg-blue-100 dark:bg-white/10 p-5 rounded-full inline-block mb-6">
                        <FingerprintIcon className="w-16 h-16 text-primary dark:text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary dark:text-gray-100">Set up Fingerprint Login</h2>
                    <p className="text-text-secondary dark:text-gray-400 mt-2">
                        You will be prompted by your device to complete the setup.
                    </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl flex flex-col space-y-2">
                    <button
                        onClick={handleSetup}
                        className="w-full py-3 bg-primary dark:bg-white text-white dark:text-black font-bold rounded-lg hover:bg-blue-800 dark:hover:bg-gray-200"
                    >
                        Enable Fingerprint Login
                    </button>
                     <button
                        onClick={onClose}
                        className="w-full py-2 text-text-secondary dark:text-gray-400 font-semibold"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FingerprintSetupModal;
