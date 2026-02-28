import React, { useState, useEffect } from 'react';
import { MainView, User, BusinessSettings } from '../../types';

// Import all necessary icons
import HomeIcon from '../icons/HomeIcon';
import SalesIcon from '../icons/SalesIcon';
import OrdersIcon from '../icons/OrdersIcon';
import InventoryIcon from '../icons/InventoryIcon';
import ReportsIcon from '../icons/ReportsIcon';
import SettingsIcon from '../icons/SettingsIcon';
import ExpenseIcon from '../icons/ExpenseIcon';
import UsersIcon from '../icons/UsersIcon';
import TruckIcon from '../icons/TruckIcon';
import ReceiptIcon from '../icons/ReceiptIcon';
import TrashIcon from '../icons/TrashIcon';
import LedgerIcon from '../icons/LedgerIcon';
import CalendarIcon from '../icons/CalendarIcon';
import LogoutIcon from '../icons/LogoutIcon';
import TagIcon from '../icons/TagIcon';
import CalculatorIcon from '../icons/CalculatorIcon';
import SmsIcon from '../icons/SmsIcon';
import PrinterIcon from '../icons/PrinterIcon';
import ChartIcon from '../icons/ChartIcon';

interface DesktopSidebarProps {
    activeUser: User;
    currentView: MainView;
    setCurrentView: (view: MainView) => void;
    onLogout: () => void;
    settings: BusinessSettings;
}

