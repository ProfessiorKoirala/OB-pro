import React, { useEffect, useState, useRef } from 'react';
import { MainView, User, BusinessSettings } from '../types';

// Icons
import OrdersIcon from './icons/OrdersIcon';
import SalesIcon from './icons/SalesIcon';
import InventoryIcon from './icons/InventoryIcon';
import UsersIcon from './icons/UsersIcon';
import ExpenseIcon from './icons/ExpenseIcon';
import ChartIcon from './icons/ChartIcon';
import CalculatorIcon from './icons/CalculatorIcon';
import CalendarIcon from './icons/CalendarIcon';
import TrashIcon from './icons/TrashIcon';
import SettingsIcon from './icons/SettingsIcon';
import TruckIcon from './icons/TruckIcon';
import PrinterIcon from '../components/icons/PrinterIcon';
import ReceiptIcon from './icons/ReceiptIcon';
import SmsIcon from './icons/SmsIcon';
import LedgerIcon from './icons/LedgerIcon';
import TagIcon from './icons/TagIcon';
import HomeIcon from './icons/HomeIcon';
import LogoutIcon from './icons/LogoutIcon';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    setCurrentView: (view: MainView) => void;
    activeUser: User;
    settings: BusinessSettings;
    onLogout: () => void;
}

const MenuItem: React.FC<{ 
    view: MainView;
    currentView?: MainView;
    icon: React.ReactNode; 
    label: string; 
    subLabel: string;
    onClick: () => void; 
    iconColor: string;
}> = ({ icon, label, subLabel, onClick, iconColor }) => (
    <button 
        onClick={onClick} 
        className="w-full flex items-center gap-4 p-4 rounded-[28px] active:bg-gray-100 dark:active:bg-gray-800 transition-all text-left mb-1"
    >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconColor} text-white shadow-sm`}>
            {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' } as any)}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-black dark:text-white leading-tight truncate">
                {label}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate mt-0.5">
                {subLabel}
            </p>
        </div>
    </button>
);

const Divider = () => <div className="mx-6 my-2 border-t border-dashed border-gray-100 dark:border-gray-800" />;

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, setCurrentView, activeUser, settings, onLogout }) => {
    const [animatePlane, setAnimatePlane] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setAnimatePlane(true);
            const timer = setTimeout(() => setAnimatePlane(false), 5500);
            return () => clearTimeout(timer);
        } else {
            setAnimatePlane(false);
            if (navRef.current) navRef.current.scrollTop = 0;
        }
    }, [isOpen]);

    const navigate = (view: MainView) => {
        setCurrentView(view);
        onClose();
    };

    const navigationGroups = [
        {
            title: 'Core Operations',
            items: [
                { view: MainView.DASHBOARD, label: 'Dashboard', subLabel: 'Analytics · Goals · Summary', icon: <HomeIcon />, color: 'bg-blue-500' },
                { view: MainView.SALES, label: 'Sales Terminal', subLabel: 'POS · Checkout · Tables', icon: <SalesIcon />, color: 'bg-green-500' },
                { view: MainView.INVENTORY, label: 'Stock Manager', subLabel: 'Inventory · Categories · Alerts', icon: <InventoryIcon />, color: 'bg-purple-500' },
                { view: MainView.STOCK_REPORT, label: 'Stock Analytics', subLabel: 'Daily Sold · Top Product · Spend', icon: <ChartIcon />, color: 'bg-orange-600' },
                { view: MainView.EXPENSES, label: 'Expense Log', subLabel: 'Utilities · Wages · Maintenance', icon: <ExpenseIcon />, color: 'bg-red-500' },
                { view: MainView.REPORTS, label: 'Business Insights', subLabel: 'Growth · Trends · Performance', icon: <ChartIcon />, color: 'bg-cyan-500' },
            ]
        },
        {
            title: 'Registries',
            items: [
                { view: MainView.ORDERS, label: 'Order History', subLabel: 'Registry · Logistics · Returns', icon: <OrdersIcon />, color: 'bg-orange-500' },
                { view: MainView.ACCOUNTING, label: 'Accounting Hub', subLabel: 'Ledger · P&L · Statements', icon: <LedgerIcon />, color: 'bg-emerald-500' },
                { view: MainView.BILLS, label: 'Bill Registry', subLabel: 'Invoices · Receipts · Taxes', icon: <ReceiptIcon />, color: 'bg-indigo-500' },
                { view: MainView.CALENDAR, label: 'Calendar', subLabel: 'Schedule · Events · Reminders', icon: <CalendarIcon />, color: 'bg-amber-500' },
                { view: MainView.COMMUNICATIONS, label: 'Client Chats', subLabel: 'SMS · Templates · Contacts', icon: <SmsIcon />, color: 'bg-sky-500' },
            ]
        },
        {
            title: 'Management',
            items: [
                { view: MainView.CUSTOMERS, label: 'Customer Base', subLabel: 'Loyalty · Profiles · History', icon: <UsersIcon />, color: 'bg-pink-500' },
                { view: MainView.CREDITORS, label: 'Creditor List', subLabel: 'Receivables · Debt · Aging', icon: <UsersIcon />, color: 'bg-rose-500' },
                { view: MainView.VENDORS, label: 'Vendor Directory', subLabel: 'Suppliers · Payables · Items', icon: <TruckIcon />, color: 'bg-teal-500' },
                { view: MainView.STAFF, label: 'Staff Roster', subLabel: 'Payroll · Attendance · Roles', icon: <UsersIcon />, color: 'bg-slate-600' },
            ]
        },
        {
            title: 'Utilities',
            items: [
                { view: MainView.DISCOUNTS, label: 'Promotions', subLabel: 'Offers · Campaigns · Codes', icon: <TagIcon />, color: 'bg-violet-500' },
                { view: MainView.TRACKER, label: 'Fleets Tracker', subLabel: 'Logistics · Delivery Status', icon: <TruckIcon />, color: 'bg-indigo-400' },
                { view: MainView.NOTES, label: 'Personal Notes', subLabel: 'Drafts · Manuals · To-do', icon: <LedgerIcon />, color: 'bg-yellow-600' },
                { view: MainView.WEATHER, label: 'Weather Hub', subLabel: 'Local Business Conditions', icon: <CalendarIcon />, color: 'bg-orange-400' },
                { view: MainView.CALCULATOR, label: 'Calculator', subLabel: 'Quick Arithmetic Utility', icon: <CalculatorIcon />, color: 'bg-zinc-500' },
                { view: MainView.RECYCLE_BIN, label: 'Recycle Bin', subLabel: 'Recover Deleted Items', icon: <TrashIcon />, color: 'bg-red-400' },
            ]
        }
    ];

    if (settings.isKotEnabled) {
        navigationGroups[1].items.push({ view: MainView.KOT_LIST, label: 'KOT History', subLabel: 'Kitchen Order Records', icon: <PrinterIcon />, color: 'bg-red-600' });
    }

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div className={`fixed top-0 left-0 h-[100dvh] w-[85%] max-w-[340px] bg-[#F8F9FB] dark:bg-gray-900 z-50 shadow-2xl flex flex-col transition-transform duration-500 cubic-bezier(0.16,1,0.3,1) ${isOpen ? 'translate-x-0' : '-translate-x-full'} gpu-accelerated overflow-hidden`}>
                
                {/* Paper Plane Animation Overlay */}
                {animatePlane && (
                    <div className="absolute inset-0 pointer-events-none z-[60]">
                        <svg className="w-6 h-6 text-[#4B2A63] plane-path-animation drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </div>
                )}
                
                {/* Scrollable Navigation Area - Now starts from the very top */}
                <nav 
                    ref={navRef}
                    className="flex-1 overflow-y-auto px-2 pt-10 pb-10 no-scrollbar"
                >
                    {/* Integrated User Profile: Swipes with other items - Updated Layout */}
                    <div className="px-4 mb-8">
                        <button 
                            onClick={() => navigate(MainView.PROFILE)}
                            className="w-full bg-white dark:bg-gray-800 p-6 rounded-[36px] flex items-center justify-between gap-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all text-left group"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-black dark:text-white text-2xl tracking-tighter truncate uppercase italic leading-none mb-2">{activeUser.name}</p>
                                <p className="text-[11px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em] leading-none">Ordinary Business OB</p>
                            </div>
                            <div className="relative shrink-0">
                                <img 
                                    src={activeUser.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeUser.name}`} 
                                    alt={activeUser.name} 
                                    className="w-20 h-20 rounded-[28px] border-2 border-gray-50 dark:border-gray-700 shadow-lg object-cover" 
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></div>
                            </div>
                        </button>
                    </div>

                    <Divider />

                    {navigationGroups.map((group, gIdx) => (
                        <div key={gIdx} className="mb-4">
                            <div className="px-4 py-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{group.title}</p>
                            </div>
                            <div className="space-y-0.5">
                                {group.items.map(item => (
                                    <MenuItem 
                                        key={item.view} 
                                        view={item.view}
                                        label={item.label}
                                        subLabel={item.subLabel}
                                        icon={item.icon}
                                        iconColor={item.color}
                                        onClick={() => navigate(item.view)}
                                    />
                                ))}
                            </div>
                            {gIdx < navigationGroups.length - 1 && <Divider />}
                        </div>
                    ))}
                </nav>

                {/* Footer Section - Compact with Settings & Sign Out */}
                <div className="px-4 pb-4 pt-3 border-t dark:border-gray-800 shrink-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center gap-3">
                    <button 
                        onClick={onLogout}
                        className="flex-1 flex items-center gap-4 py-3 px-4 rounded-[24px] active:bg-red-50 dark:active:bg-red-900/20 transition-all text-left border border-transparent active:border-red-100 dark:active:border-red-900/40"
                    >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-red-100 dark:bg-red-900/40 text-red-500 dark:text-red-400 shadow-sm">
                            <LogoutIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[15px] font-bold text-red-600 dark:text-red-400 leading-tight">Sign Out</p>
                            <p className="text-[10px] text-red-300 dark:text-red-900/60 font-medium">End session</p>
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => navigate(MainView.SETTINGS)}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 active:bg-gray-200 dark:active:bg-gray-700 active:text-black dark:active:text-white transition-all shadow-sm border border-gray-50 dark:border-gray-700 shrink-0"
                    >
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
            
            <style>{`
                .plane-path-animation {
                    position: absolute;
                    offset-path: path('M -50 100 C 50 150, 100 80, 200 120 A 40 40 0 1 1 200 200 A 40 40 0 1 1 200 120 C 250 140, 300 180, 400 100');
                    offset-rotate: auto;
                    animation: fly-along-path 5s cubic-bezier(0.445, 0.05, 0.55, 0.95) forwards;
                }

                @keyframes fly-along-path {
                    0% { offset-distance: 0%; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { offset-distance: 100%; opacity: 0; }
                }

                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
};

export default SideMenu;