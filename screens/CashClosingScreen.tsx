import React, { useState, useMemo } from 'react';
import { CashClosing, Denominations, Order, BusinessProfile } from '../types';
import HomeIcon from '../components/icons/HomeIcon';
import PrinterIcon from '../components/icons/PrinterIcon';
import ShareIcon from '../components/icons/ShareIcon';
import DownloadIcon from '../components/icons/DownloadIcon';
import { motion, AnimatePresence } from 'framer-motion';
import CashCounter from '@/components/sales/CashCounter';
import { printClosingReport } from '../utils/printUtils';

interface CashClosingScreenProps {
    orders: Order[];
    openingCash: number;
    onCloseDay: (closing: CashClosing) => void;
    onHome: () => void;
    businessProfile: BusinessProfile;
    lastClosing?: CashClosing;
}

const CashClosingScreen: React.FC<CashClosingScreenProps> = ({ 
    orders, 
    openingCash, 
    onCloseDay, 
    onHome, 
    businessProfile,
    lastClosing 
}) => {
    const [denominations, setDenominations] = useState<Denominations>({
        '1000': 0,
        '500': 0,
        '100': 0,
        '50': 0,
        '20': 0,
        '10': 0,
        '5': 0,
        'coins': 0
    });
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastClosingData, setLastClosingData] = useState<CashClosing | null>(null);

    const today = new Date().toISOString().split('T')[0];

    // Calculate cash sales from today's completed orders
    const cashSales = useMemo(() => {
        const todayOrders = orders.filter(o => {
            const orderDate = new Date(o.timestamp).toISOString().split('T')[0];
            return orderDate === today && o.status === 'Completed';
        });

        return todayOrders.reduce((acc, order) => {
            if (order.paymentMethod === 'Cash') {
                return acc + (order.grandTotal || 0);
            } else if (order.paymentMethod === 'Split') {
                return acc + (order.cashPaid || 0);
            }
            return acc;
        }, 0);
    }, [orders, today]);

    const expectedCash = openingCash + cashSales;

    const actualCash = useMemo(() => {
        return (
            denominations['1000'] * 1000 +
            denominations['500'] * 500 +
            denominations['100'] * 100 +
            denominations['50'] * 50 +
            denominations['20'] * 20 +
            denominations['10'] * 10 +
            denominations['5'] * 5 +
            denominations['coins']
        );
    }, [denominations]);

    const difference = actualCash - expectedCash;
    const hasSales = cashSales > 0;
    const hasDifference = hasSales && Math.abs(difference) > 0.01;

    const handleDenominationChange = (key: keyof Denominations, value: number) => {
        setDenominations(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        if (hasDifference && !reason.trim()) {
            alert("Please provide a reason for the cash difference.");
            return;
        }

        setIsSubmitting(true);
        const closing: CashClosing = {
            id: `close-${Date.now()}`,
            date: today,
            timestamp: Date.now(),
            openingCash,
            expectedCash,
            actualCash,
            difference,
            denominations,
            reason: hasDifference ? reason : undefined,
            closedBy: 'Manager' // Default for now
        };

        setTimeout(() => {
            onCloseDay(closing);
            setLastClosingData(closing);
            setShowSuccess(true);
            setIsSubmitting(false);
        }, 1000);
    };

    const handlePrint = () => {
        if (lastClosingData) {
            printClosingReport(lastClosingData, businessProfile);
        }
    };

    const handleShare = async () => {
        if (lastClosingData && navigator.share) {
            try {
                await navigator.share({
                    title: `Cash Closing Report - ${lastClosingData.date}`,
                    text: `Cash Closing Summary for ${businessProfile.name}\nDate: ${lastClosingData.date}\nExpected: ₹${lastClosingData.expectedCash}\nActual: ₹${lastClosingData.actualCash}\nDifference: ₹${lastClosingData.difference}`,
                    url: window.location.href
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            alert("Sharing is not supported on this device/browser.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 transition-colors font-sans overflow-hidden">
            <header className="px-6 pt-12 pb-4 shrink-0 bg-white dark:bg-gray-950 z-20 border-b dark:border-gray-900">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-black dark:text-white tracking-tighter italic uppercase leading-none">
                            SMART <span className="text-blue-600 uppercase">CLOSING</span>
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em] mt-1 italic">Reconciliation System</p>
                    </div>
                    <button 
                        onClick={onHome} 
                        className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-all active:scale-90"
                    >
                        <HomeIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Summary Section */}
                    <section className="lg:col-span-5 space-y-6">
                        <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Financial Summary</p>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500 uppercase">Opening Float</span>
                                    <span className="text-lg font-black text-black dark:text-white">₹{openingCash.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500 uppercase">Cash Sales</span>
                                    <span className="text-lg font-black text-green-600">₹{cashSales.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500 uppercase">Expected Cash</span>
                                    <span className="text-lg font-black text-blue-600">₹{expectedCash.toLocaleString()}</span>
                                </div>
                                <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500 uppercase">Physical Cash</span>
                                    <span className="text-2xl font-black text-black dark:text-white">₹{actualCash.toLocaleString()}</span>
                                </div>
                                
                                {hasSales && (
                                    <div className={`flex justify-between items-center p-4 rounded-2xl ${difference === 0 ? 'bg-green-50 dark:bg-green-900/10' : difference > 0 ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-red-50 dark:bg-red-900/10'}`}>
                                        <span className="text-xs font-black uppercase tracking-widest">Difference</span>
                                        <span className={`text-xl font-black ${difference === 0 ? 'text-green-600' : difference > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                            {difference > 0 ? '+' : ''}{difference.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {hasDifference && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-4"
                            >
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">Accountability Reason (Required)</p>
                                <textarea 
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Explain the discrepancy..."
                                    className="w-full bg-red-50 dark:bg-red-900/5 border-2 border-red-100 dark:border-red-900/20 rounded-[32px] p-6 text-sm font-bold focus:ring-4 focus:ring-red-500/10 outline-none transition-all min-h-[120px]"
                                />
                            </motion.div>
                        )}
                    </section>

                    {/* Denominations Section */}
                    <section className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cash Count Table</p>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Auto-Calculating</span>
                        </div>
                        <CashCounter 
                            denominations={denominations} 
                            onChange={handleDenominationChange} 
                        />
                    </section>
                </div>
            </main>

            <footer className="px-6 pb-12 pt-6 bg-white dark:bg-gray-950 border-t dark:border-gray-900 shrink-0">
                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || showSuccess}
                    className={`w-full py-6 font-black rounded-[40px] shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-[0.4em] text-white flex items-center justify-center gap-3 ${isSubmitting || showSuccess ? 'bg-gray-400' : 'bg-black dark:bg-white dark:text-black'}`}
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : showSuccess ? (
                        'Day Closed'
                    ) : (
                        'Finalize & Close Day'
                    )}
                </button>
                
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-3 gap-3 mt-4"
                        >
                            <button 
                                onClick={handlePrint}
                                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 active:scale-95 transition-all"
                            >
                                <PrinterIcon className="w-5 h-5 mb-2 text-blue-600" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Print</span>
                            </button>
                            <button 
                                onClick={handleShare}
                                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 active:scale-95 transition-all"
                            >
                                <ShareIcon className="w-5 h-5 mb-2 text-green-600" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Share</span>
                            </button>
                            <button 
                                onClick={handlePrint} // Using print as download for now
                                className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 active:scale-95 transition-all"
                            >
                                <DownloadIcon className="w-5 h-5 mb-2 text-purple-600" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Report</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center mt-4">
                    Closing the day will lock all transactions for {today}.
                </p>
            </footer>
        </div>
    );
};

export default CashClosingScreen;
