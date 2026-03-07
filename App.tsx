import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleOAuthProvider, CodeResponse } from '@react-oauth/google';
import { getSupabase } from './src/supabase';
import { Session } from '@supabase/supabase-js';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import PermissionScreen from './screens/PermissionScreen';
import LoginScreen, { LocalCredentials } from './screens/LoginScreen';
import MainScreen from './MainScreen'; 
import { User, AppDataBackup, Theme, BusinessProfile, Promotion } from './types';
import AccountChooserScreen from './screens/AccountChooserScreen';
import { loadDataFromDrive, deleteDataFromDrive, saveDataToDrive, GOOGLE_CLIENT_ID, GAPI_TOKEN_EXPIRED_ERROR } from './googleApi';
import { getInitialData, loadLocalDataForUser, mergeWithInitialData, deleteLocalDataForUser } from './utils/dataUtils';
import PinLoginScreen from './screens/PinLoginScreen';
import PasswordLoginScreen from './screens/PasswordLoginScreen';
import PremiumFeatureScreen from './screens/PremiumFeatureScreen';
import AuthMethodChooserScreen from './screens/AuthMethodChooserScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import AuthenticationPromptModal from './components/AuthenticationPromptModal';
import GreetingScreen from './screens/GreetingScreen';
import { authenticateBiometric } from './utils/biometricUtils';
import PromotionModal from './components/PromotionModal';

type AppState = 'LOADING' | 'ONBOARDING' | 'PERMISSION' | 'AUTH' | 'AUTHENTICATING_USER' | 'DATA_LOADING' | 'GREETING' | 'LOGGED_IN' | 'COMPLETE_PROFILE';
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
    const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
    const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
    const [showPromotion, setShowPromotion] = useState(false);

    const handleSelectAccount = useCallback((user: User) => {
        setAuthenticatingUser(user);
        setSelectedAuthMethod(null);
        setAppState('AUTHENTICATING_USER');
    }, []);

    const handleGoogleSync = useCallback(async () => {
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err) {
            console.error("Google sync error:", err);
            alert("Failed to start Google sync. Please check your connection.");
        }
    }, []);

    const handleSupabaseSession = useCallback(async (session: Session) => {
        const { user } = session;
        const providerToken = session.provider_token;
        
        if (user && providerToken) {
            const userId = `google-${user.id}`;
            const gUser: User = {
                id: userId,
                name: user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                profilePicUrl: user.user_metadata.avatar_url || `https://i.pravatar.cc/150?u=${user.email}`,
                accountType: 'google' as const,
                accessToken: providerToken,
            };

            // If we are currently logged in as a Local user, we are migrating
            if (appState === 'LOGGED_IN' && activeUser?.accountType === 'local') {
                const oldUserId = activeUser.id;
                // Migrate data
                if (initialData) {
                    // Save to local for new user
                    localStorage.setItem(`ob-pro-data-${userId}`, JSON.stringify(initialData));
                    // Save to Drive for new user
                    try {
                        await saveDataToDrive(providerToken, initialData);
                    } catch (err) {
                        console.error("Failed to save data to Drive during migration:", err);
                    }
                }
                
                setUsers(prevUsers => {
                    const existingUser = prevUsers.find(u => u.id === userId);
                    const userForAuth = { ...(existingUser || {}), ...gUser };
                    const updatedUsers = prevUsers.some(u => u.id === userId)
                        ? prevUsers.map(u => (u.id === userId ? userForAuth : u))
                        : [...prevUsers, userForAuth];
                    localStorage.setItem('ob-pro-users', JSON.stringify(updatedUsers));
                    return updatedUsers;
                });

                setActiveUser(gUser);
                alert("Congratulations! You are now a premium user with Google Drive Sync enabled.");
                return;
            }

            setUsers(prevUsers => {
                const existingUser = prevUsers.find(u => u.id === userId);
                const userForAuth = { ...(existingUser || {}), ...gUser };
                const updatedUsers = prevUsers.some(u => u.id === userId)
                    ? prevUsers.map(u => (u.id === userId ? userForAuth : u))
                    : [...prevUsers, userForAuth];
                localStorage.setItem('ob-pro-users', JSON.stringify(updatedUsers));
                return updatedUsers;
            });
            
            // If we are in AUTH state or CHOOSE_ACCOUNT, log them in automatically
            if (appState === 'AUTH' || appState === 'LOADING') {
                handleSelectAccount(gUser);
            }
        }
    }, [appState, activeUser, initialData, handleSelectAccount]);

    const handleSupabaseSessionRef = useRef(handleSupabaseSession);
    useEffect(() => {
        handleSupabaseSessionRef.current = handleSupabaseSession;
    }, [handleSupabaseSession]);

    // Handle Supabase Auth State
    useEffect(() => {
        const supabase = getSupabase();
        if (!supabase) return;

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSupabaseSession(session);
            if (session) handleSupabaseSessionRef.current(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSupabaseSession(session);
            if (session) handleSupabaseSessionRef.current(session);
        });

        return () => subscription.unsubscribe();
    }, []); // Run only once
    const [selectedAuthMethod, setSelectedAuthMethod] = useState<AuthMethod>(null);
    const [verificationResult, setVerificationResult] = useState<'SUCCESS' | 'FAILURE' | null>(null);
    const [pendingDeletionUser, setPendingDeletionUser] = useState<User | null>(null);

    useEffect(() => {
        const root = window.document.documentElement;
        const applyInitialTheme = () => {
            const savedTheme = localStorage.getItem('ob-pro-global-theme') as Theme | null;
            if (activeUser) return; // MainScreen will handle it

            root.classList.remove('light', 'dark', 'midnight', 'forest', 'sunset', 'ocean');
            
            let effectiveTheme: string = savedTheme || 'light';
            if (savedTheme === 'system' || !savedTheme) {
                effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            
            root.classList.add(effectiveTheme);
            
            if (['dark', 'midnight', 'forest', 'sunset', 'ocean'].includes(effectiveTheme)) {
                root.classList.add('dark');
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

    const handleLogout = useCallback(async () => {
        const supabase = getSupabase();
        if (supabase) {
            await supabase.auth.signOut();
        }
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
                    name: existingUser?.name || gUser.name || gUser.email.split('@')[0],
                    email: gUser.email,
                    profilePicUrl: existingUser?.profilePicUrl || gUser.picture || `https://i.pravatar.cc/150?u=${gUser.email}`,
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

    const handleLoginComplete = useCallback((user: User) => {
        setUsers(prevUsers => {
            const exists = prevUsers.some(u => u.id === user.id);
            const updatedUsers = exists
                ? prevUsers.map(u => u.id === user.id ? { ...u, ...user } : u)
                : [...prevUsers, user];
            localStorage.setItem('ob-pro-users', JSON.stringify(updatedUsers));
            return updatedUsers;
        });
        handleSelectAccount(user);
    }, [handleSelectAccount]);

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
                            name: existingUser?.name || gUser.name || gUser.email.split('@')[0],
                            email: gUser.email,
                            profilePicUrl: existingUser?.profilePicUrl || gUser.picture || `https://i.pravatar.cc/150?u=${gUser.email}`,
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

    const handleGreetingFinish = async () => {
        if (verificationResult === 'SUCCESS') {
            // Fetch promotion from Supabase
            const supabase = getSupabase();
            if (supabase) {
                try {
                    const { data, error } = await supabase
                        .from('promotions')
                        .select('*')
                        .eq('isActive', true)
                        .order('createdAt', { ascending: false })
                        .limit(1);
                    
                    if (data && data.length > 0 && !error) {
                        setActivePromotion(data[0]);
                        setShowPromotion(true);
                    }
                } catch (err) {
                    console.error("Failed to fetch promotion:", err);
                }
            }

            if (activeUser && initialData) {
                const isNewProfile = initialData.businessProfile.businessName === 'My Business' && !initialData.businessProfile.phone;
                if (isNewProfile) {
                    setAppState('COMPLETE_PROFILE');
                } else {
                    setAppState('LOGGED_IN');
                }
            } else {
                setAppState('LOGGED_IN');
            }
        } else {
            setAppState('AUTH');
            setVerificationResult(null);
        }
    };

    const handleCompleteProfile = (updatedProfile: BusinessProfile) => {
        if (initialData) {
            const updatedData = { ...initialData, businessProfile: updatedProfile };
            setInitialData(updatedData);
            setAppState('LOGGED_IN');
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

    const performDeletion = useCallback(async (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        
        // If it's a Google account, try to delete from Drive
        if (userToDelete?.accountType === 'google' && userToDelete.accessToken) {
            try {
                await deleteDataFromDrive(userToDelete.accessToken);
            } catch (err) {
                console.error("Failed to delete data from Google Drive during profile deletion:", err);
                // We proceed with local deletion anyway
            }
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
        setPendingDeletionUser(null);
    }, [users, activeUser, authenticatingUser, handleLogout]);

    const handleDeleteUser = useCallback((userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) return;
        
        if (!window.confirm("Are you sure you want to delete this profile? This will permanently erase all business data associated with this account.")) {
            return;
        }
        
        setPendingDeletionUser(userToDelete);
    }, [users]);

    const renderContent = () => {
        const content = (() => {
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
                        : <LoginScreen onLocalLogin={handleLocalLoginAttempt} onLocalSignUp={handleLocalSignUp} onGoogleSignInClick={() => setShowPremiumScreen(true)} onLoginComplete={handleLoginComplete} onSignUpComplete={handleLoginComplete} />;
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
                        return <MainScreen activeUser={activeUser} initialData={initialData} onLogout={handleLogout} onUpdateUser={handleUpdateUser} onUpdateUserEmail={handleUpdateUserEmail} onDeleteUser={handleDeleteUser} onPremiumFeatureClick={handleGoogleSync} />;
                    }
                    return <SplashScreen />;
                case 'COMPLETE_PROFILE':
                    if (activeUser && initialData) {
                        return <CompleteProfileScreen user={activeUser} initialBusinessProfile={initialData.businessProfile} onComplete={handleCompleteProfile} />;
                    }
                    return <SplashScreen />;
                default:
                    return <SplashScreen />;
            }
        })();

        return (
            <>
                {content}
                {showPromotion && activePromotion && (
                    <PromotionModal 
                        promotion={activePromotion} 
                        onClose={() => setShowPromotion(false)} 
                    />
                )}
            </>
        );
    };
    
    return (
        <div className="h-full">
            {renderContent()}
            {pendingDeletionUser && (
                <AuthenticationPromptModal
                    user={pendingDeletionUser}
                    onConfirm={(credential) => {
                        const authType = (pendingDeletionUser.enablePinLogin && pendingDeletionUser.pinCode) ? 'pin' : (pendingDeletionUser.password ? 'password' : 'none');
                        let isValid = false;
                        if (authType === 'pin') isValid = credential === pendingDeletionUser.pinCode;
                        else if (authType === 'password') isValid = credential === pendingDeletionUser.password;
                        else if (authType === 'none') isValid = true; // Google account with no extra auth

                        if (isValid) {
                            performDeletion(pendingDeletionUser.id);
                            return true;
                        }
                        return false;
                    }}
                    onClose={() => setPendingDeletionUser(null)}
                />
            )}
        </div>
    );
};

const App: React.FC = () => {
    if (!GOOGLE_CLIENT_ID) return <div className="p-4 text-red-500">Config Error</div>;
    return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}><AppContent /></GoogleOAuthProvider>;
};

export default App;