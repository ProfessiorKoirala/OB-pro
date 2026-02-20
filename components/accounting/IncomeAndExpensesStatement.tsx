import React, { useMemo } from 'react';
import { Order, Expense } from '../../types';

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface StatementRowProps {
    label: string;
    value?: number;
    isSubtotal?: boolean;
    isTotal?: boolean;
    isHeader?: boolean;
    indentLevel?: number;
    isNegative?: boolean;
}

const StatementRow: React.FC<StatementRowProps> = ({ label, value, isSubtotal, isTotal, isHeader, indentLevel = 0, isNegative = false }) => {
    const indentClass = `pl-${indentLevel * 4}`;
    const valueStr = value !== undefined ? formatCurrency(value) : '';

    if (isHeader) {
        return <h3 className={`font-bold text-lg text-text-primary pt-4 pb-2 ${indentClass}`}>{label}</h3>;
    }

    if (isTotal) {
        const textColor = value && value > 0 ? 'text-green-700' : value && value < 0 ? 'text-red-700' : 'text-text-primary';
        return (
            <div className={`flex justify-between items-center py-3 px-4 rounded-lg mt-2 ${value && value > 0 ? 'bg-green-50' : value && value < 0 ? 'bg-red-50' : 'bg-gray-100'}`}>
                <span className={`font-bold text-lg ${textColor}`}>{label}</span>
                <span className={`font-bold text-lg ${textColor}`}>{valueStr}</span>
            </div>
        );
    }

    if (isSubtotal) {
        return (
            <div className={`flex justify-between items-center font-semibold text-text-primary border-t pt-2 mt-2 ${indentClass}`}>
                <span>{label}</span>
                <span>{isNegative ? `(${valueStr})` : valueStr}</span>
            </div>
        );
    }

    return (
        <div className={`flex justify-between items-center text-sm py-1.5 ${indentClass}`}>
            <span className="text-gray-600">{label}</span>
            <span className={`font-medium text-gray-800`}>{isNegative ? `(${valueStr})` : valueStr}</span>
        </div>
    );
};


interface IncomeAndExpensesStatementProps {
    orders: Order[];
    expenses: Expense[];
}

const IncomeAndExpensesStatement: React.FC<IncomeAndExpensesStatementProps> = ({ orders, expenses }) => {
    const { incomeBreakdown, expenseBreakdown, totalRevenue, totalExpenses, operatingProfit } = useMemo(() => {
        const incomeByPaymentMethod: { [key: string]: number } = { 'Cash Sales': 0, 'Bank Sales': 0, 'Credit Sales': 0 };
        orders.forEach(o => {
            switch (o.paymentMethod) {
                case 'Cash':
                    incomeByPaymentMethod['Cash Sales'] += o.grandTotal || 0;
                    break;
                case 'Bank':
                    incomeByPaymentMethod['Bank Sales'] += o.grandTotal || 0;
                    break;
                case 'Credit':
                    incomeByPaymentMethod['Credit Sales'] += o.grandTotal || 0;
                    break;
                case 'Split':
                    incomeByPaymentMethod['Cash Sales'] += o.cashPaid || 0;
                    incomeByPaymentMethod['Bank Sales'] += o.bankPaid || 0;
                    break;
                default:
                    // Fallback for older orders without a payment method
                    if(o.creditorId) {
                        incomeByPaymentMethod['Credit Sales'] += o.grandTotal || 0;
                    } else {
                        incomeByPaymentMethod['Cash Sales'] += o.grandTotal || 0; // Assume cash for old non-credit orders
                    }
                    break;
            }
        });
        const incomeBreakdown = Object.entries(incomeByPaymentMethod).filter(([, value]) => value > 0).map(([label, value]) => ({label, value}));
        const totalRevenue = incomeBreakdown.reduce((sum, item) => sum + item.value, 0);

        const expensesByCategory: { [key: string]: number } = {};
        expenses.forEach(e => {
            if (!expensesByCategory[e.category]) expensesByCategory[e.category] = 0;
            expensesByCategory[e.category] += e.amount;
        });
        const expenseBreakdown = Object.entries(expensesByCategory).map(([label, value]) => ({label, value})).sort((a,b) => b.value - a.value);
        const totalExpenses = expenseBreakdown.reduce((sum, item) => sum + item.value, 0);

        const operatingProfit = totalRevenue - totalExpenses;

        return { incomeBreakdown, expenseBreakdown, totalRevenue, totalExpenses, operatingProfit };
    }, [orders, expenses]);


    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            {/* Revenue Section */}
            <StatementRow label="I. Revenue" isHeader />
            {incomeBreakdown.map(item => (
                <StatementRow key={item.label} label={item.label} value={item.value} indentLevel={1} />
            ))}
            <StatementRow label="Total Revenue" value={totalRevenue} isSubtotal indentLevel={1} />

             {/* Expenses Section */}
            <StatementRow label="II. Operating Expenses" isHeader />
            {expenseBreakdown.map(item => (
                <StatementRow key={item.label} label={item.label} value={item.value} indentLevel={1} isNegative />
            ))}
            <StatementRow label="Total Operating Expenses" value={totalExpenses} isSubtotal indentLevel={1} isNegative />
            
            {/* Profit Summary */}
            <div className="pt-4">
                <StatementRow label="Operating Profit" value={operatingProfit} isTotal />
            </div>
             <div className="pt-4 mt-2 text-xs text-gray-500">
                <p><strong>Note:</strong> Operating Profit is calculated as Total Revenue minus Total Operating Expenses. This statement does not account for Cost of Goods Sold (COGS) or non-operating income/expenses.</p>
            </div>
        </div>
    );
};

export default IncomeAndExpensesStatement;