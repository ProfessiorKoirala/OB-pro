import React, { useMemo } from 'react';
import { Order, Payment, Expense, Product } from '../../types';

interface BalanceSheetProps {
    allOrders: Order[];
    allPayments: Payment[];
    allExpenses: Expense[];
    products: Product[];
}

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const BalanceSection: React.FC<{ title: string; rows: { label: string; value: number }[]; totalLabel: string; totalValue: number }> = ({ title, rows, totalLabel, totalValue }) => (
    <div>
        <h3 className="font-bold text-xl text-primary mb-2">{title}</h3>
        <table className="w-full">
            <tbody>
                {rows.map(row => (
                    <tr key={row.label}>
                        <td className="py-2 pl-4 text-gray-600">{row.label}</td>
                        <td className="py-2 text-right font-medium text-gray-900">{formatCurrency(row.value)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr className="border-t-2 font-bold text-lg text-text-primary">
                    <td className="py-2 mt-2">{totalLabel}</td>
                    <td className="py-2 mt-2 text-right">{formatCurrency(totalValue)}</td>
                </tr>
            </tfoot>
        </table>
    </div>
);

const BalanceSheet: React.FC<BalanceSheetProps> = ({ allOrders, allPayments, allExpenses, products }) => {
    
    const { assets, liabilities, equity } = useMemo(() => {
        // ASSETS
        const inventoryValue = products.reduce((sum, p) => sum + p.price * (p.stock || 0), 0);
        
        const totalCreditGiven = allOrders
            .filter(o => o.paymentMethod === 'Credit')
            .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

        const totalCreditPayments = allPayments
            .filter(p => p.type === 'Credit Payment')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const accountsReceivable = totalCreditGiven - totalCreditPayments;
        const totalAssets = inventoryValue + accountsReceivable;
        
        // LIABILITIES
        const totalAdvancesReturned = allPayments
            .filter(p => p.type === 'Advance Return')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const advancesPayable = Math.max(0, totalAdvancesReturned - accountsReceivable); // Simplified
        const totalLiabilities = advancesPayable;

        // EQUITY
        const totalRevenue = allOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const totalExpenses = allExpenses.reduce((sum, e) => sum + e.amount, 0);
        const retainedEarnings = totalRevenue - totalExpenses;
        
        // The accounting equation: Assets = Liabilities + Equity
        // We use Owner's Capital as a balancing item in this simplified model.
        const ownersCapital = totalAssets - totalLiabilities - retainedEarnings;

        const totalEquity = retainedEarnings + ownersCapital;

        return {
            assets: {
                inventoryValue,
                accountsReceivable: Math.max(0, accountsReceivable),
                total: totalAssets,
            },
            liabilities: {
                advancesPayable,
                total: totalLiabilities,
            },
            equity: {
                retainedEarnings,
                ownersCapital,
                total: totalEquity,
            }
        };
    }, [allOrders, allPayments, allExpenses, products]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-6">
            <BalanceSection 
                title="Assets"
                rows={[
                    { label: "Inventory (at Retail Price)", value: assets.inventoryValue },
                    { label: "Accounts Receivable", value: assets.accountsReceivable }
                ]}
                totalLabel="Total Assets"
                totalValue={assets.total}
            />
             <BalanceSection 
                title="Liabilities"
                rows={[
                    { label: "Advances Payable", value: liabilities.advancesPayable },
                ]}
                totalLabel="Total Liabilities"
                totalValue={liabilities.total}
            />
            <BalanceSection 
                title="Equity"
                rows={[
                     { label: "Owner's Capital", value: equity.ownersCapital },
                     { label: "Retained Earnings", value: equity.retainedEarnings }
                ]}
                totalLabel="Total Equity"
                totalValue={equity.total}
            />
            
            <div className="pt-4 text-xs text-gray-500">
                <p><strong>Note:</strong> This is a simplified balance sheet. 'Owner's Capital' is calculated as a balancing figure. Real-world balance sheets would include more items like cash, long-term assets, and loans.</p>
            </div>
        </div>
    );
};

export default BalanceSheet;