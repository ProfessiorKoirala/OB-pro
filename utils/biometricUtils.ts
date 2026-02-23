
export const isBiometricAvailable = async (): Promise<boolean> => {
    try {
        return !!(
            window.PublicKeyCredential &&
            await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        );
    } catch (e) {
        console.warn("Biometric check failed:", e);
        return false;
    }
};

export const registerBiometric = async (userId: string, userName: string): Promise<string | null> => {
    try {
        if (!window.PublicKeyCredential || !navigator.credentials) {
            throw new Error("WebAuthn or Credentials API not supported in this browser.");
        }
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const userID = new TextEncoder().encode(userId);

        const publicKey: PublicKeyCredentialCreationOptions = {
            challenge,
            rp: {
                name: "OB Pro Terminal",
                id: window.location.hostname,
            },
            user: {
                id: userID,
                name: userName,
                displayName: userName,
            },
            pubKeyCredParams: [
                { alg: -7, type: "public-key" }, // ES256
                { alg: -257, type: "public-key" }, // RS256
            ],
            authenticatorSelection: {
                authenticatorAttachment: "platform",
                userVerification: "required",
                residentKey: "preferred",
            },
            timeout: 60000,
            attestation: "none",
        };

        const credential = await navigator.credentials.create({
            publicKey,
        }) as PublicKeyCredential;

        if (credential) {
            // In a real app, you'd send credential.rawId to the server.
            // Here we'll just return the base64 encoded ID to store locally.
            return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        }
        return null;
    } catch (error: any) {
        console.error("Biometric registration failed:", error);
        if (error.name === 'SecurityError' || error.name === 'NotAllowedError') {
            alert("Biometric access is blocked by your browser or security policy. If you are in a preview frame, try opening the app in a new tab.");
        }
        return null;
    }
};

export const authenticateBiometric = async (credentialId: string): Promise<boolean> => {
    try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const rawId = new Uint8Array(
            atob(credentialId)
                .split("")
                .map((c) => c.charCodeAt(0))
        );

        const publicKey: PublicKeyCredentialRequestOptions = {
            challenge,
            allowCredentials: [
                {
                    id: rawId,
                    type: "public-key",
                    transports: ["internal"],
                },
            ],
            userVerification: "required",
            timeout: 60000,
        };

        const assertion = await navigator.credentials.get({
            publicKey,
        });

        return !!assertion;
    } catch (error) {
        console.error("Biometric authentication failed:", error);
        return false;
    }
};
