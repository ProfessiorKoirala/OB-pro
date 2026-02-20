import React, { useMemo } from 'react';
import { Order, Expense, Payment } from '../../types';

interface TransactionsLogProps {
    orders: Order[];
    expenses: Expense[];
    payments: Payment[];
}

type Transaction = {
    date: number;
    type: 'Sale' | 'Expense' | 'Payment';
    description: string;
    amount: number;
    isDebit: boolean;
};

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TransactionsLog: React.FC<TransactionsLogProps> = ({ orders, expenses, payments }) => {
    const transactions = useMemo(() => {
        const allTransactions: Transaction[] = [];

        orders.forEach(o => allTransactions.push({
            date: o.timestamp,
            type: 'Sale',
            description: `Order #${o.id.slice(-6)} to ${o.customerName || 'Walk-in'}`,
            amount: o.grandTotal || 0,
            isDebit: false, // Credit to Sales Revenue
        }));
        
        expenses.forEach(e => allTransactions.push({
            date: new Date(e.date).getTime(),
            type: 'Expense',
            description: `${e.title} (${e.category})`,
            amount: e.amount,
            isDebit: true, // Debit to Expense account
        }));

        payments.forEach(p => allTransactions.push({
            date: p.date,
            type: 'Payment',
            description: `${p.type} via ${p.method}`,
            amount: p.amount,
            isDebit: p.type === 'Credit Payment', // Debit to cash/bank
        }));
        
        return allTransactions.sort((a,b) => b.date - a.date);
    }, [orders, expenses, payments]);

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Details</th>
                        <th className="p-3 text-right font-semibold text-gray-600">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((t, index) => (
                        <tr key={index} className="border-b last:border-0">
                            <td className="p-3 text-gray-600">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                            <td className="p-3">
                                <p className="font-semibold text-gray-800">{t.type}</p>
                                <p className="text-xs text-gray-500">{t.description}</p>
                            </td>
                            <td className={`p-3 text-right font-bold ${t.isDebit ? 'text-red-600' : 'text-green-600'}`}>
                                {t.isDebit ? '-' : '+'} {formatCurrency(t.amount)}
                            </td>
                        </tr>
                    ))}
                     {transactions.length === 0 && (
                        <tr>
                            <td colSpan={3} className="text-center p-8 text-gray-500">No transactions for this period.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionsLog;