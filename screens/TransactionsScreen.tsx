import React, { useState, useMemo } from 'react';
import { AppDataBackup, Order, Expense, Payment, Purchase, VendorPayment, BusinessProfile } from '../types';
import BackIcon from '../components/icons/BackIcon';
import SearchIcon from '../components/icons/SearchIcon';
import TransactionDetailModal from '../components/transactions/TransactionDetailModal';
import HomeIcon from '../components/icons/HomeIcon';

interface TransactionsScreenProps {
    appData: AppDataBackup;
    onBack: () => void;
    businessProfile: BusinessProfile;
    onDeleteTransaction: (transaction: UnifiedTransaction) => void;
    onHome?: () => void;
}

export type UnifiedTransaction = {
    id: string;
    type: 'Sale' | 'Expense' | 'Purchase' | 'Credit Payment' | 'Advance Return' | 'Vendor Payment' | 'Vendor Advance' | 'Direct Payment';
    saleType?: 'Table' | 'Order' | 'Takeaway';
    title: string;
    subtitle: string;
    amount: number;
    timestamp: number;
    method: string;
    originalData: any;
    isIncome: boolean;
};

const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ appData, onBack, businessProfile, onDeleteTransaction, onHome }) => {
    const [filter, setFilter] = useState<'All' | 'Income' | 'Expense'>('All');
    const [incomeTypeFilter, setIncomeTypeFilter] = useState<'All' | 'Table' | 'Order' | 'Takeaway'>('All');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTransaction, setSelectedTransaction] = useState<UnifiedTransaction | null>(null);

    const transactions = useMemo(() => {
        const list: UnifiedTransaction[] = [];

        // 1. Sales (Orders)
        appData.orders.forEach(o => {
            list.push({
                id: `sale-${o.id}`,
                type: 'Sale',
                saleType: o.type,
                title: o.customerName || 'Walk-in Customer',
                subtitle: `Order #${o.id.slice(-6).toUpperCase()}`,
                amount: o.grandTotal || 0,
                timestamp: o.timestamp,
                method: o.paymentMethod || 'Cash',
                originalData: o,
                isIncome: true
            });
        });

        // 2. Expenses
        appData.expenses.forEach(e => {
            list.push({
                id: `exp-${e.id}`,
                type: 'Expense',
                title: e.title,
                subtitle: e.category,
                amount: e.amount,
                timestamp: new Date(e.date + 'T12:00:00').getTime(),
                method: 'Cash',
                originalData: e,
                isIncome: false
            });
        });

        // 3. Payments
        appData.payments.forEach(p => {
            const creditor = appData.creditors.find(c => c.id === p.creditorId);
            list.push({
                id: `pmt-${p.id}`,
                type: p.type as any,
                title: creditor?.name || (p.type === 'Direct Payment' ? 'Direct Sale Payment' : 'Unknown Entity'),
                subtitle: p.type,
                amount: p.amount,
                timestamp: p.date,
                method: p.method,
                originalData: p,
                isIncome: p.type === 'Credit Payment' || p.type === 'Direct Payment' || p.type === 'Delivery Advance'
            });
        });

        // 4. Purchases (Expense)
        appData.purchases.forEach(pur => {
            const vendor = appData.vendors.find(v => v.id === pur.vendorId);
            list.push({
                id: `pur-${pur.id}`,
                type: 'Purchase',
                title: vendor?.name || 'General Purchase',
                subtitle: `Bill #${pur.id.slice(-6).toUpperCase()}`,
                amount: pur.totalAmount,
                timestamp: pur.timestamp,
                method: pur.paymentMethod,
                originalData: pur,
                isIncome: false
            });
        });

        // 5. Vendor Payments (Expense)
        appData.vendorPayments.forEach(vp => {
            const vendor = appData.vendors.find(v => v.id === vp.vendorId);
            list.push({
                id: `vp-${vp.id}`,
                type: vp.type === 'Vendor Payment' ? 'Vendor Payment' : 'Vendor Advance',
                title: vendor?.name || 'Unknown Vendor',
                subtitle: vp.type,
                amount: vp.amount,
                timestamp: vp.date,
                method: vp.method,
                originalData: vp,
                isIncome: false
            });
        });

        return list.sort((a, b) => b.timestamp - a.timestamp);
    }, [appData]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.timestamp).toISOString().split('T')[0];
            const matchesDate = tDate === filterDate;
            const matchesFilter = filter === 'All' || (filter === 'Income' ? t.isIncome : !t.isIncome);
            const matchesIncomeType = filter !== 'Income' || incomeTypeFilter === 'All' || t.saleType === incomeTypeFilter;
            return matchesDate && matchesFilter && matchesIncomeType;
        });
    }, [transactions, filter, incomeTypeFilter, filterDate]);

    const formatCurrency = (amount: number, isIncome: boolean) => {
        const sign = isIncome ? '+' : '-';
        return `${sign}${amount.toFixed(2)} ₹`;
    };

    return (
        <div className="flex flex-col h-full bg-[#F8F9FB] dark:bg-gray-950 transition-colors font-sans overflow-hidden">
            {selectedTransaction && (
                <TransactionDetailModal 
                    transaction={selectedTransaction} 
                    onClose={() => setSelectedTransaction(null)} 
                    onDelete={() => {
                        onDeleteTransaction(selectedTransaction);
                        setSelectedTransaction(null);
                    }}
                    businessProfile={businessProfile}
                    isVatEnabled={appData.settings.isVatEnabled}
                />
            )}
            
            <header className="px-6 pt-10 pb-6 shrink-0 bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-400 active:scale-90 transition-all">
                        <BackIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-black text-black dark:text-white tracking-tight italic uppercase leading-none">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1">Pro</span> Ledger</h1>
                    <div className="flex items-center gap-2">
                        {onHome && (
                            <button onClick={onHome} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                                <HomeIcon className="w-6 h-6" />
                            </button>
                        )}
                        {!onHome && <div className="w-12"></div>}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {(['All', 'Income', 'Expense'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); if(f !== 'Income') setIncomeTypeFilter('All'); }}
                                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    filter === f 
                                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' 
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                {f === 'Income' ? 'Fund In' : f === 'Expense' ? 'Fund Out' : 'All Activities'}
                            </button>
                        ))}
                    </div>

                    {filter === 'Income' && (
                        <div className="animate-fade-in flex gap-1.5 p-1 bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-x-auto no-scrollbar border border-gray-100 dark:border-gray-700">
                             {(['All', 'Table', 'Order', 'Takeaway'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setIncomeTypeFilter(t)}
                                    className={`flex-1 py-2 px-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${incomeTypeFilter === t ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm' : 'text-gray-300'}`}
                                >
                                    {t === 'Table' ? 'Dine-In' : t === 'Order' ? 'Delivery' : t === 'All' ? 'Combined' : t}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
                        <input 
                            type="date" 
                            value={filterDate} 
                            onChange={e => setFilterDate(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                            style={{ colorScheme: 'light' }}
                        />
                         <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4 no-scrollbar pb-32">
                {filteredTransactions.length > 0 ? filteredTransactions.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSelectedTransaction(t)}
                        className="w-full bg-white dark:bg-gray-900 p-5 rounded-[40px] flex items-center gap-4 shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all group"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                            t.isIncome ? 'bg-green-50 text-green-500 border-green-100 dark:bg-green-900/10 dark:border-green-900/20' : 'bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800 dark:border-gray-700'
                        }`}>
                            {t.type === 'Sale' && (t.originalData as Order).status === 'Cancelled' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            ) : t.isIncome ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 11l5-5m0 0l5 5m-5-5v12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 13l-5 5m0 0l-5-5m5 5V6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <h3 className="text-[17px] font-black text-black dark:text-white truncate italic uppercase tracking-tighter leading-none mb-1.5">{t.title}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest leading-none">
                                    {t.method} • {t.subtitle} {t.saleType ? `(${t.saleType === 'Table' ? 'Dine-In' : t.saleType === 'Order' ? 'Delivery' : t.saleType})` : ''}
                                </span>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className={`text-xl font-black italic tracking-tighter leading-none ${t.isIncome ? 'text-green-500' : 'text-black dark:text-white'}`}>
                                {formatCurrency(t.amount, t.isIncome)}
                            </p>
                            <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest mt-1.5">
                                {new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </p>
                        </div>
                    </button>
                )) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                        <div className="w-24 h-24 rounded-[40px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6 border border-gray-100 dark:border-gray-800">
                            <SearchIcon className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-black dark:text-white italic uppercase tracking-tighter">Ledger Clear</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 italic">NO {filter.toUpperCase()} RECORDS FOR THIS DAY</p>
                    </div>
                )}
            </main>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default TransactionsScreen;