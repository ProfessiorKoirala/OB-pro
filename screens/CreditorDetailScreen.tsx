import React, { useMemo, useState } from 'react';
import { Creditor, Order, Payment } from '../types';
import CollectPaymentModal from '../components/CollectPaymentModal';
import ReturnAdvanceModal from '../components/ReturnAdvanceModal';
import BillDetailModal from '../components/BillDetailModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { printCreditorStatement } from '../utils/printUtils';
import PrinterIcon from '../components/icons/PrinterIcon';
import ShareIcon from '../components/icons/ShareIcon';
import { shareCreditorStatementAsText, shareOnWhatsApp } from '../utils/shareUtils';
import BoxIcon from '../components/icons/BoxIcon';
import CashIcon from '../components/icons/CashIcon';

interface BusinessProfile {
    businessName: string;
    tagline: string;
    email: string;
    phone: string;
    pan: string;
    profilePic: string;
    coverPic: string;
    paymentQR?: string;
    vatNumber?: string;
}

interface CreditorDetailScreenProps {
  creditor: Creditor;
  orders: Order[];
  payments: Payment[];
  onBack: () => void;
  onCollectPayment: (creditorId: string, data: { amount: number; method: 'Cash' | 'Bank' }) => void;
  onReturnAdvance: (creditorId: string, data: { amount: number; method: 'Cash' | 'Bank' }) => void;
  isVatEnabled: boolean;
  businessProfile: BusinessProfile;
  isDesktop?: boolean;
}

type CreditHistoryItem = (Order & { historyType: 'order' }) | (Payment & { historyType: 'payment' });

const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
);

