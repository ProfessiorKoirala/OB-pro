import React, { useState, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider, CodeResponse } from '@react-oauth/google';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import PermissionScreen from './screens/PermissionScreen';
import LoginScreen, { LocalCredentials } from './screens/LoginScreen';
import MainScreen from './MainScreen'; 
import { User, AppDataBackup } from './types';
import AccountChooserScreen from './screens/AccountChooserScreen';
import { loadDataFromDrive, GOOGLE_CLIENT_ID, GAPI_TOKEN_EXPIRED_ERROR } from './googleApi';
import { getInitialData, loadLocalDataForUser, mergeWithInitialData, deleteLocalDataForUser } from './utils/dataUtils';
import PinLoginScreen from './screens/PinLoginScreen';
import PasswordLoginScreen from './screens/PasswordLoginScreen';
import PremiumFeatureScreen from './screens/PremiumFeatureScreen';
import AuthMethodChooserScreen from './screens/AuthMethodChooserScreen';
import GreetingScreen from './screens/GreetingScreen';
import { authenticateBiometric } from './utils/biometricUtils';

type AppState = 'LOADING' | 'ONBOARDING' | 'PERMISSION' | 'AUTH' | 'AUTHENTICATING_USER' | 'DATA_LOADING' | 'GREETING' | 'LOGGED_IN';
type AuthState = 'CHOOSE_ACCOUNT' | 'LOGIN_FORM';
type AuthMethod = 'PIN' | 'PASSWORD' | 'BIOMETRIC' | null;

