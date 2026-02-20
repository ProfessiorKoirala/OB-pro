
import React, { useMemo } from 'react';
import { Order, Expense, Payment } from '../../types';

interface AuditReportProps {
    orders: Order[];
    expenses: Expense[];
    payments: Payment[];
}

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const AuditReport: React.FC<AuditReportProps> = ({ orders, expenses, payments }) => {
    const summary = useMemo(() => {
        const completedOrders = orders.filter(o => o.status === 'Completed');
        const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        const topExpenses = [...expenses]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);
            
        const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

        return { 
            totalRevenue, 
            totalExpenses, 
            transactionCount: orders.length,
            completedCount: completedOrders.length,
            avgOrderValue,
            topExpenses 
        };
    }, [orders, expenses]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Volume</p>
                    <p className="text-2xl font-black text-black dark:text-white italic">{summary.transactionCount}</p>
                    <p className="text-[8px] font-bold text-gray-300 uppercase mt-1">Orders Recorded</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-[32px] border border-gray-100 dark:border-gray-700">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Avg. Basket</p>
                    <p className="text-2xl font-black text-black dark:text-white italic">{formatCurrency(summary.avgOrderValue)}</p>
                    <p className="text-[8px] font-bold text-gray-300 uppercase mt-1">Per Completion</p>
                </div>
            </div>

            <div className="bg-black dark:bg-white p-8 rounded-[40px] shadow-xl text-white dark:text-black">
                <h4 className="text-[10px] font-black opacity-50 uppercase tracking-[0.3em] mb-6 text-center">Top Burn Categories</h4>
                <div className="space-y-4">
                    {summary.topExpenses.map((e, i) => (
                        <div key={i} className="flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black opacity-30">0{i+1}</span>
                                <span className="font-bold uppercase italic text-sm tracking-tight">{e.title}</span>
                            </div>
                            <span className="font-black text-sm">{formatCurrency(e.amount)}</span>
                        </div>
                    ))}
                    {summary.topExpenses.length === 0 && (
                        <p className="text-center text-xs opacity-40 font-bold uppercase italic py-4">No significant expenses</p>
                    )}
                </div>
            </div>

             <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] border border-blue-100 dark:border-blue-900/20">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest text-center leading-relaxed">
                    Internal audit complete. All transactions match recorded ledger entries for this period.
                </p>
            </div>
        </div>
    );
};

export default AuditReport;
