
import React, { useMemo } from 'react';
import { Order, Expense, Payment, Creditor, Product } from '../../types';

interface TrialBalanceProps {
    orders: Order[];
    expenses: Expense[];
    payments: Payment[];
    creditors: Creditor[];
    products: Product[];
}

const formatCurrency = (value: number) => Math.round(value).toLocaleString('en-IN');

const TrialBalance: React.FC<TrialBalanceProps> = ({ orders, expenses, payments }) => {
    const data = useMemo(() => {
        const salesRevenue = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const operatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        // Simplified cash vs credit tracking
        const cashIn = orders.filter(o => o.status === 'Completed' && o.paymentMethod === 'Cash').reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const bankIn = orders.filter(o => o.status === 'Completed' && o.paymentMethod === 'Bank').reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const creditGiven = orders.filter(o => o.status === 'Completed' && o.paymentMethod === 'Credit').reduce((sum, o) => sum + (o.grandTotal || 0), 0);

        const items = [
            { name: 'Cash Account', debit: cashIn, credit: 0 },
            { name: 'Bank Account', debit: bankIn, credit: 0 },
            { name: 'Accounts Receivable', debit: creditGiven, credit: 0 },
            { name: 'Sales Revenue', debit: 0, credit: salesRevenue },
            { name: 'Operating Expenses', debit: operatingExpenses, credit: 0 },
        ];

        const totalDebit = items.reduce((sum, i) => sum + i.debit, 0);
        const totalCredit = items.reduce((sum, i) => sum + i.credit, 0);
        
        // Balancing logic
        const diff = totalCredit - totalDebit;
        if (diff !== 0) {
            items.push({ 
                name: 'Opening Balance Equity', 
                debit: diff < 0 ? Math.abs(diff) : 0, 
                credit: diff > 0 ? diff : 0 
            });
        }

        return { 
            items, 
            finalDebit: items.reduce((sum, i) => sum + i.debit, 0), 
            finalCredit: items.reduce((sum, i) => sum + i.credit, 0) 
        };
    }, [orders, expenses]);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-black dark:border-white">
                        <th className="text-left pb-4 font-black uppercase italic tracking-tighter dark:text-white">Account Ledger</th>
                        <th className="text-right pb-4 font-black uppercase italic tracking-tighter dark:text-white">Debit (₹)</th>
                        <th className="text-right pb-4 font-black uppercase italic tracking-tighter dark:text-white">Credit (₹)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {data.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="py-4 font-bold text-gray-700 dark:text-gray-300 italic uppercase">{item.name}</td>
                            <td className="py-4 text-right font-black dark:text-white">{item.debit > 0 ? formatCurrency(item.debit) : '-'}</td>
                            <td className="py-4 text-right font-black dark:text-white">{item.credit > 0 ? formatCurrency(item.credit) : '-'}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900/50">
                        <td className="py-5 font-black uppercase italic text-base dark:text-white">TOTALS</td>
                        <td className="py-5 text-right font-black text-base dark:text-white">{formatCurrency(data.finalDebit)}</td>
                        <td className="py-5 text-right font-black text-base dark:text-white">{formatCurrency(data.finalCredit)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default TrialBalance;
