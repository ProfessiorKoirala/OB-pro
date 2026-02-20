import React, { useState, useMemo } from 'react';
import { Order, Expense, Payment, Creditor, Product, BusinessProfile } from '../types';
import DateRangeFilter from '../components/accounting/DateRangeFilter';
import ReportViewer from '../components/accounting/ReportViewer';
import IncomeAndExpensesStatement from '../components/accounting/IncomeAndExpensesStatement';
import ProfitAndLossStatement from '../components/accounting/ProfitAndLossStatement';
import BalanceSheet from '../components/accounting/BalanceSheet';
import TransactionsLog from '../components/accounting/TransactionsLog';
import AuditReport from '../components/accounting/AuditReport';
import TrialBalance from '../components/accounting/TrialBalance';
import HomeIcon from '../components/icons/HomeIcon';

type ReportType = 'Income & Expenses' | 'Profit & Loss' | 'Balance Sheet' | 'Transactions Log' | 'Audit Report' | 'Trial Balance';

interface AccountingScreenProps {
    orders: Order[];
    expenses: Expense[];
    payments: Payment[];
    creditors: Creditor[];
    products: Product[];
    businessProfile: BusinessProfile;
    onHome?: () => void;
}

const reportOptions: { name: ReportType; description: string }[] = [
    { name: 'Trial Balance', description: 'Check accuracy of ledger balances before statements.' },
    { name: 'Profit & Loss', description: 'Summary of revenues and expenses for the period.' },
    { name: 'Audit Report', description: 'Internal verification summary of all records.' },
    { name: 'Income & Expenses', description: 'Detailed breakdown of all cash inflows and outflows.' },
    { name: 'Balance Sheet', description: 'Snapshot of your company assets and equity.' },
];

const AccountingScreen: React.FC<AccountingScreenProps> = (props) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [activeReport, setActiveReport] = useState<ReportType | null>(null);
    const [dateRange, setDateRange] = useState({
        start: startOfMonth.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
    });

    const filteredData = useMemo(() => {
        const startDate = new Date(dateRange.start).getTime();
        const endDate = new Date(dateRange.end).getTime() + (24 * 60 * 60 * 1000 - 1);

        return {
            orders: props.orders.filter(o => o.timestamp >= startDate && o.timestamp <= endDate),
            expenses: props.expenses.filter(e => {
                const eDate = new Date(e.date).getTime();
                return eDate >= startDate && eDate <= endDate;
            }),
            payments: props.payments.filter(p => p.date >= startDate && p.date <= endDate),
        };
    }, [props.orders, props.expenses, props.payments, dateRange]);

    const renderReport = () => {
        switch (activeReport) {
            case 'Trial Balance':
                return <TrialBalance orders={filteredData.orders} expenses={filteredData.expenses} payments={filteredData.payments} creditors={props.creditors} products={props.products} />;
            case 'Income & Expenses':
                return <IncomeAndExpensesStatement orders={filteredData.orders} expenses={filteredData.expenses} />;
            case 'Profit & Loss':
                return <ProfitAndLossStatement orders={filteredData.orders} expenses={filteredData.expenses} />;
            case 'Balance Sheet':
                return <BalanceSheet allOrders={props.orders} allPayments={props.payments} allExpenses={props.expenses} products={props.products} />;
            case 'Transactions Log':
                 return <TransactionsLog orders={filteredData.orders} expenses={filteredData.expenses} payments={filteredData.payments} />;
            case 'Audit Report':
                return <AuditReport orders={filteredData.orders} expenses={filteredData.expenses} payments={filteredData.payments} />;
            default:
                return null;
        }
    };
    
    if (activeReport) {
        return (
            <ReportViewer title={activeReport} onBack={() => setActiveReport(null)} businessProfile={props.businessProfile} onHome={props.onHome}>
                <div className="animate-fade-in">{renderReport()}</div>
            </ReportViewer>
        );
    }

    return (
        <div className="p-4 pb-24 bg-gray-50 min-h-full font-sans">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-black text-black italic uppercase tracking-tighter">OB <span className="text-[14px] bg-black text-white px-2 py-0.5 rounded ml-1">Pro</span></h1>
                        <span className="bg-black text-white text-[8px] font-black px-2 py-0.5 rounded italic uppercase">Ledger</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">FINANCIAL STATEMENTS HUB</p>
                </div>
                {props.onHome && (
                    <button onClick={props.onHome} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-black transition-all shadow-sm">
                        <HomeIcon className="w-6 h-6" />
                    </button>
                )}
            </header>
            
            <DateRangeFilter
                startDate={dateRange.start}
                endDate={dateRange.end}
                onFilterChange={(start, end) => setDateRange({ start, end })}
            />

            <div className="mt-8 space-y-4">
                {reportOptions.map(({ name, description }) => (
                    <button
                        key={name}
                        onClick={() => setActiveReport(name)}
                        className="w-full bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm text-left active:scale-[0.98] transition-all flex items-center justify-between group"
                    >
                        <div className="min-w-0 flex-1">
                            <h3 className="font-black text-black text-lg italic uppercase tracking-tight group-hover:text-primary transition-colors">{name}</h3>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{description}</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:text-black transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AccountingScreen;