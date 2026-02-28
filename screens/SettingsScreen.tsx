import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BusinessSettings, User, MainView, Theme, BusinessProfile, Denominations } from '../types';
import PinSetupModal from '../components/PinSetupModal';
import ConfirmationModal from '../components/ConfirmationModal';
import KeyIcon from '../components/icons/KeyIcon';
import PinIcon from '../components/icons/PinIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ExportIcon from '../components/icons/ExportIcon';
import ImportIcon from '../components/icons/ImportIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import GoogleIcon from '../components/icons/GoogleIcon';
import CloudIcon from '../components/icons/CloudIcon';
import TagIcon from '../components/icons/TagIcon';
import AuthenticationPromptModal from '../components/AuthenticationPromptModal';
import ColorSwatchIcon from '../components/icons/ColorSwatchIcon';
import LedgerIcon from '../components/icons/LedgerIcon';
import FolderIcon from '../components/icons/FolderIcon';
import { getDirectoryHandle } from '../utils/fileSystemApi';
import QrCodeIcon from '../components/icons/QrCodeIcon';
import ShieldIcon from '../components/icons/ShieldIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import InformationCircleIcon from '../components/icons/InformationCircleIcon';
import { isBiometricAvailable, registerBiometric } from '../utils/biometricUtils';
import FingerprintIcon from '../components/icons/FingerprintIcon';
import PrivacyPolicyModal from '../components/settings/PrivacyPolicyModal';
import WhatsNextModal from '../components/settings/WhatsNextModal';
import ImportantNotesModal from '../components/settings/ImportantNotesModal';
import ChartIcon from '../components/icons/ChartIcon';
import PrinterIcon from '../components/icons/PrinterIcon';
import HeartIcon from '../components/icons/HeartIcon';
import SupportDeveloperModal from '../components/settings/SupportDeveloperModal';
import CashCounter from '@/components/sales/CashCounter';
import CloseIcon from '../components/icons/CloseIcon';

interface SettingsScreenProps {
    isVatEnabled: boolean;
    onVatToggle: () => void;
    businessSettings: BusinessSettings;
    onUpdateBusinessSettings: (settings: BusinessSettings) => void;
    onExportData: () => void;
    onImportData: () => void;
    onLogout: () => void;
    activeUser: User;
    onUpdateUserSettings: (updates: Partial<User>) => void;
    setCurrentView: (view: MainView) => void;
    onClearAllData: () => void;
    onDeleteUser: (userId: string) => void;
    businessProfile: BusinessProfile;
    onUpdateBusinessProfile: (profile: BusinessProfile) => void;
    onPremiumFeatureClick?: () => void;
    syncStatus?: string;
    onForceSync?: () => void;
}

const SettingsRow: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; children?: React.ReactNode, onClick?: () => void; isDestructive?: boolean }> = ({ icon, title, subtitle, children, onClick, isDestructive }) => (
    <div onClick={onClick} className={`flex items-center space-x-4 p-4 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : ''} ${isDestructive ? 'text-red-600' : 'text-text-primary'}`}>
        <div className={isDestructive ? 'text-red-500' : 'text-primary'}>{icon}</div>
        <div className="flex-1">
            <h3 className={`font-semibold ${isDestructive ? 'text-red-600' : 'text-text-primary'}`}>{title}</h3>
            <p className={`text-sm ${isDestructive ? 'text-red-500/80' : 'text-text-secondary'}`}>{subtitle}</p>
        </div>
        <div>{children}</div>
    </div>
);

const Toggle: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; disabled?: boolean; }> = ({ enabled, onChange, disabled = false }) => (
    <button
        type="button"
        className={`${
        enabled ? 'bg-primary' : 'bg-gray-300'
        } relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
    >
        <span
        className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
        } inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ease-in-out`}
        />
    </button>
);

const SettingsCard: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors">
        <div className="flex justify-between items-center p-4">
            <h2 className="font-bold text-lg text-text-primary dark:text-gray-100">{title}</h2>
            {action && <div>{action}</div>}
        </div>
        {children}
    </div>
);


const ThemeSelector: React.FC<{ currentTheme: Theme, onSelect: (theme: Theme) => void }> = ({ currentTheme, onSelect }) => {
    const themes: { id: Theme; name: string; icon: React.ReactNode }[] = [
        { id: 'light', name: 'Light Mode', icon: <div className="w-6 h-6 rounded-full border bg-white shadow-sm" /> },
        { id: 'dark', name: 'Dark Mode', icon: <div className="w-6 h-6 rounded-full border bg-gray-900 shadow-sm" /> },
        { id: 'midnight', name: 'Midnight Blue', icon: <div className="w-6 h-6 rounded-full border bg-[#0f172a] shadow-sm" /> },
        { id: 'forest', name: 'Forest Green', icon: <div className="w-6 h-6 rounded-full border bg-[#064e3b] shadow-sm" /> },
        { id: 'sunset', name: 'Sunset Red', icon: <div className="w-6 h-6 rounded-full border bg-[#450a0a] shadow-sm" /> },
        { id: 'ocean', name: 'Ocean Deep', icon: <div className="w-6 h-6 rounded-full border bg-[#083344] shadow-sm" /> },
        { id: 'system', name: 'System Default', icon: <div className="w-6 h-6 rounded-full border bg-gradient-to-r from-white to-gray-900 shadow-sm" /> },
    ];

    return (
        <div className="p-4 grid grid-cols-2 gap-3">
            {themes.map(theme => (
                <button
                    key={theme.id}
                    onClick={() => onSelect(theme.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${currentTheme === theme.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}
                >
                    <div className="flex items-center space-x-3">
                        {theme.icon}
                        <span className="font-bold text-xs text-text-primary dark:text-gray-100">{theme.name}</span>
                    </div>
                    {currentTheme === theme.id && <CheckCircleIcon className="w-4 h-4 text-primary" />}
                </button>
            ))}
        </div>
    );
};

// Internal icon for ThemeSelector
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const daysOfWeek: (keyof BusinessSettings['workingDays'])[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const SettingsScreen: React.FC<SettingsScreenProps> = (props) => {
    const { businessSettings, onUpdateBusinessSettings, activeUser, onUpdateUserSettings, setCurrentView, onClearAllData, onDeleteUser, businessProfile, onUpdateBusinessProfile, onPremiumFeatureClick, syncStatus, onForceSync } = props;
    const [isPinModalOpen, setPinModalOpen] = useState(false);
    const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [clearDataStep, setClearDataStep] = useState(0);
    const [hasFileSystemAccess, setHasFileSystemAccess] = useState(false);
    const [isQrCodeExpanded, setIsQrCodeExpanded] = useState(false);
    const [activeModal, setActiveModal] = useState<'privacy' | 'roadmap' | 'safety' | 'support' | null>(null);
    const [biometricSupported, setBiometricSupported] = useState(false);
    const [isOpeningCashModalOpen, setOpeningCashModalOpen] = useState(false);
    const [isOpeningCashConfirmOpen, setOpeningCashConfirmOpen] = useState(false);
    const [pendingOpeningCash, setPendingOpeningCash] = useState<number | null>(null);
    const [tempDenominations, setTempDenominations] = useState<Denominations>({
        '1000': 0, '500': 0, '100': 0, '50': 0, '20': 0, '10': 0, '5': 0, 'coins': 0
    });

    const calculatedOpeningCash = useMemo(() => {
        return (Object.keys(tempDenominations) as Array<keyof Denominations>).reduce((acc, key) => {
            const multiplier = key === 'coins' ? 1 : parseInt(key, 10);
            return acc + (tempDenominations[key] * multiplier);
        }, 0);
    }, [tempDenominations]);

    const qrInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        isBiometricAvailable().then(setBiometricSupported);
    }, []);

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;


     useEffect(() => {
        const checkAccess = async () => {
            const handle = await getDirectoryHandle(false); // don't prompt
            setHasFileSystemAccess(!!handle);
        };
        checkAccess();
    }, []);

    const handleGrantAccess = async () => {
        const handle = await getDirectoryHandle(true); // prompt
        if (handle) {
            setHasFileSystemAccess(true);
            alert("File system access granted! Your data will now be saved to the folder you selected.");
        }
    };

    const handleLogoutClick = () => {
        if (isAnimating) return;
        setLogoutConfirmOpen(false); // Close modal
        setIsAnimating(true);
        setTimeout(() => {
            props.onLogout();
        }, 1500);
    };

    const handlePinSet = (pin: string) => {
        onUpdateUserSettings({ pinCode: pin, enablePinLogin: true });
        setPinModalOpen(false);
    };

    const handlePinToggle = (value: boolean) => {
        if (value && !activeUser.pinCode) {
            setPinModalOpen(true);
            return;
        }
        onUpdateUserSettings({ enablePinLogin: value });
    };

    const handleBiometricToggle = async (value: boolean) => {
        if (value) {
            try {
                const credentialId = await registerBiometric(activeUser.id, activeUser.name);
                if (credentialId) {
                    onUpdateUserSettings({ 
                        enableBiometricLogin: true, 
                        biometricCredentialId: credentialId 
                    });
                } else {
                    alert("Biometric registration was cancelled or failed.");
                }
            } catch (err) {
                console.error(err);
                alert("An error occurred during biometric registration.");
            }
        } else {
            onUpdateUserSettings({ enableBiometricLogin: false });
        }
    };
    
    const handleClearDataClick = () => {
      setClearDataStep(1);
    }

    const handleAuthAndClear = (credential: string): boolean => {
        const authType = activeUser.enablePinLogin && activeUser.pinCode ? 'pin' : (activeUser.accountType === 'local' ? 'password' : 'none');

        let isValid = false;
        if (authType === 'pin') {
            isValid = credential === activeUser.pinCode;
        } else if (authType === 'password') {
            isValid = credential === activeUser.password;
        }

        if (isValid) {
            onClearAllData();
            setClearDataStep(0);
            alert("All data has been cleared successfully.");
            return true;
        } else {
            return false;
        }
    };

    const handleQRUploadClick = () => {
        qrInputRef.current?.click();
    };
    
    const handleQRFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateBusinessProfile({ ...businessProfile, paymentQR: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveQR = () => {
        onUpdateBusinessProfile({ ...businessProfile, paymentQR: '' });
    };

    const handleSaveOpeningCashFromCount = () => {
        setPendingOpeningCash(calculatedOpeningCash);
        setOpeningCashConfirmOpen(true);
        setOpeningCashModalOpen(false);
    };

    const confirmOpeningCash = () => {
        if (pendingOpeningCash !== null) {
            onUpdateBusinessSettings({ 
                ...businessSettings, 
                openingCash: pendingOpeningCash,
                openingCashSetDate: new Date().toISOString().split('T')[0]
            });
            setPendingOpeningCash(null);
            setOpeningCashConfirmOpen(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const isOpeningCashSetToday = businessSettings.openingCashSetDate === today;

    const isGoogleConnected = props.activeUser.accountType === 'google';
    const hasLocalAuth = (activeUser.accountType === 'local' && activeUser.password) || (activeUser.enablePinLogin && activeUser.pinCode);
    
    const qrCodeAction = (
        <button
            onClick={() => setIsQrCodeExpanded(!isQrCodeExpanded)}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 transition-transform duration-300 ${isQrCodeExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    );


    return (
        <div className="p-4 pb-28 bg-background dark:bg-gray-900 min-h-full transition-colors">
            {isPinModalOpen && <PinSetupModal onClose={() => setPinModalOpen(false)} onPinSet={handlePinSet} />}
            {isLogoutConfirmOpen && (
                <ConfirmationModal 
                    title="Confirm Logout"
                    message="Are you sure you want to log out?"
                    onConfirm={handleLogoutClick}
                    onCancel={() => setLogoutConfirmOpen(false)}
                    confirmText="Logout"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}
            {clearDataStep === 1 && (
                <ConfirmationModal
                    title="Are you sure?"
                    message="This will delete all your business data. This action cannot be undone."
                    onConfirm={() => setClearDataStep(2)}
                    onCancel={() => setClearDataStep(0)}
                    confirmText="Yes, Continue"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}
            {clearDataStep === 2 && (
                <ConfirmationModal
                    title="Final Confirmation"
                    message="This is your final warning. All sales, expenses, inventory, and customer data will be PERMANENTLY erased. Are you absolutely certain?"
                    onConfirm={() => setClearDataStep(3)}
                    onCancel={() => setClearDataStep(0)}
                    confirmText="Yes, I Understand, Delete Everything"
                    confirmButtonClass="bg-red-800 hover:bg-red-900"
                />
            )}
            {clearDataStep === 3 && (
                <AuthenticationPromptModal
                    user={activeUser}
                    onConfirm={handleAuthAndClear}
                    onClose={() => setClearDataStep(0)}
                />
            )}
            {activeModal === 'privacy' && <PrivacyPolicyModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'roadmap' && <WhatsNextModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'safety' && <ImportantNotesModal onClose={() => setActiveModal(null)} />}
            <SupportDeveloperModal isOpen={activeModal === 'support'} onClose={() => setActiveModal(null)} />

            {isOpeningCashModalOpen && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-950 w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up border border-gray-100 dark:border-gray-800">
                        <header className="px-8 py-6 border-b dark:border-gray-900 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter italic">Opening Cash Count</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Calculate your starting float</p>
                            </div>
                            <button onClick={() => setOpeningCashModalOpen(false)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
                            <CashCounter 
                                denominations={tempDenominations} 
                                onChange={(key, val) => setTempDenominations(prev => ({ ...prev, [key]: val }))} 
                            />
                        </div>
                        <footer className="px-8 py-6 border-t dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between shrink-0">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Calculated</p>
                                <p className="text-xl font-black text-blue-600">
                                    ₹{calculatedOpeningCash.toLocaleString()}
                                </p>
                            </div>
                            <button 
                                onClick={handleSaveOpeningCashFromCount}
                                className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl text-xs uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg"
                            >
                                Apply to Float
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {isOpeningCashConfirmOpen && (
                <ConfirmationModal 
                    title="Confirm Opening Float"
                    message={`Are you sure you want to set the opening float to ₹${pendingOpeningCash?.toLocaleString()}? This cannot be changed until tomorrow.`}
                    onConfirm={confirmOpeningCash}
                    onCancel={() => {
                        setOpeningCashConfirmOpen(false);
                        setPendingOpeningCash(null);
                    }}
                    confirmText="Set Float"
                />
            )}

            <header className="mb-6 animate-slide-down flex items-center justify-between">
                <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">Settings</h1>
                <button 
                    onClick={() => setCurrentView(MainView.DASHBOARD)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm text-primary font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span>Home</span>
                </button>
            </header>
            
            <div className="space-y-6">
                 <SettingsCard title="Appearance">
                    <div className="border-t dark:border-gray-700">
                        <ThemeSelector
                            currentTheme={businessSettings.theme}
                            onSelect={(theme) => onUpdateBusinessSettings({ ...businessSettings, theme })}
                        />
                    </div>
                 </SettingsCard>
                 <SettingsCard title="Account & Sync">
                    <div className="border-t divide-y dark:border-gray-700 dark:divide-gray-700">
                        {isGoogleConnected ? (
                            <SettingsRow
                                icon={<CloudIcon className="h-7 w-7" />}
                                title="Connected to Google"
                                subtitle={props.activeUser.email}
                            />
                        ) : (
                            <SettingsRow
                                icon={<GoogleIcon className="h-7 w-7" />}
                                title="Google Drive Sync"
                                subtitle="Premium feature. Contact developer Sandesh Koirala: +977-9825953166"
                                onClick={onPremiumFeatureClick}
                            >
                                <span className="font-semibold text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Premium</span>
                            </SettingsRow>
                        )}
                    </div>
                 </SettingsCard>

                 <SettingsCard title="Security">
                    <div className="border-t divide-y dark:border-gray-700 dark:divide-gray-700">
                        <SettingsRow icon={<PinIcon className="h-7 w-7" />} title="PIN Login" subtitle={activeUser.pinCode ? 'PIN is set' : 'Quick login with a 4-digit PIN'}>
                            <Toggle enabled={!!activeUser.enablePinLogin} onChange={handlePinToggle} />
                        </SettingsRow>
                        {biometricSupported && (
                            <SettingsRow icon={<FingerprintIcon className="h-7 w-7" />} title="Biometric Login" subtitle="Use fingerprint or face ID to unlock">
                                <Toggle enabled={!!activeUser.enableBiometricLogin} onChange={handleBiometricToggle} />
                            </SettingsRow>
                        )}
                    </div>
                 </SettingsCard>
                
                 <SettingsCard title="Business Settings">
                    <div className="border-t divide-y dark:border-gray-700 dark:divide-gray-700">
                        <SettingsRow icon={<KeyIcon className="h-7 w-7" />} title="VAT / GST" subtitle="Enable tax calculation on sales">
                            <Toggle enabled={props.isVatEnabled} onChange={props.onVatToggle} />
                        </SettingsRow>
                         <SettingsRow icon={<PrinterIcon className="h-7 w-7" />} title="Kitchen Order Tickets (KOT)" subtitle="Enable printing orders for the kitchen">
                            <Toggle 
                                enabled={businessSettings.isKotEnabled} 
                                onChange={() => onUpdateBusinessSettings({...businessSettings, isKotEnabled: !businessSettings.isKotEnabled})} 
                            />
                        </SettingsRow>
                        <SettingsRow icon={<ChartIcon className="h-7 w-7" />} title="Daily Sales Target" subtitle={`Current goal: ${formatCurrency(businessSettings.dailySalesTarget || 0)}`}>
                            <input
                                type="number"
                                value={businessSettings.dailySalesTarget || ''}
                                onChange={e => onUpdateBusinessSettings({...businessSettings, dailySalesTarget: parseInt(e.target.value, 10) || 0})}
                                className="w-28 text-right font-semibold p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                placeholder="e.g. 5000"
                            />
                        </SettingsRow>
                        <SettingsRow icon={<LedgerIcon className="h-7 w-7" />} title="Opening Cash (Float)" subtitle={isOpeningCashSetToday ? "Float is locked for today" : `Starting cash: ${formatCurrency(businessSettings.openingCash || 0)}`}>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setOpeningCashModalOpen(true)}
                                    disabled={isOpeningCashSetToday}
                                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Calculate with Cash Count"
                                >
                                    <QrCodeIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="number"
                                    value={businessSettings.openingCash || ''}
                                    disabled={isOpeningCashSetToday}
                                    onChange={e => {
                                        const val = parseInt(e.target.value, 10) || 0;
                                        setPendingOpeningCash(val);
                                        setOpeningCashConfirmOpen(true);
                                    }}
                                    className="w-28 text-right font-semibold p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="e.g. 1000"
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow icon={<TagIcon className="h-7 w-7" />} title="Discounts & Offers" subtitle="Create and manage discounts" onClick={() => setCurrentView(MainView.DISCOUNTS)} />
                    </div>
                 </SettingsCard>

                 <SettingsCard title="Working Days">
                    <div className="p-4 border-t dark:border-gray-700">
                        <div className="flex justify-around items-center">
                            {daysOfWeek.map((day) => {
                                const isWorkingDay = businessSettings.workingDays[day];
                                return (
                                    <button
                                        key={day}
                                        onClick={() => {
                                            onUpdateBusinessSettings({
                                                ...businessSettings,
                                                workingDays: {
                                                    ...businessSettings.workingDays,
                                                    [day]: !isWorkingDay,
                                                },
                                            });
                                        }}
                                        className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                                            ${isWorkingDay 
                                                ? 'bg-primary text-white shadow-md' 
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        aria-pressed={isWorkingDay}
                                        title={day.charAt(0).toUpperCase() + day.slice(1)}
                                    >
                                        {day.substring(0, 2).toUpperCase()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </SettingsCard>

                <SettingsCard title="Payment QR Code" action={qrCodeAction}>
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isQrCodeExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
                        <div className="p-4 border-t dark:border-gray-700">
                            <p className="text-sm text-text-secondary dark:text-gray-400 mb-4">
                                Upload your business's payment QR code (e.g., FonePay, eSewa). It will be printed on customer bills for easy payment.
                            </p>
                            <div className="flex flex-col items-center space-y-4">
                                {businessProfile.paymentQR ? (
                                    <img src={businessProfile.paymentQR} alt="Payment QR Code" className="w-48 h-48 object-contain border rounded-lg bg-white" />
                                ) : (
                                    <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center text-text-secondary text-center p-4">
                                        <QrCodeIcon className="h-12 w-12 text-gray-400 mb-2" />
                                        No QR Code Uploaded
                                    </div>
                                )}
                                <div className="flex space-x-3">
                                    <input type="file" ref={qrInputRef} onChange={handleQRFileChange} hidden accept="image/*" />
                                    <button onClick={handleQRUploadClick} className="font-semibold text-sm bg-blue-100 text-primary px-4 py-2 rounded-lg hover:bg-blue-200">
                                        {businessProfile.paymentQR ? 'Change QR' : 'Upload QR'}
                                    </button>
                                    {businessProfile.paymentQR && (
                                        <button onClick={handleRemoveQR} className="font-semibold text-sm bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200">
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </SettingsCard>

                 <SettingsCard title="Data Management">
                    <div className="border-t dark:border-gray-700 divide-y dark:divide-gray-700">
                        {!hasFileSystemAccess && (
                            <SettingsRow 
                                icon={<FolderIcon className="h-7 w-7" />} 
                                title="Enable Persistent Storage" 
                                subtitle="Save data directly to your device"
                            >
                                <button 
                                    onClick={handleGrantAccess}
                                    className="font-semibold text-sm bg-blue-100 text-primary px-4 py-2 rounded-lg hover:bg-blue-200"
                                >
                                    Grant Access
                                </button>
                            </SettingsRow>
                        )}
                        <SettingsRow 
                            icon={<CloudIcon className="h-7 w-7" />} 
                            title="Save Data Locally" 
                            subtitle={isGoogleConnected ? "Keep a local copy for offline access" : "Data is always saved locally for this account"}
                        >
                            <Toggle 
                                enabled={businessSettings.saveDataLocally} 
                                onChange={(val) => onUpdateBusinessSettings({...businessSettings, saveDataLocally: val})}
                                disabled={!isGoogleConnected}
                            />
                        </SettingsRow>
                        <SettingsRow icon={<ExportIcon className="h-7 w-7" />} title="Export Data" subtitle="Download all data as a JSON file" onClick={props.onExportData} />
                        <SettingsRow icon={<ImportIcon className="h-7 w-7" />} title="Import Data" subtitle="Import from a backup file" onClick={props.onImportData} />
                        <SettingsRow 
                            icon={<CloudIcon className="h-7 w-7" />} 
                            title="Force Sync Now" 
                            subtitle={`Last status: ${syncStatus || 'Unknown'}`}
                        >
                            <button 
                                onClick={onForceSync}
                                className="font-semibold text-sm bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200"
                            >
                                Sync Now
                            </button>
                        </SettingsRow>
                        <SettingsRow 
                            icon={<LedgerIcon className="h-7 w-7" />} 
                            title="Historical Data Entry" 
                            subtitle="Manually add old records from your daybook" 
                            onClick={() => setCurrentView(MainView.HISTORICAL_DATA_ENTRY)} 
                        />
                    </div>
                 </SettingsCard>

                 <SettingsCard title="Information & Help">
                    <div className="border-t dark:border-gray-700 divide-y dark:divide-gray-700">
                        <SettingsRow 
                            icon={<ShieldIcon className="h-7 w-7" />} 
                            title="Privacy Policy" 
                            subtitle="How your data is stored and handled"
                            onClick={() => setActiveModal('privacy')}
                        />
                        <SettingsRow 
                            icon={<SparklesIcon className="h-7 w-7" />} 
                            title="What's Coming Next" 
                            subtitle="Check out our feature roadmap"
                            onClick={() => setActiveModal('roadmap')}
                        />
                        <SettingsRow 
                            icon={<InformationCircleIcon className="h-7 w-7" />} 
                            title="Data Safety" 
                            subtitle="Important notes to prevent data loss"
                            onClick={() => setActiveModal('safety')}
                        />
                        <SettingsRow 
                            icon={<HeartIcon className="h-7 w-7 text-red-500" />} 
                            title="Buy a coffee, support developer" 
                            subtitle="Support the development of OB Pro"
                            onClick={() => setActiveModal('support')}
                        />
                    </div>
                </SettingsCard>
                 
                 <SettingsCard title="Danger Zone">
                    <div className="border-t dark:border-gray-700 divide-y dark:divide-gray-700">
                        <SettingsRow 
                            icon={<TrashIcon className="h-7 w-7" />} 
                            title="Clear All Data" 
                            subtitle={hasLocalAuth ? "Permanently delete all business data" : "Set a PIN or Password to enable this feature"} 
                            isDestructive={true}
                        >
                            <button 
                                onClick={handleClearDataClick}
                                disabled={!hasLocalAuth}
                                className="font-semibold text-sm bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                Clear
                            </button>
                        </SettingsRow>
                        <SettingsRow 
                            icon={<TrashIcon className="h-7 w-7" />} 
                            title="Delete Entire Profile" 
                            subtitle="Permanently delete this account and all its data" 
                            isDestructive={true}
                        >
                            <button 
                                onClick={() => onDeleteUser(activeUser.id)}
                                className="font-semibold text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-md"
                            >
                                Delete Profile
                            </button>
                        </SettingsRow>
                    </div>
                 </SettingsCard>

                <div className="pt-8">
                    <button
                        onClick={() => setLogoutConfirmOpen(true)}
                        disabled={isAnimating}
                        className="w-full flex items-center justify-center gap-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-black py-5 rounded-[32px] border border-red-100 dark:border-red-900/20 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
                    >
                        <LogoutIcon className="h-5 w-5" />
                        <span>{isAnimating ? 'Authenticating Sign-out...' : 'Sign Out of Empire'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;