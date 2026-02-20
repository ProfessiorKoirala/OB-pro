import React, { useMemo, useState, useCallback } from 'react';
import { Order, Expense, BusinessProfile, User } from '../types';
import BillDetailModal from '../components/BillDetailModal';
import ReceiptIcon from '../components/icons/ReceiptIcon';
import ExpenseIcon from '../components/icons/ExpenseIcon';
import { printOrders, printOrder, printExpense } from '../utils/printUtils';
import PrintDateSelectorModal from '../components/PrintDateSelectorModal';
import PrinterIcon from '../components/icons/PrinterIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import HomeIcon from '../components/icons/HomeIcon';

type Transaction = {
    id: string;
    type: 'Sale' | 'Expense';
    saleType?: 'Table' | 'Order' | 'Takeaway';
    date: number;
    title: string;
    description: string;
    amount: number;
    originalObject: Order | Expense;
};

interface BillsScreenProps {
    orders: Order[];
    expenses: Expense[];
    isVatEnabled: boolean;
    businessProfile: BusinessProfile;
    activeUser: User;
    onDeleteOrder: (orderId: string) => void;
    onDeleteExpense: (expenseId: string) => void;
    onHome?: () => void;
}

const BillsScreen: React.FC<BillsScreenProps> = (props) => {
    const { orders, expenses, isVatEnabled, businessProfile, onDeleteOrder, onDeleteExpense, onHome } = props;
    const [filter, setFilter] = useState<'All' | 'Sales' | 'Expenses'>('All');
    const [saleTypeFilter, setSaleTypeFilter] = useState<'All' | 'Table' | 'Order' | 'Takeaway'>('All');
    const [filterDate, setFilterDate] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isPrintModalOpen, setPrintModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

    const allTransactions = useMemo(() => {
        const salesTransactions: Transaction[] = (orders || []).map(o => ({
            id: o.id,
            type: 'Sale',
            saleType: o.type,
            date: o.timestamp,
            title: `Order #${o.id.slice(-6).toUpperCase()}`,
            description: o.customerName || (o.type === 'Table' ? `Table ${o.tableId?.slice(-2)}` : 'Walk-in Customer'),
            amount: o.grandTotal || 0,
            originalObject: o,
        }));

        const expenseTransactions: Transaction[] = (expenses || []).map(e => ({
            id: e.id,
            type: 'Expense',
            date: new Date(e.date + 'T00:00:00').getTime(),
            title: e.title,
            description: e.category,
            amount: e.amount,
            originalObject: e,
        }));

        return [...salesTransactions, ...expenseTransactions].sort((a, b) => b.date - a.date);
    }, [orders, expenses]);

    const filteredTransactions = useMemo(() => {
        let transactions = allTransactions;

        if (filter !== 'All') {
            transactions = transactions.filter(t => t.type === (filter === 'Sales' ? 'Sale' : 'Expense'));
        }

        if (filter === 'Sales' && saleTypeFilter !== 'All') {
            transactions = transactions.filter(t => t.saleType === saleTypeFilter);
        }

        if (filterDate) {
            transactions = transactions.filter(t => {
                const tDate = new Date(t.date).toISOString().split('T')[0];
                return tDate === filterDate;
            });
        }
        
        return transactions;
    }, [allTransactions, filter, saleTypeFilter, filterDate]);

    const handleTransactionClick = (transaction: Transaction) => {
        if (transaction.type === 'Sale') {
            setSelectedOrder(transaction.originalObject as Order);
        }
    };

    const handlePrintByDate = (date: string) => {
        const targetDate = new Date(date);
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

        const ordersToPrint = orders.filter(o => o.timestamp >= startOfDay && o.timestamp <= endOfDay);
        if (ordersToPrint.length === 0) {
            alert(`No sales found on ${targetDate.toLocaleDateString()}.`);
            return;
        }
        printOrders(ordersToPrint, businessProfile, isVatEnabled);
        setPrintModalOpen(false);
    };
    
    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

    const handleConfirmDelete = useCallback(() => {
        if (transactionToDelete) {
            if (transactionToDelete.type === 'Sale') {
                onDeleteOrder(transactionToDelete.id);
            } else { 
                onDeleteExpense(transactionToDelete.id);
            }
            setTransactionToDelete(null);
        }
    }, [transactionToDelete, onDeleteOrder, onDeleteExpense]);

    const handleOpenReceiptOrPrint = (transaction: Transaction) => {
        if (transaction.type === 'Sale') {
            setSelectedOrder(transaction.originalObject as Order);
        } else { 
            printExpense(transaction.originalObject as Expense, businessProfile);
        }
    };

    const totalInView = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="p-6 pb-32 bg-[#F8F9FB] dark:bg-gray-950 min-h-full font-sans transition-colors">
            {selectedOrder && <BillDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} isVatEnabled={isVatEnabled} businessProfile={businessProfile} />}
            {isPrintModalOpen && <PrintDateSelectorModal onPrint={handlePrintByDate} onClose={() => setPrintModalOpen(false)} />}
            
            {transactionToDelete && (
                <ConfirmationModal
                    title={`Delete ${transactionToDelete.type}`}
                    message={`Are you sure you want to delete this ${transactionToDelete.type.toLowerCase()}? This action will adjust your ledger totals and move the item to the Recycle Bin.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setTransactionToDelete(null)}
                    confirmText="Delete"
                    confirmButtonClass="bg-red-600 text-white"
                />
            )}
            
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">OB <span className="text-[12px] bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded ml-1">Pro</span></h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2 italic leading-none">Bill Registry</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setPrintModalOpen(true)} className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-black dark:text-white active:scale-90 transition-all border border-gray-100 dark:border-gray-700 shadow-sm">
                        <PrinterIcon className="h-6 w-6" />
                    </button>
                    {onHome && (
                        <button onClick={onHome} className="p-3 bg-white dark:bg-gray-800 rounded-2xl text-gray-400 active:scale-90 transition-all border border-gray-100 dark:border-gray-700 shadow-sm">
                            <HomeIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </header>
            
            <div className="bg-white dark:bg-gray-900 p-5 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm mb-8 space-y-6">
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Archive Search</p>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-sm font-bold w-full focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none"
                        style={{ colorScheme: 'light' }}
                    />
                </div>

                <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-gray-800 rounded-[28px]">
                    {(['All', 'Sales', 'Expenses'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); if(f !== 'Sales') setSaleTypeFilter('All'); }}
                            className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {filter === 'Sales' && (
                    <div className="animate-fade-in space-y-3 pt-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1 text-center">Specific Segment</p>
                        <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-gray-800 rounded-[28px] border border-gray-100 dark:border-gray-700">
                            {(['All', 'Table', 'Order', 'Takeaway'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setSaleTypeFilter(t)}
                                    className={`flex-1 py-2.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${saleTypeFilter === t ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-300'}`}
                                >
                                    {t === 'Table' ? 'Dine-In' : t === 'Order' ? 'Delivery' : t}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-black dark:bg-white p-7 rounded-[40px] shadow-2xl text-white dark:text-black mb-10 flex justify-between items-center overflow-hidden relative">
                <div className="relative z-10">
                    <p className="text-[9px] font-black opacity-50 uppercase tracking-[0.2em] mb-2">FILTERED TOTAL</p>
                    <h2 className="text-4xl font-black italic tracking-tighter leading-none">{formatCurrency(totalInView)}</h2>
                </div>
                <div className="opacity-10 absolute -right-4 -bottom-4">
                    <ReceiptIcon className="w-32 h-32" />
                </div>
            </div>

            <div className="space-y-4 no-scrollbar">
                {filteredTransactions.length > 0 ? filteredTransactions.map(transaction => {
                    const isSale = transaction.type === 'Sale';
                    return (
                        <div key={transaction.id} className="bg-white dark:bg-gray-900 p-5 rounded-[36px] shadow-sm flex items-center gap-5 border border-gray-100 dark:border-gray-800 transition-all">
                             <div 
                                onClick={() => handleTransactionClick(transaction)}
                                className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm border cursor-pointer ${isSale ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-900/30' : 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30'}`}
                             >
                                {isSale ? <ReceiptIcon className="h-7 w-7"/> : <ExpenseIcon className="h-7 w-7"/>}
                            </div>
                            <div className="flex-1 cursor-pointer min-w-0" onClick={() => handleTransactionClick(transaction)}>
                                <h3 className="font-black text-lg text-black dark:text-white uppercase italic tracking-tighter leading-none mb-1.5 truncate">{transaction.title}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{transaction.description} • {isSale && transaction.saleType === 'Table' ? 'Dine-In' : isSale && transaction.saleType === 'Order' ? 'Delivery' : transaction.saleType || ''}</p>
                                <p className={`text-xl font-black italic tracking-tighter leading-none mt-2 ${isSale ? 'text-green-600' : 'text-red-600'}`}>
                                    {isSale ? '+' : '-'} {formatCurrency(transaction.amount)}
                                </p>
                            </div>
                             <div className="text-right shrink-0 flex flex-col items-end gap-3">
                                <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest mb-1">{new Date(transaction.date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}</p>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenReceiptOrPrint(transaction); }} 
                                        className="w-11 h-11 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 hover:text-black dark:hover:text-white active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700"
                                    >
                                        <PrinterIcon className="h-5 w-5"/>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTransactionToDelete(transaction); }} 
                                        className="w-11 h-11 flex items-center justify-center bg-red-50 dark:bg-red-900/10 rounded-xl text-red-300 hover:text-red-500 active:scale-90 border border-red-100 dark:border-red-900/20 shadow-sm"
                                    >
                                        <TrashIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }) : (
                    <div className="text-center py-32 opacity-20">
                        <div className="bg-gray-100 dark:bg-gray-800 w-24 h-24 rounded-[40px] flex items-center justify-center mx-auto mb-6">
                            <ReceiptIcon className="h-12 w-12" />
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-black dark:text-white">Clean Registry</h3>
                        <p className="text-[9px] font-bold uppercase tracking-widest mt-2">NO TRANSACTIONS FOUND</p>
                    </div>
                )}
            </div>
            <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default BillsScreen;