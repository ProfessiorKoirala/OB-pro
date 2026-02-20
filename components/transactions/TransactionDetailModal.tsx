
import React from 'react';
import { UnifiedTransaction } from '../../screens/TransactionsScreen';
import CloseIcon from '../icons/CloseIcon';
import PrinterIcon from '../icons/PrinterIcon';
import TrashIcon from '../icons/TrashIcon';
import { printOrder, printExpense, printPurchaseBill } from '../../utils/printUtils';
import { BusinessProfile } from '../../types';

interface TransactionDetailModalProps {
    transaction: UnifiedTransaction;
    onClose: () => void;
    onDelete: () => void;
    businessProfile: BusinessProfile;
    isVatEnabled: boolean;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, onClose, onDelete, businessProfile, isVatEnabled }) => {
    
    const handlePrint = () => {
        const { type, originalData } = transaction;
        if (type === 'Sale') {
            printOrder(originalData, businessProfile, isVatEnabled);
        } else if (type === 'Expense') {
            printExpense(originalData, businessProfile);
        } else if (type === 'Purchase') {
            const vendor = businessProfile; // Mocking vendor for general purchase
            printPurchaseBill(originalData, vendor as any, businessProfile);
        } else {
            alert("Print not available for this record type yet.");
        }
    };

    const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-[48px] w-full max-w-md overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <header className="p-8 pb-0 flex justify-between items-start">
                    <div className={`p-4 rounded-3xl ${transaction.isIncome ? 'bg-green-100 text-green-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                        {transaction.isIncome ? (
                             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 11l5-5m0 0l5 5m-5-5v12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 13l-5 5m0 0l-5-5m5 5V6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onDelete} className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-all shadow-sm">
                            <TrashIcon className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <main className="p-8 pt-6 space-y-8">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em] mb-2">{transaction.type} Details</p>
                        <h2 className="text-4xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none mb-1">{transaction.title}</h2>
                        <p className="text-sm font-bold text-gray-400">{transaction.subtitle}</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[32px] space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
                            <span className={`text-2xl font-black italic ${transaction.isIncome ? 'text-green-500' : 'text-black dark:text-white'}`}>
                                {transaction.isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Date</span>
                            <span className="font-bold text-black dark:text-white uppercase text-sm">
                                {new Date(transaction.timestamp).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Time</span>
                            <span className="font-bold text-black dark:text-white uppercase text-sm">
                                {new Date(transaction.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Method</span>
                            <span className="font-bold text-black dark:text-white uppercase text-sm">{transaction.method}</span>
                        </div>
                    </div>

                    <div className="pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={handlePrint} className="flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-gray-800 text-black dark:text-white font-black rounded-[24px] text-xs uppercase tracking-widest active:scale-95 transition-all">
                                <PrinterIcon className="w-5 h-5" /> Print
                            </button>
                            <button onClick={onClose} className="py-4 bg-black dark:bg-white text-white dark:text-black font-black rounded-[24px] text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                                Done
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TransactionDetailModal;
