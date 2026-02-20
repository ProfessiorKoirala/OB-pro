import React, { useState, useMemo } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';
import ShoppingBagIcon from '../components/icons/ShoppingBagIcon';
import LightbulbIcon from '../components/icons/LightbulbIcon';
import HomeIcon from '../components/icons/HomeIcon';
import CashIcon from '../components/icons/CashIcon';
import MegaphoneIcon from '../components/icons/MegaphoneIcon';
import WrenchIcon from '../components/icons/WrenchIcon';
import TagIcon from '../components/icons/TagIcon';
import { Expense, BusinessProfile } from '../types';
import AddIcon from '../components/icons/AddIcon';
import { printExpenseReport } from '../utils/printUtils';
import PrinterIcon from '../components/icons/PrinterIcon';
import PencilIcon from '../components/icons/PencilIcon';

type Filter = 'Today' | 'This Week' | 'This Month' | 'All Time' | 'Custom';

interface ExpensesScreenProps {
    expenses: Expense[];
    onAddClick: () => void;
    onEditClick: (expense: Expense) => void;
    onDeleteExpense: (expenseId: string) => void;
    businessProfile: BusinessProfile;
    onHome?: () => void;
}

const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ expenses, onAddClick, onEditClick, onDeleteExpense, businessProfile, onHome }) => {
    const [filter, setFilter] = useState<Filter>('This Month');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

    const filteredExpenses = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return expenses.filter(exp => {
            const expDate = new Date(exp.date);
             expDate.setHours(0,0,0,0); // Normalize date
             
            switch (filter) {
                case 'Today':
                    return expDate.getTime() === today.getTime();
                case 'This Week':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    return expDate >= weekStart;
                case 'This Month':
                    return expDate.getFullYear() === today.getFullYear() && expDate.getMonth() === today.getMonth();
                case 'Custom':
                     if (!customRange.start || !customRange.end) return true;
                     const startDate = new Date(customRange.start);
                     const endDate = new Date(customRange.end);
                     startDate.setHours(0,0,0,0);
                     endDate.setHours(0,0,0,0);
                     return expDate >= startDate && expDate <= endDate;
                case 'All Time':
                default:
                    return true;
            }
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, filter, customRange]);
    
    const totalExpenses = useMemo(() => {
        return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    }, [filteredExpenses]);

    const handleDeleteClick = (expense: Expense) => {
        setExpenseToDelete(expense);
    };

    const handleConfirmDelete = () => {
        if (expenseToDelete) {
            onDeleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
        }
    };
    
    const handlePrint = () => {
        printExpenseReport(filteredExpenses, filter, businessProfile);
    };

    const getCategoryIcon = (category: string) => {
        const iconClass = "h-6 w-6 text-primary";
        switch(category) {
            case 'Supplies': return <ShoppingBagIcon className={iconClass} />;
            case 'Utilities': return <LightbulbIcon className={iconClass} />;
            case 'Rent': return <HomeIcon className={iconClass} />;
            case 'Wages': return <CashIcon className={iconClass} />;
            case 'Marketing': return <MegaphoneIcon className={iconClass} />;
            case 'Maintenance': return <WrenchIcon className={iconClass} />;
            default: return <TagIcon className={iconClass} />;
        }
    }

    return (
        <div className="relative p-4 pb-28 bg-background min-h-full">
            {expenseToDelete && (
                <ConfirmationModal
                    title="Delete Expense"
                    message={`Are you sure you want to delete "${expenseToDelete.title}"? This action cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setExpenseToDelete(null)}
                    confirmText="Delete"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}
            
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1 font-black">Pro</span></h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Expenses</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrint}
                      className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm active:scale-95 transition-all"
                    >
                        <PrinterIcon className="h-6 w-6"/>
                    </button>
                    {onHome && (
                        <button onClick={onHome} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                            <HomeIcon className="w-6 h-6" />
                        </button>
                    )}
                    <button 
                        onClick={onAddClick}
                        className="p-3 bg-black text-white rounded-2xl shadow-xl active:scale-95 transition-all"
                    >
                        <AddIcon className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <div className="flex flex-wrap gap-2 mb-4">
                {(['Today', 'This Week', 'This Month', 'All Time', 'Custom'] as Filter[]).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${filter === f ? 'bg-primary text-white shadow' : 'bg-white text-gray-700 border hover:bg-gray-100'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            
            {filter === 'Custom' && (
                <div className="bg-white p-4 rounded-xl my-4 border animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1">
                            <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                            <input id="startDate" type="date" value={customRange.start} onChange={e => setCustomRange(p => ({...p, start: e.target.value}))} className="bg-gray-100 p-2 rounded-lg text-sm w-full focus:ring-primary focus:border-primary border-gray-200" style={{ colorScheme: 'light' }}/>
                        </div>
                        <div className="hidden sm:block text-gray-500 font-semibold text-sm pt-5">to</div>
                        <div className="flex-1">
                            <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                            <input id="endDate" type="date" value={customRange.end} onChange={e => setCustomRange(p => ({...p, end: e.target.value}))} className="bg-gray-100 p-2 rounded-lg text-sm w-full focus:ring-primary focus:border-primary border-gray-200" style={{ colorScheme: 'light' }}/>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="bg-blue-50 border-l-4 border-primary text-primary p-4 rounded-xl my-4 shadow-sm">
                <p className="text-sm font-semibold">Total Expenses ({filter})</p>
                <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="space-y-3">
                 {filteredExpenses.length > 0 ? filteredExpenses.map(expense => (
                     <div key={expense.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center space-x-3 group">
                         <div className="p-3 bg-primary/10 rounded-full">
                           {getCategoryIcon(expense.category)}
                         </div>
                         <div className="flex-1">
                             <p className="font-bold text-text-primary">{expense.title}</p>
                             <p className="text-sm text-text-secondary">{expense.category} · {new Date(expense.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                         </div>
                         <div className="text-right flex items-center space-x-1">
                             <div>
                                <p className="font-semibold text-red-600">- ₹{expense.amount.toLocaleString('en-IN')}</p>
                             </div>
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEditClick(expense)} className="text-gray-400 hover:text-primary p-1">
                                    <PencilIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDeleteClick(expense)} className="text-gray-400 hover:text-red-500 p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                         </div>
                     </div>
                 )) : (
                    <div className="text-center py-10 text-text-secondary bg-white rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No Expenses</h3>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ExpensesScreen;