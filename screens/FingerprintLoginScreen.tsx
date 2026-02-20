import React, { useEffect } from 'react';
import FingerprintIcon from '../components/icons/FingerprintIcon';
import { base64UrlToArrayBuffer } from '../utils/dataUtils';

interface FingerprintLoginScreenProps {
    onSuccess: () => void;
    onBack: () => void;
    user: { name: string; profilePicUrl?: string; credentialId?: string };
}

const FingerprintLoginScreen: React.FC<FingerprintLoginScreenProps> = ({ onSuccess, onBack, user }) => {
    useEffect(() => {
        const authenticate = async () => {
             if (!user.credentialId) {
                alert('Fingerprint not set up for this user. Please log in with another method and enable it in Settings.');
                onBack();
                return;
            }
            try {
                const challenge = new Uint8Array(32);
                crypto.getRandomValues(challenge);

                const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
                    challenge,
                    allowCredentials: [{
                        id: base64UrlToArrayBuffer(user.credentialId),
                        type: 'public-key',
                        transports: ['internal'],
                    }],
                    timeout: 60000,
                    userVerification: 'required',
                };

                const assertion = await navigator.credentials.get({
                    publicKey: publicKeyCredentialRequestOptions,
                });

                if (assertion) {
                    onSuccess();
                } else {
                    throw new Error('Authentication assertion failed.');
                }
            } catch (error) {
                console.error('Fingerprint login error:', error);
                // Don't alert on user cancellation (AbortError)
                if ((error as Error).name !== 'AbortError' && (error as Error).name !== 'NotAllowedError') {
                    alert(`Fingerprint login failed. Please try another method. Error: ${(error as Error).message}`);
                }
                onBack();
            }
        };

        // Delay to allow animation to show before OS prompt
        const timeoutId = setTimeout(authenticate, 500);

        return () => clearTimeout(timeoutId);
    }, [onSuccess, onBack, user.credentialId]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
            <img src={user.profilePicUrl} alt={user.name} className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg border-4 border-white" />
            <h1 className="text-2xl font-bold text-text-primary">Welcome, {user.name.split(' ')[0]}</h1>
            <p className="text-text-secondary mt-2">Use your fingerprint to log in</p>
            
            <div className="my-12">
                <div className="relative flex items-center justify-center h-40 w-40">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
                    <div className="absolute inset-2 bg-primary/20 rounded-full animate-ping delay-200"></div>
                     <div className="bg-white p-6 rounded-full inline-block shadow-inner">
                        <FingerprintIcon className="w-20 h-20 text-primary" />
                    </div>
                </div>
            </div>

            <p className="text-text-secondary font-medium text-lg">Waiting for authentication...</p>
            
            <button onClick={onBack} className="mt-8 text-primary font-semibold">
                Use another method
            </button>
        </div>
    );
};

export default FingerprintLoginScreen;