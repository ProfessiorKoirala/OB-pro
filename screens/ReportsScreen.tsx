import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Order, Expense, Product, Payment, BusinessProfile } from '../types';
import HomeIcon from '../components/icons/HomeIcon';
import PrinterIcon from '../components/icons/PrinterIcon';
import { printReport } from '../utils/printUtils';

interface ReportsScreenProps {
  orders: Order[];
  expenses: Expense[];
  products: Product[];
  payments: Payment[];
  businessProfile: BusinessProfile;
  onHome?: () => void;
}

type Period = 'Today' | 'This Week' | 'This Month' | 'All Time';

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const ReportsScreen: React.FC<ReportsScreenProps> = ({ orders, expenses, products, payments, businessProfile, onHome }) => {
    const [period, setPeriod] = useState<Period>('This Month');

    const handlePrintReport = () => {
        const content = (
            <div style={{ padding: '20px' }}>
                <h3 style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>Financial Summary ({period})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <p><strong>Total Sales:</strong> {formatCurrency(financialBreakdown.totalSales)}</p>
                        <p><strong>Cash Sales:</strong> {formatCurrency(financialBreakdown.cashSales)}</p>
                        <p><strong>Bank Sales:</strong> {formatCurrency(financialBreakdown.bankSales)}</p>
                        <p><strong>Credit Sales:</strong> {formatCurrency(financialBreakdown.creditSales)}</p>
                    </div>
                    <div>
                        <p><strong>Total Expenses:</strong> {formatCurrency(financialBreakdown.totalExpenses)}</p>
                        <p><strong>Net Profit:</strong> {formatCurrency(financialBreakdown.netProfit)}</p>
                        <p><strong>Due to Recover:</strong> {formatCurrency(financialBreakdown.dueToRecover)}</p>
                    </div>
                </div>
                
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '30px' }}>Sales Breakdown</h3>
                <p><strong>Total Orders:</strong> {salesReport.totalOrders}</p>
                <p><strong>Average Order Value:</strong> {formatCurrency(salesReport.averageOrderValue)}</p>
                
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', marginTop: '30px' }}>Top Selling Products</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #000' }}>
                            <th style={{ textAlign: 'left' }}>Product</th>
                            <th style={{ textAlign: 'right' }}>Qty</th>
                            <th style={{ textAlign: 'right' }}>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salesReport.topProducts.slice(0, 10).map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                <td>{p.name}</td>
                                <td style={{ textAlign: 'right' }}>{p.quantity}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(p.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
        printReport(`Financial Report - ${period}`, businessProfile, content);
    };

    const filteredData = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const isDateInPeriod = (dateMillis: number): boolean => {
            const date = new Date(dateMillis);
            switch(period) {
                case 'Today':
                    return date.toDateString() === today.toDateString();
                case 'This Week':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    return date >= weekStart;
                case 'This Month':
                    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
                case 'All Time':
                    return true;
            }
        }
        
        const filteredOrders = orders.filter(o => isDateInPeriod(o.timestamp));
        const filteredExpenses = expenses.filter(e => {
            const parts = e.date.split('-');
            const expenseDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return isDateInPeriod(expenseDate.getTime());
        });
        const filteredPayments = (payments || []).filter(p => isDateInPeriod(p.date));

        return { filteredOrders, filteredExpenses, filteredPayments };
    }, [orders, expenses, payments, period]);

    const financialBreakdown = useMemo(() => {
        const completedSales = filteredData.filteredOrders.filter(o => o.status === 'Completed');
        const totalSales = completedSales.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        const totalExpenses = filteredData.filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        const cashSales = completedSales.reduce((sum, o) => {
            if (o.paymentMethod === 'Cash' || !o.paymentMethod) return sum + (o.grandTotal || 0);
            if (o.paymentMethod === 'Split') return sum + (o.cashPaid || 0);
            return sum;
        }, 0);

        const bankSales = completedSales.reduce((sum, o) => {
            if (o.paymentMethod === 'Bank') return sum + (o.grandTotal || 0);
            if (o.paymentMethod === 'Split') return sum + (o.bankPaid || 0);
            return sum;
        }, 0);

        // Accounting Logic
        const creditSales = completedSales.filter(o => o.paymentMethod === 'Credit').reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        
        // Recovered is strictly payments against credit
        const creditRecovered = filteredData.filteredPayments.filter(p => p.type === 'Credit Payment').reduce((sum, p) => sum + p.amount, 0);
        
        // Advances are reported separately
        const deliveryAdvances = filteredData.filteredPayments.filter(p => p.type === 'Delivery Advance').reduce((sum, p) => sum + p.amount, 0);
        const deliverySettlements = filteredData.filteredPayments.filter(p => p.type === 'Delivery Settlement').reduce((sum, p) => sum + p.amount, 0);

        const dueToRecover = Math.max(0, creditSales - creditRecovered);
        
        // Mock Bad Debt as credit older than 30 days in "All Time" mode
        let badDebt = 0;
        if (period === 'All Time') {
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const oldUnpaidCredit = orders
                .filter(o => o.paymentMethod === 'Credit' && o.status === 'Completed' && o.timestamp < thirtyDaysAgo)
                .reduce((sum, o) => sum + (o.grandTotal || 0), 0);
            badDebt = Math.max(0, oldUnpaidCredit * 0.15); // Projected risk
        }

        return { 
            totalSales, totalExpenses, cashSales, bankSales, creditSales, 
            creditRecovered, deliveryAdvances, deliverySettlements, dueToRecover, badDebt,
            netProfit: totalSales - totalExpenses
        };
    }, [filteredData, period, orders]);

    const salesReport = useMemo(() => {
        const salesData = filteredData.filteredOrders;
        const totalOrders = salesData.length;
        const avgOrderValue = totalOrders > 0 ? financialBreakdown.totalSales / totalOrders : 0;
        
        const salesByDay = salesData.reduce((acc, order) => {
            const date = new Date(order.timestamp).toLocaleDateString('en-CA');
            acc[date] = (acc[date] || 0) + (order.grandTotal || 0);
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(salesByDay)
            .map(([date, sales]) => ({ 
                name: new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {day: '2-digit', month: 'short'}),
                sales,
                sortKey: new Date(date + 'T00:00:00').getTime()
            }))
            .sort((a,b) => a.sortKey - b.sortKey);

        return { totalOrders, avgOrderValue, chartData };
    }, [filteredData.filteredOrders, financialBreakdown.totalSales]);
    
    const salesVsExpenseReport = useMemo(() => {
        const combinedData: { [key: string]: { sales: number; expenses: number } } = {};

        let getKey: (date: Date) => string;
        let getLabel: (key: string) => string;

        switch (period) {
            case 'Today':
                getKey = (date) => `${date.getHours()}:00`;
                getLabel = (key) => key;
                break;
            case 'This Week':
            case 'This Month':
                getKey = (date) => date.toLocaleDateString('en-CA');
                getLabel = (key) => new Date(key + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                break;
            case 'All Time':
            default:
                getKey = (date) => `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                getLabel = (key) => new Date(key + '-02').toLocaleString('default', { month: 'short', year: '2-digit' });
                break;
        }

        filteredData.filteredOrders.forEach(order => {
            const key = getKey(new Date(order.timestamp));
            if (!combinedData[key]) combinedData[key] = { sales: 0, expenses: 0 };
            combinedData[key].sales += order.grandTotal || 0;
        });

        filteredData.filteredExpenses.forEach(expense => {
            const parts = expense.date.split('-');
            const expenseDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            
            const key = getKey(expenseDate);
            if (!combinedData[key]) combinedData[key] = { sales: 0, expenses: 0 };
            combinedData[key].expenses += expense.amount;
        });

        const chartData = Object.entries(combinedData)
            .map(([key, values]) => ({
                name: getLabel(key),
                ...values,
                sortKey: (period === 'Today') 
                    ? parseInt(key.split(':')[0], 10) 
                    : (period === 'All Time' ? new Date(key + '-01T00:00:00').getTime() : new Date(key + 'T00:00:00').getTime()),
            }))
            .sort((a, b) => a.sortKey - b.sortKey);
        
        return { chartData };
    }, [filteredData, period]);
    
    const productReport = useMemo(() => {
        const productSales: { [key: string]: { name: string, quantity: number, revenue: number } } = {};
        filteredData.filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const id = item.product.id;
                if (!productSales[id]) {
                    productSales[id] = { name: item.product.name, quantity: 0, revenue: 0 };
                }
                productSales[id].quantity += item.quantity;
                productSales[id].revenue += item.quantity * item.product.price;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
            
        return { topProducts };

    }, [filteredData.filteredOrders]);

    const paymentMethodReport = useMemo(() => {
        const completedOrders = filteredData.filteredOrders.filter(o => o.status === 'Completed');
        const methods: { [key: string]: number } = { 'Cash': 0, 'Bank': 0, 'Credit': 0 };
        
        completedOrders.forEach(o => {
            if (o.paymentMethod === 'Split') {
                methods['Cash'] += (o.cashPaid || 0);
                methods['Bank'] += (o.bankPaid || 0);
            } else {
                const method = o.paymentMethod || 'Cash';
                methods[method] = (methods[method] || 0) + (o.grandTotal || 0);
            }
        });

        return Object.entries(methods)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));
    }, [filteredData.filteredOrders]);

    const expenseCategoryReport = useMemo(() => {
        const categories: { [key: string]: number } = {};
        filteredData.filteredExpenses.forEach(e => {
            const cat = e.category || 'Other';
            categories[cat] = (categories[cat] || 0) + e.amount;
        });

        return Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value }));
    }, [filteredData.filteredExpenses]);

    const customerReport = useMemo(() => {
        const customerStats: { [key: string]: { name: string, count: number, total: number } } = {};
        filteredData.filteredOrders.forEach(o => {
            const name = o.customerName || 'Guest';
            if (!customerStats[name]) customerStats[name] = { name, count: 0, total: 0 };
            customerStats[name].count += 1;
            customerStats[name].total += (o.grandTotal || 0);
        });

        return Object.values(customerStats)
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);
    }, [filteredData.filteredOrders]);

    const hourlySalesTrend = useMemo(() => {
        const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, sales: 0 }));
        filteredData.filteredOrders.forEach(o => {
            const hour = new Date(o.timestamp).getHours();
            hours[hour].sales += (o.grandTotal || 0);
        });
        return hours.map(h => ({
            name: `${h.hour}:00`,
            sales: h.sales
        }));
    }, [filteredData.filteredOrders]);

    const COLORS = ['#4B2A63', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#6366F1', '#EC4899'];

    const ReportCard: React.FC<{title: string; children: React.ReactNode; dark?: boolean}> = ({ title, children, dark }) => (
        <div className={`p-6 rounded-[32px] shadow-sm border transition-colors ${dark ? 'bg-black text-white border-black' : 'bg-white text-text-primary border-gray-100'}`}>
            <h2 className={`text-[10px] font-black uppercase tracking-[0.4em] mb-6 ${dark ? 'opacity-40' : 'text-gray-400'}`}>{title}</h2>
            {children}
        </div>
    );

    const NoData: React.FC<{message?: string}> = ({message = "No volume recorded for this period."}) => (
        <div className="h-[250px] flex items-center justify-center text-gray-500 bg-gray-50 rounded-[32px]">
            {message}
        </div>
    );

    return (
        <div className="p-4 pb-28 bg-background min-h-full transition-colors font-sans">
            <header className="mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-black dark:text-white italic uppercase tracking-tighter leading-none">OB <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded ml-1 font-black">Pro</span></h1>
                        <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.4em] mt-2 italic">Intelligence Terminal</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrintReport}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm flex items-center gap-2"
                        >
                            <PrinterIcon className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase">Print</span>
                        </button>
                        {onHome && (
                            <button onClick={onHome} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-black dark:hover:text-white transition-all shadow-sm">
                                <HomeIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-full mb-8 overflow-x-auto no-scrollbar">
                {(['Today', 'This Week', 'This Month', 'All Time'] as Period[]).map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`flex-1 text-[9px] font-black py-3 px-4 rounded-full transition-all whitespace-nowrap ${period === p ? 'bg-black dark:bg-white text-white dark:text-black shadow-xl' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        {p.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                <ReportCard title="Financial Analytics" dark>
                    <div className="space-y-6">
                         {[
                            { label: "Gross Sales", value: financialBreakdown.totalSales, main: true },
                            { label: "Cash Collections", value: financialBreakdown.cashSales },
                            { label: "Digital Bank Sales", value: financialBreakdown.bankSales },
                            { label: "Credit Load (Sales)", value: financialBreakdown.creditSales, color: 'text-red-300' },
                            { label: "Credit Recovered", value: financialBreakdown.creditRecovered, color: 'text-purple-400' },
                            { label: "Credit to Recover", value: financialBreakdown.dueToRecover, color: 'text-red-500', bold: true },
                            { label: "Delivery Advance", value: financialBreakdown.deliveryAdvances, color: 'text-blue-400' },
                            { label: "Delivery Settlement", value: financialBreakdown.deliverySettlements, color: 'text-green-500' },
                            { label: "Total Burn (Expenses)", value: financialBreakdown.totalExpenses, color: 'text-red-400' },
                            { label: "Bad Debt Estimate", value: financialBreakdown.badDebt, color: 'text-orange-400' },
                            { label: "Net Period Profit", value: financialBreakdown.netProfit, main: true, color: financialBreakdown.netProfit >= 0 ? 'text-green-400' : 'text-red-400' }
                        ].map((item, idx) => (
                            <div key={idx} className={`flex justify-between items-end border-b border-white/5 pb-2 last:border-0 ${item.main ? 'pt-2 mb-2' : ''}`}>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${item.main ? 'text-white opacity-100' : 'opacity-40 text-white'}`}>{item.label}</span>
                                <span className={`text-xl font-black italic tracking-tighter ${item.color || 'text-white'} ${item.main ? 'text-2xl' : ''}`}>
                                    {formatCurrency(item.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </ReportCard>

                <ReportCard title="Sales Trends">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Vol. Counter</p>
                            <p className="text-xl font-black italic">{salesReport.totalOrders} <span className="text-[10px]">ORDERS</span></p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg. Ticket</p>
                            <p className="text-xl font-black italic">{formatCurrency(salesReport.avgOrderValue)}</p>
                        </div>
                    </div>
                    {salesReport.chartData.length > 0 ? (
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesReport.chartData} isAnimationActive={false}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} dy={10} fontStyle="italic" fontWeight="bold"/>
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(value as number)} animationDuration={0}/>
                                    <Line type="monotone" dataKey="sales" stroke="#000000" strokeWidth={3} dot={{ r: 4, fill: '#000' }} activeDot={{ r: 6 }} isAnimationActive={false}/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <NoData />}
                </ReportCard>
                
                 <ReportCard title="Growth vs. Burn">
                    {salesVsExpenseReport.chartData.length > 0 ? (
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesVsExpenseReport.chartData} isAnimationActive={false}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} dy={10} fontStyle="italic" fontWeight="bold" />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(value as number)} animationDuration={0}/>
                                    <Bar dataKey="sales" name="INCOME" fill="#10B981" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                                    <Bar dataKey="expenses" name="EXPENSE" fill="#EF4444" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <NoData />}
                </ReportCard>

                <ReportCard title="Top Performers">
                    {productReport.topProducts.length > 0 ? (
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productReport.topProducts} layout="vertical" isAnimationActive={false}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 10, fill: '#6B7280', fontWeight: 'bold'}} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(value as number)} cursor={{fill: '#f3f4f6'}} animationDuration={0} />
                                    <Bar dataKey="revenue" fill="#4B2A63" radius={[0, 8, 8, 0]} barSize={24} isAnimationActive={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <NoData />}
                </ReportCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReportCard title="Payment Methods">
                        {paymentMethodReport.length > 0 ? (
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart isAnimationActive={false}>
                                        <Pie
                                            data={paymentMethodReport}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            isAnimationActive={false}
                                        >
                                            {paymentMethodReport.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <NoData />}
                    </ReportCard>

                    <ReportCard title="Expense Breakdown">
                        {expenseCategoryReport.length > 0 ? (
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart isAnimationActive={false}>
                                        <Pie
                                            data={expenseCategoryReport}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                            isAnimationActive={false}
                                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {expenseCategoryReport.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : <NoData />}
                    </ReportCard>
                </div>

                <ReportCard title="Top Customers (by Value)">
                    {customerReport.length > 0 ? (
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={customerReport} isAnimationActive={false}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} dy={10} fontStyle="italic" fontWeight="bold" />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(value as number)} animationDuration={0}/>
                                    <Bar dataKey="total" fill="#10B981" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <NoData />}
                </ReportCard>

                <ReportCard title="Hourly Sales Intensity">
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hourlySalesTrend} isAnimationActive={false}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" fontSize={8} tickLine={false} axisLine={false} dy={10} fontStyle="italic" fontWeight="bold" interval={2} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(value as number)} animationDuration={0}/>
                                <Line type="stepAfter" dataKey="sales" stroke="#4B2A63" strokeWidth={2} dot={false} isAnimationActive={false} fill="#4B2A63" opacity={0.8} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ReportCard>
            </div>
        </div>
    );
};

export default ReportsScreen;