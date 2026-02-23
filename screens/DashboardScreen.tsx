import React, { useMemo, useState, useEffect } from 'react';
import { MainView, Order, Expense, BusinessProfile, Product, Payment, VendorPayment, BusinessSettings } from '../types';
import SearchIcon from '../components/icons/SearchIcon';
import BellIcon from '../components/icons/BellIcon';
import PrinterIcon from '../components/icons/PrinterIcon';
import SalesIcon from '../components/icons/SalesIcon';
import ExpenseIcon from '../components/icons/ExpenseIcon';
import BoxIcon from '../components/icons/BoxIcon';
import GlobalSearchModal from '../components/GlobalSearchModal';
import { printDailyReport } from '../utils/printUtils';

interface DashboardScreenProps {
  setCurrentView: (view: MainView) => void;
  businessProfile: BusinessProfile;
  orders: Order[];
  expenses: Expense[];
  products: Product[];
  payments: Payment[];
  vendorPayments: VendorPayment[];
  unreadNotificationCount: number;
  onOpenNotifications: () => void;
  setIsMenuOpen: (open: boolean) => void;
  settings: BusinessSettings;
  isDesktop?: boolean;
}

type Period = 'Today' | 'Week' | 'Month' | 'Year' | 'All Time';

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const DashboardScreen: React.FC<DashboardScreenProps> = ({ 
    setCurrentView, 
    businessProfile, 
    orders = [], 
    expenses = [], 
    products = [],
    payments = [],
    vendorPayments = [],
    unreadNotificationCount = 0, 
    onOpenNotifications, 
    setIsMenuOpen,
    settings,
    isDesktop
}) => {
    const [period, setPeriod] = useState<Period>('Today');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [animatePlane, setAnimatePlane] = useState(false);
    
    // --- BRANDING ANIMATION STATES ---
    const [proPop, setProPop] = useState(false);
    const [subIndex, setSubIndex] = useState(0);
    const subtitles = ['Empire', 'Terminal', 'Command'];

    useEffect(() => {
        const popInterval = setInterval(() => {
            setProPop(true);
            setTimeout(() => setProPop(false), 800);
        }, 8000);

        const subInterval = setInterval(() => {
            setSubIndex(prev => (prev + 1) % subtitles.length);
        }, 5000);

        return () => {
            clearInterval(popInterval);
            clearInterval(subInterval);
        };
    }, []);

    // --- EFFECT: Paper Plane Animation Trigger ---
    useEffect(() => {
        const triggerFlight = () => {
            setAnimatePlane(true);
            setTimeout(() => setAnimatePlane(false), 5500); 
        };

        triggerFlight();
        const interval = setInterval(triggerFlight, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!businessProfile || typeof businessProfile !== 'object') {
        return (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 h-full">
                <p className="text-gray-400 font-black animate-pulse uppercase tracking-[0.3em]">Syncing Empire...</p>
            </div>
        );
    }

    const filteredData = useMemo(() => {
        const now = new Date();
        const getRange = (p: Period): [number, number] => {
            const start = new Date();
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            switch (p) {
                case 'Today': start.setHours(0,0,0,0); break;
                case 'Week': start.setDate(now.getDate() - now.getDay()); start.setHours(0,0,0,0); break;
                case 'Month': start.setDate(1); start.setHours(0,0,0,0); break;
                case 'Year': start.setMonth(0, 1); start.setHours(0,0,0,0); break;
                case 'All Time': return [0, end.getTime()];
            }
            return [start.getTime(), end.getTime()];
        };

        const [startTime, endTime] = getRange(period);
        const periodOrders = (orders || []).filter(o => o.timestamp >= startTime && o.timestamp <= endTime);
        const periodExpenses = (expenses || []).filter(e => {
            const eDate = new Date(e.date + 'T00:00:00').getTime();
            return eDate >= startTime && eDate <= endTime;
        });
        const periodPayments = (payments || []).filter(p => p.date >= startTime && p.date <= endTime);

        const priorOrders = (orders || []).filter(o => o.timestamp < startTime);
        const priorPayments = (payments || []).filter(p => p.date < startTime);

        return { periodOrders, periodExpenses, periodPayments, priorOrders, priorPayments };
    }, [period, orders, expenses, payments]);

    const stats = useMemo(() => {
        const completedSales = filteredData.periodOrders.filter(o => o.status === 'Completed');
        
        const priorCreditSales = filteredData.priorOrders
            .filter(o => o.paymentMethod === 'Credit' && o.status === 'Completed')
            .reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        
        const priorCreditPayments = filteredData.priorPayments
            .filter(p => p.type === 'Credit Payment')
            .reduce((sum, p) => sum + p.amount, 0);
            
        const priorAdvanceReturns = filteredData.priorPayments
            .filter(p => p.type === 'Advance Return')
            .reduce((sum, p) => sum + p.amount, 0);

        const startingBalance = priorCreditSales - (priorCreditPayments - priorAdvanceReturns);
        
        const cashSales = completedSales.reduce((sum, o) => {
            if (o.paymentMethod === 'Cash' || !o.paymentMethod) return sum + (o.grandTotal || 0);
            if (o.paymentMethod === 'Split') return sum + (o.cashPaid || 0);
            return sum;
        }, 0);

        const bankSales = completedSales.reduce((sum, o) => {
            if (o.paymentMethod === 'Bank') return sum + (o.grandTotal || 0);
            if (o.paymentMethod === 'Split') return sum + (o.bankPaid || 0);
            return sum;
        }, 0);

        const periodCreditSales = completedSales
            .filter(o => o.paymentMethod === 'Credit')
            .reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        
        const periodCreditInflow = filteredData.periodPayments
            .filter(p => p.type === 'Credit Payment')
            .reduce((sum, p) => sum + p.amount, 0);

        const periodAdvanceReturns = filteredData.periodPayments
            .filter(p => p.type === 'Advance Return')
            .reduce((sum, p) => sum + p.amount, 0);

        const deliveryAdvances = filteredData.periodPayments.filter(p => p.type === 'Delivery Advance').reduce((sum, p) => sum + p.amount, 0);
        const deliverySettlements = filteredData.periodPayments.filter(p => p.type === 'Delivery Settlement').reduce((sum, p) => sum + p.amount, 0);

        let creditRecovered = 0;
        let creditorAdvance = startingBalance < 0 ? Math.abs(startingBalance) : 0;
        let netDebt = startingBalance > 0 ? startingBalance : 0;

        const netInflow = periodCreditInflow - periodAdvanceReturns;
        const recoveryFromOldDebt = Math.max(0, Math.min(netDebt, netInflow));
        let remainingInflow = netInflow - recoveryFromOldDebt;
        const recoveryFromNewSales = Math.max(0, Math.min(periodCreditSales, remainingInflow));
        remainingInflow -= recoveryFromNewSales;
        const newAdvanceCreated = Math.max(0, remainingInflow);
        const recoveryFromOldAdvance = Math.max(0, Math.min(creditorAdvance, periodCreditSales));
        
        creditRecovered = recoveryFromOldDebt + recoveryFromNewSales + recoveryFromOldAdvance;
        creditorAdvance = (creditorAdvance - recoveryFromOldAdvance) + newAdvanceCreated;
        const dueToRecover = Math.max(0, periodCreditSales - (recoveryFromNewSales + recoveryFromOldAdvance));

        const totalSales = cashSales + bankSales + creditRecovered + deliveryAdvances + deliverySettlements;
        
        const totalExpenses = filteredData.periodExpenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalSales - totalExpenses;

        const itemMap: { [key: string]: number } = {};
        filteredData.periodOrders.forEach(o => o.items.forEach(i => {
            if (!i.status || i.status === 'Active' || i.status === 'Exchanged') {
                itemMap[i.product.name] = (itemMap[i.product.name] || 0) + i.quantity;
            }
        }));
        const topItems = Object.entries(itemMap).sort((a,b) => b[1] - a[1]).slice(0, 3);

        const hourMap: { [key: string]: number } = {};
        filteredData.periodOrders.forEach(o => {
            const hr = new Date(o.timestamp).getHours();
            hourMap[`${hr}:00`] = (hourMap[`${hr}:00`] || 0) + 1;
        });
        const busiestHour = Object.entries(hourMap).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

        const todayStart = new Date().setHours(0,0,0,0);
        const todaySalesOnly = orders.filter(o => o.timestamp >= todayStart && o.status === 'Completed').reduce((sum, o) => {
             return sum + (o.grandTotal || 0);
        }, 0);

        return { 
            totalSales, netProfit, cashSales, bankSales, periodCreditSales, 
            creditRecovered, creditorAdvance, deliveryAdvances, deliverySettlements, dueToRecover, totalExpenses, topItems, busiestHour, completedSales,
            todaySalesOnly
        };
    }, [filteredData, orders]);

    const dailyTarget = settings.dailySalesTarget || 0;
    const isTargetMet = dailyTarget > 0 && stats.todaySalesOnly >= dailyTarget;
    const targetProgress = dailyTarget > 0 ? Math.min(100, (stats.todaySalesOnly / dailyTarget) * 100) : 0;
    const toGo = dailyTarget > stats.todaySalesOnly ? dailyTarget - stats.todaySalesOnly : 0;

    const handlePrintDaily = () => {
        printDailyReport({
            date: new Date(),
            totalSales: stats.totalSales,
            totalExpenses: stats.totalExpenses,
            netProfit: stats.netProfit,
            totalOrders: filteredData.periodOrders.length,
            topItems: stats.topItems.map(([name, quantity]) => ({ name, quantity }))
        }, businessProfile);
    };

    return (
        <div className="bg-white dark:bg-gray-900 h-full relative overflow-hidden transition-colors flex flex-col font-sans">
            {isSearchOpen && (
                <div className="absolute inset-0 z-[100] bg-white dark:bg-gray-950 flex flex-col animate-fade-in">
                    <GlobalSearchModal 
                        onClose={() => setIsSearchOpen(false)} 
                        products={products} 
                        orders={orders} 
                        expenses={expenses} 
                    />
                </div>
            )}

            {/* --- PAPER PLANE ANIMATION OVERLAY --- */}
            {animatePlane && (
                <div className="absolute inset-0 pointer-events-none z-[60]">
                    <svg className="w-6 h-6 text-[#4B2A63] plane-path-animation drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </div>
            )}

            <header className="px-6 pt-12 pb-4 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-30 shrink-0 transition-colors">
                <div className="flex items-center gap-3">
                    {!isDesktop && (
                        <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-2 group shrink-0 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 active:scale-95 transition-all">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </div>
                            <img src={businessProfile.profilePic || 'https://i.pravatar.cc/150'} className="w-8 h-8 rounded-lg object-cover border border-white dark:border-gray-600 shadow-sm" alt="profile" />
                        </button>
                    )}
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-2xl font-black text-black dark:text-white tracking-tighter leading-none italic uppercase">
                                OB
                                <span className={`ml-1 inline-block bg-black dark:bg-white text-white dark:text-black text-[9px] font-black px-2 py-0.5 rounded italic uppercase tracking-tighter shadow-sm relative overflow-hidden transition-all duration-500 ${proPop ? 'scale-125 rotate-3 bg-[#4B2A63] dark:bg-[#4B2A63] text-white ring-2 ring-purple-400' : ''}`}>
                                    Pro
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shine-slow"></div>
                                </span>
                            </h1>
                        </div>
                        <div className="h-4 overflow-hidden mt-1">
                            <div 
                                className="transition-transform duration-700 ease-in-out"
                                style={{ transform: `translateY(-${subIndex * 16}px)` }}
                            >
                                {subtitles.map(sub => (
                                    <p key={sub} className="text-[8px] h-4 font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest truncate max-w-[120px]">
                                        {sub} Mode
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-black dark:text-white border border-gray-100 dark:border-gray-700 active:scale-90 transition-all">
                        <SearchIcon className="w-5 h-5" />
                    </button>
                    <button onClick={onOpenNotifications} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-black dark:text-white border border-gray-100 dark:border-gray-700 relative active:scale-90 transition-all">
                        <BellIcon className="w-5 h-5" />
                        {unreadNotificationCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>}
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-10 no-scrollbar pb-32">
                <div className="flex p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl border border-gray-50 dark:border-gray-800 transition-all overflow-x-auto no-scrollbar">
                    {(['Today', 'Week', 'Month', 'Year', 'All Time'] as Period[]).map(p => (
                        <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2 px-4 text-[9px] font-black rounded-xl whitespace-nowrap transition-all ${period === p ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl' : 'text-gray-400 dark:text-gray-500'}`}>
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-7 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col justify-center border-2 transition-all duration-500 ${
                        isTargetMet 
                        ? 'bg-[#FFD700] dark:bg-[#FFD700] border-[#FFD700] ring-4 ring-yellow-400/20' 
                        : 'bg-black dark:bg-white border-black dark:border-white'
                    }`}>
                         {isTargetMet && (
                             <div className="absolute -top-4 -right-4 opacity-10 rotate-12">
                                <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.54 1.5 1.81 2.63 3.39 2.94V19H7v2h10v-2h-3.78v-3.12c1.58-.31 2.85-1.44 3.39-2.94C19.08 11.63 21 9.55 21 7V6c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
                             </div>
                         )}
                         
                         <div className="flex justify-between items-start relative z-10">
                            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${isTargetMet ? 'text-black opacity-60' : 'text-white dark:text-black opacity-50'}`}>
                                GROSS SALES {period === 'Today' ? '(DAILY)' : `(${period.toUpperCase()})`}
                            </p>
                            {isTargetMet && (
                                <span className="bg-black text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter animate-bounce shadow-lg">Target Met</span>
                            )}
                         </div>

                         <h2 className={`text-4xl font-black italic tracking-tighter leading-none relative z-10 transition-colors ${isTargetMet ? 'text-black' : 'text-white dark:text-black'}`}>
                             {formatCurrency(stats.totalSales)}
                         </h2>

                         <div className="mt-4 flex flex-col gap-2 relative z-10">
                            <div className="flex justify-between items-end">
                                <p className={`text-[8px] font-black uppercase tracking-widest ${isTargetMet ? 'text-black opacity-40' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {isTargetMet ? 'DAILY GOAL EXCEEDED' : dailyTarget > 0 ? `Target: ${formatCurrency(dailyTarget)}` : 'SET A DAILY TARGET'}
                                </p>
                                {dailyTarget > 0 && !isTargetMet && (
                                    <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest animate-pulse">
                                        {formatCurrency(toGo)} TO GO
                                    </p>
                                )}
                            </div>
                            
                            {dailyTarget > 0 && (
                                <div className={`h-1.5 w-full rounded-full overflow-hidden shadow-inner ${isTargetMet ? 'bg-black/10' : 'bg-white/10 dark:bg-black/5'}`}>
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isTargetMet ? 'bg-black' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`}
                                        style={{ width: `${targetProgress}%` }}
                                    />
                                </div>
                            )}
                         </div>
                         
                         <div className={`absolute top-6 right-6 w-1.5 h-1.5 rounded-full ${isTargetMet ? 'bg-black animate-ping' : 'bg-green-500 animate-pulse'}`}></div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-7 rounded-[40px] shadow-sm flex flex-col justify-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">NET EARNINGS</p>
                        <h2 className={`text-2xl font-black italic tracking-tighter leading-none ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(stats.netProfit)}</h2>
                    </div>
                </div>

                <section className="bg-black dark:bg-white p-9 rounded-[48px] shadow-2xl text-white dark:text-black transition-all">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em]">Detailed Summary ({period})</h3>
                        <div className="px-3 py-1 bg-white/10 dark:bg-black/5 rounded-full">
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Audit Mode</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        {[
                            { label: "Cash Sales", value: stats.cashSales },
                            { label: "Bank Sales", value: stats.bankSales },
                            { label: "Credit Recovered", value: stats.creditRecovered, color: 'text-purple-400 dark:text-purple-600' },
                            { label: "Creditor Advance", value: stats.creditorAdvance, color: 'text-green-400 dark:text-green-600' },
                            { label: "Delivery Advance", value: stats.deliveryAdvances, color: 'text-blue-400 dark:text-blue-600' },
                            { label: "Delivery Settlement", value: stats.deliverySettlements, color: 'text-cyan-400 dark:text-cyan-600' },
                            { label: "Total Expenses", value: stats.totalExpenses },
                            { label: "Due To Recover", value: stats.dueToRecover, color: 'text-red-400 dark:text-red-600' }
                        ].map((row, idx) => (
                            <div key={idx} className="flex justify-between items-end group">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-white dark:text-black opacity-100">{row.label}</span>
                                    <div className="h-0.5 w-4 bg-white/20 dark:bg-black/10 rounded-full"></div>
                                </div>
                                <span className={`text-xl font-black italic tracking-tighter ${row.color || 'text-white dark:text-black'}`}>{formatCurrency(row.value)}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-7 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                        <p className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.2em] mb-5">Top Selling</p>
                        <div className="space-y-4">
                            {stats.topItems.map(([name, qty], i) => (
                                <div key={i} className="flex flex-col">
                                    <span className="text-sm font-black text-black dark:text-white italic uppercase tracking-tight truncate leading-none mb-1.5">{i+1}. {name}</span>
                                    <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{qty} units</span>
                                </div>
                            ))}
                            {stats.topItems.length === 0 && <p className="text-[11px] italic text-gray-500 dark:text-gray-400 opacity-100">No volume recorded</p>}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-7 rounded-[40px] border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                        <p className="text-[10px] font-black text-black dark:text-white uppercase tracking-[0.2em]">Peak Traffic</p>
                        <div>
                            <p className="text-4xl font-black text-black dark:text-white italic tracking-tighter leading-none">{stats.busiestHour}</p>
                            <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-2">PEAK SETTLEMENTS</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handlePrintDaily}
                    className="w-full py-6 bg-gray-50 dark:bg-gray-800/50 text-black dark:text-white rounded-[40px] border border-gray-100 dark:border-gray-800 flex items-center justify-center gap-4 active:scale-95 transition-all shadow-sm group"
                >
                    <PrinterIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <div className="text-left leading-none">
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Empire Summary</p>
                        <p className="text-[9px] font-bold opacity-30 mt-1 uppercase tracking-widest">Generate Hardcopy</p>
                    </div>
                </button>
            </main>

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

                @keyframes shine-anim {
                    0% { transform: translateX(-100%); }
                    20% { transform: translateX(100%); }
                    100% { transform: translateX(100%); }
                }

                .animate-shine-slow {
                    animation: shine-anim 4s infinite;
                }
            `}</style>
        </div>
    );
};

export default DashboardScreen;