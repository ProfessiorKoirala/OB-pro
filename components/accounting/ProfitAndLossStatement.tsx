
import React, { useMemo } from 'react';
import { Order, Expense } from '../../types';

interface ProfitAndLossStatementProps {
    orders: Order[];
    expenses: Expense[];
}

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProfitAndLossStatement: React.FC<ProfitAndLossStatementProps> = ({ orders, expenses }) => {
    const { totalRevenue, totalExpenses, netProfit } = useMemo(() => {
        const totalRevenue = orders.filter(o => o.status === 'Completed').reduce((sum, order) => sum + (order.grandTotal || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const netProfit = totalRevenue - totalExpenses;
        return { totalRevenue, totalExpenses, netProfit };
    }, [orders, expenses]);

    const getNetProfitColor = () => {
        if (netProfit > 0) return 'text-green-600 dark:text-green-400';
        if (netProfit < 0) return 'text-red-600 dark:text-red-400';
        return 'text-text-primary dark:text-white';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm space-y-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2">Performance Summary</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b dark:border-gray-700">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Total Sales Revenue</span>
                    <span className="font-black text-xl text-green-600 dark:text-green-400">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b dark:border-gray-700">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Total Operating Expenses</span>
                    <span className="font-black text-xl text-red-500 dark:text-red-400">-{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center py-6">
                    <span className="text-black dark:text-white font-black uppercase text-sm tracking-[0.2em]">Net Earnings</span>
                    <span className={`text-3xl font-black italic tracking-tighter ${getNetProfitColor()}`}>{formatCurrency(netProfit)}</span>
                </div>
            </div>
             <div className="pt-6 border-t dark:border-gray-700 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center leading-relaxed">
                Profit is calculated as Completed Sales - Recorded Expenses.
            </div>
        </div>
    );
};

export default ProfitAndLossStatement;