const CreditorDetailScreen: React.FC<CreditorDetailScreenProps> = ({ creditor, orders, payments, onBack, onCollectPayment, onReturnAdvance, isVatEnabled, businessProfile, isDesktop }) => {
    const [isCollecting, setIsCollecting] = useState(false);
    const [isReturning, setIsReturning] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ 
        title: string; 
        message: string; 
        onConfirm: () => void; 
        type: 'collect' | 'return' 
    } | null>(null);

    const { creditHistory, balance, advance } = useMemo(() => {
        const creditorOrders = orders.filter(o => o.creditorId === creditor.id);
        const creditorPayments = payments.filter(p => p.creditorId === creditor.id);
        
        // Accounting Logic: Total Purchased (Debit) - Total Paid (Credit)
        const totalDebits = creditorOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        
        const totalPayments = creditorPayments
            .filter(p => p.type !== 'Advance Return')
            .reduce((sum, p) => sum + p.amount, 0);

        const totalAdvanceReturns = creditorPayments
            .filter(p => p.type === 'Advance Return')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const effectiveBalance = totalDebits - totalPayments + totalAdvanceReturns;

        const balance = effectiveBalance > 0 ? effectiveBalance : 0;
        const advance = effectiveBalance < 0 ? Math.abs(effectiveBalance) : 0;
        
        const creditHistoryItems: CreditHistoryItem[] = [
            ...creditorOrders.map(o => ({ ...o, historyType: 'order' as const })),
            ...creditorPayments.map(p => ({ ...p, historyType: 'payment' as const }))
        ];

        const sortedHistory = creditHistoryItems.sort((a, b) => {
            const dateA = a.historyType === 'order' ? a.timestamp : a.date;
            const dateB = b.historyType === 'order' ? b.timestamp : b.date;
            return dateB - dateA;
        });

        return { creditHistory: sortedHistory, balance, advance };
    }, [orders, payments, creditor.id]);

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const handleSavePayment = (data: { amount: number; method: 'Cash' | 'Bank' }) => {
        setConfirmAction({
            title: "Confirm Collection",
            message: `Are you sure you want to record a collection of ${formatCurrency(data.amount)} via ${data.method}?`,
            type: 'collect',
            onConfirm: () => {
                onCollectPayment(creditor.id, data);
                setIsCollecting(false);
                setConfirmAction(null);
            }
        });
    };
    
    const handleSaveReturn = (data: { amount: number; method: 'Cash' | 'Bank' }) => {
        setConfirmAction({
            title: "Confirm Return",
            message: `Are you sure you want to return ${formatCurrency(data.amount)} from the credit advance via ${data.method}?`,
            type: 'return',
            onConfirm: () => {
                onReturnAdvance(creditor.id, data);
                setIsReturning(false);
                setConfirmAction(null);
            }
        });
    };

    const handlePrintStatement = () => {
        printCreditorStatement(creditor, creditHistory as any, balance, advance, businessProfile);
    };

    const handleShareStatement = () => {
        const statementText = shareCreditorStatementAsText(creditor, creditHistory as any, balance, advance, businessProfile);
        shareOnWhatsApp(statementText);
    };

    const getHistoryLabel = (item: CreditHistoryItem) => {
        if (item.historyType === 'order') {
            if (item.paymentMethod === 'Credit') return "Credit Purchase";
            if (item.paymentMethod === 'Cash') return "Purchased In Cash";
            if (item.paymentMethod === 'Bank') return "Purchased In Bank";
            if (item.paymentMethod === 'Split') return "Purchased (Split Pay)";
            return `Purchased (${item.paymentMethod})`;
        } else {
            const pItem = item as Payment;
            switch (pItem.type) {
                case 'Credit Payment': return "Account Payment";
                case 'Direct Payment': return `Paid in ${pItem.method}`;
                case 'Advance Return': return "Cash Returned to Client";
                case 'Delivery Advance': return "Pre-payment";
                case 'Delivery Settlement': return "Balance Paid";
                default: return pItem.type;
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-950 min-h-full font-sans transition-colors">
            {isCollecting && <CollectPaymentModal onClose={() => setIsCollecting(false)} onSave={handleSavePayment} />}
            {isReturning && advance > 0 && <ReturnAdvanceModal onClose={() => setIsReturning(false)} onSave={handleSaveReturn} maxAmount={advance} />}
            {selectedOrder && <BillDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} isVatEnabled={isVatEnabled} businessProfile={businessProfile} />}
            
            {confirmAction && (
                <ConfirmationModal 
                    title={confirmAction.title}
                    message={confirmAction.message}
                    onConfirm={confirmAction.onConfirm}
                    onCancel={() => setConfirmAction(null)}
                    confirmText="Yes, Proceed"
                    confirmButtonClass={confirmAction.type === 'return' ? 'bg-red-600 text-white' : 'bg-black dark:bg-white text-white dark:text-black'}
                />
            )}

            <header className="bg-white dark:bg-gray-900 shadow-sm px-6 pt-12 pb-6 flex items-center sticky top-0 z-30 w-full shrink-0">
                {!isDesktop && (
                    <button onClick={onBack} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-400 active:scale-90 transition-all mr-4">
                        <ArrowLeftIcon />
                    </button>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none truncate">{creditor.name}</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Audit Trail</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleShareStatement} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-black dark:text-white active:scale-90 transition-all border border-gray-100 dark:border-gray-700">
                        <ShareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handlePrintStatement} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-black dark:text-white active:scale-90 transition-all border border-gray-100 dark:border-gray-700">
                        <PrinterIcon className="w-5 h-5" />
                    </button>
                </div>
            </header>
            
            <main className="p-6 space-y-10 pb-40 no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-7 rounded-[40px] shadow-sm border transition-all ${balance > 0 ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${balance > 0 ? 'text-red-500' : 'text-gray-400'}`}>Amount Due</p>
                        <p className={`text-2xl font-black italic tracking-tighter leading-none ${balance > 0 ? 'text-red-600' : 'text-black dark:text-white'}`}>{formatCurrency(balance)}</p>
                    </div>
                     <div className={`p-7 rounded-[40px] shadow-sm border transition-all ${advance > 0 ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${advance > 0 ? 'text-green-600' : 'text-gray-400'}`}>Credit Advance</p>
                        <p className={`text-2xl font-black italic tracking-tighter leading-none ${advance > 0 ? 'text-green-600' : 'text-black dark:text-white'}`}>{formatCurrency(advance)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setIsCollecting(true)}
                        className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-[32px] font-black uppercase tracking-[0.3em] text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        Collect Payment
                    </button>
                    <button 
                        onClick={() => setIsReturning(true)}
                        disabled={advance <= 0}
                        className="w-full py-5 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-[32px] border border-gray-100 dark:border-gray-700 text-[11px] font-black uppercase tracking-[0.3em] shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-20"
                    >
                        Return Advance
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-8 pb-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Audit Trail</h3>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {creditHistory.length > 0 ? creditHistory.map((item, idx) => (
                            <div key={idx} className="p-6 flex justify-between items-center group">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border ${
                                        item.historyType === 'order' 
                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-100 dark:border-purple-900/30' 
                                        : (item as Payment).type === 'Advance Return'
                                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-900/30'
                                            : 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-100 dark:border-green-900/30'
                                    }`}>
                                        {item.historyType === 'order' ? <BoxIcon className="w-7 h-7" /> : <CashIcon className="w-7 h-7" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-black dark:text-white uppercase italic tracking-tighter leading-none mb-1.5">{getHistoryLabel(item)}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {new Date(item.historyType === 'order' ? item.timestamp : (item as Payment).date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-black italic tracking-tighter leading-none ${
                                        item.historyType === 'order' 
                                        ? 'text-red-500' 
                                        : (item as Payment).type === 'Advance Return'
                                            ? 'text-red-600'
                                            : 'text-green-600'
                                    }`}>
                                        {item.historyType === 'order' 
                                            ? `+${formatCurrency(item.grandTotal || 0)}` 
                                            : (item as Payment).type === 'Advance Return'
                                                ? `+${formatCurrency(item.amount)}`
                                                : `-${formatCurrency(item.amount)}`
                                        }
                                    </p>
                                    {item.historyType === 'order' && (
                                        <button 
                                            onClick={() => setSelectedOrder(item)}
                                            className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2 hover:underline underline-offset-4"
                                        >
                                            View Slip
                                        </button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="py-24 text-center opacity-30">
                                <p className="text-[10px] font-black uppercase tracking-widest italic">No activity recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default CreditorDetailScreen;