const NavItem: React.FC<{
    view: MainView;
    currentView: MainView;
    setCurrentView: (view: MainView) => void;
    icon: React.ReactElement;
    label: string;
    subLabel: string;
    iconColor: string;
    isCollapsed: boolean;
}> = ({ view, currentView, setCurrentView, icon, label, subLabel, iconColor, isCollapsed }) => {
    const isActive = view === currentView;
    return (
        <div
            onClick={() => setCurrentView(view)}
            className={`flex items-center gap-4 p-4 mx-2 rounded-[24px] cursor-pointer transition-all duration-200 ${
                isActive 
                ? 'bg-gray-100 dark:bg-gray-700 shadow-sm' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconColor} text-white shadow-sm`}>
                {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
            </div>
            {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-bold leading-tight truncate ${isActive ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                        {label}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                        {subLabel}
                    </p>
                </div>
            )}
        </div>
    );
};

const Divider = () => <div className="mx-6 my-2 border-t border-dashed border-gray-100 dark:border-gray-800" />;

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ activeUser, currentView, setCurrentView, onLogout, settings }) => {
    const [animatePlane, setAnimatePlane] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const triggerFlight = () => {
            setAnimatePlane(true);
            setTimeout(() => setAnimatePlane(false), 5500); 
        };

        // Initial flight trigger
        triggerFlight();
        
        // Repeat every 1 minute
        const interval = setInterval(triggerFlight, 60000);
        return () => clearInterval(interval);
    }, []);

    const coreItems = [
        { view: MainView.DASHBOARD, label: 'Dashboard', subLabel: 'Analytics · Goals · Summary', icon: <HomeIcon />, color: 'bg-blue-500' },
        { view: MainView.SALES, label: 'Sales Terminal', subLabel: 'POS · Checkout · Tables', icon: <SalesIcon />, color: 'bg-green-500' },
        { view: MainView.INVENTORY, label: 'Stock Manager', subLabel: 'Inventory · Categories · Alerts', icon: <InventoryIcon />, color: 'bg-purple-500' },
        { view: MainView.STOCK_REPORT, label: 'Stock Analytics', subLabel: 'Daily Sold · Top Product · Spend', icon: <ChartIcon />, color: 'bg-orange-600' },
        { view: MainView.EXPENSES, label: 'Expense Log', subLabel: 'Utilities · Wages · Maintenance', icon: <ExpenseIcon />, color: 'bg-red-500' },
        { view: MainView.REPORTS, label: 'Business Insights', subLabel: 'Growth · Trends · Performance', icon: <ReportsIcon />, color: 'bg-cyan-500' },
    ];

    const registryItems = [
        { view: MainView.ORDERS, label: 'Order History', subLabel: 'Registry · Logistics · Returns', icon: <OrdersIcon />, color: 'bg-orange-500' },
        { view: MainView.ACCOUNTING, label: 'Accounting Hub', subLabel: 'Ledger · P&L · Statements', icon: <LedgerIcon />, color: 'bg-emerald-500' },
        { view: MainView.BILLS, label: 'Bill Registry', subLabel: 'Invoices · Receipts · Taxes', icon: <ReceiptIcon />, color: 'bg-indigo-500' },
        { view: MainView.CALENDAR, label: 'Calendar', subLabel: 'Schedule · Events · Reminders', icon: <CalendarIcon />, color: 'bg-amber-500' },
        { view: MainView.COMMUNICATIONS, label: 'Client Chats', subLabel: 'SMS · Templates · Contacts', icon: <SmsIcon />, color: 'bg-sky-500' },
    ];

    const managementItems = [
        { view: MainView.CUSTOMERS, label: 'Customer Base', subLabel: 'Loyalty · Profiles · History', icon: <UsersIcon />, color: 'bg-pink-500' },
        { view: MainView.CREDITORS, label: 'Creditor List', subLabel: 'Receivables · Debt · Aging', icon: <UsersIcon />, color: 'bg-rose-500' },
        { view: MainView.VENDORS, label: 'Vendor Directory', subLabel: 'Suppliers · Payables · Items', icon: <TruckIcon />, color: 'bg-teal-500' },
        { view: MainView.STAFF, label: 'Staff Roster', subLabel: 'Payroll · Attendance · Roles', icon: <UsersIcon />, color: 'bg-slate-600' },
    ];

    const utilityItems = [
        { view: MainView.DISCOUNTS, label: 'Promotions', subLabel: 'Offers · Campaigns · Codes', icon: <TagIcon />, color: 'bg-violet-500' },
        { view: MainView.TRACKER, label: 'Fleets Tracker', subLabel: 'Logistics · Delivery Status', icon: <TruckIcon />, color: 'bg-indigo-400' },
        { view: MainView.NOTES, label: 'Personal Notes', subLabel: 'Drafts · Manuals · To-do', icon: <LedgerIcon />, color: 'bg-yellow-600' },
        { view: MainView.WEATHER, label: 'Weather Hub', subLabel: 'Local Business Conditions', icon: <CalendarIcon />, color: 'bg-orange-400' },
        { view: MainView.HISTORICAL_DATA_ENTRY, label: 'Daybook Entry', subLabel: 'Manual Record Digitization', icon: <LedgerIcon />, color: 'bg-stone-500' },
        { view: MainView.CALCULATOR, label: 'Calculator', subLabel: 'Quick Arithmetic Utility', icon: <CalculatorIcon />, color: 'bg-zinc-500' },
        { view: MainView.RECYCLE_BIN, label: 'Recycle Bin', subLabel: 'Recover Deleted Items', icon: <TrashIcon />, color: 'bg-red-400' },
    ];

    // Conditionally add KOT
    if (settings.isKotEnabled) {
        registryItems.push({ view: MainView.KOT_LIST, label: 'KOT History', subLabel: 'Kitchen Order Records', icon: <PrinterIcon />, color: 'bg-red-600' });
    }

    const navigationGroups = [
        { title: 'Core Operations', items: coreItems },
        { title: 'Registries', items: registryItems },
        { title: 'Management', items: managementItems },
        { title: 'Utilities', items: utilityItems },
    ];

    return (
        <aside className={`bg-[#F8F9FB] dark:bg-gray-950 transition-all duration-300 border-r dark:border-gray-800 flex flex-col relative ${isCollapsed ? 'w-24' : 'w-[310px]'}`}>
            {/* Collapse Toggle */}
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-6 -right-4 z-[70] w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all group"
                title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
            >
                {isCollapsed ? (
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                )}
            </button>

            {/* Paper Plane Animation Overlay */}
            {animatePlane && (
                <div className="absolute inset-0 pointer-events-none z-[60]">
                    <svg className="w-6 h-6 text-[#4B2A63] plane-path-animation drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </div>
            )}

            {/* Scrollable Navigation Area */}
            <nav className="flex-1 overflow-y-auto no-scrollbar pt-10 pb-10">
                
                {/* Integrated User Profile */}
                <div className="px-4 mb-4">
                    <button 
                        onClick={() => setCurrentView(MainView.PROFILE)}
                        className={`w-full bg-white dark:bg-gray-900 rounded-[36px] flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all text-left group ${isCollapsed ? 'p-2 justify-center' : 'p-6 justify-between'}`}
                    >
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-black dark:text-white text-2xl tracking-tighter truncate uppercase italic leading-none mb-2">{activeUser.name}</p>
                                <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] leading-none">Ordinary Business OB</p>
                            </div>
                        )}
                        <div className="relative shrink-0">
                            <img 
                                src={activeUser.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeUser.name}`} 
                                alt={activeUser.name} 
                                className={`${isCollapsed ? 'w-12 h-12 rounded-2xl' : 'w-20 h-20 rounded-[28px]'} border-2 border-white dark:border-gray-700 shadow-lg object-cover group-hover:scale-105 transition-transform`} 
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                        </div>
                    </button>
                </div>

                {/* Quick Actions: Sign Out & Settings */}
                <div className={`px-4 mb-6 flex items-center gap-2 ${isCollapsed ? 'flex-col px-2' : ''}`}>
                    <button 
                        onClick={onLogout}
                        className={`flex items-center gap-2 py-2.5 px-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 group transition-all border border-transparent active:scale-95 ${isCollapsed ? 'w-full justify-center' : 'flex-1'}`}
                        title="Sign Out"
                    >
                        <LogoutIcon className="w-4 h-4 text-red-500" />
                        {!isCollapsed && <span className="text-[13px] font-bold text-red-600">Sign Out</span>}
                    </button>
                    
                    <button 
                        onClick={() => setCurrentView(MainView.SETTINGS)}
                        className={`flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-100 dark:border-gray-800 shadow-sm active:scale-95 ${isCollapsed ? 'w-full justify-center' : 'flex-1'}`}
                        title="Settings"
                    >
                        <SettingsIcon className="w-4 h-4 text-gray-500" />
                        {!isCollapsed && <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300">Settings</span>}
                    </button>
                </div>

                <Divider />

                {navigationGroups.map((group, gIdx) => (
                    <div key={gIdx} className="mb-4">
                        {!isCollapsed && (
                            <div className="px-4 py-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">{group.title}</p>
                            </div>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map(item => (
                                <NavItem 
                                    key={item.view} 
                                    view={item.view}
                                    currentView={currentView}
                                    setCurrentView={setCurrentView}
                                    label={item.label}
                                    subLabel={item.subLabel}
                                    icon={item.icon}
                                    iconColor={item.color}
                                    isCollapsed={isCollapsed}
                                />
                            ))}
                        </div>
                        {gIdx < navigationGroups.length - 1 && <Divider />}
                    </div>
                ))}
            </nav>

            {/* Footer Actions - Removed as they are now at the top */}
            <div className="h-4 shrink-0" />
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
        </aside>
    );
};

export default DesktopSidebar;