const AppContent: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('LOADING');
    const [authState, setAuthState] = useState<AuthState>('LOGIN_FORM');
    const [users, setUsers] = useState<User[]>([]);
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [authenticatingUser, setAuthenticatingUser] = useState<User | null>(null);
    const [initialData, setInitialData] = useState<AppDataBackup | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('Loading...');
    const [showPremiumScreen, setShowPremiumScreen] = useState(false);
    const [selectedAuthMethod, setSelectedAuthMethod] = useState<AuthMethod>(null);
    const [verificationResult, setVerificationResult] = useState<'SUCCESS' | 'FAILURE' | null>(null);

    useEffect(() => {
        const root = window.document.documentElement;
        const applyInitialTheme = () => {
            const savedTheme = localStorage.getItem('ob-pro-global-theme');
            if (activeUser) return; // MainScreen will handle it

            root.classList.remove('light', 'dark');
            if (savedTheme === 'dark') {
                root.classList.add('dark');
            } else if (savedTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                // Default to light for initial screens
                root.classList.add('light');
            }
        };
        
        applyInitialTheme();
        
        if (!activeUser && localStorage.getItem('ob-pro-global-theme') === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyInitialTheme();
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [activeUser]);

    const handleLogout = useCallback(() => {
        setActiveUser(null);
        setInitialData(null);
        setAuthenticatingUser(null);
        setSelectedAuthMethod(null);
        setVerificationResult(null);
        
        const storedUsersStr = localStorage.getItem('ob-pro-users') || localStorage.getItem('mynager-users');
        const storedUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];

        if (storedUsers.length > 0) {
            setAuthState('CHOOSE_ACCOUNT');
        } else {
            setAuthState('LOGIN_FORM');
        }
        setAppState('AUTH');
    }, []);
    
    const loadUserData = useCallback(async (user: User): Promise<AppDataBackup> => {
        try {
            if (user.accountType === 'google') {
                if (!user.accessToken) {
                    throw new Error("Google user is missing an access token. Please log in again.");
                }
                const driveData = await loadDataFromDrive(user.accessToken);
                // mergeWithInitialData ensures driveData has all required properties of AppDataBackup
                return mergeWithInitialData(driveData);
            } else { 
                const localData = await loadLocalDataForUser(user.id);
                if (!localData.settings.saveDataLocally) {
                    localData.settings.saveDataLocally = true;
                }
                return localData;
            }
        } catch (error) {
            if ((error as Error).message === GAPI_TOKEN_EXPIRED_ERROR) {
                alert("Your session has expired. Please log in again.");
            }
            handleLogout();
            throw error; 
        }
    }, [handleLogout]);

    const handleAuthAttempt = useCallback(async (isCorrect: boolean, userToVerify: User) => {
        if (isCorrect) {
            setVerificationResult('SUCCESS');
            setAppState('GREETING');
            try {
                const loadedData = await loadUserData(userToVerify);
                setInitialData(loadedData);
                setActiveUser(userToVerify);
            } catch (error) {
                console.error("Data load failed", error);
            }
        } else {
            setVerificationResult('FAILURE');
            setAppState('GREETING');
        }
    }, [loadUserData]);

    const handleGoogleCodeResponse = useCallback(async (codeResponse: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>) => {
        try {
            const codeVerifier = sessionStorage.getItem('react-oauth-google-code-verifier');
            sessionStorage.removeItem('react-oauth-google-code-verifier');
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code: codeResponse.code,
                    client_id: GOOGLE_CLIENT_ID,
                    grant_type: 'authorization_code',
                    redirect_uri: window.location.origin,
                    code_verifier: codeVerifier || "",
                })
            });
            const tokens = await tokenResponse.json();
            const accessToken = tokens.access_token;
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const gUser = await userInfoResponse.json();
            const userId = `google-${gUser.sub}`;
            setUsers(prevUsers => {
                const existingUser = prevUsers.find(u => u.id === userId);
                const userForAuth: User = {
                    ...(existingUser || {}),
                    id: userId,
                    name: existingUser?.name || gUser.email.split('@')[0],
                    email: gUser.email,
                    profilePicUrl: existingUser?.profilePicUrl || `https://i.pravatar.cc/150?u=${gUser.email}`,
                    accountType: 'google',
                    accessToken: accessToken,
                };
                const updatedUsers = prevUsers.some(u => u.id === userId)
                    ? prevUsers.map(u => (u.id === userId ? userForAuth : u))
                    : [...prevUsers, userForAuth];
                localStorage.setItem('ob-pro-users', JSON.stringify(updatedUsers));
                handleSelectAccount(userForAuth);
                return updatedUsers;
            });
        } catch (error) {
            console.error("Google login failed:", error);
        }
    }, []);

    const handleSelectAccount = useCallback((user: User) => {
        setAuthenticatingUser(user);
        setSelectedAuthMethod(null);
        setAppState('AUTHENTICATING_USER');
    }, []);

    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
                const tokens = event.data.tokens;
                const accessToken = tokens.access_token;
                
                try {
                    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    const gUser = await userInfoResponse.json();
                    const userId = `google-${gUser.sub}`;
                    
                    setUsers(prevUsers => {
                        const existingUser = prevUsers.find(u => u.id === userId);
                        const userForAuth: User = {
                            ...(existingUser || {}),
                            id: userId,
                            name: existingUser?.name || gUser.email.split('@')[0],
                            email: gUser.email,
                            profilePicUrl: existingUser?.profilePicUrl || `https://i.pravatar.cc/150?u=${gUser.email}`,
                            accountType: 'google',
                            accessToken: accessToken,
                        };
                        const updatedUsers = prevUsers.some(u => u.id === userId)
                            ? prevUsers.map(u => (u.id === userId ? userForAuth : u))
                            : [...prevUsers, userForAuth];
                        localStorage.setItem('ob-pro-users', JSON.stringify(updatedUsers));
                        handleSelectAccount(userForAuth);
                        return updatedUsers;
                    });
                } catch (error) {
                    console.error("Failed to fetch user info after Google login:", error);
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleSelectAccount]);

    const handleBiometricLogin = useCallback(async (user: User) => {
        if (user.biometricCredentialId) {
            const success = await authenticateBiometric(user.biometricCredentialId);
            if (success) {
                handleAuthAttempt(true, user);
            } else {
                alert("Biometric authentication failed or was cancelled.");
                setSelectedAuthMethod(null);
            }
        }
    }, [handleAuthAttempt]);

    useEffect(() => {
        if (appState === 'AUTHENTICATING_USER' && authenticatingUser) {
            const isGoogleAccount = authenticatingUser.accountType === 'google';
            const hasPinAuth = authenticatingUser.enablePinLogin && authenticatingUser.pinCode;
            const hasBiometricAuth = authenticatingUser.enableBiometricLogin && authenticatingUser.biometricCredentialId;
            
            if (isGoogleAccount && !hasPinAuth && !hasBiometricAuth) {
                handleAuthAttempt(true, authenticatingUser);
            } else if (selectedAuthMethod === 'BIOMETRIC') {
                handleBiometricLogin(authenticatingUser);
            }
        }
    }, [appState, authenticatingUser, handleAuthAttempt, selectedAuthMethod, handleBiometricLogin]);

    const handleOnboardingComplete = () => {
        localStorage.setItem('ob-pro-onboarded', 'true');
        setAppState('PERMISSION');
    };
    
    const handlePermissionComplete = () => {
        setAppState('AUTH');
    };
    
    const handleLocalLoginAttempt = useCallback(async (credentials: LocalCredentials): Promise<{ user: User } | { error: string }> => {
        const userId = `local-${credentials.email}`;
        const existingUser = users.find(u => u.id === userId);
        if (existingUser) {
            const isCorrect = existingUser.password === credentials.password;
            handleAuthAttempt(isCorrect, existingUser);
            return isCorrect ? { user: existingUser } : { error: "Verification Failed" };
        }
        return { error: "No account found." };
    }, [users, handleAuthAttempt]);
    
    const handleLocalSignUp = useCallback(async (credentials: LocalCredentials): Promise<{ user: User } | { error: string }> => {
        const userId = `local-${credentials.email}`;
        const newUser: User = {
            id: userId,
            name: credentials.name || credentials.email.split('@')[0],
            email: credentials.email,
            accountType: 'local',
            password: credentials.password,
            profilePicUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.name || credentials.email}`
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('ob-pro-users', JSON.stringify(updatedUsers));
        handleAuthAttempt(true, newUser);
        return { user: newUser };
    }, [users, handleAuthAttempt]);

    const handleGreetingFinish = () => {
        if (verificationResult === 'SUCCESS') {
            setAppState('LOGGED_IN');
        } else {
            setAppState('AUTH');
            setVerificationResult(null);
        }
    };

    const handleUpdateUser = useCallback((updatedUser: User) => {
        setUsers(prevUsers => {
            const updatedUsers = prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
            localStorage.setItem('ob-pro-users', JSON.stringify(updatedUsers));
            return updatedUsers;
        });
        setActiveUser(updatedUser);
    }, []);

    const handleUpdateUserEmail = useCallback((oldUserId: string, migratedUser: User) => {
        setUsers(prevUsers => {
            const updatedUsers = prevUsers.map(u => u.id === oldUserId ? migratedUser : u);
            localStorage.setItem('ob-pro-users', JSON.stringify(updatedUsers));
            return updatedUsers;
        });
        setActiveUser(migratedUser);
        
        const oldDataKey = `ob-pro-data-${oldUserId}`;
        const newDataKey = `ob-pro-data-${migratedUser.id}`;
        const data = localStorage.getItem(oldDataKey);
        if (data) {
            localStorage.setItem(newDataKey, data);
            localStorage.removeItem(oldDataKey);
        }

        const oldPendingKey = `ob-pro-pending-orders-${oldUserId}`;
        const newPendingKey = `ob-pro-pending-orders-${migratedUser.id}`;
        const pendingOrdersData = localStorage.getItem(oldPendingKey);
        if (pendingOrdersData) {
            localStorage.setItem(newPendingKey, pendingOrdersData);
            localStorage.removeItem(oldPendingKey);
        }
    }, []);

    const handleDeleteUser = useCallback((userId: string) => {
        if (!window.confirm("Are you sure you want to delete this profile? This will permanently erase all business data associated with this account.")) {
            return;
        }

        setUsers(prevUsers => {
            const updatedUsers = prevUsers.filter(u => u.id !== userId);
            localStorage.setItem('ob-pro-users', JSON.stringify(updatedUsers));
            
            if (updatedUsers.length === 0) {
                setAuthState('LOGIN_FORM');
            } else {
                setAuthState('CHOOSE_ACCOUNT');
            }
            return updatedUsers;
        });
        
        // Delete their local data
        deleteLocalDataForUser(userId);
        localStorage.removeItem(`ob-pro-data-${userId}`);
        localStorage.removeItem(`ob-pro-pending-orders-${userId}`);
        
        // If the deleted user was the active user, log out
        if (activeUser?.id === userId) {
            handleLogout();
        } else if (authenticatingUser?.id === userId) {
            setAuthenticatingUser(null);
            setAppState('AUTH');
        }
    }, [activeUser, authenticatingUser, handleLogout]);

    const renderContent = () => {
        switch (appState) {
            case 'LOADING':
                return <SplashScreen onComplete={() => {
                    const storedUsersStr = localStorage.getItem('ob-pro-users') || localStorage.getItem('mynager-users');
                    const storedUsers = storedUsersStr ? JSON.parse(storedUsersStr) : [];
                    setUsers(storedUsers);
                    const hasOnboarded = (localStorage.getItem('ob-pro-onboarded') || localStorage.getItem('mynager-onboarded')) === 'true';
                    if (!hasOnboarded) setAppState('ONBOARDING');
                    else {
                        if (storedUsers.length > 0) setAuthState('CHOOSE_ACCOUNT');
                        else setAuthState('LOGIN_FORM');
                        setAppState('AUTH');
                    }
                }} />;
            case 'DATA_LOADING':
                return <SplashScreen message={loadingMessage} onComplete={() => setAppState('GREETING')} />;
            case 'GREETING':
                return <GreetingScreen status={verificationResult || 'SUCCESS'} onFinish={handleGreetingFinish} />;
            case 'ONBOARDING':
                return <OnboardingScreen onComplete={handleOnboardingComplete} />;
            case 'PERMISSION':
                return <PermissionScreen onResult={handlePermissionComplete} />;
            case 'AUTH':
                if (showPremiumScreen) return <PremiumFeatureScreen onBack={() => setShowPremiumScreen(false)} />;
                return authState === 'CHOOSE_ACCOUNT' 
                    ? <AccountChooserScreen users={users} onSelectAccount={handleSelectAccount} onAddNewAccount={() => setAuthState('LOGIN_FORM')} onPremiumClick={() => setShowPremiumScreen(true)} onDeleteAccount={handleDeleteUser} />
                    : <LoginScreen onLocalLogin={handleLocalLoginAttempt} onLocalSignUp={handleLocalSignUp} onGoogleSignInClick={() => setShowPremiumScreen(true)} onLoginComplete={()=>{}} onSignUpComplete={()=>{}} />;
            case 'AUTHENTICATING_USER':
                if (!authenticatingUser) return <SplashScreen />;
                if ((authenticatingUser.pinCode || authenticatingUser.enableBiometricLogin) && !selectedAuthMethod) {
                    return <AuthMethodChooserScreen user={authenticatingUser} onSelect={setSelectedAuthMethod} onBack={() => setAppState('AUTH')} />;
                }
                if (selectedAuthMethod === 'BIOMETRIC') {
                    return <SplashScreen message="Authenticating Biometric..." onComplete={() => {}} />;
                }
                return selectedAuthMethod === 'PIN' || (authenticatingUser.pinCode && !selectedAuthMethod)
                    ? <PinLoginScreen user={authenticatingUser} correctPin={authenticatingUser.pinCode!} onSuccess={() => handleAuthAttempt(true, authenticatingUser)} onBack={() => setAppState('AUTH')} onDeleteProfile={() => handleDeleteUser(authenticatingUser.id)} />
                    : <PasswordLoginScreen user={authenticatingUser} onSuccess={(pass) => {
                        const isCorrect = pass === authenticatingUser.password;
                        handleAuthAttempt(isCorrect, authenticatingUser);
                        return isCorrect;
                    }} onBack={() => setAppState('AUTH')} onDeleteProfile={() => handleDeleteUser(authenticatingUser.id)} />;
            case 'LOGGED_IN':
                if (activeUser && initialData) {
                    return <MainScreen activeUser={activeUser} initialData={initialData} onLogout={handleLogout} onUpdateUser={handleUpdateUser} onUpdateUserEmail={handleUpdateUserEmail} onDeleteUser={handleDeleteUser} />;
                }
                return <SplashScreen />;
            default:
                return <SplashScreen />;
        }
    };
    
    return <div className="h-full">{renderContent()}</div>;
};

const App: React.FC = () => {
    if (!GOOGLE_CLIENT_ID) return <div className="p-4 text-red-500">Config Error</div>;
    return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}><AppContent /></GoogleOAuthProvider>;
};

export default App;